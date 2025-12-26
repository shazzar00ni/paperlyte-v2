# Fonts Directory

This directory contains self-hosted font files for security and performance.

## Current Fonts

- ✅ **Inter Variable** (`Inter-Variable.woff2`) - Body text and UI elements

## Missing Fonts

- ⚠️ **Playfair Display Variable** (`PlayfairDisplay-Variable.woff2`) - Headings

### To Add Playfair Display:

1. Visit [Google Webfonts Helper](https://gwfh.mranftl.com/fonts/playfair-display?subsets=latin)
2. Select "Variable" font
3. Download the `PlayfairDisplay-Variable.woff2` file
4. Place it in this directory as `PlayfairDisplay-Variable.woff2`

Alternatively, use this direct download:
```bash
# Download Playfair Display Variable font
curl -o public/fonts/PlayfairDisplay-Variable.woff2 \
  "https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff2"
```

## Font Face Declarations

Font face declarations are defined in:
- Main app: `src/styles/typography.css`
- Privacy page: `public/privacy.html`
- Terms page: `public/terms.html`

All font references use self-hosted files for security (no CDN dependencies).
