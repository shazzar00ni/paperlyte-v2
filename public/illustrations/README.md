# Duotone Illustrations Directory

This directory contains duotone SVG illustrations used throughout the Paperlyte landing page.

## Using Streamline Illustrations

### Step 1: Purchase/Download Illustrations

1. Visit [Streamline HQ Duotone Illustrations](https://www.streamlinehq.com/illustrations/illustrations-duotone)
2. Purchase the illustrations pack or subscribe to access
3. Download the SVG files you need

### Step 2: Prepare SVG Files

Streamline duotone illustrations use two colors. To work with our theme system:

1. Open the SVG in a text editor
2. Replace color values with CSS custom properties:
   - Primary color: `var(--illustration-primary, #1a1a1a)`
   - Secondary color: `var(--illustration-secondary, rgba(26, 26, 26, 0.1))`

Example SVG structure:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <!-- Primary shapes (dark color) -->
  <path fill="var(--illustration-primary, #1a1a1a)" d="..."/>

  <!-- Secondary shapes (light color) -->
  <path fill="var(--illustration-secondary, rgba(26, 26, 26, 0.1))" d="..."/>
</svg>
```

### Step 3: Add to This Directory

Save the modified SVG files to this directory with descriptive names:
- `speed-fast.svg` - For zero-lag typing section
- `tags-organization.svg` - For tag-based organization
- `sync-cloud.svg` - For cross-platform sync
- `mobile-phone.svg` - For mobile section
- `frustrated-user.svg` - For problem section
- `rocket-launch.svg` - For hero decorative elements

### Step 4: Use in Components

Import and use the `Illustration` component:

```tsx
import { Illustration } from '@components/ui/Illustration'

<Illustration
  name="speed-fast"
  size="lg"
  ariaLabel="Lightning fast performance"
/>
```

## Recommended Illustrations for Each Section

### Hero Section

- **Decorative elements**: Abstract shapes, geometric patterns
- **Size**: hero (500px)
- **Suggestions**: Floating elements, abstract backgrounds

### Solution Section

1. **Zero-Lag Typing**: Lightning bolt, rocket, speedometer
2. **Tag-Based Organization**: Tags, labels, filing system
3. **Works Everywhere**: Globe, devices, cloud sync

### Features Section

- Small icons to complement or replace Font Awesome icons
- **Size**: sm (120px)
- Match existing feature themes

### Mobile Section

- **Illustration**: Person using mobile phone, mobile interface
- **Size**: lg (300px)

### Problem Section

- **Illustration**: Frustrated user, complex interface, tangled wires
- **Size**: md (200px)

## Color Theming

Illustrations automatically adapt to light/dark mode:
- **Light mode**: Primary = #1a1a1a (black), Secondary = rgba(26, 26, 26, 0.1)
- **Dark mode**: Primary = #ffffff (white), Secondary = rgba(255, 255, 255, 0.1)

Custom colors can be passed via props:

```tsx
<Illustration
  name="custom"
  primaryColor="#ff0000"
  secondaryColor="rgba(255, 0, 0, 0.2)"
/>
```

## Example Files

This directory includes example placeholder illustrations to demonstrate the format.
Replace these with actual Streamline illustrations when ready.
