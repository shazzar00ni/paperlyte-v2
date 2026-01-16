# Streamline Duotone Illustrations Integration Guide

This guide explains how to integrate Streamline HQ duotone illustrations into the Paperlyte landing page.

## Overview

The site now has a complete infrastructure for using duotone SVG illustrations that automatically adapt to your monochrome color scheme and dark mode.

## What's Been Set Up

### 1. Illustration Component

A reusable `<Illustration>` component located at:
- `src/components/ui/Illustration/Illustration.tsx`

**Features:**
- Automatic color theming (black/white in light mode, white/black in dark mode)
- Responsive sizing with 5 variants: `sm`, `md`, `lg`, `xl`, `hero`
- Custom color override support
- Full accessibility support
- Mobile-responsive with proper scaling

**Usage:**
```tsx
import { Illustration } from '@components/ui/Illustration'

<Illustration
  name="speed-fast"
  size="lg"
  ariaLabel="Lightning fast performance"
/>
```

### 2. Directory Structure

Illustrations are stored in `/public/illustrations/`:
- `speed-fast.svg` - For zero-lag typing section (placeholder)
- `tags-organization.svg` - For tag-based organization (placeholder)
- `sync-cloud.svg` - For cross-platform sync (placeholder)
- `mobile-phone.svg` - For mobile section (placeholder)

### 3. Integrated Sections

Illustrations are now used in:

#### Solution Section
- Three large illustrations for the value propositions
- Side-by-side layout on desktop
- Stacked layout on mobile (illustration on top)

#### Mobile Section
- Large illustration showing mobile usage
- Side-by-side layout on desktop
- Stacked layout on mobile

## How to Add Streamline Illustrations

### Step 1: Purchase Access

1. Visit [Streamline HQ Duotone Illustrations](https://www.streamlinehq.com/illustrations/illustrations-duotone)
2. Purchase a license or subscribe for access
3. Download the SVG files you need

### Step 2: Prepare SVG Files

Streamline illustrations come with two colors. To make them work with our theme system:

1. Open the downloaded SVG in a text editor
2. Identify the two main colors (usually hex codes)
3. Replace them with CSS custom properties:

**Before:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <path fill="#000000" d="..."/>
  <path fill="rgba(0, 0, 0, 0.1)" d="..."/>
</svg>
```

**After:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <path fill="var(--illustration-primary, #1a1a1a)" d="..."/>
  <path fill="var(--illustration-secondary, rgba(26, 26, 26, 0.1))" d="..."/>
</svg>
```

**Color Mapping:**
- Primary color (darker): `var(--illustration-primary, #1a1a1a)`
- Secondary color (lighter): `var(--illustration-secondary, rgba(26, 26, 26, 0.1))`

The fallback values ensure the SVG displays correctly even if CSS variables aren't loaded.

### Step 3: Add to Project

Save the prepared SVG files to `/public/illustrations/` with descriptive names:

```bash
public/illustrations/
├── speed-fast.svg              # Replace placeholder
├── tags-organization.svg       # Replace placeholder
├── sync-cloud.svg              # Replace placeholder
├── mobile-phone.svg            # Replace placeholder
└── [your-new-illustration].svg # Add new ones as needed
```

### Step 4: Use in Components

The illustrations are already integrated in the Solution and Mobile sections. To use them elsewhere:

```tsx
import { Illustration } from '@components/ui/Illustration'

<Illustration
  name="your-illustration-name"  // filename without .svg
  size="lg"                       // sm | md | lg | xl | hero
  ariaLabel="Descriptive label"  // For accessibility
/>
```

## Recommended Illustrations

Based on your landing page content, here are recommended illustration themes from Streamline:

### Solution Section

1. **Zero-Lag Typing** (`speed-fast.svg`)
   - Keywords: lightning, speed, rocket, fast, performance
   - Look for: Dynamic motion, speed indicators, lightning bolts

2. **Tag-Based Organization** (`tags-organization.svg`)
   - Keywords: tags, labels, organize, categorize, filing
   - Look for: Tag icons, filing systems, organization

3. **Cross-Platform Sync** (`sync-cloud.svg`)
   - Keywords: cloud, sync, devices, cross-platform, connectivity
   - Look for: Multiple devices, cloud icons, sync arrows

### Mobile Section

4. **Mobile Phone** (`mobile-phone.svg`)
   - Keywords: mobile, phone, smartphone, app, interface
   - Look for: Person using phone, mobile interface, mobile-first

### Additional Sections (Optional)

5. **Hero Section Decoratives**
   - Abstract shapes, geometric patterns, floating elements
   - Use `size="hero"` for large background illustrations

6. **Features Section**
   - Specific icons for each feature (can use smaller `size="sm"`)
   - Match the existing Font Awesome icon themes

7. **Problem Section**
   - Keywords: frustrated, complex, confused, overwhelmed
   - Look for: Tangled wires, complexity, frustration indicators

## Size Guide

Choose the appropriate size based on placement:

| Size   | Dimensions | Use Case                          |
|--------|------------|-----------------------------------|
| `sm`   | 120x120px  | Feature cards, small accents      |
| `md`   | 200x200px  | Secondary content areas           |
| `lg`   | 300x300px  | Solution cards, Mobile section    |
| `xl`   | 400x400px  | Large hero elements               |
| `hero` | 500x500px  | Hero section backgrounds          |

Sizes automatically scale down on mobile devices.

## Color Theming

Illustrations automatically adapt to your color scheme:

**Light Mode:**
- Primary: `#1a1a1a` (near black)
- Secondary: `rgba(26, 26, 26, 0.1)` (10% black)

**Dark Mode:**
- Primary: `#ffffff` (white)
- Secondary: `rgba(255, 255, 255, 0.1)` (10% white)

### Custom Colors

Override the theme colors when needed:

```tsx
<Illustration
  name="special-illustration"
  primaryColor="#ff0000"
  secondaryColor="rgba(255, 0, 0, 0.2)"
/>
```

## Adding More Sections

To add illustrations to other sections:

### Features Section (Example)

```tsx
// In Features.tsx
import { Illustration } from '@components/ui/Illustration'

{FEATURES.map((feature) => (
  <article className={styles.card}>
    <Illustration
      name={feature.illustration}
      size="sm"
      ariaLabel={feature.title}
    />
    <h3>{feature.title}</h3>
    <p>{feature.description}</p>
  </article>
))}
```

### Hero Section Decoratives (Example)

```tsx
// In Hero.tsx
<div className={styles.decorativeIllustrations}>
  <Illustration
    name="abstract-shape-1"
    size="hero"
    className={styles.floatingIllustration}
  />
</div>
```

## Performance Considerations

- SVG files are lightweight and scale perfectly
- Illustrations use lazy loading by default
- CSS variables enable efficient theming without JS
- Animations respect `prefers-reduced-motion`

## Accessibility

The Illustration component handles accessibility automatically:

- Uses `role="img"` for semantic meaning
- Accepts `ariaLabel` for screen readers
- Falls back to `aria-hidden="true"` when no label provided
- All interactive illustrations should have descriptive labels

## Troubleshooting

### Illustration Not Showing

1. Verify the SVG file exists in `/public/illustrations/`
2. Check the filename matches the `name` prop (without `.svg`)
3. Ensure CSS custom properties are properly set in the SVG

### Colors Not Theming

1. Open the SVG and verify you replaced hard-coded colors with CSS variables
2. Check both `fill` and `stroke` attributes
3. Ensure fallback values are included: `var(--illustration-primary, #1a1a1a)`

### Size Issues

1. Verify the `viewBox` attribute is set correctly in the SVG
2. Try different size variants: `sm`, `md`, `lg`, `xl`, `hero`
3. Check if CSS is overriding the component styles

## Example: Complete Integration

Here's how the current integration looks in the Solution section:

```tsx
<div className={styles.valuePropContent}>
  <div className={styles.valueText}>
    <h3>Zero-Lag Typing</h3>
    <p>Your thoughts move fast. So should your app.</p>
    <!-- More content -->
  </div>

  <div className={styles.valueIllustration}>
    <Illustration
      name="speed-fast"
      size="lg"
      ariaLabel="Zero-Lag Typing illustration"
    />
  </div>
</div>
```

With corresponding CSS for responsive layout:

```css
.valuePropContent {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: center;
}

@media (max-width: 768px) {
  .valuePropContent {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .valueIllustration {
    order: -1; /* Illustration appears above text on mobile */
  }
}
```

## Next Steps

1. Purchase Streamline duotone illustrations
2. Download illustrations matching the recommended themes
3. Prepare SVG files using the color replacement guide
4. Replace placeholder SVGs in `/public/illustrations/`
5. Preview your site to ensure illustrations display correctly
6. Adjust sizing and colors as needed

The infrastructure is ready - you just need to add your purchased Streamline illustrations!
