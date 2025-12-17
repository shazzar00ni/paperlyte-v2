# Paperlyte Design System

> **Version:** 2.0.0
> **Last Updated:** December 17, 2025

A comprehensive design system for Paperlyte - a lightning-fast, distraction-free note-taking application that prioritizes simplicity and performance through a clean, monochrome aesthetic.

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

**Design Philosophy:** Paperlyte uses a sophisticated monochrome palette that emphasizes clarity, elegance, and timelessness. The near-black and pure white color scheme creates a paper-like aesthetic that's both modern and classic.

### Primary Colors

```css
/* Light Mode */
--color-primary: #1a1a1a;        /* Near black - Main brand color */
--color-primary-dark: #000000;   /* Pure black - Hover states */
--color-primary-light: #333333;  /* Dark gray - Accents */
```

#### Color Usage
- **Primary (#1a1a1a)** - CTAs, primary buttons, bold statements
- **Primary Dark (#000000)** - Hover states on primary elements
- **Primary Light (#333333)** - Subtle accents, muted elements

### Neutral Colors

```css
/* Light Mode */
--color-background: #FFFFFF;      /* Pure white - Main background */
--color-surface: #F9FAFB;         /* Gray 50 - Card backgrounds */
--color-surface-dark: #18181b;    /* Zinc 900 - Dark surface sections */
--color-text-primary: #111827;    /* Gray 900 - Headings, body text */
--color-text-secondary: #6B7280;  /* Gray 500 - Supporting text */
--color-text-tertiary: #9CA3AF;   /* Gray 400 - Muted text */
--color-border: #E5E7EB;          /* Gray 200 - Borders, dividers */
--color-border-light: #F3F4F6;    /* Gray 100 - Subtle borders */
--color-text-on-primary: #FFFFFF; /* White text on primary backgrounds */
--color-text-on-dark: #FFFFFF;    /* White text on dark surfaces */
--color-text-on-dark-secondary: rgba(255, 255, 255, 0.7); /* Semi-transparent white */
```

### Dark Mode Colors

**Dark Mode Philosophy:** In dark mode, the palette inverts while maintaining the monochrome aesthetic. White becomes the primary color, creating a sophisticated light-on-dark experience.

```css
/* Dark Mode */
--color-primary: #FFFFFF;        /* Pure white - Primary in dark mode */
--color-primary-dark: #F1F5F9;   /* Slate 100 - Hover states */
--color-primary-light: #E2E8F0;  /* Slate 200 - Accents */
--color-background: #0F172A;     /* Slate 900 - Dark background */
--color-surface: #1E293B;        /* Slate 800 - Card backgrounds */
--color-surface-dark: #0F172A;   /* Slate 900 - Dark sections */
--color-text-primary: #F1F5F9;   /* Slate 100 - Light text */
--color-text-secondary: #94A3B8; /* Slate 400 - Supporting text */
--color-text-tertiary: #64748B;  /* Slate 500 - Muted text */
--color-border: #334155;         /* Slate 700 - Borders */
--color-border-light: #1E293B;   /* Slate 800 - Subtle borders */
```

### WCAG Compliance Matrix

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| `#111827` (Text Primary) | `#FFFFFF` (Background) | 16.1:1 | AAA | Body text (light mode) |
| `#6B7280` (Text Secondary) | `#FFFFFF` (Background) | 4.6:1 | AA | Supporting text (light mode) |
| `#9CA3AF` (Text Tertiary) | `#FFFFFF` (Background) | 3.1:1 | AA (Large Text Only) | Large text (18pt+/14pt+ bold), metadata, non-critical labels |
| `#1a1a1a` (Primary) | `#FFFFFF` (Background) | 16.8:1 | AAA | Primary buttons, text |
| `#FFFFFF` (Text) | `#1a1a1a` (Primary) | 16.8:1 | AAA | Text on primary buttons |
| `#F1F5F9` (Text Primary) | `#0F172A` (Background) | 15.8:1 | AAA | Body text (dark mode) |
| `#94A3B8` (Text Secondary) | `#0F172A` (Background) | 7.2:1 | AAA | Supporting text (dark mode) |
| `#64748B` (Text Tertiary) | `#0F172A` (Background) | 5.1:1 | AA | Muted text (dark mode) |

**All color combinations meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text). The monochrome palette provides exceptional contrast ratios, exceeding AAA standards for most combinations.**

### Color State Guidelines

#### Hover States
```css
/* Primary Button Hover */
background-color: var(--color-primary-dark); /* #000000 */
transform: translateY(-1px);
box-shadow: var(--shadow-md);

/* Secondary Button Hover */
background-color: var(--color-surface);
border-color: var(--color-text-secondary);
transform: translateY(-1px);

/* Ghost Button Hover */
background-color: var(--color-surface);
color: var(--color-text-primary);
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
- Use primary color (#1a1a1a in light, #ffffff in dark) for CTAs and important actions
- Leverage the high contrast of the monochrome palette for clarity
- Use text-secondary (#6B7280) for supporting information
- Use text-tertiary (#9CA3AF) sparingly for subtle metadata
- Test colors in both light and dark modes

❌ **DON'T:**
- Introduce colors outside the monochrome palette (except semantic colors like success/error)
- **Use text-tertiary (#9CA3AF) for normal body text** - it only meets AA standards for large text (18pt+/14pt+ bold)
- Use text-tertiary for critical information - reserve it for non-essential metadata, timestamps, and labels
- Place secondary text on colored backgrounds without checking contrast
- Use color alone to convey information (add icons or text)
- Override focus outline colors (accessibility requirement)

### Semantic States

While the design is primarily monochrome, **semantic colors are allowed as exceptions** for success, error, warning, and info states. However, **never rely on color alone** - always combine with icons and clear text.

```css
/* Semantic colors (from variables.css) */
--color-success: #10b981;  /* Emerald 500 */
--color-error: #ef4444;    /* Red 500 */
--color-warning: #f59e0b;  /* Amber 500 */
--color-info: #3b82f6;     /* Blue 500 */
```

**Best Practices for Semantic States:**

1. **Always combine color with icons:**
   - Success: `fa-circle-check` + green
   - Error: `fa-exclamation-circle` + red
   - Warning: `fa-exclamation-triangle` + amber
   - Info: `fa-info-circle` + blue

2. **Use subtle color application:**
   - Prefer colored borders/icons rather than full backgrounds
   - Use monochrome backgrounds with colored accents
   - Keep text in monochrome palette for readability

3. **Monochrome-only alternative (if avoiding all color):**
   ```css
   /* Use icon + border weight variations */
   .success { border: 2px solid var(--color-text-primary); }
   .error { border: 3px solid var(--color-primary-dark); }
   .warning { border: 2px dashed var(--color-border); }
   .info { border: 1px solid var(--color-border); }
   ```

**Example Implementation:**

```tsx
import styles from './Alert.module.css'

// With semantic color (preferred for critical states)
<div className={styles.alert}>
  <i className={`fa-solid fa-exclamation-circle ${styles.errorIcon}`} />
  <p>Error: Please check your input</p>
</div>

// Monochrome alternative
<div className={styles.alert}>
  <i className="fa-solid fa-exclamation-circle" />
  <strong>Error:</strong> Please check your input
</div>
```

```css
/* Alert.module.css */
.errorIcon {
  color: var(--color-error);
}

.successIcon {
  color: var(--color-success);
}

.warningIcon {
  color: var(--color-warning);
}

.infoIcon {
  color: var(--color-info);
}
```

---

## Typography

**Typography Philosophy:** Paperlyte combines the clarity of Inter for UI and body text with the elegance of Playfair Display for headlines, creating a sophisticated contrast between functional and expressive typography.

### Font Families

```css
--font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
```

**Primary:** Inter (Google Fonts) - Clean, readable sans-serif for UI and body text
**Display:** Playfair Display (Google Fonts) - Elegant serif for headlines and emphasis
**Fallback:** System fonts for fast loading and graceful degradation

**Loading Strategy:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
```

**Font Usage Guidelines:**
- **Inter**: Navigation, buttons, body text, UI components, feature descriptions
- **Playfair Display**: Hero headlines, section titles, large display text, emphasis text (italic)

### Type Scale

| Name | Size | rem | px | Line Height | Font Family | Use Case |
|------|------|-----|----|-------------|-------------|----------|
| **Hero** | `--font-size-7xl` | 4.5rem | 72px | 1.1 (tight) | Playfair Display | Hero headlines (desktop) |
| **Display XL** | `--font-size-6xl` | 3.75rem | 60px | 1.1 (tight) | Playfair Display | Large display headlines |
| **Display** | `--font-size-5xl` | 3rem | 48px | 1.1 (tight) | Playfair Display | Display headlines |
| **H1** | `--font-size-4xl` | 2.25rem | 36px | 1.25 (snug) | Inter or Playfair | Page titles |
| **H2** | `--font-size-3xl` | 1.875rem | 30px | 1.25 (snug) | Playfair Display | Section headers |
| **H3** | `--font-size-2xl` | 1.5rem | 24px | 1.25 (snug) | Inter | Subsection headers |
| **H4** | `--font-size-xl` | 1.25rem | 20px | 1.25 (snug) | Inter | Card titles |
| **H5** | `--font-size-lg` | 1.125rem | 18px | 1.25 (snug) | Inter | Small headers |
| **Body** | `--font-size-base` | 1rem | 16px | 1.75 (relaxed) | Inter | Body text, paragraphs |
| **Small** | `--font-size-sm` | 0.875rem | 14px | 1.5 (normal) | Inter | Captions, labels |
| **Tiny** | `--font-size-xs` | 0.75rem | 12px | 1.5 (normal) | Inter | Metadata, timestamps |

### Font Weights

```css
--font-weight-normal: 400;    /* Body text */
--font-weight-medium: 500;    /* Emphasis */
--font-weight-semibold: 600;  /* Strong emphasis */
--font-weight-bold: 700;      /* Headings */
```

### Line Heights

```css
--line-height-tight: 1.1;     /* Hero headlines (Playfair Display) */
--line-height-snug: 1.25;     /* Headings */
--line-height-normal: 1.5;    /* UI elements, small text */
--line-height-relaxed: 1.75;  /* Body text, paragraphs */
```

### Responsive Typography

Typography automatically adjusts on mobile devices for better readability and space efficiency:

```css
@media (max-width: 768px) {
  --font-size-7xl: 3.25rem;  /* 72px → 52px */
  --font-size-6xl: 2.75rem;  /* 60px → 44px */
  --font-size-5xl: 2.25rem;  /* 48px → 36px */
  --font-size-4xl: 1.875rem; /* 36px → 30px */
}
```

**Note:** Hero headlines reduce significantly on mobile to maintain visual balance and prevent overwhelming small screens.

### Typography Examples

**Using CSS Modules (recommended):**

```tsx
import styles from './Component.module.css'

// Hero headline (Playfair Display serif)
<h1 className={styles.headline}>
  Your thoughts, <em className={styles.headlineItalic}>unchained</em> from complexity
</h1>

// Section header (Playfair Display)
<h2 className={styles.sectionTitle}>Beautiful Simplicity</h2>

// Subsection header (Inter)
<h3>Feature Details</h3>

// Card title (Inter)
<h4>Lightning Speed</h4>

// Body text (Inter)
<p>Regular paragraph text with relaxed line height for optimal readability.</p>
```

**CSS Module styles:**

```css
/* Component.module.css */
.headline {
  font-family: var(--font-family-serif);  /* Playfair Display */
  font-size: var(--font-size-7xl);        /* 72px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-tight);  /* 1.1 */
  letter-spacing: -0.02em;
}

.headlineItalic {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.sectionTitle {
  font-family: var(--font-family-serif);  /* Playfair Display */
  font-size: var(--font-size-3xl);        /* 30px */
  font-weight: var(--font-weight-bold);   /* 700 */
  line-height: var(--line-height-snug);   /* 1.25 */
}
```

**Global utility classes** (from src/styles/typography.css):

```tsx
<p className="font-semibold">Emphasized text</p>
<p className="text-center">Centered text</p>
<p className="text-primary">Primary colored text</p>
```

### ✅ Do's and ❌ Don'ts

✅ **DO:**
- Use Playfair Display for hero headlines and major section titles
- Use Inter for UI, navigation, buttons, and body text
- Use italic Playfair Display for emphasis within headlines
- Use semantic HTML headings (h1-h6) in hierarchical order
- Use relaxed line-height (1.75) for body text
- Limit line length to 60-80 characters for readability
- Use font-weight-normal (400) for Playfair Display headlines

❌ **DON'T:**
- Mix serif and sans-serif within the same text block (except for italic emphasis)
- Use Playfair Display for body text or small UI elements
- Skip heading levels (h1 → h3)
- Use font sizes smaller than 12px (--font-size-xs)
- Set line-height below 1.1 (readability issues)
- Use more than 2-3 font weights in a single section

---

## Spacing System

**Base Unit:** 8px (0.5rem)

All spacing follows a consistent 8px grid system for visual harmony and precise alignment.

### Spacing Scale

```css
--spacing-xs: 0.5rem;   /* 8px   - Tight spacing, icon gaps */
--spacing-sm: 1rem;     /* 16px  - Small spacing, form fields */
--spacing-md: 1.5rem;   /* 24px  - Medium spacing, card padding */
--spacing-lg: 2rem;     /* 32px  - Large spacing, between sections */
--spacing-xl: 3rem;     /* 48px  - Extra large spacing */
--spacing-2xl: 4rem;    /* 64px  - Section padding (mobile) */
--spacing-3xl: 6rem;    /* 96px  - Major section spacing (desktop) */
--spacing-4xl: 8rem;    /* 128px - Hero section spacing, major dividers */
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
--max-width-content: 1024px;   /* Maximum content width for readability */
--header-height: 72px;         /* Fixed header height (increased for better presence) */
```

### Border Radius

```css
--border-radius-sm: 0.25rem;   /* 4px  - Small elements, checkboxes */
--border-radius-md: 0.5rem;    /* 8px  - Cards, inputs */
--border-radius-lg: 1rem;      /* 16px - Large cards, feature boxes */
--border-radius-xl: 1.5rem;    /* 24px - Hero cards, prominent elements */
--border-radius-full: 9999px;  /* Full - Pills, badges, primary buttons */
```

**Usage Notes:**
- **Full border-radius** is the signature style for buttons and badges in the Paperlyte design
- Cards and inputs use moderate radius (md) for a clean, professional look
- Large radius (lg, xl) is reserved for prominent content containers

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);                              /* Subtle elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);                            /* Buttons, hover states */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);                          /* Modals, dropdowns */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);                          /* Hero mockup, large modals */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06); /* Layered shadow for cards */
```

**Shadow Usage:**
- Use shadows sparingly in the monochrome design to create depth without clutter
- `shadow-card` provides a subtle, layered shadow perfect for the minimalist aesthetic

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

##### 1. Primary Button

- **Use:** Primary CTAs, main actions
- **Style:** Filled with primary color, full pill-shaped border-radius
- **States:** Default, hover (lifted + shadow), active, disabled

```tsx
<Button variant="primary" icon="fa-download" onClick={handleDownload}>
  Download App
</Button>
```

```css
.primary {
  background-color: var(--color-primary);      /* #1a1a1a (light) or #ffffff (dark) */
  color: var(--color-text-on-primary);         /* #ffffff */
  border: 1px solid transparent;
  border-radius: var(--border-radius-full);    /* 9999px - pill shape */
  min-height: 44px;
  min-width: 44px;
}

.primary:hover {
  background-color: var(--color-primary-dark); /* #000000 (light) or #f1f5f9 (dark) */
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

##### 2. Secondary Button

- **Use:** Secondary actions, alternative options
- **Style:** Outlined with subtle border, pill-shaped
- **States:** Transparent → surface background on hover

```tsx
<Button variant="secondary" href="/learn-more">
  Learn More
</Button>
```

```css
.secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);  /* 9999px - pill shape */
}

.secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  transform: translateY(-1px);
}
```

##### 3. Ghost Button

- **Use:** Tertiary actions, navigation links
- **Style:** No border, minimal styling, pill-shaped
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
  border: 1px solid transparent;
  border-radius: var(--border-radius-full);  /* 9999px - pill shape */
}

.ghost:hover {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
}
```

#### Sizes

All buttons use pill-shaped border-radius for a modern, friendly appearance.

```css
/* Small - 44px min-height (accessibility minimum) */
.small {
  padding: 0.5rem 1.25rem;    /* 8px 20px */
  font-size: var(--font-size-sm);  /* 14px */
  min-height: 44px;
  min-width: 44px;
}

/* Medium (default) - 44px min-height */
.medium {
  padding: 0.75rem 1.5rem;    /* 12px 24px */
  font-size: var(--font-size-base);  /* 16px */
  min-height: 44px;
  min-width: 44px;
}

/* Large - 52px min-height (hero CTAs) */
.large {
  padding: 1rem 2rem;         /* 16px 32px */
  font-size: var(--font-size-base);  /* 16px */
  min-height: 52px;
  min-width: 52px;
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

**Minimum touch target size: 44x44px** (WCAG 2.5.5 Level AA)

The design uses 44px as the minimum touch target, meeting WCAG 2.5.5 Level AA compliance. This ensures all interactive elements are easily tappable on mobile devices.

```css
button,
a {
  min-height: 44px;
  min-width: 44px;
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

## Hero Section Design Patterns

The hero section is the most prominent part of the landing page, featuring distinctive design elements that establish Paperlyte's brand identity.

### Hero Layout Structure

```tsx
<section className="hero">
  {/* Decorative background shapes */}
  <div className="decorations">
    <ParallaxLayer speed={0.3}>
      <div className="shape shape1" />
    </ParallaxLayer>
    <ParallaxLayer speed={0.2}>
      <div className="shape shape2" />
    </ParallaxLayer>
  </div>

  {/* Floating icons (hidden on mobile) */}
  <div className="floatingContainer">
    <FloatingElement delay={0}>
      <i className="fa-solid fa-bolt" />
    </FloatingElement>
    {/* More floating icons... */}
  </div>

  {/* Main content grid */}
  <div className="container">
    <div className="content">
      <div className="badge">
        <i className="fa-solid fa-sparkles" />
        <span>Now in Beta</span>
      </div>

      <h1 className="headline">
        Your thoughts, <em className="headlineItalic">unchained</em> from complexity
      </h1>

      <p className="subheadline">
        Lightning-fast note-taking without the bloat. Just you and your ideas.
      </p>

      <div className="ctas">
        <Button variant="primary" size="large">Download App</Button>
        <Button variant="secondary" size="large">Learn More</Button>
      </div>
    </div>

    {/* App mockup/preview */}
    <div className="mockup">
      {/* Mockup content... */}
    </div>
  </div>

  {/* Trusted by section */}
  <div className="trusted">
    <span className="trustedLabel">TRUSTED BY</span>
    <div className="trustedLogos">
      <span>Company 1</span>
      <span>Company 2</span>
    </div>
  </div>
</section>
```

### Design Elements

#### 1. Badge Component

Small, pill-shaped badges for announcements or status indicators:

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
```

#### 2. Headline with Italic Emphasis

```css
.headline {
  font-family: var(--font-family-serif);  /* Playfair Display */
  font-size: var(--font-size-7xl);        /* 72px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-tight);  /* 1.1 */
  letter-spacing: -0.02em;                /* Tight tracking */
}

.headlineItalic {
  font-style: italic;
  color: var(--color-text-tertiary);      /* Muted gray */
}
```

#### 3. Parallax Background Shapes

Blurred, gradient shapes that move at different speeds on scroll. These create subtle, abstract visual interest without distracting from content.

```css
.shape {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--color-primary) 0%,    /* Near-black center in light mode */
    transparent 70%             /* Fades to transparent */
  );
  filter: blur(60px);            /* Heavy blur creates soft gradient */
  opacity: 0.03;                 /* Very subtle - barely visible */
}

/* Reduce blur on mobile for better performance */
@media (max-width: 768px) {
  .shape {
    filter: blur(40px);          /* Reduced blur for mobile */
  }
}
```

**Visual Effect:** The heavy blur (60px) combined with low opacity (0.03) creates extremely subtle, soft shadows that add depth without being distracting. In light mode, the near-black (#1a1a1a) creates gentle gray gradients. In dark mode, white creates soft light halos. Blur is reduced to 40px on mobile for better performance.

**Reduced Motion:** Parallax effects are disabled when `prefers-reduced-motion` is active.

#### 4. Floating Icons

Animated icons positioned absolutely, floating with subtle motion:

```css
.floatingIcon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  color: var(--color-primary);
}
```

**Mobile:** Floating icons are hidden on mobile (max-width: 768px) for a cleaner experience.

#### 5. App Mockup Card

```css
.mockupCard {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);  /* 24px */
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-xl);
}
```

The mockup includes:
- Header with window dots
- Skeleton content lines
- Checkboxes
- Statistics with serif numbers (Playfair Display)
- Primary CTA button

#### 6. Trusted By Section

```css
.trusted {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  padding: var(--spacing-xl) var(--spacing-md);
}

.trustedLabel {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;  /* Wide tracking for labels */
}
```

### Responsive Behavior

```css
@media (max-width: 1024px) {
  /* Single column layout */
  .container {
    grid-template-columns: 1fr;
  }

  /* Center-aligned content */
  .content {
    text-align: center;
  }
}

@media (max-width: 768px) {
  /* Reduce headline size */
  .headline {
    font-size: var(--font-size-5xl);  /* 72px → 36px */
  }

  /* Stack CTAs vertically */
  .ctas {
    flex-direction: column;
    align-items: stretch;
  }

  /* Hide floating icons */
  .floatingContainer {
    display: none;
  }
}
```

### Performance Considerations

- **Blur Effects:** Use sparingly; blur is reduced for users with `prefers-reduced-motion` (60px → 40px) to improve performance with static shapes
- **Parallax:** Implemented with `requestAnimationFrame` for 60fps performance; completely disabled when `prefers-reduced-motion` is active
  - **Implementation:** Uses `useParallax` hook (src/hooks/useParallax.ts) and `ParallaxLayer` component (src/components/ui/ParallaxLayer)
  - **How it works:** Uses Intersection Observer to only calculate when in viewport, requestAnimationFrame for smooth updates
  - **Automatic optimizations:** Respects prefers-reduced-motion, can disable on mobile (default: true)
- **Floating Animations:** CSS-based with `will-change: transform` hint; hidden on mobile for cleaner UX
- **Reduced Motion:** All animations and parallax effects are disabled when user prefers reduced motion

**Parallax Implementation Example:**

```tsx
import { useParallax } from '@hooks/useParallax'

const MyParallaxComponent = () => {
  const { ref, offset, isActive } = useParallax({
    speed: 0.3,  // Move slower than scroll for background effect
    disableOnMobile: true  // Disable on mobile for performance
  })

  return (
    <div ref={ref}>
      <div style={{ transform: `translateY(${offset}px)` }}>
        {/* Parallax content */}
      </div>
    </div>
  )
}
```

**CSS Optimizations:**

```css
/* Reduce blur for better performance when motion is reduced */
@media (prefers-reduced-motion: reduce) {
  .shape {
    filter: blur(40px);  /* Reduced from 60px */
  }
}

/* Hide floating elements on mobile */
@media (max-width: 768px) {
  .floatingContainer {
    display: none;
  }

  .shape {
    /* Optionally reduce shape sizes on mobile for performance */
    width: 250px;
    height: 250px;
  }
}
```

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

**Note:** This project uses **CSS Custom Properties** for dynamic theming (see src/styles/variables.css). Dark mode is handled automatically via CSS variables that respond to `[data-theme='dark']` and `@media (prefers-color-scheme: dark)`.

If you prefer to use Tailwind's built-in dark mode instead, here's the configuration:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // or 'media' for automatic system preference
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',  // Near black (light mode)
          dark: '#000000',     // Pure black
          light: '#333333',    // Dark gray
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',     // Slate 900 (dark mode)
        },
        surface: {
          DEFAULT: '#F9FAFB',
          dark: '#1E293B',     // Slate 800 (dark mode)
          'dark-alt': '#18181b', // Zinc 900 (dark sections)
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',  // Use only for large text (18pt+/14pt+ bold)
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
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
        '6xl': '3.75rem', // 60px
        '7xl': '4.5rem',  // 72px
      },
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
        '3xl': '6rem',  // 96px
        '4xl': '8rem',  // 128px
      },
      borderRadius: {
        sm: '0.25rem',  // 4px
        md: '0.5rem',   // 8px
        lg: '1rem',     // 16px
        xl: '1.5rem',   // 24px
        full: '9999px', // Pill shape
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
};
```

**Dark Mode Implementation:**

The design uses CSS custom properties that automatically respond to dark mode. In dark mode, the monochrome palette inverts:

- Primary: `#1a1a1a` → `#ffffff` (white becomes primary)
- Background: `#ffffff` → `#0F172A` (slate 900)
- Text Primary: `#111827` → `#F1F5F9` (slate 100)

This inversion is handled automatically via the CSS variables in `src/styles/variables.css`.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-12-17 | Major monochrome rebrand: colors (purple → black/white), Playfair Display typography, pill buttons, hero patterns, expanded scales. See full documentation for details. |
| 1.0.0 | 2025-11-29 | Initial design system documentation |

---

## Resources

- **Tailwind CSS:** https://tailwindcss.com/docs/customizing-colors
- **Inter Font:** https://fonts.google.com/specimen/Inter
- **Font Awesome:** https://fontawesome.com/search?o=r&m=free&s=solid
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design (Reference):** https://material.io/design/typography/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

**Maintained by:** Paperlyte Design Team
**Questions?** See CONTRIBUTING.md for design contribution guidelines.
