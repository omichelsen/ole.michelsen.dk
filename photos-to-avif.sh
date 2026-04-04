#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/folder [quality 1-100]"
  exit 1
fi

FOLDER="$1"
QUALITY="${2:-80}"

if [ ! -d "$FOLDER" ]; then
  echo "Error: '$FOLDER' is not a valid directory"
  exit 1
fi

if ! [[ "$QUALITY" =~ ^[0-9]+$ ]] || [ "$QUALITY" -lt 1 ] || [ "$QUALITY" -gt 100 ]; then
  echo "Error: quality must be a number between 1 and 100"
  exit 1
fi

shopt -s nullglob nocaseglob
FILES=("$FOLDER"/*.{jpg,jpeg,heic})
shopt -u nullglob nocaseglob

if [ ${#FILES[@]} -eq 0 ]; then
  echo "No JPEG or HEIC files found in '$FOLDER'"
  exit 0
fi

echo "Converting ${#FILES[@]} file(s) in '$FOLDER' at quality $QUALITY..."

SUCCESS=0
FAIL=0

for f in "${FILES[@]}"; do
  OUT="${f%.*}.avif"
  if magick "$f" -quality "$QUALITY" "$OUT"; then
    echo "  ✓ $(basename "$f") → $(basename "$OUT")"
    ((SUCCESS++))
  else
    echo "  ✗ Failed: $(basename "$f")"
    ((FAIL++))
  fi
done

echo ""
echo "Done. $SUCCESS converted, $FAIL failed."