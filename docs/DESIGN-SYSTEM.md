# Paperlyte Design System

> **Version:** 2.1.0
> **Last Updated:** December 20, 2025

A comprehensive design system for Paperlyte - a lightning-fast, distraction-free note-taking application that prioritizes simplicity and performance through a clean, modern aesthetic with a purple accent color.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout & Grid](#layout--grid)
6. [Component Library](#component-library)
   - [Available Components](#available-components)
   - [Detailed Component API](#detailed-component-api)
   - [Layout Components](#layout-components)
   - [Section Components](#section-components)
   - [Hooks & Utilities](#hooks--utilities)
   - [Architectural Patterns](#architectural-patterns)
7. [Iconography](#iconography)
8. [Animation Guidelines](#animation-guidelines)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)
11. [Design Tokens](#design-tokens-tailwind-config-ready)
12. [Version History](#version-history)

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

**Design Philosophy:** Paperlyte uses a clean, paper-inspired palette with purple (#7C3AED) as the primary accent color. The design emphasizes clarity and readability with high-contrast neutral colors, while the purple accent adds visual interest to interactive elements and calls-to-action.

### Primary Colors

```css
/* Light Mode */
--color-primary: #7c3aed;         /* Purple 600 - Main brand color */
--color-primary-dark: #6d28d9;    /* Purple 700 - Hover states */
--color-primary-light: #a78bfa;   /* Purple 400 - Accents */
--color-primary-faint: rgba(124, 58, 237, 0.1);    /* 10% opacity for backgrounds */
--color-primary-fainter: rgba(124, 58, 237, 0.05); /* 5% opacity for subtle backgrounds */
```

#### Color Usage

- **Primary (#7c3aed)** - CTAs, primary buttons, links, interactive elements
- **Primary Dark (#6d28d9)** - Hover states on primary elements
- **Primary Light (#a78bfa)** - Subtle accents, secondary highlights
- **Primary Faint** - Background tints for focus states, subtle backgrounds
- **Primary Fainter** - Very subtle backgrounds, hover states

### Neutral Colors

```css
/* Light Mode */
--color-background: #FFFFFF;      /* Pure white - Main background */
--color-surface: #F9FAFB;         /* Gray 50 - Card backgrounds */
--color-text-primary: #111827;    /* Gray 900 - Headings, body text */
--color-text-secondary: #6B7280;  /* Gray 500 - Supporting text */
--color-text-on-primary: #FFFFFF; /* White text on primary backgrounds */
--color-border: #E5E7EB;          /* Gray 200 - Borders, dividers */
```

### Dark Mode Colors

**Dark Mode Philosophy:** In dark mode, the palette maintains readability while providing a comfortable low-light experience. The purple accent remains consistent for brand recognition.

```css
/* Dark Mode */
--color-primary: #7c3aed;        /* Purple 600 - Consistent brand color */
--color-primary-dark: #6d28d9;   /* Purple 700 - Hover states */
--color-primary-light: #8b5cf6;  /* Purple 500 - Accents */
--color-primary-faint: rgba(124, 58, 237, 0.1);    /* 10% opacity for backgrounds */
--color-primary-fainter: rgba(124, 58, 237, 0.05); /* 5% opacity for subtle backgrounds */
--color-background: #0F172A;     /* Slate 900 - Dark background */
--color-surface: #1E293B;        /* Slate 800 - Card backgrounds */
--color-text-primary: #F1F5F9;   /* Slate 100 - Light text */
--color-text-secondary: #94A3B8; /* Slate 400 - Supporting text */
--color-border: #334155;         /* Slate 700 - Borders */
```

### WCAG Compliance Matrix

All colors have been tested for WCAG 2.1 compliance. The table below shows key color combinations and their contrast ratios.

#### Primary Color Combinations

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| `#111827` (Text Primary) | `#FFFFFF` (Background) | 16.1:1 | AAA | Body text (light mode) |
| `#6B7280` (Text Secondary) | `#FFFFFF` (Background) | 4.6:1 | AA | Supporting text (light mode) |
| `#7c3aed` (Primary) | `#FFFFFF` (Background) | 6.2:1 | AA | Interactive elements, links (large text) |
| `#FFFFFF` (Text on Primary) | `#7c3aed` (Primary) | 6.2:1 | AA | Text on primary buttons (large text) |
| `#6d28d9` (Primary Dark) | `#FFFFFF` (Background) | 7.8:1 | AAA | Hover states, emphasized elements |
| `#a78bfa` (Primary Light) | `#FFFFFF` (Background) | 3.1:1 | AA* | Large text only (18pt+/14pt+ bold) |

#### Dark Mode Combinations

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| `#F1F5F9` (Text Primary) | `#0F172A` (Background) | 15.8:1 | AAA | Body text (dark mode) |
| `#94A3B8` (Text Secondary) | `#0F172A` (Background) | 7.2:1 | AAA | Supporting text (dark mode) |
| `#7c3aed` (Primary) | `#0F172A` (Background) | 6.5:1 | AA | Interactive elements (dark mode) |
| `#FFFFFF` (Text) | `#1E293B` (Surface) | 14.8:1 | AAA | Text on surface (dark mode) |

#### Semantic Color Combinations

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| `#22c55e` (Success) | `#FFFFFF` (Background) | 3.1:1 | AA* | Success icons/badges (large text only) |
| `#dc2626` (Error) | `#FFFFFF` (Background) | 5.9:1 | AA | Error messages, alerts |
| `#4ade80` (Success Dark) | `#0F172A` (Background) | 4.2:1 | AA* | Success states (dark mode, large text) |
| `#f87171` (Error Dark) | `#0F172A` (Background) | 4.8:1 | AA | Error states (dark mode) |

**Notes:**
- AA* = Meets AA standards for large text (18pt/14pt bold) and UI components (3:1 minimum)
- Normal text requires 4.5:1 contrast (AA) or 7:1 (AAA)
- Large text and UI components require 3:1 contrast (AA)
- The purple primary color (#7c3aed) provides 6.2:1 contrast on white and 6.5:1 on dark backgrounds
- Contrast ratios calculated using WCAG 2.1 relative luminance formula
- Semantic colors (success, error) are always paired with icons and descriptive text for accessibility
- All background/border variants use very low opacity and are not intended for text contrast

**Testing Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [APCA Contrast Calculator](https://www.myndex.com/APCA/) (next-generation contrast algorithm)
- Chrome DevTools Lighthouse Accessibility Audit

### Color State Guidelines

#### Hover States

```css
/* Primary Button Hover */
background-color: var(--color-primary-dark); /* #6d28d9 */
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
- Use primary color (#7c3aed) for CTAs and important interactive elements
- Leverage high contrast of neutral colors for readability
- Use text-secondary (#6B7280) for supporting information
- Test colors in both light and dark modes
- Use purple sparingly to draw attention to key actions

❌ **DON'T:**
- Overuse the purple accent - it should highlight, not overwhelm
- Place secondary text on colored backgrounds without checking contrast
- Use color alone to convey information (add icons or text)
- Override focus outline colors (accessibility requirement)

### Semantic States

Semantic colors are used for success, error, warning, and info states. **Never rely on color alone** - always combine with icons and clear text.

```css
/* Semantic colors (Light Mode) */
--color-success: #22c55e;  /* Green 500 */
--color-success-bg: rgba(34, 197, 94, 0.1);
--color-success-border: rgba(34, 197, 94, 0.3);
--color-error: #dc2626;    /* Red 600 */
--color-error-bg: rgba(239, 68, 68, 0.1);
--color-error-border: rgba(239, 68, 68, 0.3);

/* Semantic colors (Dark Mode) */
--color-success: #4ade80;  /* Green 400 - higher contrast */
--color-success-bg: rgba(74, 222, 128, 0.15);
--color-success-border: rgba(74, 222, 128, 0.35);
--color-error: #f87171;    /* Red 400 - higher contrast */
--color-error-bg: rgba(248, 113, 113, 0.15);
--color-error-border: rgba(248, 113, 113, 0.35);
```

**Best Practices for Semantic States:**

1. **Always combine color with icons:**
   - Success: `fa-circle-check` + green
   - Error: `fa-exclamation-circle` + red

2. **Use subtle color application:**
   - Prefer colored borders/icons rather than full backgrounds
   - Use neutral backgrounds with colored accents
   - Keep text in neutral palette for readability

**Example Implementation:**

```tsx
import styles from './Alert.module.css'

// Success state with icon
<div className={styles.alert}>
  <i className={`fa-solid fa-circle-check ${styles.successIcon}`} />
  <p>Successfully saved your changes</p>
</div>

// Error state with icon
<div className={styles.alert}>
  <i className={`fa-solid fa-exclamation-circle ${styles.errorIcon}`} />
  <p><strong>Error:</strong> Please check your input</p>
</div>
```

```css
/* Alert.module.css */
.successIcon {
  color: var(--color-success);
}

.errorIcon {
  color: var(--color-error);
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}
```

---

## Typography

**Typography Philosophy:** Paperlyte uses Inter, a clean and highly readable sans-serif font family, for all text. This creates a consistent, professional appearance across the application while maintaining excellent legibility at all sizes.

### Font Families

```css
--font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Primary:** Inter (Variable Font) - Clean, readable sans-serif for all text
**Fallback:** System fonts for fast loading and graceful degradation

**Loading Strategy:**

```html
<!-- Preload critical font for faster rendering -->
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="/fonts/Inter-Variable.woff2"
  crossorigin
/>
```

**Font Usage Guidelines:**
- **Inter**: All text - navigation, buttons, headings, body text, UI components

### Type Scale

| Name | Size | rem | px | Line Height | Use Case |
|------|------|-----|----|-------------|----------|
| **5xl** | `--font-size-5xl` | 3rem | 48px | 1.25 (tight) | Hero headlines |
| **4xl** | `--font-size-4xl` | 2.25rem | 36px | 1.25 (tight) | Page titles |
| **3xl** | `--font-size-3xl` | 1.875rem | 30px | 1.25 (tight) | Section headers |
| **2xl** | `--font-size-2xl` | 1.5rem | 24px | 1.25 (tight) | Subsection headers |
| **XL** | `--font-size-xl` | 1.25rem | 20px | 1.25 (normal) | Card titles |
| **LG** | `--font-size-lg` | 1.125rem | 18px | 1.5 (normal) | Small headers, emphasized text |
| **Base** | `--font-size-base` | 1rem | 16px | 1.75 (relaxed) | Body text, paragraphs |
| **SM** | `--font-size-sm` | 0.875rem | 14px | 1.5 (normal) | Captions, labels, small text |
| **XS** | `--font-size-xs` | 0.75rem | 12px | 1.5 (normal) | Metadata, timestamps |

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
--line-height-normal: 1.5;    /* UI elements, small text */
--line-height-relaxed: 1.75;  /* Body text, paragraphs */
```

### Responsive Typography

Typography automatically adjusts on mobile devices for better readability and space efficiency:

```css
@media (max-width: 768px) {
  --font-size-4xl: 1.875rem; /* 36px → 30px */
  --font-size-5xl: 2.25rem;  /* 48px → 36px */
  --spacing-3xl: 4rem;       /* 96px → 64px */
}

@media (max-width: 480px) {
  --font-size-3xl: 1.5rem;   /* 30px → 24px */
  --font-size-4xl: 1.75rem;  /* 30px → 28px */
  --font-size-5xl: 2rem;     /* 36px → 32px */
}
```

**Note:** Hero headlines reduce significantly on mobile to maintain visual balance and prevent overwhelming small screens.

### Typography Examples

**Using CSS Modules (recommended):**

```tsx
import styles from './Component.module.css'

// Hero headline
<h1 className={styles.hero}>
  Your thoughts, <em>unchained</em> from complexity
</h1>

// Section header
<h2 className={styles.sectionTitle}>Beautiful Simplicity</h2>

// Subsection header
<h3 className={styles.subsection}>Feature Details</h3>

// Card title
<h4 className={styles.cardTitle}>Lightning Speed</h4>

// Body text
<p>Regular paragraph text with relaxed line height for optimal readability.</p>
```

**CSS Module styles:**

```css
/* Component.module.css */
.hero {
  font-family: var(--font-family);
  font-size: var(--font-size-5xl);        /* 48px */
  font-weight: var(--font-weight-bold);   /* 700 */
  line-height: var(--line-height-tight);  /* 1.25 */
  letter-spacing: -0.01em;
}

.sectionTitle {
  font-family: var(--font-family);
  font-size: var(--font-size-3xl);        /* 30px */
  font-weight: var(--font-weight-bold);   /* 700 */
  line-height: var(--line-height-tight);  /* 1.25 */
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
- Use Inter for all text consistently
- Use semantic HTML headings (h1-h6) in hierarchical order
- Use relaxed line-height (1.75) for body text
- Limit line length to 60-80 characters for readability
- Use font-weight variations (medium, semibold, bold) to create hierarchy

❌ **DON'T:**
- Mix multiple font families
- Skip heading levels (h1 → h3)
- Use font sizes smaller than 12px (--font-size-xs)
- Set line-height below 1.25 (readability issues)
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
--header-height: 64px;         /* Fixed header height */
```

### Border Radius

```css
--border-radius-sm: 0.25rem;   /* 4px  - Small elements, checkboxes */
--border-radius-md: 0.5rem;    /* 8px  - Cards, inputs */
--border-radius-lg: 1rem;      /* 16px - Large cards, feature boxes */
--border-radius-full: 9999px;  /* Full - Pills, badges, primary buttons */
```

**Usage Notes:**
- **Full border-radius** is the signature style for buttons and badges in the Paperlyte design
- Cards and inputs use moderate radius (md) for a clean, professional look
- Large radius (lg) is reserved for prominent content containers

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);       /* Subtle elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);     /* Buttons, hover states */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);   /* Modals, dropdowns */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);   /* Hero mockup, large modals */
```

**Shadow Usage:**
- Use shadows to create depth and establish visual hierarchy
- Apply sparingly for a clean, minimalist aesthetic
- Darker shadows for more prominent elevation

### Z-Index Layers

```css
--z-header: 1000;   /* Sticky header */
--z-modal: 2000;    /* Modal overlays */
--z-tooltip: 3000;  /* Tooltips, popovers */
```

---

## Component Library

Paperlyte's component library provides reusable UI elements that follow the design system principles. All components are built with TypeScript, accessibility in mind, and support dark mode.

### Available Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Button** | `ui/Button` | Primary, secondary, and ghost button variants |
| **Icon** | `ui/Icon` | Font Awesome icon wrapper with accessibility |
| **AnimatedElement** | `ui/AnimatedElement` | Scroll-triggered animations (fade, slide, scale) |
| **ParallaxLayer** | `ui/ParallaxLayer` | Parallax scrolling effects for backgrounds |
| **FloatingElement** | `ui/FloatingElement` | Floating/bobbing animations for decorative elements |
| **TextReveal** | `ui/TextReveal` | Text reveal animations |
| **CounterAnimation** | `ui/CounterAnimation` | Animated number counting |
| **SVGPathAnimation** | `ui/SVGPathAnimation` | SVG path drawing animations |
| **EmailCapture** | `ui/EmailCapture` | Email signup form component |
| **FeedbackWidget** | `ui/FeedbackWidget` | User feedback collection widget |
| **ThemeToggle** | `ui/ThemeToggle` | Light/dark mode toggle switch |

### Component Overview

Components are organized into three categories:

**UI Components** - Reusable, atomic interface elements
- [Button](#button) - Primary, secondary, ghost button variants
- [Icon](#icon) - SVG icons with Font Awesome fallback and accessibility
- [ThemeToggle](#themetoggle) - Theme switcher
- [EmailCapture](#emailcapture) - Email signup form
- [FeedbackWidget](#feedbackwidget) - User feedback modal
- [AnimatedElement](#animatedelement) - Scroll-triggered animations
- [ParallaxLayer](#parallaxlayer) - Parallax scrolling
- [FloatingElement](#floatingelement) - Floating animations
- [CounterAnimation](#counteranimation) - Number counting
- [TextReveal](#textreveal) - Text reveal animations
- [SVGPathAnimation](#svgpathanimation) - SVG path drawing

**Layout Components** - Page structure and composition
- [Section](#section) - Consistent section wrapper
- [Header](#header) - Main navigation
- [Footer](#footer) - Site footer

**Section Components** - Pre-composed page sections
- [Hero](#hero) - Hero section
- [Features](#features) - Feature grid
- [Pricing](#pricing) - Pricing plans
- [Testimonials](#testimonials) - Customer reviews
- [Comparison](#comparison) - Feature comparison
- [Statistics](#statistics) - Key metrics
- [FAQ](#faq) - Questions and answers
- [CTA](#cta) - Call-to-action
- [Mobile](#mobile) - Mobile app showcase

**Hooks** - React hooks for common patterns
- [useMediaQuery](#usemediaquery) - Responsive breakpoints
- [useParallax](#useparallax) - Parallax effects
- [useIntersectionObserver](#useintersectionobserver) - Viewport detection
- [useReducedMotion](#usereducedmotion) - Motion preferences
- [useTheme](#usetheme) - Theme management
- [useScrollPosition](#usescrollposition) - Scroll tracking

---

## Detailed Component API

### UI Components

#### Button

**Location:** `src/components/ui/Button`

**Purpose:** Versatile button component with multiple variants, sizes, and support for icons and links.

**Props Interface:**

```typescript
interface ButtonProps {
  children: ReactNode              // Button content/label
  variant?: 'primary' | 'secondary' | 'ghost'  // Button style variant (default: 'primary')
  size?: 'small' | 'medium' | 'large'          // Button size (default: 'medium')
  href?: string                                 // Optional link URL (renders as <a> if provided)
  onClick?: () => void                          // Click handler
  icon?: string                                 // Font Awesome icon name (e.g., 'fa-download')
  disabled?: boolean                            // Disabled state (default: false)
  className?: string                            // Additional CSS classes
  ariaLabel?: string                            // Accessibility label
  type?: 'button' | 'submit' | 'reset'         // Button type (default: 'button')
}
```

**Variants:**
- `primary` - Filled with primary color, for main CTAs
- `secondary` - Outlined with border, for alternative actions
- `ghost` - Transparent background, for tertiary actions

**Sizes:**
- `small` - 44px min-height, 14px font
- `medium` - 44px min-height, 16px font (default)
- `large` - 52px min-height, 16px font

**Usage Examples:**

```tsx
// Primary button with icon
<Button variant="primary" icon="fa-download" onClick={handleDownload}>
  Download App
</Button>

// Link button
<Button variant="secondary" href="/learn-more">
  Learn More
</Button>

// Submit button in form
<Button type="submit" variant="primary" disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</Button>

// Ghost button
<Button variant="ghost" size="small" onClick={handleCancel}>
  Cancel
</Button>
```

**Design Tokens:**
- Background: `--color-primary` (primary), transparent (secondary/ghost) - See [Color Palette](#color-palette)
- Border Radius: `--border-radius-full` (9999px - pill shape) - See [Layout & Grid](#layout--grid)
- Minimum Touch Target: 44x44px (WCAG 2.5.5 Level AAA) - See [Accessibility](#accessibility)
- Spacing: `--spacing-sm`, `--spacing-md` - See [Spacing System](#spacing-system)

---

#### Icon

**Location:** `src/components/ui/Icon`

**Purpose:** SVG icon component with Font Awesome fallback, consistent sizing, and accessibility support.

**Props Interface:**

```typescript
interface IconProps {
  name: string                           // Icon name (e.g., 'fa-bolt', 'fa-circle-check')
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x'  // Icon size (default: 'md')
  variant?: 'solid' | 'brands' | 'regular'         // Icon variant (default: 'solid')
  className?: string                               // Additional CSS classes
  ariaLabel?: string                               // Accessibility label (required for semantic icons)
  color?: string                                   // Custom color (default: currentColor)
  style?: React.CSSProperties                      // Inline styles
}
```

**Size Mapping:**
- `sm` - 16px
- `md` - 20px (default)
- `lg` - 24px
- `xl` - 32px
- `2x` - 40px
- `3x` - 48px

**Usage Examples:**

```tsx
// Decorative icon (no aria-label needed)
<Icon name="fa-bolt" size="md" aria-hidden="true" />

// Semantic icon (requires aria-label)
<Icon name="fa-circle-check" size="lg" ariaLabel="Success" />

// Icon with custom color
<Icon name="fa-heart" size="xl" color="#ef4444" />

// Icon in button
<Button icon="fa-download">Download</Button>
```

**Accessibility:**
- Decorative icons: Use `aria-hidden="true"`, no `ariaLabel`
- Semantic icons: Provide descriptive `ariaLabel`, automatic `role="img"`
- Falls back to Font Awesome if icon not in custom set
- See [Accessibility Guidelines](#accessibility) for more information

---

#### ThemeToggle

**Location:** `src/components/ui/ThemeToggle`

**Purpose:** Button to toggle between light and dark themes.

**Props:** None (controlled by `useTheme` hook)

**Usage Example:**

```tsx
<ThemeToggle />
```

**Features:**
- Automatic icon switching (moon/sun)
- Aria-label updates based on current theme
- Integrates with `useTheme` hook
- Persists preference to localStorage

---

#### EmailCapture

**Location:** `src/components/ui/EmailCapture`

**Purpose:** Email signup form with validation, GDPR consent, and spam protection.

**Props Interface:**

```typescript
interface EmailCaptureProps {
  variant?: 'inline' | 'centered'   // Layout variant (default: 'inline')
  placeholder?: string               // Input placeholder (default: 'Enter your email')
  buttonText?: string                // Submit button text (default: 'Join Waitlist')
}
```

**Features:**
- Email validation
- Honeypot spam protection
- GDPR consent checkbox
- Loading and success states
- Error handling with user-friendly messages
- Integrates with Netlify serverless functions
- Analytics tracking on successful signup

**Usage Examples:**

```tsx
// Inline variant (for headers/CTAs)
<EmailCapture variant="inline" buttonText="Get Early Access" />

// Centered variant (for dedicated sections)
<EmailCapture variant="centered" placeholder="your@email.com" />
```

**States:**
- `idle` - Initial state
- `loading` - Submitting form
- `success` - Email submitted successfully
- `error` - Validation or submission error

---

#### FeedbackWidget

**Location:** `src/components/ui/FeedbackWidget`

**Purpose:** Floating feedback button with modal for bug reports and feature requests.

**Props Interface:**

```typescript
interface FeedbackWidgetProps {
  onSubmit?: (data: FeedbackFormData) => Promise<void> | void  // Optional submit handler
}

interface FeedbackFormData {
  type: 'bug' | 'feature'   // Feedback type
  message: string            // User's feedback message
}
```

**Features:**
- Floating button accessible from anywhere
- Modal with form (bug report or feature request)
- Focus management and keyboard navigation
- Focus trap within modal
- Escape key to close
- Backdrop click to close
- Confirmation message after submission
- Mobile responsive
- Default localStorage storage if no `onSubmit` provided

**Usage Examples:**

```tsx
// Default behavior (stores in localStorage)
<FeedbackWidget />

// Custom submit handler
<FeedbackWidget 
  onSubmit={async (data) => {
    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }}
/>
```

**Accessibility:**
- Modal uses `role="dialog"` and `aria-modal="true"`
- Focus trapped within modal
- Focus restored to trigger button on close
- Screen reader announcements for errors/confirmation

---

#### AnimatedElement

**Location:** `src/components/ui/AnimatedElement`

**Purpose:** Wrapper component for scroll-triggered animations using Intersection Observer.

**Props Interface:**

```typescript
interface AnimatedElementProps {
  children: ReactNode                    // Content to animate
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale'  // Animation type (default: 'fadeIn')
  delay?: number                         // Animation delay in ms (default: 0)
  threshold?: number                     // Intersection Observer threshold 0-1 (default: 0.1)
  className?: string                     // Additional CSS classes
}
```

**Animation Types:**
- `fadeIn` - Opacity fade in
- `slideUp` - Slide up from below with fade
- `slideInLeft` - Slide in from left
- `slideInRight` - Slide in from right
- `scale` - Scale up from 95% to 100%

**Usage Examples:**

```tsx
// Basic fade in
<AnimatedElement animation="fadeIn">
  <h1>Welcome</h1>
</AnimatedElement>

// Slide up with delay
<AnimatedElement animation="slideUp" delay={200}>
  <p>Content appears after 200ms delay</p>
</AnimatedElement>

// Custom threshold (trigger when 50% visible)
<AnimatedElement animation="scale" threshold={0.5}>
  <div className="card">...</div>
</AnimatedElement>
```

**Accessibility:**
- Automatically disabled when `prefers-reduced-motion` is set
- Uses CSS transitions with hardware acceleration

---

#### ParallaxLayer

**Location:** `src/components/ui/ParallaxLayer`

**Purpose:** Creates parallax scrolling effect for background elements and content.

**Props Interface:**

```typescript
interface ParallaxLayerProps {
  children: ReactNode       // Content to apply parallax effect to
  speed?: number            // Parallax speed multiplier (default: 0.3)
  zIndex?: number           // Z-index for layering (default: 0)
  className?: string        // Additional CSS classes
  absolute?: boolean        // Position absolute for background layers (default: false)
  opacity?: number          // Layer opacity (default: 1)
}
```

**Speed Guidelines:**
- `0` - No movement (static)
- `0.1-0.3` - Subtle background effect (recommended)
- `0.4-0.6` - Medium parallax
- `0.7-1.0` - Strong foreground effect
- Negative values - Reverse direction

**Usage Examples:**

```tsx
// Background parallax layer
<ParallaxLayer speed={0.2} absolute zIndex={-1}>
  <div className="background-decoration" />
</ParallaxLayer>

// Content with subtle parallax
<ParallaxLayer speed={0.1}>
  <h1>Hero Title</h1>
</ParallaxLayer>

// Multiple layers for depth
<ParallaxLayer speed={0.1} zIndex={1}>
  <div className="back-layer" />
</ParallaxLayer>
<ParallaxLayer speed={0.3} zIndex={2}>
  <div className="front-layer" />
</ParallaxLayer>
```

**Performance:**
- GPU-accelerated CSS transforms (60fps)
- Disabled on mobile by default (via `useParallax` hook)
- Respects `prefers-reduced-motion` - See [Animation Guidelines](#animation-guidelines)
- Only calculates when in viewport (Intersection Observer)

---

#### FloatingElement

**Location:** `src/components/ui/FloatingElement`

**Purpose:** Creates gentle floating/bobbing animation effects for decorative elements.

**Props Interface:**

```typescript
interface FloatingElementProps {
  children: ReactNode                          // Content to float
  duration?: number                            // Animation duration in seconds (default: 3)
  delay?: number                               // Animation delay in seconds (default: 0)
  distance?: number                            // Float distance in pixels (default: 20)
  direction?: 'vertical' | 'horizontal' | 'circular'  // Float direction (default: 'vertical')
  className?: string                           // Additional CSS classes
  pauseWhenHidden?: boolean                    // Pause when out of viewport (default: true)
}
```

**Usage Examples:**

```tsx
// Gentle vertical float
<FloatingElement duration={4} distance={15}>
  <div className="floating-icon">🌟</div>
</FloatingElement>

// Fast horizontal float with delay
<FloatingElement direction="horizontal" duration={2} delay={0.5}>
  <span>→</span>
</FloatingElement>

// Circular orbit
<FloatingElement direction="circular" duration={8} distance={30}>
  <div className="orbiting-element" />
</FloatingElement>
```

**Performance:**
- CSS animations with GPU acceleration
- Automatically pauses when out of viewport (saves CPU)
- Respects `prefers-reduced-motion` - See [Animation Guidelines](#animation-guidelines)

---

#### CounterAnimation

**Location:** `src/components/ui/CounterAnimation`

**Purpose:** Animates numbers counting up from start to end value.

**Props Interface:**

```typescript
interface CounterAnimationProps {
  end: number                              // Target number to count to
  start?: number                           // Starting number (default: 0)
  duration?: number                        // Animation duration in ms (default: 2000)
  prefix?: string                          // Prefix before number (e.g., "$")
  suffix?: string                          // Suffix after number (e.g., "+", "%")
  decimals?: number                        // Decimal places to show (default: 0)
  className?: string                       // Additional CSS classes
  easing?: 'linear' | 'easeOutQuart' | 'easeOutExpo'  // Easing function (default: 'easeOutQuart')
  separator?: boolean                      // Add thousands separator (default: true)
  minWidth?: string                        // Min width to prevent layout shift
}
```

**Usage Examples:**

```tsx
// Simple counter
<CounterAnimation end={1000} />

// Currency counter
<CounterAnimation end={99.99} prefix="$" decimals={2} />

// Percentage counter
<CounterAnimation end={99} suffix="%" duration={3000} />

// Large number with custom easing
<CounterAnimation end={10000000} easing="easeOutExpo" suffix="+" />
```

**Features:**
- requestAnimationFrame for smooth 60fps
- Intersection Observer triggers animation when scrolled into view
- Automatic thousands separator formatting
- Customizable easing functions
- Prevents layout shift with automatic minimum width calculation

---

#### TextReveal

**Location:** `src/components/ui/TextReveal`

**Purpose:** Animates text revealing character by character or word by word.

**Props Interface:**

```typescript
interface TextRevealProps {
  children: string                        // Text content to animate
  type?: 'character' | 'word'             // Reveal type (default: 'word')
  delay?: number                          // Base delay before start in ms (default: 0)
  stagger?: number                        // Delay between units in ms (default: 50)
  animation?: 'fadeUp' | 'fadeIn' | 'slideUp' | 'blur'  // Effect type (default: 'fadeUp')
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'  // HTML tag to render as
  className?: string                      // Additional CSS classes
  threshold?: number                      // Intersection threshold 0-1 (default: 0.2)
}
```

**Usage Examples:**

```tsx
// Word-by-word reveal
<TextReveal as="h1">
  Welcome to Paperlyte
</TextReveal>

// Character reveal with custom timing
<TextReveal type="character" stagger={30} animation="blur">
  Lightning Fast
</TextReveal>

// Word reveal with delay
<TextReveal delay={500} animation="slideUp">
  Your thoughts, unchained
</TextReveal>
```

**Animation Types:**
- `fadeUp` - Fade in with upward slide
- `fadeIn` - Simple opacity fade
- `slideUp` - Slide up from below
- `blur` - Blur to clear effect

---

#### SVGPathAnimation

**Location:** `src/components/ui/SVGPathAnimation`

**Purpose:** Animates SVG paths with a drawing effect.

**Props Interface:**

```typescript
interface SVGPathAnimationProps {
  children: ReactNode                     // SVG <path> elements to animate
  duration?: number                       // Animation duration in ms (default: 2000)
  delay?: number                          // Delay before start in ms (default: 0)
  staggerDelay?: number                   // Delay between paths in ms (default: 200)
  easing?: string                         // CSS timing function (default: 'ease-out')
  width?: number                          // SVG viewBox width (default: 100)
  height?: number                         // SVG viewBox height (default: 100)
  className?: string                      // Additional CSS classes
  strokeColor?: string                    // Stroke color (default: 'currentColor')
  strokeWidth?: number                    // Stroke width (default: 2)
  fillColor?: string                      // Fill color (default: 'none')
  animateFill?: boolean                   // Animate fill after stroke (default: false)
}
```

**Usage Examples:**

```tsx
// Simple path draw
<SVGPathAnimation duration={1500}>
  <path d="M10 10 L90 90" />
</SVGPathAnimation>

// Complex shape with fill
<SVGPathAnimation
  width={200}
  height={200}
  strokeColor="#7c3aed"
  fillColor="#7c3aed"
  animateFill
>
  <path d="M100 10 L190 90 L10 90 Z" />
</SVGPathAnimation>

// Multiple paths with stagger
<SVGPathAnimation duration={2000} staggerDelay={300}>
  <path d="M10 50 Q50 10 90 50" />
  <path d="M10 70 Q50 110 90 70" />
</SVGPathAnimation>
```

**Features:**
- Automatic path length calculation
- Multiple paths with staggered animation
- Optional fill animation after stroke completes
- GPU-accelerated stroke-dashoffset animation

---

### Layout Components

#### Section

**Location:** `src/components/layout/Section`

**Purpose:** Reusable section wrapper with consistent spacing and backgrounds.

**Props Interface:**

```typescript
interface SectionProps {
  id?: string                             // Section ID for navigation
  children: ReactNode                     // Section content
  className?: string                      // Additional CSS classes
  background?: 'default' | 'surface' | 'primary'  // Background variant (default: 'default')
  padding?: 'default' | 'large' | 'none'          // Padding size (default: 'default')
}
```

**Background Variants:**
- `default` - Uses `--color-background`
- `surface` - Uses `--color-surface` (subtle gray)
- `primary` - Uses `--color-primary` (purple accent)

**Padding Sizes:**
- `default` - Standard section spacing (64px vertical)
- `large` - Extra spacing for hero sections (96px vertical)
- `none` - No padding (for custom layouts)

**Usage Examples:**

```tsx
// Standard section
<Section id="features" background="surface">
  <h2>Features</h2>
  {/* content */}
</Section>

// Hero section with large padding
<Section id="hero" padding="large">
  {/* hero content */}
</Section>

// Custom background
<Section background="primary" className={styles.customSection}>
  {/* content */}
</Section>
```

**Features:**
- Consistent max-width container
- Responsive padding adjustments
- Semantic `<section>` element
- Memoized for performance

---

#### Header

**Location:** `src/components/layout/Header`

**Purpose:** Main navigation header with mobile menu support.

**Props:** None (self-contained component)

**Features:**
- Sticky/fixed positioning
- Mobile hamburger menu
- Focus management and keyboard navigation
- Escape key closes menu
- Focus trap in mobile menu
- Theme toggle integration
- Smooth scroll to sections

**Usage Example:**

```tsx
<Header />
```

**Accessibility:**
- ARIA roles and labels
- Keyboard navigation support
- Focus trap in mobile menu
- Screen reader friendly

---

#### Footer

**Location:** `src/components/layout/Footer`

**Purpose:** Site footer with links and copyright information.

**Props:** None (self-contained component)

**Usage Example:**

```tsx
<Footer />
```

---

### Section Components

Section components are pre-composed layouts for specific page sections.

#### Hero

**Location:** `src/components/sections/Hero`

**Purpose:** Hero section with headline, subheading, email capture, and tags.

**Props:** None

**Features:**
- AnimatedElement integration for staggered entrance
- EmailCapture component
- Icon tags for key features
- Smooth scroll to features section

---

#### Features

**Location:** `src/components/sections/Features`

**Purpose:** Feature grid displaying application capabilities.

**Props:** None

**Features:**
- Pulls feature data from `@constants/features`
- Responsive grid layout (1-2-3 columns)
- Animated card entrance with stagger
- Icon integration

---

#### Pricing

**Location:** `src/components/sections/Pricing`

**Purpose:** Pricing tiers and plan comparison.

**Props:** None

---

#### Testimonials

**Location:** `src/components/sections/Testimonials`

**Purpose:** Customer testimonials with ratings.

**Props:** None

**Features:**
- Testimonial data from constants
- Responsive layout
- Animated entrance

---

#### Comparison

**Location:** `src/components/sections/Comparison`

**Purpose:** Feature comparison table vs competitors.

**Props:** None

**Features:**
- Comparison data from `@constants/comparison`
- Checkmark/cross icons
- Mobile-responsive table

---

#### Statistics

**Location:** `src/components/sections/Statistics`

**Purpose:** Key metrics and statistics display.

**Props:** None

**Features:**
- CounterAnimation integration
- Grid layout
- Animated number counting

---

#### FAQ

**Location:** `src/components/sections/FAQ`

**Purpose:** Frequently asked questions with collapsible answers.

**Props:** None

**Features:**
- FAQ data from constants
- Collapsible accordion pattern
- Keyboard navigation

---

#### CTA

**Location:** `src/components/sections/CTA`

**Purpose:** Call-to-action section with email capture.

**Props:** None

**Features:**
- EmailCapture integration
- Prominent positioning
- Action-focused copy

---

#### Mobile

**Location:** `src/components/sections/Mobile`

**Purpose:** Mobile app showcase section.

**Props:** None

---

## Hooks & Utilities

### useMediaQuery

**Location:** `src/hooks/useMediaQuery.ts`

**Purpose:** React hook for responsive design with programmatic breakpoint detection.

**Signature:**

```typescript
function useMediaQuery(query: string): boolean
```

**Parameters:**
- `query` - CSS media query string (e.g., `'(min-width: 768px)'`)

**Returns:**
- `boolean` - Whether the media query currently matches

**Usage Examples:**

```tsx
import { useMediaQuery } from '@hooks/useMediaQuery'

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}

// Conditional rendering based on screen size
function Navigation() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? <MobileNav /> : <DesktopNav />
}

// Hide elements on specific breakpoints
function HeroSection() {
  const showFloatingIcons = useMediaQuery('(min-width: 769px)')
  
  return (
    <section>
      {showFloatingIcons && <FloatingDecorations />}
      <HeroContent />
    </section>
  )
}
```

**How It Works:**
- Wraps `window.matchMedia()` with reactive state
- Listens to viewport changes via `MediaQueryListEvent`
- Updates component when media query match status changes
- SSR-safe (returns `false` when `window` is undefined)

**Common Breakpoints:**

```tsx
// Mobile
const isMobile = useMediaQuery('(max-width: 768px)')

// Tablet
const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1023px)')

// Desktop
const isDesktop = useMediaQuery('(min-width: 1024px)')

// Large desktop
const isLargeDesktop = useMediaQuery('(min-width: 1280px)')

// Portrait orientation
const isPortrait = useMediaQuery('(orientation: portrait)')

// Reduced motion
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

// Dark mode preference
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
```

**When to Use CSS vs useMediaQuery:**

**Use CSS media queries for:**
- Pure visual changes (layout, spacing, sizing)
- No conditional logic needed
- Better performance (no JS execution)
- Style-only responsive adjustments

**Use useMediaQuery hook for:**
- Conditional component rendering
- Different component trees for different screen sizes
- Logic that depends on viewport size
- Dynamic content loading based on screen size

**Performance Notes:**
- Hook only re-renders when match status actually changes
- Safe to use in multiple components simultaneously
- No polling - event-based updates only
- Minimal overhead compared to resize listeners

---

### Other Hooks

#### useParallax

**Location:** `src/hooks/useParallax.ts`

**Purpose:** Creates parallax scrolling effects.

**Features:**
- GPU-accelerated transforms
- Intersection Observer for viewport detection
- Automatic mobile/reduced motion disabling
- requestAnimationFrame for smooth updates

---

#### useIntersectionObserver

**Location:** `src/hooks/useIntersectionObserver.ts`

**Purpose:** Detects when element enters viewport.

**Features:**
- Configurable threshold
- Optional trigger-once behavior
- Used by AnimatedElement, ParallaxLayer, etc.

---

#### useReducedMotion

**Location:** `src/hooks/useReducedMotion.ts`

**Purpose:** Detects user's motion preference.

**Returns:** `boolean` - true if user prefers reduced motion

---

#### useTheme

**Location:** `src/hooks/useTheme.ts`

**Purpose:** Manages light/dark theme state.

**Features:**
- localStorage persistence
- System preference detection
- Theme toggle function

---

#### useScrollPosition

**Location:** `src/hooks/useScrollPosition.ts`

**Purpose:** Tracks current scroll position.

---

## Architectural Patterns

### File Structure

All components follow a consistent structure:

```
ComponentName/
├── index.ts                 # Barrel export
├── ComponentName.tsx        # Main component
├── ComponentName.module.css # Scoped styles
└── ComponentName.test.tsx   # Unit tests
```

### Barrel Export Pattern

Every component directory has an `index.ts` file that re-exports the component:

```typescript
// index.ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'
```

**Benefits:**
- Clean imports: `from '@components/ui/Button'` instead of `from '@components/ui/Button/Button'`
- Easy to refactor internal structure
- Type exports available alongside component

### TypeScript Props Interfaces

All components define a TypeScript interface for their props:

```typescript
interface ComponentNameProps {
  // Props definition
}

export const ComponentName = (props: ComponentNameProps): React.ReactElement => {
  // Component implementation
}
```

**Conventions:**
- Interface name matches component name + `Props`
- Export props interface for type composition
- Use `ReactElement` or `ReactNode` for return types
- Use `?` for optional props with defaults

### React.memo Pattern

Layout and section components use `React.memo` for performance:

```typescript
export const Section = React.memo<SectionProps>(
  ({ id, children, className }) => {
    // Component implementation
  }
)

Section.displayName = 'Section'
```

**When to Use:**
- Layout components that rarely change props
- Section components with static content
- Components in lists or grids

**When NOT to Use:**
- Components with props that change frequently
- Components with children that update often
- Small, simple components (overhead not worth it)

### CSS Modules

All components use CSS Modules for scoped styling:

```tsx
import styles from './Component.module.css'

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

**Benefits:**
- No class name conflicts
- Co-located with component
- Type-safe with TypeScript
- Automatic optimization/minification

**Naming Conventions:**
- Use camelCase for class names
- Descriptive names (`.primaryButton` not `.pb`)
- BEM-like modifiers: `.button`, `.buttonPrimary`, `.buttonDisabled`

### Design Token Integration

Components reference CSS custom properties from `src/styles/variables.css`:

```css
/* Component.module.css */
.button {
  background-color: var(--color-primary);
  border-radius: var(--border-radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}
```

**Never hardcode values that exist as design tokens:**
- ❌ `color: #7c3aed`
- ✅ `color: var(--color-primary)`
- ❌ `padding: 16px 24px`
- ✅ `padding: var(--spacing-sm) var(--spacing-md)`

**See also:**
- [Color Palette](#color-palette) - All color tokens
- [Typography](#typography) - Font size and weight tokens
- [Spacing System](#spacing-system) - Spacing scale
- [Layout & Grid](#layout--grid) - Border radius and layout tokens
- [Animation Guidelines](#animation-guidelines) - Transition and animation tokens
- [Design Tokens (Tailwind Config)](#design-tokens-tailwind-config-ready) - Full token reference

### Component Testing

All components have accompanying test files using Vitest and React Testing Library:

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

**Testing Best Practices:**
- Test user behavior, not implementation
- Use `screen` queries from Testing Library
- Test accessibility (aria labels, keyboard navigation)
- Test different prop combinations
- Test error states and edge cases

### Accessibility Guidelines

All components must meet WCAG 2.1 AA standards:

**Required:**
- Semantic HTML elements
- Proper heading hierarchy
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratios (see [Color Palette](#color-palette))
- Touch target sizes (44x44px minimum)

**Animation Accessibility:**
- All animations respect `prefers-reduced-motion`
- Use `useReducedMotion` hook
- Provide static fallbacks
- Never rely on motion alone to convey information

**Form Accessibility:**
- Associate labels with inputs
- Provide error messages with `role="alert"`
- Use `aria-invalid` for validation states
- Include `aria-describedby` for help text

---

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
  background-color: var(--color-primary);      /* #7c3aed */
  color: var(--color-text-on-primary);         /* #ffffff */
  border: 1px solid transparent;
  border-radius: var(--border-radius-full);    /* 9999px - pill shape */
  min-height: 44px;
  min-width: 44px;
}

.primary:hover {
  background-color: var(--color-primary-dark); /* #6d28d9 */
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
- Maintain 44px minimum touch target size (meets WCAG 2.5.5 Level AAA)
- Show clear hover/focus states for interactive elements
- Use semantic button types (`<button type="button">`)

❌ **DON'T:**
- Use more than one primary button in close proximity
- Create buttons smaller than 44x44px (violates WCAG 2.5.5 Level AAA)
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

### Quick Reference

**CSS Variables (min-width approach):**
```css
/* These breakpoints are implemented in variables.css */
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Small mobile (extra adjustments) */ }
@media (min-width: 769px)  { /* Tablet and above */ }
@media (min-width: 1024px) { /* Desktop and above */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

**Common Patterns:**
```css
/* Hide on mobile, show on tablet+ */
@media (max-width: 768px) {
  .desktop-only { display: none; }
}

/* Show on mobile, hide on tablet+ */
@media (min-width: 769px) {
  .mobile-only { display: none; }
}

/* Adjust layout at tablet breakpoint */
@media (min-width: 769px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

### Responsive Utility Classes

Paperlyte provides utility classes in `src/styles/utilities.css` for common responsive needs.

**Visibility Utilities:**

```css
/* Hide on mobile (< 768px) */
.hidden-mobile {
  display: none; /* Hidden on mobile, visible on desktop */
}

/* Hide on desktop (>= 769px) */
.hidden-desktop {
  display: none; /* Hidden on desktop, visible on mobile */
}

/* Hide completely */
.hidden {
  display: none;
}

/* Screen reader only (visually hidden but accessible) */
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

**Usage Examples:**

```tsx
// Hide decorative elements on mobile
<div className="hidden-mobile">
  <FloatingElement>...</FloatingElement>
</div>

// Show mobile navigation only on mobile
<nav className="hidden-desktop">
  <MobileNav />
</nav>

// Screen reader only text
<span className="sr-only">Skip to main content</span>
```

**Container Utilities:**

```css
.container {
  width: 100%;
  max-width: var(--max-width);        /* 1280px */
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);    /* 24px */
  padding-right: var(--spacing-md);
}

.container-content {
  max-width: var(--max-width-content); /* 1024px */
}
```

**Flexbox Utilities:**

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Gap utilities */
.gap-xs { gap: var(--spacing-xs); }  /* 8px */
.gap-sm { gap: var(--spacing-sm); }  /* 16px */
.gap-md { gap: var(--spacing-md); }  /* 24px */
.gap-lg { gap: var(--spacing-lg); }  /* 32px */
```

**Spacing Utilities:**

```css
/* Margin top */
.mt-xs { margin-top: var(--spacing-xs); }  /* 8px */
.mt-sm { margin-top: var(--spacing-sm); }  /* 16px */
.mt-md { margin-top: var(--spacing-md); }  /* 24px */
.mt-lg { margin-top: var(--spacing-lg); }  /* 32px */
.mt-xl { margin-top: var(--spacing-xl); }  /* 48px */

/* Margin bottom */
.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }
```

### CSS vs Programmatic Responsive Patterns

**Use CSS Media Queries For:**

```css
/* Visual-only changes - no logic needed */
.hero-title {
  font-size: var(--font-size-5xl);  /* 48px */
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-4xl);  /* 36px */
  }
}

/* Layout adjustments */
.grid {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

**Use useMediaQuery Hook For:**

```tsx
import { useMediaQuery } from '@hooks/useMediaQuery'

function HeroSection() {
  // Conditional component rendering
  const isMobile = useMediaQuery('(max-width: 768px)')
  const showParallax = useMediaQuery('(min-width: 1024px)')
  
  return (
    <section>
      {/* Different components for different screens */}
      {isMobile ? <MobileHero /> : <DesktopHero />}
      
      {/* Conditionally render expensive features */}
      {showParallax && <ParallaxBackground />}
      
      {/* Different content structure */}
      {isMobile ? (
        <SimpleLayout />
      ) : (
        <ComplexTwoColumnLayout />
      )}
    </section>
  )
}

// Dynamic data loading based on screen size
function ImageGallery() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const imageSize = isMobile ? 'small' : 'large'
  
  return (
    <div>
      {images.map(img => (
        <img src={img[imageSize]} alt={img.alt} />
      ))}
    </div>
  )
}
```

**Combining Both Approaches:**

```tsx
function FeatureSection() {
  // Use hook for component logic
  const showAnimations = useMediaQuery('(min-width: 769px)')
  
  return (
    // Use CSS class for styling
    <section className={styles.features}>
      <div className={styles.grid}> {/* CSS handles grid columns */}
        {features.map((feature) => (
          showAnimations ? (
            <AnimatedElement key={feature.id} animation="slideUp">
              <FeatureCard {...feature} />
            </AnimatedElement>
          ) : (
            <FeatureCard key={feature.id} {...feature} />
          )
        ))}
      </div>
    </section>
  )
}
```

**Performance Best Practices:**

✅ **DO:**
- Use CSS for visual-only changes (better performance)
- Use `useMediaQuery` sparingly for conditional logic
- Combine CSS classes with media queries for most cases
- Cache media query results when possible

❌ **DON'T:**
- Use `useMediaQuery` for simple hiding/showing (use CSS classes)
- Create many `useMediaQuery` hooks with same query (use once, pass down)
- Poll `window.innerWidth` manually (use `useMediaQuery` instead)
- Forget that `useMediaQuery` causes re-renders on viewport changes

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

**Minimum implemented touch target size: 44x44px** (WCAG 2.5.5 Level AAA; Level AA minimum is 24x24px)

The design uses 44px as the minimum touch target, exceeding the WCAG 2.5.5 Level AA requirement (24x24px) and meeting Level AAA. This ensures all interactive elements are easily tappable on mobile devices.

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
- Ensure touch targets are at least 44x44px (meets WCAG 2.5.5 Level AAA)
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

#### 2. Headline with Emphasis

```css
.headline {
  font-family: var(--font-family);        /* Inter */
  font-size: var(--font-size-5xl);        /* 48px */
  font-weight: var(--font-weight-bold);   /* 700 */
  line-height: var(--line-height-tight);  /* 1.25 */
  letter-spacing: -0.01em;                /* Slightly tight tracking */
}

.headlineItalic {
  font-style: italic;
  color: var(--color-primary);            /* Purple accent for emphasis */
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
    var(--color-primary) 0%,    /* Purple center */
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

**Visual Effect:** The heavy blur (60px) combined with low opacity (0.03) creates extremely subtle, soft purple halos that add depth without being distracting. Blur is reduced to 40px on mobile for better performance.

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
  border-radius: var(--border-radius-lg);  /* 16px */
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-xl);
}
```

The mockup includes:
- Header with window dots
- Skeleton content lines
- Checkboxes
- Statistics with clear numbers
- Primary CTA button

#### 6. Trusted By Section

```css
.trusted {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) var(--spacing-md);
}

.trustedLabel {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
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
    font-size: var(--font-size-4xl);  /* 48px → 30px */
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
          DEFAULT: '#7c3aed',  // Purple 600
          dark: '#6d28d9',     // Purple 700
          light: '#a78bfa',    // Purple 400
          faint: 'rgba(124, 58, 237, 0.1)',
          fainter: 'rgba(124, 58, 237, 0.05)',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',     // Slate 900 (dark mode)
        },
        surface: {
          DEFAULT: '#F9FAFB',
          dark: '#1E293B',     // Slate 800 (dark mode)
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        border: {
          DEFAULT: '#E5E7EB',
        },
        success: {
          DEFAULT: '#22c55e',  // Green 500
          dark: '#4ade80',     // Green 400 (dark mode)
        },
        error: {
          DEFAULT: '#dc2626',  // Red 600
          dark: '#f87171',     // Red 400 (dark mode)
        },
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
        full: '9999px', // Pill shape
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

**Dark Mode Implementation:**

The design uses CSS custom properties that automatically respond to dark mode. In dark mode:

- Primary: `#7c3aed` (purple remains consistent for brand recognition)
- Background: `#ffffff` → `#0F172A` (slate 900)
- Surface: `#F9FAFB` → `#1E293B` (slate 800)
- Text Primary: `#111827` → `#F1F5F9` (slate 100)
- Text Secondary: `#6B7280` → `#94A3B8` (slate 400)

This is handled automatically via the CSS variables in `src/styles/variables.css`.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2025-12-20 | **Major expansion**: Added comprehensive component library documentation (28 components), TypeScript prop interfaces, detailed hook documentation (useMediaQuery, useParallax, etc.), architectural patterns, responsive utility classes, CSS vs programmatic patterns, and enhanced cross-referencing. |
| 1.0.0 | 2025-12-20 | Updated documentation to match current implementation: Purple accent color (#7c3aed), Inter-only typography, accurate WCAG contrast ratios, current breakpoints, and comprehensive component library documentation. |

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
