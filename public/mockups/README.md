# Product Mockups

This directory contains product screenshot mockups used throughout the Paperlyte landing page.

## Required Images

### 1. `notes-list.png`

**Purpose**: Primary hero mockup showing the notes list view
**Content**: "Today's Notes" interface with 3 notes displayed:
- "Project Ideas" (blue dot) - Brainstorming session for the new app...
- "Meeting Notes" (green dot) - Key takeaways from client discussion...
- "Quick Thoughts" (purple dot) - Writing in progress...

**Recommended specs**:
- Format: PNG (with transparency if applicable)
- Dimensions: ~1100x800px or similar aspect ratio (16:10 preferred)
- DPI: 144 (2x for Retina displays)
- File size: < 500KB (optimize for web)

### 2. `note-detail.png`

**Purpose**: Secondary floating mockup showing note editor view
**Content**: Single note editor window, using either generic window chrome or (optionally) macOS-style window controls (red, yellow, green dots), and bullet points:
- Quick idea about the new project...
- Remember to call Sarah about the meeting
- Brain dump for tomorrow's presentation...

**Recommended specs**:
- Format: PNG (with transparency if applicable)
- Dimensions: ~800x600px or similar
- DPI: 144 (2x for Retina displays)
- File size: < 400KB (optimize for web)

## Usage

These images are displayed in the Hero section of the landing page (`src/components/sections/Hero/Hero.tsx`).

- **Primary mockup** (`notes-list.png`): Main focus, displayed prominently
- **Secondary mockup** (`note-detail.png`): Floating accent, overlapping the primary mockup for visual depth

### Fallback Strategy

The Hero component uses `<picture>` elements with:

- **PNG source** (preferred): High-quality optimized images for production
- **SVG fallback** (included): Lightweight vector placeholders used when PNG files are missing

Current placeholder files:

- `notes-list.svg` - SVG placeholder matching the notes list layout
- `note-detail.svg` - SVG placeholder matching the note detail layout

**For production**: Replace placeholders by adding optimized PNG files as specified above.

## Image Optimization

Before adding images, ensure they are optimized for web:

```bash
# Using ImageMagick
convert original.png -resize 1100x -quality 85 notes-list.png

# Using pngquant (for better PNG compression)
pngquant --quality=85-95 original.png --output notes-list.png
```

## Accessibility

All mockup images include descriptive alt text in the Hero component for screen readers. No additional action needed.
