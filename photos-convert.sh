#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./photos-convert.sh -s <source_dir> -o <output_dir> [options]

Options:
  -s <dir>              Source directory containing HEIC/AVIF files
  -o <dir>              Output directory
  -w <px>               Target width at 1x
  -h <px>               Target height at 1x
  --quality-avif <n>    AVIF quality 0-100 (default: 60)
  --quality-webp <n>    WebP quality 0-100 (default: 82)
  --quality-jpeg <n>    JPEG quality 0-100 (default: 85)
  --help                Show this help

Resize behaviour:
  Neither -w nor -h     Keep source dimensions
  Only -w               Resize to width, preserve aspect ratio
  Only -h               Resize to height, preserve aspect ratio
  Both -w and -h        Centre crop to exact dimensions
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

log() {
  echo "$*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"
}

validate_int_range() {
  local name="$1"
  local value="$2"

  [[ "$value" =~ ^[0-9]+$ ]] || die "$name must be an integer between 0 and 100"
  (( value >= 0 && value <= 100 )) || die "$name must be between 0 and 100"
}

avif_quality_to_crf() {
  local quality="$1"

  # User-facing AVIF quality is 0-100 where higher means better quality.
  # libsvtav1 uses CRF 0-63 where lower means better quality.
  printf '%s' $(( ((100 - quality) * 63 + 50) / 100 ))
}

SOURCE_DIR=""
OUTPUT_DIR=""
TARGET_WIDTH=""
TARGET_HEIGHT=""
QUALITY_AVIF=60
QUALITY_WEBP=82
QUALITY_JPEG=85

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s)
      SOURCE_DIR="${2:-}"
      shift 2
      ;;
    -o)
      OUTPUT_DIR="${2:-}"
      shift 2
      ;;
    -w)
      TARGET_WIDTH="${2:-}"
      shift 2
      ;;
    -h)
      TARGET_HEIGHT="${2:-}"
      shift 2
      ;;
    --quality-avif)
      QUALITY_AVIF="${2:-}"
      shift 2
      ;;
    --quality-webp)
      QUALITY_WEBP="${2:-}"
      shift 2
      ;;
    --quality-jpeg)
      QUALITY_JPEG="${2:-}"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$SOURCE_DIR" ]] || die "Missing source directory. Use -s <dir>"
[[ -n "$OUTPUT_DIR" ]] || die "Missing output directory. Use -o <dir>"
[[ -d "$SOURCE_DIR" ]] || die "Source directory not found: $SOURCE_DIR"

if [[ -n "$TARGET_WIDTH" ]]; then
  [[ "$TARGET_WIDTH" =~ ^[1-9][0-9]*$ ]] || die "Width must be a positive integer"
fi

if [[ -n "$TARGET_HEIGHT" ]]; then
  [[ "$TARGET_HEIGHT" =~ ^[1-9][0-9]*$ ]] || die "Height must be a positive integer"
fi

validate_int_range "AVIF quality" "$QUALITY_AVIF"
validate_int_range "WebP quality" "$QUALITY_WEBP"
validate_int_range "JPEG quality" "$QUALITY_JPEG"

require_command ffmpeg
require_command magick

mkdir -p "$OUTPUT_DIR"

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/photos-convert.XXXXXX")"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

FFMPEG_ENCODERS="$(ffmpeg -hide_banner -encoders 2>/dev/null || true)"

ffmpeg_has_encoder() {
  local encoder="$1"
  printf '%s\n' "$FFMPEG_ENCODERS" | grep -Eq "[[:space:]]${encoder}([[:space:]]|$)"
}

ffmpeg_has_encoder libsvtav1 || die "ffmpeg is missing libsvtav1 AVIF encoding support"

build_filter() {
  local width="$1"
  local height="$2"

  if [[ -n "$width" && -n "$height" ]]; then
    printf "scale=%s:%s:force_original_aspect_ratio=increase:flags=lanczos,crop=%s:%s" \
      "$width" "$height" "$width" "$height"
  elif [[ -n "$width" ]]; then
    printf "scale=%s:-2:flags=lanczos" "$width"
  elif [[ -n "$height" ]]; then
    printf "scale=-2:%s:flags=lanczos" "$height"
  else
    printf "null"
  fi
}

prepare_fallback_source() {
  local input_file="$1"
  local fallback_file="$2"

  magick "$input_file[0]" -auto-orient -strip "$fallback_file"
}

build_magick_resize_args() {
  local width="$1"
  local height="$2"

  if [[ -n "$width" && -n "$height" ]]; then
    printf -- "-resize %sx%s^ -gravity Center -extent %sx%s" \
      "$width" "$height" "$width" "$height"
  elif [[ -n "$width" ]]; then
    printf -- "-resize %sx" "$width"
  elif [[ -n "$height" ]]; then
    printf -- "-resize x%s" "$height"
  else
    printf -- ""
  fi
}

run_ffmpeg() {
  local input_file="$1"
  local output_file="$2"
  local filter="$3"
  local codec="$4"
  local quality="$5"
  local pix_fmt="$6"

  local -a codec_args
  case "$codec" in
    avif)
      local avif_crf
      avif_crf="$(avif_quality_to_crf "$quality")"
      codec_args=(
        -c:v libsvtav1
        -crf "$avif_crf"
        -preset 6
      )
      ;;
    webp)
      codec_args=(
        -c:v libwebp
        -quality "$quality"
        -compression_level 6
      )
      ;;
    jpg)
      local jpeg_qscale
      jpeg_qscale=$(( 2 + ((100 - quality) * 29 / 100) ))
      codec_args=(
        -c:v mjpeg
        -q:v "$jpeg_qscale"
        -huffman optimal
        -qmin "$jpeg_qscale"
        -qmax "$jpeg_qscale"
      )
      ;;
    *)
      die "Unsupported ffmpeg codec: $codec"
      ;;
  esac

  ffmpeg \
    -hide_banner \
    -loglevel error \
    -y \
    -threads 0 \
    -i "$input_file" \
    -frames:v 1 \
    -vf "$filter" \
    -map_metadata -1 \
    -map_chapters -1 \
    -an \
    -sn \
    -dn \
    -pix_fmt "$pix_fmt" \
    "${codec_args[@]}" \
    "$output_file"
}

run_magick() {
  local input_file="$1"
  local output_file="$2"
  local width="$3"
  local height="$4"
  local codec="$5"
  local quality="$6"

  local resize_args
  resize_args="$(build_magick_resize_args "$width" "$height")"

  case "$codec" in
    webp)
      # shellcheck disable=SC2086
      magick "$input_file[0]" -auto-orient $resize_args -strip +profile icc \
        -quality "$quality" "$output_file"
      ;;
    jpg)
      # shellcheck disable=SC2086
      magick "$input_file[0]" -auto-orient $resize_args -strip +profile icc \
        -sampling-factor 4:2:0 -interlace JPEG -quality "$quality" "$output_file"
      ;;
    *)
      die "Unsupported magick codec: $codec"
      ;;
  esac
}

convert_variant() {
  local input_file="$1"
  local output_base="$2"
  local width="$3"
  local height="$4"

  local filter
  filter="$(build_filter "$width" "$height")"

  run_ffmpeg "$input_file" "${output_base}.avif" "$filter" avif "$QUALITY_AVIF" yuv420p

  if ffmpeg_has_encoder libwebp; then
    run_ffmpeg "$input_file" "${output_base}.webp" "$filter" webp "$QUALITY_WEBP" yuv420p
  else
    run_magick "$input_file" "${output_base}.webp" "$width" "$height" webp "$QUALITY_WEBP"
  fi

  run_ffmpeg "$input_file" "${output_base}.jpg" "$filter" jpg "$QUALITY_JPEG" yuvj420p
}

convert_file() {
  local input_file="$1"
  local stem="$2"
  local failure=0
  local working_input="$input_file"
  local fallback_png="$TMP_DIR/${stem}.png"
  local ext

  ext="${input_file##*.}"
  ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"

  log "Processing ${stem} -> @1x avif/webp/jpg, @2x avif/webp/jpg"

  if [[ "$ext" == "heic" || "$ext" == "heif" ]]; then
    if prepare_fallback_source "$input_file" "$fallback_png"; then
      working_input="$fallback_png"
    else
      echo "  Failed decoding source ${stem}" >&2
      return 1
    fi
  fi

  if ! convert_variant "$working_input" "$OUTPUT_DIR/${stem}@1x" "$TARGET_WIDTH" "$TARGET_HEIGHT"; then
    if [[ "$ext" == "heic" || "$ext" == "heif" ]]; then
      echo "  Failed writing @1x outputs for ${stem}" >&2
      failure=1
    else
      echo "  Failed writing @1x outputs for ${stem}" >&2
      failure=1
    fi
  fi

  if [[ $failure -eq 0 ]]; then
    local width_2x=""
    local height_2x=""

    if [[ -n "$TARGET_WIDTH" ]]; then
      width_2x=$(( TARGET_WIDTH * 2 ))
    fi
    if [[ -n "$TARGET_HEIGHT" ]]; then
      height_2x=$(( TARGET_HEIGHT * 2 ))
    fi

    if ! convert_variant "$working_input" "$OUTPUT_DIR/${stem}@2x" "$width_2x" "$height_2x"; then
      echo "  Failed writing @2x outputs for ${stem}" >&2
      failure=1
    fi
  fi

  return "$failure"
}

shopt -s nullglob nocaseglob
input_files=("$SOURCE_DIR"/*.heic "$SOURCE_DIR"/*.heif "$SOURCE_DIR"/*.avif)
shopt -u nullglob nocaseglob

if [[ ${#input_files[@]} -eq 0 ]]; then
  log "No HEIC/AVIF files found in $SOURCE_DIR"
  exit 0
fi

success_count=0
failure_count=0

for input_file in "${input_files[@]}"; do
  stem="$(basename "${input_file%.*}")"

  if convert_file "$input_file" "$stem"; then
    success_count=$(( success_count + 1 ))
  else
    failure_count=$(( failure_count + 1 ))
  fi
done

log ""
log "Done. ${success_count} file(s) converted, ${failure_count} file(s) failed."

if (( failure_count > 0 )); then
  exit 1
fi
