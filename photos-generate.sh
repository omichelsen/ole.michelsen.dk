#!/usr/bin/env bash
# =============================================================================
# convert_images.sh
# Converts AVIF images in a folder to multi-format, multi-resolution versions
# optimised for retina displays.
#
# Output formats per image:
#   • AVIF  (HDR-capable, modern browsers)
#   • WebP  (wide browser support)
#   • JPEG  (universal fallback)
#
# Output sizes per image:
#   • Portrait  (height > width) → 200 px wide  @1x, 400 px wide  @2x (retina)
#   • Landscape (width >= height) → 400 px wide  @1x, 800 px wide  @2x (retina)
#
# Usage:
#   ./convert_images.sh <folder_path> [options]
#
# Options:
#   -q, --quality <0-100>   JPEG/WebP quality        (default: 85)
#   -a, --avif-quality <0-100> AVIF quality (higher=better) (default: 70)
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
  grep '^#' "$0" | grep -v '#!/' | sed 's/^# \{0,2\}//'
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

# ── Convert one file to one format at one width ───────────────────────────────
# Args: src  dest_no_ext  width  format  quality  avif_quality  verbose
convert_one() {
  local src="$1" base="$2" width="$3" fmt="$4" quality="$5" avifq="$6" verbose="$7"
  local dest="${base}.${fmt}"
  local ff_quiet=(-loglevel error)
  $verbose && ff_quiet=()

  local scale_filter="scale=${width}:-2:flags=lanczos"

  case "$fmt" in
    avif)
      # ffmpeg's libaom-av1 encoder is not always compiled into Homebrew builds.
      # Instead: decode+scale via ffmpeg to a temp PNG, then encode with avifenc.
      # avifenc quality: 0=worst, 100=lossless (60–80 is a good range for photos)
      local tmp_png
      tmp_png="$(mktemp /tmp/convert_XXXXXX.png)"
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$scale_filter" \
        "$tmp_png"
      if $verbose; then
        avifenc --jobs all -q "$avifq" "$tmp_png" "$dest"
      else
        avifenc --jobs all -q "$avifq" "$tmp_png" "$dest" > /dev/null 2>&1
      fi
      rm -f "$tmp_png"
      ;;
    webp)
      # ffmpeg's libwebp encoder is not compiled into the standard Homebrew build.
      # Instead: decode+scale via ffmpeg to a temp PNG, then encode with cwebp.
      local tmp_png
      tmp_png="$(mktemp /tmp/convert_XXXXXX.png)"
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$scale_filter" \
        "$tmp_png"
      local cwebp_quiet=(-quiet)
      $verbose && cwebp_quiet=()
      cwebp "${cwebp_quiet[@]}" -q "$quality" -m 6 "$tmp_png" -o "$dest"
      rm -f "$tmp_png"
      ;;
    jpg)
      ffmpeg "${ff_quiet[@]}" -y -i "$src" \
        -vf "$scale_filter" \
        -q:v 2 \
        -huffman optimal \
        "$dest"
      # Apply quality with a second pass using sips (macOS native) if available
      # — ffmpeg JPEG quality via -q:v is approximate; for fine control we
      #   re-encode with sips which respects a 0-100 scale.
      if command -v sips &>/dev/null; then
        sips --setProperty formatOptions "$quality" "$dest" &>/dev/null || true
      fi
      ;;
  esac
}

# ── Process a single AVIF source image ────────────────────────────────────────
process_image() {
  local src="$1"
  local filename
  filename="$(basename "$src" .avif)"

  # Get dimensions
  local dims
  dims="$(get_dimensions "$src")"
  if [[ -z "$dims" ]]; then
    warn "Could not read dimensions for: $src — skipping"
    return
  fi

  local w h
  IFS=',' read -r w h <<< "$dims"

  # Determine orientation and base widths
  local w1x w2x orientation
  if (( h > w )); then
    orientation="portrait"
    w1x=200
    w2x=400
  else
    orientation="landscape"
    w1x=400
    w2x=800
  fi

  log "$(basename "$src")  [${w}×${h} px, ${orientation}]"

  local formats=(avif webp jpg)

  for fmt in "${formats[@]}"; do
    local dir_fmt="${OUTPUT_DIR}/${fmt}"
    mkdir -p "$dir_fmt"

    # 1× (standard)
    local dest1x="${dir_fmt}/${filename}@1x"
    convert_one "$src" "$dest1x" "$w1x" "$fmt" "$QUALITY" "$AVIF_QUALITY" "$VERBOSE"

    # 2× (retina)
    local dest2x="${dir_fmt}/${filename}@2x"
    convert_one "$src" "$dest2x" "$w2x" "$fmt" "$QUALITY" "$AVIF_QUALITY" "$VERBOSE"

    ok "  ${fmt}: ${w1x}px @1x + ${w2x}px @2x → ${dir_fmt}/"
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

  # Collect AVIF files (case-insensitive extension)
  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.avif" \) -print0 | sort -z)

  local count="${#files[@]}"
  if (( count == 0 )); then
    warn "No AVIF files found in: $INPUT_DIR"
    exit 0
  fi

  echo "  Found : ${count} AVIF file(s)"
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