#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./photos-exif-to-json.sh -i <input_dir> -o <output_file>

Description:
  Recursively scan an input folder for AVIF files and write a flat JSON
  object keyed by filename. Each value contains:

    {
      "lat": 55.9351,
      "lng": 12.3009,
      "width": 100,
      "height": 206
    }

  The output shape matches src/_data/exif.json.

Options:
  -i  Input folder to scan recursively
  -o  Output JSON file
  --help  Show this help
EOF
}

error() {
  echo "Error: $*" >&2
  exit 1
}

warn() {
  echo "Warning: $*" >&2
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || error "Missing dependency: $1"
}

parse_exif_number() {
  local value="$1"

  if [[ "$value" == */* ]]; then
    local numerator="${value%%/*}"
    local denominator="${value##*/}"
    awk -v n="$numerator" -v d="$denominator" 'BEGIN { printf "%.10f", n / d }'
  else
    printf "%s" "$value"
  fi
}

decimal_from_dms() {
  local ref="$1"
  local dms="$2"

  IFS=',' read -r deg min sec <<< "$dms"

  local degrees minutes seconds result
  degrees="$(parse_exif_number "$deg")"
  minutes="$(parse_exif_number "$min")"
  seconds="$(parse_exif_number "$sec")"

  result="$(awk -v d="$degrees" -v m="$minutes" -v s="$seconds" 'BEGIN { printf "%.4f", d + (m / 60) + (s / 3600) }')"

  if [[ "$ref" == "S" || "$ref" == "W" ]]; then
    awk -v value="$result" 'BEGIN { printf "%.4f", value * -1 }'
  else
    printf "%s" "$result"
  fi
}

INPUT_DIR=""
OUTPUT_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -i)
      INPUT_DIR="${2:-}"
      shift 2
      ;;
    -o)
      OUTPUT_FILE="${2:-}"
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
[[ -n "$OUTPUT_FILE" ]] || error "Missing output file. Use -o <output_file>"
[[ -d "$INPUT_DIR" ]] || error "Input folder not found: $INPUT_DIR"

require_command magick
require_command node

OUTPUT_DIR="$(dirname "$OUTPUT_FILE")"
mkdir -p "$OUTPUT_DIR"

temp_file="$(mktemp)"
cleanup() {
  rm -f "$temp_file"
}
trap cleanup EXIT

count=0
skipped=0

while IFS= read -r -d '' file; do
  filename="$(basename "$file")"

  if ! output="$(magick identify -format '%[EXIF:GPSLatitudeRef]\n%[EXIF:GPSLatitude]\n%[EXIF:GPSLongitudeRef]\n%[EXIF:GPSLongitude]\n%w\n%h' "$file" 2>/dev/null)"; then
    warn "Skipping $file because metadata could not be read"
    skipped=$((skipped + 1))
    continue
  fi

  old_ifs="$IFS"
  IFS=$'\n'
  set -f
  lines=($output)
  set +f
  IFS="$old_ifs"

  lat_ref="${lines[0]:-}"
  lat_raw="${lines[1]:-}"
  lng_ref="${lines[2]:-}"
  lng_raw="${lines[3]:-}"
  width="${lines[4]:-}"
  height="${lines[5]:-}"

  if [[ -z "$lat_ref" || -z "$lat_raw" || -z "$lng_ref" || -z "$lng_raw" ]]; then
    warn "Skipping $file because GPS EXIF data is missing"
    skipped=$((skipped + 1))
    continue
  fi

  lat="$(decimal_from_dms "$lat_ref" "$lat_raw")"
  lng="$(decimal_from_dms "$lng_ref" "$lng_raw")"

  printf '%s\t%s\t%s\t%s\t%s\n' "$filename" "$lat" "$lng" "$width" "$height" >> "$temp_file"
  count=$((count + 1))
done < <(find "$INPUT_DIR" -type f -iname '*.avif' -print0 | sort -z)

node - "$temp_file" "$OUTPUT_FILE" <<'EOF'
const fs = require('fs')

const [, , inputPath, outputPath] = process.argv
const lines = fs.existsSync(inputPath)
  ? fs.readFileSync(inputPath, 'utf8').split('\n').filter(Boolean)
  : []

const data = Object.fromEntries(
  lines.map((line) => {
    const [filename, lat, lng, width, height] = line.split('\t')
    return [
      filename,
      {
        lat: Number(lat),
        lng: Number(lng),
        width: Number(width),
        height: Number(height),
      },
    ]
  })
)

fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`)
EOF

echo "Wrote $count entries to $OUTPUT_FILE"
if (( skipped > 0 )); then
  echo "Skipped $skipped file(s) without readable GPS EXIF data"
fi
