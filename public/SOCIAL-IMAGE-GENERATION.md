# Social Media Image Generation

## Overview
The `og-image.svg` (1200x630) and `twitter-image.svg` (1200x675) files serve as source templates for social media preview images.

## Why JPG/PNG is Required
While we've created SVG templates, most social media platforms (Facebook, Twitter/X, LinkedIn) require **raster images** (JPG or PNG) for preview cards. SVG is not supported.

## Generating Social Media Images

### Method 1: Online Converter (Quickest)
1. Visit <https://cloudconvert.com/svg-to-jpg> or <https://svgtopng.com/>
2. Upload `public/og-image.svg` and `public/twitter-image.svg`
3. Set quality to 90-95%
4. Download as JPG
5. Rename to:
   - `og-image.jpg` (from og-image.svg)
   - `twitter-image.jpg` (from twitter-image.svg)
6. Place in `public/` directory

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert SVG to JPG with high quality
convert public/og-image.svg -quality 95 public/og-image.jpg
convert public/twitter-image.svg -quality 95 public/twitter-image.jpg
```

### Method 3: Using Browser DevTools
1. Open `public/og-image.svg` in a browser
2. Open DevTools (F12)
3. Zoom to 100%
4. Right-click on the SVG and "Inspect"
5. Right-click the SVG element and "Capture Node Screenshot"
6. Save as `og-image.jpg`
7. Repeat for `twitter-image.svg`

### Method 4: Using Node.js (Automated)
```bash
# Install sharp package
npm install --save-dev sharp

# Create and run generation script
node scripts/generate-social-images.js
```

## Image Specifications

### Open Graph (Facebook, LinkedIn)
- **File**: `og-image.jpg`
- **Dimensions**: 1200 x 630 pixels
- **Aspect Ratio**: 1.91:1
- **Format**: JPG (recommended) or PNG
- **Max Size**: < 8 MB
- **Recommended**: 95% quality JPG

### Twitter Card
- **File**: `twitter-image.jpg`
- **Dimensions**: 1200 x 675 pixels (or use 1200x630)
- **Aspect Ratio**: 16:9 (or 1.91:1)
- **Format**: JPG (recommended) or PNG
- **Max Size**: < 5 MB
- **Recommended**: 90-95% quality JPG

## Testing Social Media Previews

After generating and deploying the images, test them with:

### Facebook Debugger
- URL: <https://developers.facebook.com/tools/debug/>
- Paste your site URL
- Click "Scrape Again" to refresh cache

### Twitter/X Card Validation
- Twitter/X no longer provides a public Card Validator tool.
- To validate your Twitter/X cards:
  - Use the [Twitter Developer Portal](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) for documentation and troubleshooting.
  - Alternatively, use a meta tag preview tool like [metatags.io](https://metatags.io/) to check your card rendering.

### LinkedIn Post Inspector
- URL: <https://www.linkedin.com/post-inspector/>
- Paste your site URL
- Check preview rendering

## Current Status

✅ `og-image.svg` - Created (vector template, 1200x630)
✅ `twitter-image.svg` - Created (vector template, 1200x675)
⚠️ `og-image.jpg` - Needs conversion from SVG
⚠️ `twitter-image.jpg` - Needs conversion from SVG

## Temporary Fallback

The HTML currently references `.jpg` files. Until these are generated:
- Social media platforms may show a broken image or no preview
- The site will still function normally
- Update meta tags to use `.svg` temporarily if needed for testing

## Automation Script (Optional)

Create `scripts/generate-social-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

async function generateSocialImages() {
  // Convert OG image
  await sharp('public/og-image.svg')
    .resize(1200, 630)
    .jpeg({ quality: 95 })
    .toFile('public/og-image.jpg');

  // Convert Twitter image
  await sharp('public/twitter-image.svg')
    .resize(1200, 675)
    .jpeg({ quality: 95 })
    .toFile('public/twitter-image.jpg');

  console.log('✅ Social media images generated successfully!');
}

generateSocialImages().catch(console.error);
```

Run with: `node scripts/generate-social-images.js`
