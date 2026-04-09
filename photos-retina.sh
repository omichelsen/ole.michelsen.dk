#!/usr/bin/env bash
# photos-retina.sh
# Convert HEIC/AVIF images to AVIF, WebP, and JPEG at 1x and 2x (retina) sizes.
#
# Usage:
#   photos-retina.sh [OPTIONS] <source_dir> <output_dir>
#
# Options:
#   -w, --width  <px>       Target 1x width  (optional)
#   -h, --height <px>       Target 1x height (optional)
#   -q, --quality-avif <n>  AVIF quality  0–100, default 60
#   -Q, --quality-webp <n>  WebP quality  0–100, default 82
#   -j, --quality-jpeg <n>  JPEG quality  0–100, default 85
#   --help                  Show this help
#
# Resize logic:
#   --width only   → resize to width, maintain aspect ratio
#   --height only  → resize to height, maintain aspect ratio
#   --width+height → center-crop to exact WxH
#   neither        → no resize (only format conversion)
#
# Output filenames:
#   <stem>.avif / <stem>@2x.avif
#   <stem>.webp / <stem>@2x.webp
#   <stem>.jpg  / <stem>@2x.jpg

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
QUALITY_AVIF=60
QUALITY_WEBP=82
QUALITY_JPEG=85
TARGET_W=""
TARGET_H=""

# ── Helpers ───────────────────────────────────────────────────────────────────
usage() {
    grep '^#' "$0" | sed 's/^# \{0,3\}//; s/^#//' | sed -n '/Usage:/,/^$/p'
    exit 0
}

die() { echo "ERROR: $*" >&2; exit 1; }

require_cmd() {
    command -v "$1" &>/dev/null || die "'$1' not found. Install ImageMagick 7 (magick)."
}

# ── Argument parsing ───────────────────────────────────────────────────────────
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -w|--width)         TARGET_W="$2";       shift 2 ;;
        -h|--height)        TARGET_H="$2";       shift 2 ;;
        -q|--quality-avif)  QUALITY_AVIF="$2";   shift 2 ;;
        -Q|--quality-webp)  QUALITY_WEBP="$2";   shift 2 ;;
        -j|--quality-jpeg)  QUALITY_JPEG="$2";   shift 2 ;;
        --help)             usage ;;
        -*)                 die "Unknown option: $1" ;;
        *)                  POSITIONAL+=("$1");  shift ;;
    esac
done

[[ ${#POSITIONAL[@]} -eq 2 ]] || die "Expected <source_dir> and <output_dir>. Run with --help for usage."

SRC_DIR="${POSITIONAL[0]}"
OUT_DIR="${POSITIONAL[1]}"

[[ -d "$SRC_DIR" ]] || die "Source directory not found: $SRC_DIR"
mkdir -p "$OUT_DIR"

require_cmd magick

# ── Validate numeric quality args ─────────────────────────────────────────────
for val in "$QUALITY_AVIF" "$QUALITY_WEBP" "$QUALITY_JPEG"; do
    [[ "$val" =~ ^[0-9]+$ ]] && [[ "$val" -le 100 ]] || \
        die "Quality values must be integers 0–100 (got: $val)"
done

# ── Per-format conversion ─────────────────────────────────────────────────────
# convert_image <input> <output> <scale 1|2> <extra magick opts...>
convert_image() {
    local input="$1"
    local output="$2"
    local scale="$3"
    shift 3
    local fmt_opts=("$@")

    local resize_args=()

    if [[ -n "$TARGET_W" || -n "$TARGET_H" ]]; then
        local w_scaled="" h_scaled=""
        [[ -n "$TARGET_W" ]] && w_scaled=$(( TARGET_W * scale ))
        [[ -n "$TARGET_H" ]] && h_scaled=$(( TARGET_H * scale ))

        if [[ -n "$TARGET_W" && -n "$TARGET_H" ]]; then
            # Both dimensions: cover-fill then center-crop to exact size
            resize_args=(
                -resize "${w_scaled}x${h_scaled}^"
                -gravity Center
                -extent "${w_scaled}x${h_scaled}"
            )
        elif [[ -n "$w_scaled" ]]; then
            resize_args=( -resize "${w_scaled}x" )
        else
            resize_args=( -resize "x${h_scaled}" )
        fi
    fi

    magick "$input" \
        -auto-orient \
        "${resize_args[@]+"${resize_args[@]}"}" \
        -strip \
        "${fmt_opts[@]}" \
        "$output"
}

# ── Main loop ─────────────────────────────────────────────────────────────────
shopt -s nullglob nocaseglob
FILES=("$SRC_DIR"/*.heic "$SRC_DIR"/*.heif "$SRC_DIR"/*.avif)
shopt -u nullglob nocaseglob

[[ ${#FILES[@]} -gt 0 ]] || die "No HEIC, HEIF, or AVIF files found in: $SRC_DIR"

SUCCESS=0
FAIL=0

for input in "${FILES[@]}"; do
    filename="$(basename "$input")"
    stem="${filename%.*}"

    echo "── $filename"

    for scale in 1 2; do
        suffix="@1x"
        [[ $scale -eq 2 ]] && suffix="@2x"

        # ── AVIF ──────────────────────────────────────────────────────────────
        out_avif="${OUT_DIR}/${stem}${suffix}.avif"
        if convert_image "$input" "$out_avif" "$scale" \
                -quality "$QUALITY_AVIF" -define avif:speed=6 2>/tmp/im_err; then
            echo "   ✓ ${stem}${suffix}.avif"
        else
            echo "   ✗ ${stem}${suffix}.avif — $(cat /tmp/im_err)" >&2
            (( FAIL++ )) || true
        fi

        # ── WebP ──────────────────────────────────────────────────────────────
        out_webp="${OUT_DIR}/${stem}${suffix}.webp"
        if convert_image "$input" "$out_webp" "$scale" \
                -quality "$QUALITY_WEBP" 2>/tmp/im_err; then
            echo "   ✓ ${stem}${suffix}.webp"
        else
            echo "   ✗ ${stem}${suffix}.webp — $(cat /tmp/im_err)" >&2
            (( FAIL++ )) || true
        fi

        # ── JPEG ──────────────────────────────────────────────────────────────
        out_jpg="${OUT_DIR}/${stem}${suffix}.jpg"
        if convert_image "$input" "$out_jpg" "$scale" \
                -quality "$QUALITY_JPEG" \
                -sampling-factor 4:2:0 \
                -interlace JPEG 2>/tmp/im_err; then
            echo "   ✓ ${stem}${suffix}.jpg"
        else
            echo "   ✗ ${stem}${suffix}.jpg — $(cat /tmp/im_err)" >&2
            (( FAIL++ )) || true
        fi
    done

    (( SUCCESS++ )) || true
done

echo ""
echo "Done. Processed $SUCCESS source file(s) with $FAIL conversion error(s)."
[[ $FAIL -eq 0 ]]