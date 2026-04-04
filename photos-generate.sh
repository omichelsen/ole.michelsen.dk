#!/usr/bin/env bash
# =============================================================================
# convert_images.sh
# Converts AVIF and JPEG images in a folder to multi-format, multi-resolution versions
# optimised for retina displays.
#
# Output formats per image:
#   • AVIF  (HDR-capable, modern browsers)
#   • WebP  (wide browser support)
#   • JPEG  (universal fallback)
#
# Output sizes per image:
#   • Default portrait  (height > width) → 200 px wide  @1x, 400 px wide  @2x
#   • Default landscape (width >= height) → centre-cropped to 2:3, 200 px wide @1x, 400 px wide @2x
#   • Custom size via --width/--height → exact WxH @1x, doubled at @2x
#
# Usage:
#   ./convert_images.sh <folder_path> [options]
#
# Options:
#   -q, --quality <0-100>   JPEG/WebP quality        (default: 85)
#   -a, --avif-quality <0-100> AVIF quality (higher=better) (default: 70)
#   -w, --width <px>        Output width for @1x     (optional)
#   -H, --height <px>       Output height for @1x    (optional)
#   -o, --output <folder>   Output folder            (default: <folder>/converted)
#   -v, --verbose           Show per-file ffmpeg output
#   -h, --help              Show this help
#
# Dependencies:
#   ffmpeg   — install via Homebrew: brew install ffmpeg
#   cwebp    — install via Homebrew: brew install webp
#   avifenc  — install via Homebrew: brew install libavif
# =============================================================================

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
INPUT_DIR=""
QUALITY=85
AVIF_QUALITY=70
OUTPUT_DIR=""
VERBOSE=false
TARGET_WIDTH=""
TARGET_HEIGHT=""

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()    { echo -e "${CYAN}▸${RESET} $*"; }
ok()     { echo -e "${GREEN}✔${RESET} $*"; }
warn()   { echo -e "${YELLOW}⚠${RESET} $*"; }
error()  { echo -e "${RED}✖${RESET} $*" >&2; }
header() { echo -e "\n${BOLD}$*${RESET}"; }

# ── Usage ─────────────────────────────────────────────────────────────────────
usage() {
  awk '
    /^#!/ { next }
    /^# =============================================================================$/ { in_header = !in_header; if (!in_header) exit; next }
    in_header && /^#/ { sub(/^# ?/, ""); print }
  ' "$0"
  exit 0
}

# ── Dependency check ──────────────────────────────────────────────────────────
check_deps() {
  local missing=()

  command -v ffmpeg  &>/dev/null || missing+=("ffmpeg   → brew install ffmpeg")
  command -v ffprobe &>/dev/null || missing+=("ffprobe  → brew install ffmpeg")
  command -v cwebp   &>/dev/null || missing+=("cwebp    → brew install webp")
  command -v avifenc &>/dev/null || missing+=("avifenc  → brew install libavif")

  if (( ${#missing[@]} > 0 )); then
    error "Missing dependencies:"
    for m in "${missing[@]}"; do echo "    $m"; done
    exit 1
  fi

  # Verify AVIF decode support
  if ! ffmpeg -codecs 2>/dev/null | grep -q 'av1\|avif'; then
    warn "ffmpeg may lack AV1/AVIF support. If conversions fail, try:"
    warn "  brew reinstall ffmpeg"
  fi
}

# ── Argument parsing ──────────────────────────────────────────────────────────
parse_args() {
  [[ $# -eq 0 ]] && { error "No folder specified."; echo "Usage: $0 <folder> [options]"; exit 1; }

  # Two-pass parse: flags can appear in any order relative to the positional arg
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -q|--quality)        QUALITY="$2";      shift 2 ;;
      -a|--avif-quality)   AVIF_QUALITY="$2"; shift 2 ;;
      -w|--width)          TARGET_WIDTH="$2"; shift 2 ;;
      -H|--height)         TARGET_HEIGHT="$2"; shift 2 ;;
      -o|--output)         OUTPUT_DIR="$2";   shift 2 ;;
      -v|--verbose)        VERBOSE=true;      shift   ;;
      -h|--help)           usage ;;
      -*)  error "Unknown option: $1"; exit 1 ;;
      *)
        # Positional argument — the input folder
        if [[ -z "${INPUT_DIR:-}" ]]; then
          INPUT_DIR="$1"
        else
          error "Unexpected argument: $1 (input folder already set to: $INPUT_DIR)"
          exit 1
        fi
        shift
        ;;
    esac
  done

  [[ -z "${INPUT_DIR:-}" ]] && { error "No input folder specified."; exit 1; }
  [[ ! -d "$INPUT_DIR" ]]   && { error "Folder not found: $INPUT_DIR"; exit 1; }
  [[ -n "$TARGET_WIDTH" && ! "$TARGET_WIDTH" =~ ^[1-9][0-9]*$ ]] && {
    error "Width must be a positive integer: $TARGET_WIDTH"
    exit 1
  }
  [[ -n "$TARGET_HEIGHT" && ! "$TARGET_HEIGHT" =~ ^[1-9][0-9]*$ ]] && {
    error "Height must be a positive integer: $TARGET_HEIGHT"
    exit 1
  }
  if [[ -n "$TARGET_WIDTH" || -n "$TARGET_HEIGHT" ]]; then
    [[ -n "$TARGET_WIDTH" && -n "$TARGET_HEIGHT" ]] || {
      error "Custom sizing requires both --width and --height."
      exit 1
    }
  fi

  # Default output dir sits inside the input dir
  [[ -z "$OUTPUT_DIR" ]] && OUTPUT_DIR="${INPUT_DIR%/}/converted"
}

# ── Get image dimensions via ffprobe ─────────────────────────────────────────
get_dimensions() {
  local file="$1"
  ffprobe -v error \
          -select_streams v:0 \
          -show_entries stream=width,height \
          -of csv=p=0 \
          "$file" 2>/dev/null
}

build_exact_filter() {
  local target_w="$1" target_h="$2"
  printf "scale=%s:%s:force_original_aspect_ratio=increase:flags=lanczos,crop=%s:%s" \
    "$target_w" "$target_h" "$target_w" "$target_h"
}

# ── Convert one file to one format with a given filter ───────────────────────
# Args: src  dest_no_ext  vf_filter  format  quality  avif_quality  verbose
convert_one() {
  local src="$1" base="$2" vf_filter="$3" fmt="$4" quality="$5" avifq="$6" verbose="$7"
  local dest="${base}.${fmt}"
  local ff_quiet=(-loglevel error)
  $verbose && ff_quiet=()

  case "$fmt" in
    avif)
      local tmp_png
      tmp_png="$(mktemp /tmp/convert_XXXXXX.png)"
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$vf_filter" \
        "$tmp_png" || {
          rm -f "$tmp_png"
          return 1
        }
      if $verbose; then
        avifenc --jobs all -q "$avifq" "$tmp_png" "$dest" || {
          rm -f "$tmp_png"
          return 1
        }
      else
        avifenc --jobs all -q "$avifq" "$tmp_png" "$dest" > /dev/null 2>&1 || {
          rm -f "$tmp_png"
          return 1
        }
      fi
      rm -f "$tmp_png"
      ;;
    webp)
      local tmp_png
      tmp_png="$(mktemp /tmp/convert_XXXXXX.png)"
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$vf_filter" \
        "$tmp_png" || {
          rm -f "$tmp_png"
          return 1
        }
      local cwebp_quiet=(-quiet)
      $verbose && cwebp_quiet=()
      cwebp "${cwebp_quiet[@]}" -q "$quality" -m 6 "$tmp_png" -o "$dest" || {
        rm -f "$tmp_png"
        return 1
      }
      rm -f "$tmp_png"
      ;;
    jpg)
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$vf_filter" \
        -q:v 2 \
        -huffman optimal \
        "$dest" || return 1
      if command -v sips &>/dev/null; then
        sips --setProperty formatOptions "$quality" "$dest" &>/dev/null || true
      fi
      ;;
  esac
}

# ── Process a single source image ─────────────────────────────────────────────
process_image() {
  local src="$1"
  local filename
  filename="$(basename "$src")"
  filename="${filename%.*}"

  # Get dimensions
  local dims
  dims="$(get_dimensions "$src")"
  if [[ -z "$dims" ]]; then
    warn "Could not read dimensions for: $src — skipping"
    return
  fi

  local w h
  IFS=',' read -r w h <<< "$dims"

  # Determine orientation and build ffmpeg filter strings.
  local orientation filter1x filter2x w1x w2x h1x h2x

  if [[ -n "$TARGET_WIDTH" && -n "$TARGET_HEIGHT" ]]; then
    orientation="custom ${TARGET_WIDTH}×${TARGET_HEIGHT}"
    w1x="$TARGET_WIDTH"; h1x="$TARGET_HEIGHT"
    w2x=$(( TARGET_WIDTH * 2 )); h2x=$(( TARGET_HEIGHT * 2 ))
    filter1x="$(build_exact_filter "$w1x" "$h1x")"
    filter2x="$(build_exact_filter "$w2x" "$h2x")"
  elif (( h > w )); then
    orientation="portrait"
    w1x=200; w2x=400
    filter1x="scale=${w1x}:-2:flags=lanczos"
    filter2x="scale=${w2x}:-2:flags=lanczos"
  else
    orientation="landscape→crop"
    w1x=200; w2x=400
    h1x=300; h2x=600
    # crop=w:h:x:y  — iw/ih are input width/height at filter time
    # crop to 2:3 from centre, then scale down
    filter1x="crop=ih*2/3:ih:(iw-ih*2/3)/2:0,scale=${w1x}:-2:flags=lanczos"
    filter2x="crop=ih*2/3:ih:(iw-ih*2/3)/2:0,scale=${w2x}:-2:flags=lanczos"
  fi

  log "$(basename "$src")  [${w}×${h} px, ${orientation}]"

  local formats=(avif webp jpg)

  for fmt in "${formats[@]}"; do
    local dir_fmt="${OUTPUT_DIR}/${fmt}"
    mkdir -p "$dir_fmt"

    convert_one "$src" "${dir_fmt}/${filename}@1x" "$filter1x" "$fmt" "$QUALITY" "$AVIF_QUALITY" "$VERBOSE" || return 1
    convert_one "$src" "${dir_fmt}/${filename}@2x" "$filter2x" "$fmt" "$QUALITY" "$AVIF_QUALITY" "$VERBOSE" || return 1

    if [[ -n "${h1x:-}" && -n "${h2x:-}" ]]; then
      ok "  ${fmt}: ${w1x}×${h1x} @1x + ${w2x}×${h2x} @2x → ${dir_fmt}/"
    else
      ok "  ${fmt}: ${w1x}px @1x + ${w2x}px @2x → ${dir_fmt}/"
    fi
  done
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  parse_args "$@"
  check_deps

  header "🖼  Image Converter — Multi-format + Retina"
  echo "  Input : $INPUT_DIR"
  echo "  Output: $OUTPUT_DIR"
  echo "  JPEG/WebP quality : $QUALITY  |  AVIF quality: $AVIF_QUALITY"
  if [[ -n "$TARGET_WIDTH" && -n "$TARGET_HEIGHT" ]]; then
    echo "  Size  : ${TARGET_WIDTH}×${TARGET_HEIGHT} @1x | $(( TARGET_WIDTH * 2 ))×$(( TARGET_HEIGHT * 2 )) @2x"
  fi

  # Collect supported source files (case-insensitive extension)
  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.avif" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0 | sort -z)

  local count="${#files[@]}"
  if (( count == 0 )); then
    warn "No AVIF or JPEG files found in: $INPUT_DIR"
    exit 0
  fi

  echo "  Found : ${count} source file(s)"
  mkdir -p "$OUTPUT_DIR"

  local i=0 errors=0
  for src in "${files[@]}"; do
    i=$(( i + 1 ))
    echo -e "\n[${i}/${count}]"
    if ! process_image "$src"; then
      error "Failed: $src"
      errors=$(( errors + 1 ))
    fi
  done

  header "Done"
  echo "  Processed : $((i - errors))/${count} image(s)"
  (( errors > 0 )) && warn "${errors} error(s) — check output above"
  echo "  Output in : $OUTPUT_DIR"
  echo ""
}

main "$@"
