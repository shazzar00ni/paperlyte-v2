# Icon Generation Instructions

## Overview
The `favicon.svg` file serves as the source for all app icons and favicons.

## Generating PNG Icons

To generate the required PNG icons from the SVG source, use one of these methods:

### Method 1: Online Tool (Quickest)
1. Visit https://realfavicongenerator.net/
2. Upload `public/favicon.svg`
3. Customize if desired
4. Generate and download the icons
5. Extract to the `public/` directory

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate all required sizes
convert public/favicon.svg -resize 16x16 public/favicon-16x16.png
convert public/favicon.svg -resize 32x32 public/favicon-32x32.png
convert public/favicon.svg -resize 180x180 public/apple-touch-icon.png
convert public/favicon.svg -resize 192x192 public/android-chrome-192x192.png
convert public/favicon.svg -resize 512x512 public/android-chrome-512x512.png
```

### Method 3: Using Node.js (Automated)
```bash
# Install sharp package
npm install --save-dev sharp

# Create and run generation script
node scripts/generate-icons.js
```

## Required Icon Sizes

- `favicon-16x16.png` - Browser tab icon (small)
- `favicon-32x32.png` - Browser tab icon (standard)
- `apple-touch-icon.png` (180x180) - iOS home screen
- `android-chrome-192x192.png` - Android home screen
- `android-chrome-512x512.png` - Android splash screen

## Current Status

✅ `favicon.svg` - Created (vector source)
✅ `site.webmanifest` - Created (PWA manifest)
⚠️  PNG icons - Need to be generated (see methods above)

The SVG favicon will work in all modern browsers, but PNG fallbacks are recommended for older browsers and native app icons.
