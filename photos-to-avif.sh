#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./photos-to-avif.sh -i <input_dir> -o <output_dir> -w <width> -h <height> [-q <quality>]

Description:
  Resize and center-crop JPG/JPEG images from an input folder and write them
  as AVIF files to an output folder, stripping metadata and restoring only GPS
  EXIF tags to reduce file size while preserving location data.

Options:
  -i  Input folder containing JPG/JPEG files
  -o  Output folder for generated AVIF files
  -w  Output width in pixels
  -h  Output height in pixels
  -q  AVIF quality from 1-100 (default: 60)
  --help  Show this help
EOF
}

error() {
  echo "Error: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || error "Missing dependency: $1"
}

restore_gps_metadata() {
  local src="$1"
  local dest="$2"

  exiftool -overwrite_original -q -q \
    -TagsFromFile "$src" \
    -GPS:all \
    "$dest" >/dev/null 2>&1
}

INPUT_DIR=""
OUTPUT_DIR=""
WIDTH=""
HEIGHT=""
QUALITY=60

while [[ $# -gt 0 ]]; do
  case "$1" in
    -i)
      INPUT_DIR="${2:-}"
      shift 2
      ;;
    -o)
      OUTPUT_DIR="${2:-}"
      shift 2
      ;;
    -w)
      WIDTH="${2:-}"
      shift 2
      ;;
    -h)
      HEIGHT="${2:-}"
      shift 2
      ;;
    -q)
      QUALITY="${2:-}"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      error "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$INPUT_DIR" ]] || error "Missing input folder. Use -i <input_dir>"
[[ -n "$OUTPUT_DIR" ]] || error "Missing output folder. Use -o <output_dir>"
[[ -n "$WIDTH" ]] || error "Missing width. Use -w <width>"
[[ -n "$HEIGHT" ]] || error "Missing height. Use -h <height>"
[[ -d "$INPUT_DIR" ]] || error "Input folder not found: $INPUT_DIR"
[[ "$WIDTH" =~ ^[1-9][0-9]*$ ]] || error "Width must be a positive integer"
[[ "$HEIGHT" =~ ^[1-9][0-9]*$ ]] || error "Height must be a positive integer"
[[ "$QUALITY" =~ ^[0-9]+$ ]] || error "Quality must be an integer between 1 and 100"
(( QUALITY >= 1 && QUALITY <= 100 )) || error "Quality must be between 1 and 100"

require_command magick
require_command exiftool

mkdir -p "$OUTPUT_DIR"

shopt -s nullglob nocaseglob
FILES=("$INPUT_DIR"/*.{jpg,jpeg})
shopt -u nullglob nocaseglob

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No JPG/JPEG files found in '$INPUT_DIR'"
  exit 0
fi

SUCCESS=0
FAIL=0

for src in "${FILES[@]}"; do
  base="$(basename "${src%.*}")"
  dest="$OUTPUT_DIR/$base.avif"

  if magick "$src" \
    -auto-orient \
    -resize "${WIDTH}x${HEIGHT}^" \
    -gravity center \
    -extent "${WIDTH}x${HEIGHT}" \
    -strip \
    -quality "$QUALITY" \
    "$dest"; then
    restore_gps_metadata "$src" "$dest"
    echo "Converted $(basename "$src") -> $(basename "$dest")"
    ((SUCCESS += 1))
  else
    echo "Failed $(basename "$src")" >&2
    ((FAIL += 1))
  fi
done

echo "Done. $SUCCESS converted, $FAIL failed."
