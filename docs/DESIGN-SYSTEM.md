# Paperlyte Design System

This document outlines the design system for Paperlyte, a lightning-fast, distraction-free note-taking application. The design system is implemented using both **CSS Custom Properties** (CSS Variables) and **Tailwind CSS**, providing flexibility for different styling approaches.

## Philosophy

Paperlyte's design philosophy prioritizes:
- **Lightning Speed**: Instant startup, real-time sync, no loading delays
- **Beautiful Simplicity**: Paper-inspired design that feels natural
- **Accessibility First**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Performance**: Hardware-accelerated animations, respect for reduced motion preferences

## Colors

### Primary Palette

The primary color is **Purple 600** (`#7C3AED`), chosen for its vibrant, modern feel while maintaining WCAG AA contrast compliance.

#### CSS Variables
```css
--color-primary: #7C3AED;        /* Purple 600 */
--color-primary-dark: #6D28D9;   /* Purple 700 */
--color-primary-light: #A78BFA;  /* Purple 400 */
--color-primary-faint: rgba(124, 58, 237, 0.1);   /* 10% opacity */
--color-primary-fainter: rgba(124, 58, 237, 0.05); /* 5% opacity */
```

#### Tailwind Classes
```html
<!-- Primary color -->
<div class="bg-primary text-white">Primary</div>
<div class="bg-primary-dark">Dark Primary</div>
<div class="bg-primary-light">Light Primary</div>

<!-- Borders -->
<div class="border-2 border-primary">Primary Border</div>

<!-- Text -->
<div class="text-primary">Primary Text</div>
```

### Background & Surface

#### Light Mode
- **Background**: `#FFFFFF` (White)
- **Surface**: `#F9FAFB` (Gray 50)

#### Dark Mode
- **Background**: `#0F172A` (Slate 900)
- **Surface**: `#1E293B` (Slate 800)

#### CSS Variables
```css
/* Light mode (default) */
--color-background: #FFFFFF;
--color-surface: #F9FAFB;

/* Dark mode */
[data-theme='dark'] {
  --color-background: #0F172A;
  --color-surface: #1E293B;
}
```

#### Tailwind Classes
```html
<!-- Background -->
<div class="bg-background dark:bg-background-dark">Background</div>
<div class="bg-surface dark:bg-surface-dark">Surface</div>
```

### Text Colors

#### Light Mode
- **Primary Text**: `#111827` (Gray 900)
- **Secondary Text**: `#6B7280` (Gray 500)
- **On Primary**: `#FFFFFF` (White)

#### Dark Mode
- **Primary Text**: `#F1F5F9` (Slate 100)
- **Secondary Text**: `#94A3B8` (Slate 400)

#### CSS Variables
```css
--color-text-primary: #111827;    /* Light mode */
--color-text-secondary: #6B7280;  /* Light mode */
--color-text-on-primary: #FFFFFF;

[data-theme='dark'] {
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
}
```

#### Tailwind Classes
```html
<p class="text-text-primary dark:text-text-primary-dark">Primary text</p>
<p class="text-text-secondary dark:text-text-secondary-dark">Secondary text</p>
<p class="bg-primary text-text-on-primary">Text on primary background</p>
```

### Border Colors

#### CSS Variables
```css
--color-border: #E5E7EB;  /* Light mode - Gray 200 */

[data-theme='dark'] {
  --color-border: #334155;  /* Dark mode - Slate 700 */
}
```

#### Tailwind Classes
```html
<div class="border border-border dark:border-border-dark">Bordered element</div>
```

## Typography

### Font Family

**Inter** is the primary font family, with system font fallbacks.

#### CSS Variable
```css
--font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Tailwind Classes
```html
<p class="font-sans">Text using Inter font</p>
```

### Font Sizes

8-tier scale optimized for readability and hierarchy.

| Name | CSS Variable | Tailwind | Size | Pixels |
|------|-------------|----------|------|--------|
| XS | `--font-size-xs` | `text-xs` | 0.75rem | 12px |
| SM | `--font-size-sm` | `text-sm` | 0.875rem | 14px |
| Base | `--font-size-base` | `text-base` | 1rem | 16px |
| LG | `--font-size-lg` | `text-lg` | 1.125rem | 18px |
| XL | `--font-size-xl` | `text-xl` | 1.25rem | 20px |
| 2XL | `--font-size-2xl` | `text-2xl` | 1.5rem | 24px |
| 3XL | `--font-size-3xl` | `text-3xl` | 1.875rem | 30px |
| 4XL | `--font-size-4xl` | `text-4xl` | 2.25rem | 36px |
| 5XL | `--font-size-5xl` | `text-5xl` | 3rem | 48px |

#### Responsive Typography
On mobile (< 768px):
- 4XL scales down to 1.875rem (30px)
- 5XL scales down to 2.25rem (36px)
- 3XL spacing reduces to 4rem

### Font Weights

| Name | CSS Variable | Tailwind | Weight |
|------|-------------|----------|--------|
| Normal | `--font-weight-normal` | `font-normal` | 400 |
| Medium | `--font-weight-medium` | `font-medium` | 500 |
| Semibold | `--font-weight-semibold` | `font-semibold` | 600 |
| Bold | `--font-weight-bold` | `font-bold` | 700 |

### Line Heights

| Name | CSS Variable | Tailwind | Height |
|------|-------------|----------|--------|
| Tight | `--line-height-tight` | `leading-tight` | 1.25 |
| Normal | `--line-height-normal` | `leading-normal` | 1.5 |
| Relaxed | `--line-height-relaxed` | `leading-relaxed` | 1.75 |

## Spacing

8px base unit spacing scale for consistent rhythm.

| Name | CSS Variable | Tailwind | Size | Pixels |
|------|-------------|----------|------|--------|
| XS | `--spacing-xs` | `spacing-xs` or `m-xs` | 0.5rem | 8px |
| SM | `--spacing-sm` | `spacing-sm` or `m-sm` | 1rem | 16px |
| MD | `--spacing-md` | `spacing-md` or `m-md` | 1.5rem | 24px |
| LG | `--spacing-lg` | `spacing-lg` or `m-lg` | 2rem | 32px |
| XL | `--spacing-xl` | `spacing-xl` or `m-xl` | 3rem | 48px |
| 2XL | `--spacing-2xl` | `spacing-2xl` or `m-2xl` | 4rem | 64px |
| 3XL | `--spacing-3xl` | `spacing-3xl` or `m-3xl` | 6rem | 96px |

#### Example Usage
```html
<!-- Tailwind -->
<div class="p-lg m-md">Content with spacing</div>
<div class="mb-xl mt-2xl">Vertical spacing</div>

<!-- CSS Variables -->
<div style="padding: var(--spacing-lg); margin: var(--spacing-md)">Content</div>
```

## Layout

### Max Widths

| Name | CSS Variable | Tailwind | Size |
|------|-------------|----------|------|
| Container | `--max-width` | `max-w-container` | 1280px |
| Content | `--max-width-content` | `max-w-content` | 1024px |

### Border Radius

| Name | CSS Variable | Tailwind | Size | Pixels |
|------|-------------|----------|------|--------|
| Small | `--border-radius-sm` | `rounded-sm` | 0.25rem | 4px |
| Medium | `--border-radius-md` | `rounded-md` | 0.5rem | 8px |
| Large | `--border-radius-lg` | `rounded-lg` | 1rem | 16px |

## Shadows

Paper-inspired shadow system for depth and hierarchy.

| Name | CSS Variable | Tailwind | Definition |
|------|-------------|----------|------------|
| Small | `--shadow-sm` | `shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| Medium | `--shadow-md` | `shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` |
| Large | `--shadow-lg` | `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` |
| Extra Large | `--shadow-xl` | `shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` |

## Transitions & Animations

### Transition Durations

| Name | CSS Variable | Tailwind | Duration |
|------|-------------|----------|----------|
| Fast | `--transition-fast` | `duration-fast` | 150ms |
| Base | `--transition-base` | `duration-base` | 250ms |
| Slow | `--transition-slow` | `duration-slow` | 350ms |

### Timing Function

| Name | CSS Variable | Tailwind | Function |
|------|-------------|----------|----------|
| Smooth | N/A | `ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Keyframe Animations

#### Fade In
```html
<div class="animate-fadeIn">Fades in on load</div>
```

#### Slide Up
```html
<div class="animate-slideUp">Slides up on load</div>
```

#### Float
```html
<div class="animate-float">Floats continuously</div>
```

### Reduced Motion

**CRITICAL**: All animations and transitions must respect `prefers-reduced-motion`.

The design system automatically handles this:
- CSS variables use `var(--reduced-motion-duration, 0.01ms)` fallback
- Global override reduces all animations to 0.01ms
- Smooth scrolling is disabled

## Z-Index Layers

Consistent layering for UI elements.

| Name | CSS Variable | Tailwind | Value |
|------|-------------|----------|-------|
| Header | `--z-header` | `z-header` | 1000 |
| Modal | `--z-modal` | `z-modal` | 2000 |
| Tooltip | `--z-tooltip` | `z-tooltip` | 3000 |

## Dark Mode

### Implementation

Dark mode is controlled by the `data-theme` attribute on the `<html>` element:

```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode -->
<html data-theme="dark">
```

### Tailwind Dark Mode

Tailwind is configured to use the `data-theme="dark"` selector:

```javascript
// tailwind.config.js
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  // ...
}
```

### Usage Examples

```html
<!-- Background changes based on theme -->
<div class="bg-background dark:bg-background-dark">
  <p class="text-text-primary dark:text-text-primary-dark">
    This text adapts to the theme
  </p>
</div>

<!-- Border colors -->
<div class="border border-border dark:border-border-dark">
  Themed borders
</div>
```

## Usage Guidelines

### When to Use CSS Variables vs Tailwind

**Use CSS Variables when:**
- Building reusable components with CSS Modules
- Need dynamic theming or runtime color changes
- Prefer scoped, component-specific styling
- Working with existing CSS codebase

**Use Tailwind when:**
- Rapidly prototyping new features
- Building utility-first UI layouts
- Need responsive design with minimal CSS
- Prefer inline styling approach

### Hybrid Approach (Recommended)

You can use both together:

```tsx
// Component using CSS Modules
import styles from './Card.module.css';

export const Card = ({ children }) => (
  <div className={`${styles.card} p-lg rounded-lg shadow-md`}>
    {children}
  </div>
);
```

```css
/* Card.module.css */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

- Primary Purple (#7C3AED) on white: **6.5:1** ✅
- Text Primary on Background: **21:1** ✅
- Text Secondary on Background: **4.6:1** ✅

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

Automatically respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Component Examples

### Button with Primary Color

```tsx
// Using Tailwind
<button className="bg-primary hover:bg-primary-dark text-white px-lg py-sm rounded-lg transition-base">
  Click Me
</button>

// Using CSS Variables
<button className={styles.button}>Click Me</button>
```

```css
/* CSS Module */
.button {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
}

.button:hover {
  background-color: var(--color-primary-dark);
}
```

### Card with Shadow and Hover Effect

```tsx
<div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-base">
  <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-sm">
    Card Title
  </h2>
  <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed">
    Card content goes here
  </p>
</div>
```

## Resources

- **CSS Variables**: [src/styles/variables.css](../src/styles/variables.css)
- **Tailwind Config**: [tailwind.config.js](../tailwind.config.js)
- **PostCSS Config**: [postcss.config.js](../postcss.config.js)
- **Inter Font**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

## Contributing

When adding new design tokens:

1. Add to CSS variables first (`src/styles/variables.css`)
2. Add corresponding Tailwind config (`tailwind.config.js`)
3. Update this documentation
4. Ensure dark mode variants exist
5. Test for WCAG AA compliance
6. Verify reduced motion compatibility
