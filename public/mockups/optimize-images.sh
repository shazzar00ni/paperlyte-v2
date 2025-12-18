#!/bin/bash
# Image optimization script for Paperlyte mockups
#
# Usage: ./optimize-images.sh [SOURCE1] [SOURCE2]
#
# Arguments (all optional):
#   SOURCE1 - Path to source image for notes-list.png (default: notes-list-original.png or notes-list.png)
#   SOURCE2 - Path to source image for note-detail.png (default: note-detail-original.png or note-detail.png)
#
# The script expects PNG format images and will:
#   - Resize to recommended dimensions (1100x800 for notes-list, 800x600 for note-detail)
#   - Optimize quality and strip metadata
#   - Compress with pngquant for web delivery
#
# Prerequisites:
#   - ImageMagick: sudo apt-get install imagemagick
#   - pngquant: sudo apt-get install pngquant

echo "Optimizing mockup images for web..."

# Check if images exist
if [ ! -f "notes-list.png" ] && [ ! -f "note-detail.png" ]; then
  echo "Error: No images found in current directory"
  echo "Please place your original images here first:"
  echo "  - notes-list-original.png (or notes-list.png)"
  echo "  - note-detail-original.png (or note-detail.png)"
  echo ""
  echo "Or pass custom filenames as arguments:"
  echo "  ./optimize-images.sh my-list.png my-detail.png"
  exit 1
fi

# Optimize notes-list.png if it exists
if [ -f "notes-list-original.png" ] || [ -f "notes-list.png" ]; then
  echo "Optimizing notes-list.png..."

  # Use original if it exists, otherwise use the main file
  INPUT="${1:-notes-list-original.png}"
  [ ! -f "$INPUT" ] && INPUT="notes-list.png"

  # Resize to recommended dimensions while maintaining aspect ratio
  convert "$INPUT" \
    -resize '1100x800>' \
    -quality 90 \
    -strip \
    notes-list-temp.png

  # Compress with pngquant
  pngquant --quality=85-95 notes-list-temp.png --output notes-list.png --force

  rm -f notes-list-temp.png

  echo "✓ notes-list.png optimized"
  ls -lh notes-list.png
fi

# Optimize note-detail.png if it exists
if [ -f "note-detail-original.png" ] || [ -f "note-detail.png" ]; then
  echo "Optimizing note-detail.png..."

  # Use original if it exists, otherwise use the main file
  INPUT="${2:-note-detail-original.png}"
  [ ! -f "$INPUT" ] && INPUT="note-detail.png"

  # Resize to recommended dimensions while maintaining aspect ratio
  convert "$INPUT" \
    -resize '800x600>' \
    -quality 90 \
    -strip \
    note-detail-temp.png

  # Compress with pngquant
  pngquant --quality=85-95 note-detail-temp.png --output note-detail.png --force

  rm -f note-detail-temp.png

  echo "✓ note-detail.png optimized"
  ls -lh note-detail.png
fi

echo ""
echo "Optimization complete!"
echo "File sizes:"
du -h notes-list.png note-detail.png 2>/dev/null
