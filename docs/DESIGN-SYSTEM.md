# Paperlyte Design System

> **Version:** 1.0.0
> **Last Updated:** November 29, 2025

A comprehensive design system for Paperlyte - a lightning-fast, distraction-free note-taking application that prioritizes simplicity and performance.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout & Grid](#layout--grid)
6. [Component Library](#component-library)
7. [Iconography](#iconography)
8. [Animation Guidelines](#animation-guidelines)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

---

## Design Principles

**Core Promise:** "Your thoughts, unchained from complexity"

### UX Principles
1. **Speed First** - Every interaction should feel instantaneous
2. **Clarity Over Cleverness** - Clear communication over creative copy
3. **Mobile Excellence** - Mobile experience must be as good as desktop
4. **Accessibility** - Usable by everyone, regardless of ability
5. **Progressive Enhancement** - Core content must be accessible without JavaScript

---

## Color Palette

### Primary Colors

```css
/* Light Mode */
--color-primary: #7C3AED;        /* Purple 600 - Main brand color */
--color-primary-dark: #6D28D9;   /* Purple 700 - Hover states */
--color-primary-light: #A78BFA;  /* Purple 400 - Accents */
```

#### Color Usage
- **Primary (#7C3AED)** - CTAs, links, active states, primary buttons
- **Primary Dark (#6D28D9)** - Hover states on primary elements
- **Primary Light (#A78BFA)** - Subtle accents, disabled states

### Neutral Colors

```css
/* Light Mode */
--color-background: #FFFFFF;      /* Pure white - Main background */
--color-surface: #F9FAFB;         /* Gray 50 - Card backgrounds */
--color-text-primary: #111827;    /* Gray 900 - Headings, body text */
--color-text-secondary: #6B7280;  /* Gray 500 - Supporting text */
--color-border: #E5E7EB;          /* Gray 200 - Borders, dividers */
--color-text-on-primary: #FFFFFF; /* White text on primary backgrounds */
```

### Dark Mode Colors

```css
/* Dark Mode */
--color-primary: #7C3AED;        /* Purple 600 - Same as light mode */
--color-primary-dark: #6D28D9;   /* Purple 700 */
--color-primary-light: #8B5CF6;  /* Purple 500 */
--color-background: #0F172A;     /* Slate 900 - Dark background */
--color-surface: #1E293B;        /* Slate 800 - Dark card backgrounds */
--color-text-primary: #F1F5F9;   /* Slate 100 - Light text */
--color-text-secondary: #94A3B8; /* Slate 400 - Muted text */
--color-border: #334155;         /* Slate 700 - Subtle borders */
```

### WCAG Compliance Matrix

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| `#111827` (Text Primary) | `#FFFFFF` (Background) | 16.1:1 | AAA | Body text (light mode) |
| `#6B7280` (Text Secondary) | `#FFFFFF` (Background) | 4.6:1 | AA | Supporting text (light mode) |
| `#7C3AED` (Primary) | `#FFFFFF` (Background) | 6.5:1 | AA | Primary buttons, links |
| `#FFFFFF` (Text) | `#7C3AED` (Primary) | 6.5:1 | AA | Text on primary buttons |
| `#F1F5F9` (Text Primary) | `#0F172A` (Background) | 15.8:1 | AAA | Body text (dark mode) |
| `#94A3B8` (Text Secondary) | `#0F172A` (Background) | 7.2:1 | AAA | Supporting text (dark mode) |

**All color combinations meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text).**

### Color State Guidelines

#### Hover States
```css
/* Primary Button Hover */
background-color: var(--color-primary-dark); /* #6D28D9 */
transform: translateY(-2px);
box-shadow: var(--shadow-md);

/* Secondary Button Hover */
background-color: var(--color-primary);
color: white;

/* Ghost Button Hover */
background-color: var(--color-surface);
color: var(--color-primary);
```

#### Active States
```css
/* All Buttons */
transform: translateY(0); /* Remove hover lift */
```

#### Disabled States
```css
opacity: 0.5;
cursor: not-allowed;
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use primary color (#7C3AED) for CTAs and important actions
- Ensure 4.5:1 contrast ratio for text, 3:1 for UI components
- Use text-secondary for less important information
- Test colors in both light and dark modes

❌ **DON'T:**
- Use primary color for large background areas
- Place secondary text on colored backgrounds without checking contrast
- Use color alone to convey information (add icons or text)
- Override focus outline colors (accessibility requirement)

---

## Typography

### Font Family

```css
--font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Primary:** Inter (Google Fonts)
**Fallback:** System fonts for fast loading

**Loading Strategy:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Type Scale

| Name | Size | rem | px | Line Height | Use Case |
|------|------|-----|----|----|----------|
| **Display** | `--font-size-5xl` | 3rem | 48px | 1.25 (tight) | Hero headlines |
| **H1** | `--font-size-4xl` | 2.25rem | 36px | 1.25 (tight) | Page titles |
| **H2** | `--font-size-3xl` | 1.875rem | 30px | 1.25 (tight) | Section headers |
| **H3** | `--font-size-2xl` | 1.5rem | 24px | 1.25 (tight) | Subsection headers |
| **H4** | `--font-size-xl` | 1.25rem | 20px | 1.25 (tight) | Card titles |
| **H5** | `--font-size-lg` | 1.125rem | 18px | 1.25 (tight) | Small headers |
| **Body** | `--font-size-base` | 1rem | 16px | 1.75 (relaxed) | Body text, paragraphs |
| **Small** | `--font-size-sm` | 0.875rem | 14px | 1.5 (normal) | Captions, labels |
| **Tiny** | `--font-size-xs` | 0.75rem | 12px | 1.5 (normal) | Metadata, timestamps |

### Font Weights

```css
--font-weight-normal: 400;    /* Body text */
--font-weight-medium: 500;    /* Emphasis */
--font-weight-semibold: 600;  /* Strong emphasis */
--font-weight-bold: 700;      /* Headings */
```

### Line Heights

```css
--line-height-tight: 1.25;    /* Headings */
--line-height-normal: 1.5;    /* UI elements */
--line-height-relaxed: 1.75;  /* Body text, paragraphs */
```

### Responsive Typography

Typography automatically adjusts on mobile devices:

```css
@media (max-width: 768px) {
  --font-size-4xl: 1.875rem; /* 36px → 30px */
  --font-size-5xl: 2.25rem;  /* 48px → 36px */
}
```

### Typography Examples

```tsx
// Heading hierarchy
<h1>Main Page Title</h1>        // 48px (36px mobile), bold, tight
<h2>Section Header</h2>         // 36px (30px mobile), bold, tight
<h3>Subsection Header</h3>      // 30px, bold, tight
<h4>Card Title</h4>             // 24px, bold, tight

// Body text
<p>Regular paragraph text with relaxed line height for readability.</p>

// Utility classes
<p className="text-primary">Primary colored text</p>
<p className="font-semibold">Semibold text</p>
<p className="text-center">Centered text</p>
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use semantic HTML headings (h1-h6) in hierarchical order
- Use relaxed line-height (1.75) for body text
- Limit line length to 60-80 characters for readability
- Use font-weight-semibold (600) for emphasis within body text

❌ **DON'T:**
- Skip heading levels (h1 → h3)
- Use font sizes smaller than 12px (--font-size-xs)
- Set line-height below 1.25 (readability issues)
- Use more than 2-3 font weights in a single section

---

## Spacing System

**Base Unit:** 8px

### Spacing Scale

```css
--spacing-xs: 0.5rem;   /* 8px  - Tight spacing */
--spacing-sm: 1rem;     /* 16px - Small spacing */
--spacing-md: 1.5rem;   /* 24px - Medium spacing */
--spacing-lg: 2rem;     /* 32px - Large spacing */
--spacing-xl: 3rem;     /* 48px - Extra large spacing */
--spacing-2xl: 4rem;    /* 64px - Section padding */
--spacing-3xl: 6rem;    /* 96px - Major section spacing */
```

### Component Spacing Guidelines

| Context | Spacing Value | Usage |
|---------|---------------|-------|
| **Icon-to-text gap** | `xs` (8px) | Buttons with icons, list items |
| **Between form fields** | `sm` (16px) | Input fields, form elements |
| **Between related elements** | `md` (24px) | Card content, paragraphs |
| **Between unrelated sections** | `lg` (32px) | Feature cards, content blocks |
| **Section top/bottom padding** | `2xl` (64px) | Hero, Features, CTA sections |
| **Major section spacing** | `3xl` (96px) | Between major page sections |

### Section Padding Standards

```css
/* Default section padding */
section {
  padding: var(--spacing-2xl) 0; /* 64px top/bottom */
}

/* Hero section (extra breathing room) */
.hero {
  padding: var(--spacing-3xl) 0; /* 96px top/bottom */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  section {
    padding: var(--spacing-xl) 0; /* 48px on mobile */
  }
}
```

### Utility Classes

```css
/* Margin utilities */
.mt-xs { margin-top: var(--spacing-xs); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }

.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }

/* Gap utilities (for flexbox/grid) */
.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use spacing tokens (never hardcode pixel values)
- Maintain consistent 8px grid alignment
- Use larger spacing (lg, xl, 2xl) to create visual hierarchy
- Reduce spacing on mobile for efficient screen usage

❌ **DON'T:**
- Use spacing values outside the defined scale (e.g., 13px, 27px)
- Use same spacing value for different hierarchical levels
- Forget to adjust spacing for mobile breakpoints

---

## Layout & Grid

### Container System

```css
/* Main container */
.container {
  width: 100%;
  max-width: var(--max-width); /* 1280px */
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);  /* 24px */
  padding-right: var(--spacing-md); /* 24px */
}

/* Content container (narrower for better readability) */
.container-content {
  max-width: var(--max-width-content); /* 1024px */
}
```

### Layout Variables

```css
--max-width: 1280px;           /* Maximum page width */
--max-width-content: 1024px;   /* Maximum content width */
--header-height: 64px;         /* Fixed header height */
```

### Border Radius

```css
--border-radius-sm: 0.25rem;  /* 4px - Small elements */
--border-radius-md: 0.5rem;   /* 8px - Buttons, cards */
--border-radius-lg: 1rem;     /* 16px - Large cards */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);           /* Subtle elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);         /* Cards, buttons */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);       /* Modals */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);       /* Large modals */
```

### Z-Index Layers

```css
--z-header: 1000;   /* Sticky header */
--z-modal: 2000;    /* Modal overlays */
--z-tooltip: 3000;  /* Tooltips, popovers */
```

---

## Component Library

### Buttons

#### Variants

**1. Primary Button**
- **Use:** Primary CTAs, main actions
- **Style:** Filled with primary color
- **States:** Default, hover (lifted + shadow), active, disabled

```tsx
<Button variant="primary" icon="fa-download" onClick={handleDownload}>
  Download App
</Button>
```

```css
.primary {
  background-color: var(--color-primary);     /* #7C3AED */
  color: white;
  border: 2px solid var(--color-primary);
}

.primary:hover {
  background-color: var(--color-primary-dark); /* #6D28D9 */
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**2. Secondary Button**
- **Use:** Secondary actions, alternative options
- **Style:** Outlined with primary color
- **States:** Transparent → filled on hover

```tsx
<Button variant="secondary" href="/learn-more">
  Learn More
</Button>
```

```css
.secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.secondary:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}
```

**3. Ghost Button**
- **Use:** Tertiary actions, navigation
- **Style:** No border, minimal styling
- **States:** Subtle background on hover

```tsx
<Button variant="ghost" size="small">
  Cancel
</Button>
```

```css
.ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 2px solid transparent;
}

.ghost:hover {
  background-color: var(--color-surface);
  color: var(--color-primary);
}
```

#### Sizes

```css
/* Small - 48px min-height (touch target) */
.small {
  padding: var(--spacing-xs) var(--spacing-sm);  /* 8px 16px */
  font-size: var(--font-size-sm);                 /* 14px */
  min-height: 48px;
  min-width: 48px;
}

/* Medium (default) - 48px min-height */
.medium {
  padding: var(--spacing-sm) var(--spacing-lg);  /* 16px 32px */
  font-size: var(--font-size-base);               /* 16px */
  min-height: 48px;
  min-width: 48px;
}

/* Large - 56px min-height */
.large {
  padding: var(--spacing-md) var(--spacing-xl);  /* 24px 48px */
  font-size: var(--font-size-lg);                 /* 18px */
  min-height: 56px;
  min-width: 56px;
}
```

#### Accessibility Features

```css
/* Keyboard focus indicator */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* Disabled state */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Icons in Buttons

```tsx
// Icon before text
<Button icon="fa-download">Download</Button>

// Icon sizing
.icon {
  font-size: 1.2em; /* 20% larger than text */
}
```

### Cards

Cards use consistent styling across the application:

```css
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md); /* 8px */
  padding: var(--spacing-md);             /* 24px */
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### Forms

**Input Fields:**

```css
input,
textarea,
select {
  font: inherit;
  padding: var(--spacing-sm);           /* 16px */
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: border-color var(--transition-base);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
```

### Navigation

**Header:**
- Height: `--header-height` (64px)
- Position: Sticky or fixed
- Z-index: `--z-header` (1000)
- Background: `--color-background` with subtle shadow

```css
.header {
  height: var(--header-height);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use primary buttons for main CTAs (max 1-2 per section)
- Maintain 48px minimum touch target size
- Show clear hover/focus states for interactive elements
- Use semantic button types (`<button type="button">`)

❌ **DON'T:**
- Use more than one primary button in close proximity
- Create buttons smaller than 48x48px
- Remove focus indicators
- Use `<div>` for clickable elements (use `<button>`)

---

## Iconography

### Icon Library

**Primary:** Font Awesome 6.5.1 (Solid icons)
**CDN:** CloudFlare CDN with SRI integrity check

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
/>
```

### Icon Component

```tsx
<Icon
  name="fa-bolt"           // Font Awesome class name
  size="md"                // sm | md | lg | xl | 2x | 3x
  ariaLabel="Speed"        // Optional for decorative icons
  color="#7C3AED"          // Optional custom color
/>
```

### Icon Sizing Standards

| Size | Class | Use Case |
|------|-------|----------|
| **sm** | `fa-sm` | Inline with text, small buttons |
| **md** | `fa-lg` | Default size, feature icons |
| **lg** | `fa-lg` | Section headers, emphasis |
| **xl** | `fa-xl` | Hero section, large features |
| **2x** | `fa-2x` | Feature cards, landing sections |
| **3x** | `fa-3x` | Hero icons, major features |

### Approved Icons for Features

| Feature | Icon | Class Name |
|---------|------|------------|
| **Speed** | ⚡ | `fa-bolt` |
| **Simplicity** | ✨ | `fa-sparkles` |
| **Tags** | 🏷️ | `fa-tags` |
| **Sync** | 🔄 | `fa-sync` or `fa-arrows-rotate` |
| **Offline** | 📡 | `fa-wifi-slash` or `fa-cloud-arrow-down` |
| **Search** | 🔍 | `fa-magnifying-glass` |
| **Edit** | ✏️ | `fa-pen` or `fa-pen-to-square` |
| **Download** | ⬇️ | `fa-download` |
| **Mobile** | 📱 | `fa-mobile-screen` |
| **Desktop** | 💻 | `fa-desktop` |
| **Security** | 🔒 | `fa-lock` |
| **Check/Success** | ✅ | `fa-check` or `fa-circle-check` |

### Icon Usage Guidelines

```tsx
// Decorative icon (no aria-label)
<Icon name="fa-bolt" aria-hidden="true" />

// Semantic icon (with aria-label)
<Icon name="fa-download" ariaLabel="Download application" />

// Icon in button
<Button icon="fa-download">Download App</Button>
```

### Accessibility

```tsx
// Decorative icons (purely visual)
<i className="fa-solid fa-bolt" aria-hidden="true" />

// Semantic icons (convey meaning)
<i
  className="fa-solid fa-circle-check"
  role="img"
  aria-label="Completed"
/>
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use solid (`fa-solid`) icons for consistency
- Provide `aria-label` for standalone icons
- Use `aria-hidden="true"` for decorative icons
- Maintain consistent icon size within sections

❌ **DON'T:**
- Mix Font Awesome styles (solid, regular, brands) randomly
- Use icons larger than `3x` in body content
- Forget to hide decorative icons from screen readers
- Use color alone to convey meaning with icons

---

## Animation Guidelines

### Timing Functions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);    /* Quick interactions */
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);    /* Standard transitions */
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);    /* Scroll animations */
```

**Easing Curve:** `cubic-bezier(0.4, 0, 0.2, 1)` - Custom ease-out curve for smooth, natural motion

### Animation Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| **Fast** | 150ms | Hover states, micro-interactions |
| **Normal** | 250ms | Button clicks, theme toggle, general transitions |
| **Slow** | 350ms | Scroll-triggered animations, page transitions |

### Animation Types

#### 1. Fade In

```css
.fadeIn {
  opacity: 0;
  transition: opacity var(--transition-slow);
}

.fadeIn.visible {
  opacity: 1;
}
```

#### 2. Slide Up

```css
.slideUp {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}

.slideUp.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### 3. Slide In (Left/Right)

```css
.slideInLeft {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}

.slideInRight {
  opacity: 0;
  transform: translateX(30px);
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}
```

#### 4. Scale

```css
.scale {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--transition-slow), transform var(--transition-slow);
  will-change: opacity, transform;
}

.scale.visible {
  opacity: 1;
  transform: scale(1);
}
```

### Scroll-Triggered Animations

```tsx
<AnimatedElement
  animation="fadeIn"      // fadeIn | slideUp | slideInLeft | slideInRight | scale
  delay={200}             // Optional delay in milliseconds
  threshold={0.1}         // Intersection Observer threshold (0-1)
>
  <h2>Animated Content</h2>
</AnimatedElement>
```

### Reduced Motion Support

**CRITICAL:** All animations must respect `prefers-reduced-motion` for accessibility.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Why 0.01ms instead of 0ms?** Some animations break with 0ms duration. Using 0.01ms is imperceptible but prevents breakage.

### Hardware Acceleration

Use `will-change` for animations to enable GPU acceleration:

```css
.animated-element {
  will-change: opacity, transform;
}

/* Remove after animation completes */
.animated-element.complete {
  will-change: auto;
}
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Always respect `prefers-reduced-motion`
- Use GPU-accelerated properties (opacity, transform)
- Keep animations under 500ms
- Use `will-change` for performance-critical animations

❌ **DON'T:**
- Animate width, height, or top/left (use transform instead)
- Use animations longer than 500ms (feels sluggish)
- Forget to test with reduced motion enabled
- Animate on page load (use scroll-triggered animations)

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Base styles: Mobile (320px - 768px) */

/* Tablet and above */
@media (min-width: 769px) { }

/* Desktop and above */
@media (min-width: 1024px) { }

/* Large desktop */
@media (min-width: 1280px) { }
```

| Breakpoint | Value | Target Devices |
|------------|-------|----------------|
| **Mobile** | < 768px | Smartphones |
| **Tablet** | 769px - 1023px | Tablets, small laptops |
| **Desktop** | 1024px - 1279px | Laptops, desktops |
| **Large Desktop** | ≥ 1280px | Large monitors |

### Mobile-First Approach

**Write CSS for mobile first, then enhance for larger screens:**

```css
/* Mobile (default) */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr;  /* Single column */
  gap: var(--spacing-md);
}

/* Tablet and up */
@media (min-width: 769px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr); /* Two columns */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(3, 1fr); /* Three columns */
  }
}
```

### Responsive Typography

Font sizes automatically reduce on mobile:

```css
@media (max-width: 768px) {
  :root {
    --font-size-4xl: 1.875rem; /* 36px → 30px */
    --font-size-5xl: 2.25rem;  /* 48px → 36px */
    --spacing-3xl: 4rem;       /* 96px → 64px */
  }
}
```

### Responsive Spacing

```css
/* Desktop */
section {
  padding: var(--spacing-3xl) 0; /* 96px */
}

/* Mobile */
@media (max-width: 768px) {
  section {
    padding: var(--spacing-xl) 0; /* 48px */
  }
}
```

### Visibility Utilities

```css
/* Hide on mobile */
.hidden-mobile {
  display: none;
}

@media (min-width: 769px) {
  .hidden-mobile {
    display: block;
  }
}

/* Hide on desktop */
@media (min-width: 769px) {
  .hidden-desktop {
    display: none;
  }
}
```

### Touch Target Sizes

**Minimum touch target size: 48x48px** (WCAG 2.5.5 Level AAA)

```css
button,
a {
  min-height: 48px;
  min-width: 48px;
}
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Design for mobile first, enhance for desktop
- Test on real devices, not just browser DevTools
- Ensure touch targets are at least 48x48px
- Use relative units (rem, em, %) for better scaling

❌ **DON'T:**
- Use fixed pixel widths for containers
- Forget to test landscape orientation on mobile
- Assume hover states work on touch devices
- Use breakpoints for specific devices (iPhone X, etc.)

---

## Accessibility

### WCAG 2.1 Compliance

**Target Level:** AA (minimum), AAA where possible

### Color Contrast

All color combinations meet **WCAG 2.1 AA standards:**
- **Normal text:** 4.5:1 minimum
- **Large text (18px+ or 14px+ bold):** 3:1 minimum
- **UI components:** 3:1 minimum

See [Color Palette](#wcag-compliance-matrix) section for full contrast matrix.

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```css
/* Visible focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default focus on mouse click */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Links

```html
<!-- Always first element in body -->
<a href="#main" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  z-index: 100;
}

.skip-link:focus {
  top: var(--spacing-xs);
  left: var(--spacing-xs);
}
```

### Semantic HTML

```tsx
// ✅ Good - Semantic HTML
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Bad - Non-semantic divs
<div class="nav">
  <div class="link-wrapper">
    <div onClick={goHome}>Home</div>
  </div>
</div>
```

### ARIA Labels

```tsx
// Icon buttons need labels
<button aria-label="Close menu">
  <Icon name="fa-times" aria-hidden="true" />
</button>

// Decorative images
<img src="decoration.png" alt="" role="presentation" />

// Semantic icons
<Icon name="fa-check" ariaLabel="Task completed" role="img" />
```

### Screen Reader Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
<button>
  <span className="sr-only">Download application</span>
  <Icon name="fa-download" aria-hidden="true" />
</button>
```

### Motion Sensitivity

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Form Accessibility

```tsx
// Always associate labels with inputs
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use semantic HTML elements (nav, main, article, etc.)
- Provide text alternatives for images and icons
- Ensure keyboard navigation works everywhere
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Respect user preferences (reduced motion, color scheme)

❌ **DON'T:**
- Use `<div>` or `<span>` for interactive elements
- Remove focus outlines without providing alternatives
- Use color alone to convey information
- Disable zoom/pinch on mobile (viewport meta tag)
- Skip heading levels (h1 → h3)

---

## Design Tokens (Tailwind Config Ready)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#A78BFA',
        },
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
      },
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
        '3xl': '6rem',  // 96px
      },
      borderRadius: {
        sm: '0.25rem',  // 4px
        md: '0.5rem',   // 8px
        lg: '1rem',     // 16px
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-29 | Initial design system documentation |

---

## Resources

- **Tailwind CSS:** [Documentation](https://tailwindcss.com/docs/customizing-colors)
- **Inter Font:** [Google Fonts](https://fonts.google.com/specimen/Inter)
- **Font Awesome:** [Icon Search](https://fontawesome.com/search?o=r&m=free&s=solid)
- **WCAG 2.1 Guidelines:** [Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- **Material Design (Reference):** [Typography Guide](https://material.io/design/typography/)
- **WebAIM Contrast Checker:** [Tool](https://webaim.org/resources/contrastchecker/)

---

**Maintained by:** Paperlyte Design Team
**Questions?** See CONTRIBUTING.md for design contribution guidelines.
