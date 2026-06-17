# Fonts Directory

This directory contains self-hosted font files for security and performance.

## Current Fonts

- ✅ **Inter Variable** (`Inter-Variable.woff2`) - Body text and UI elements (Latin subset, ~48KB, sourced from Google Fonts)
- ✅ **Playfair Display Variable** (`PlayfairDisplay-Variable.woff2`) - Headings (Latin subset, ~38KB, sourced from Google Fonts)

Both fonts are self-hosted Latin-subsetted variable fonts. No CDN dependencies at runtime.

## Font Face Declarations

Font face declarations are defined in:

- Main app: `src/styles/typography.css`
- Privacy page: `public/privacy.html`
- Terms page: `public/terms.html`

## Preload Tags

`<link rel="preload">` tags for both fonts are declared in `index.html` to avoid
depth-2 critical-request chains and pass the Lighthouse network-dependency-tree audit.
