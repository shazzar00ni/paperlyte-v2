# Required Image Assets - Paperlyte

This document outlines the image assets that need to be created for the Paperlyte landing page to complete the high-priority SEO and branding requirements from the audit report.

## Current Status

### ✅ Completed
- **SVG Favicon**: `/public/favicon.svg` - Created with brand blue (#3b82f6)
- **Open Graph Meta Tags**: Added to `index.html`
- **Twitter Card Meta Tags**: Added to `index.html`

### ❌ Missing Assets

The following image files are referenced in the HTML meta tags but do not yet exist:

## 1. Social Media Preview Images

### Open Graph Image (Facebook, LinkedIn, etc.)
- **File**: `public/og-image.jpg`
- **Dimensions**: 1200 x 630 pixels
- **Format**: JPG (optimized for web)
- **Requirements**:
  - Use brand blue (#3b82f6) as primary color
  - Include Paperlyte logo/wordmark
  - Tagline: "Your thoughts, unchained from complexity"
  - Clean, modern design matching landing page aesthetic
  - Paper-inspired visual elements
  - High contrast for readability on social media feeds

### Twitter Card Image
- **File**: `public/twitter-image.jpg`
- **Dimensions**: 1200 x 675 pixels (16:9 aspect ratio)
- **Format**: JPG (optimized for web)
- **Requirements**:
  - Same design requirements as OG image
  - Adjusted for 16:9 aspect ratio
  - Ensure key elements are centered for proper cropping

## 2. Favicon Files (PNG formats)

While the SVG favicon is now in place, additional PNG formats are recommended for broader compatibility:

### Standard Favicons
- **File**: `public/favicon-32x32.png`
  - **Dimensions**: 32 x 32 pixels
  - **Format**: PNG with transparency
  - **Source**: Convert from `/public/favicon.svg`

- **File**: `public/favicon-16x16.png`
  - **Dimensions**: 16 x 16 pixels
  - **Format**: PNG with transparency
  - **Source**: Convert from `/public/favicon.svg`

### Apple Touch Icon
- **File**: `public/apple-touch-icon.png`
  - **Dimensions**: 180 x 180 pixels
  - **Format**: PNG (no transparency - use solid background)
  - **Background**: White or brand blue (#3b82f6)
  - **Source**: Convert from `/public/favicon.svg`

## 3. Web App Manifest

Create a web app manifest for PWA support (optional but recommended):

- **File**: `public/site.webmanifest`
- **Content**:
```json
{
  "name": "Paperlyte",
  "short_name": "Paperlyte",
  "description": "Lightning-fast, distraction-free notes",
  "icons": [
    {
      "src": "/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### PWA Icons (if implementing manifest)
- `public/favicon-192x192.png` (192 x 192 pixels)
- `public/favicon-512x512.png` (512 x 512 pixels)

## Brand Guidelines

### Colors
- **Primary Blue**: `#3b82f6`
- **Text Dark**: `#1e293b`
- **Text Secondary**: `#64748b`
- **Background**: `#ffffff`

### Typography
- **Font Family**: Inter (already loaded via @fontsource/inter)
- **Weights**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

### Visual Style
- Paper-inspired design
- Clean, minimal aesthetic
- Lightning bolt icon for speed emphasis
- Focus on simplicity over complexity

## Tools for Image Creation

### Design Tools (recommended):
- **Figma** - Professional design tool (free tier available)
- **Canva** - Quick mockups and social media images
- **Adobe Illustrator** - For vector graphics

### Conversion Tools (SVG to PNG):
```bash
# If ImageMagick is available:
convert -density 300 -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -density 300 -background none favicon.svg -resize 16x16 favicon-16x16.png
convert -density 300 -background white favicon.svg -resize 180x180 apple-touch-icon.png

# Or use online tools:
# - https://cloudconvert.com/svg-to-png
# - https://www.svgtopng.com/
```

## After Creating Assets

Once all image assets are created:

1. Place them in the `public/` directory
2. Update `index.html` to reference the PNG favicons:
   ```html
   <!-- Favicon -->
   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
   <link rel="manifest" href="/site.webmanifest" />
   ```

3. Test social media previews:
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

## Priority

According to the audit report:
- **Social media images**: 🔴 **HIGH PRIORITY** (2-3 hours effort)
- **Favicon PNGs**: 🟡 **MEDIUM PRIORITY** (1 hour effort)
- **PWA manifest**: 🟢 **LOW PRIORITY** (optional enhancement)

## Estimated Effort

- Social media preview images: 2-3 hours
- PNG favicon generation: 30 minutes
- PWA manifest setup: 30 minutes
- **Total**: 3-4 hours

---

**Created**: December 10, 2024
**Status**: Awaiting image asset creation
**Related**: AUDIT-REPORT.md Section 7 (High Priority Recommendations)
