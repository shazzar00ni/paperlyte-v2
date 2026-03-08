# Layout Guidelines

---

## Grid System

Paperlyte does not use a traditional 12-column CSS grid framework. Instead, it uses a purpose-built grid per section, driven by CSS Grid and Flexbox with design-token spacing. This keeps markup lean and avoids unused grid column classes.

### Containers

Two container widths are defined:

| Class / Token | Width | Use |
|---|---|---|
| `.container` + `--max-width` | `1280px` | Outer page container — all sections |
| `.container-content` + `--max-width-content` | `1024px` | Text-heavy sections (CTA, FAQ, Problem) |

Apply both to constrain a section's prose width:
```html
<div class="container">
  <div class="container-content">
    <h2>…</h2>
    <p>…</p>
  </div>
</div>
```

The `.container` class provides horizontal padding (`var(--spacing-md)` on each side) and auto-centers the content via `margin: 0 auto`.

### Standard Feature Grid (3-column)

Used by the Features section and similar 3-up layouts:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

/* Tablet */
@media (max-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile */
@media (max-width: 480px) {
  .grid { grid-template-columns: 1fr; }
}
```

### Two-Column Split (text + image)

Used by the Solution and Mobile sections:

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
}

@media (max-width: 768px) {
  .split {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}
```

---

## Breakpoints

| Name | Width | Target |
|---|---|---|
| Desktop | > 1024px | Primary layout |
| Tablet | ≤ 1024px | Two-column collapses |
| Tablet small | ≤ 768px | Grid collapses to 2 columns; hamburger nav |
| Mobile | ≤ 480px | Single column; reduced spacing; floating elements hidden |
| Mobile small | ≤ 375px | Fine-tune font sizes and padding |

**Mobile-first philosophy:** Write base styles for mobile, then add desktop overrides with `@media (min-width: ...)`. Exception: complex desktop-only features (parallax, floating elements) use `@media (max-width: 768px) { display: none }` for simplicity.

---

## Section Anatomy

Every page section follows a consistent vertical rhythm:

```
┌─────────────────────────────────────────────────┐
│  Section padding top:  --spacing-3xl  (96px)    │
│                                                 │
│  [Eyebrow label]      ← optional               │
│  Section headline (h2)                          │
│  Section subheading (p)                         │
│                                                 │
│  Section body / grid / cards                    │
│                                                 │
│  Section padding bottom: --spacing-3xl (96px)   │
└─────────────────────────────────────────────────┘
```

- Use `var(--spacing-3xl)` for vertical section padding (reduces to `4rem` on tablet, `3rem` on mobile via token overrides)
- Section headlines are centered on all screen sizes unless the section is a two-column split
- Eyebrow label → headline → subheading always stack in this order

### Section Background Variants

| Variant | Background | Foreground |
|---|---|---|
| `default` | `--color-background` (#fff) | Standard text colours |
| `surface` | `--color-surface` (#f9fafb) | Standard text colours |
| `dark` | `--color-surface-dark` (#18181b) | `--color-text-on-dark` (white) |

Alternate section backgrounds (default → surface → dark → default…) to create visual rhythm without adding colour.

---

## Header Layout

```
┌─────────────────────────────────────────────────┐
│  height: 64px  (--header-height)                │
│  position: sticky  top: 0  z-index: 1000        │
│                                                 │
│  [Logo]    [Nav links]    [ThemeToggle] [CTA]  │
└─────────────────────────────────────────────────┘
```

- Flexbox: `justify-content: space-between`, `align-items: center`
- Nav links use `gap: var(--spacing-md)`
- At ≤ 768px: nav links collapse to hamburger; CTA button hides; ThemeToggle stays visible

---

## Footer Layout

Desktop (3-column):
```
┌──────────────┬──────────────┬──────────────┐
│ Brand column │ Product links│ Legal links  │
│ Logo         │ Features     │ Privacy      │
│ Tagline      │ Pricing      │ Terms        │
│ Social icons │ Roadmap      │ Cookies      │
└──────────────┴──────────────┴──────────────┘
│ Copyright strip (full width)               │
└────────────────────────────────────────────┘
```

Mobile: All columns stack vertically with `var(--spacing-xl)` gap.

---

## Utility Classes

Defined in `src/styles/utilities.css`:

### Container
```css
.container          /* max-width: 1280px, centered, horizontal padding */
.container-content  /* max-width: 1024px */
```

### Flexbox
```css
.flex               /* display: flex */
.flex-col           /* flex-direction: column */
.items-center       /* align-items: center */
.justify-center     /* justify-content: center */
.justify-between    /* justify-content: space-between */
.gap-xs             /* gap: --spacing-xs */
.gap-sm             /* gap: --spacing-sm */
.gap-md             /* gap: --spacing-md */
```

### Visibility / Accessibility
```css
.sr-only            /* visually hidden, screen-reader accessible */
.skip-link          /* skip-to-content link, visible on focus */
```

---

## Z-Index Layers

| Layer | Token | Value |
|---|---|---|
| Header | `--z-header` | 1000 |
| Modal / Drawer | `--z-modal` | 2000 |
| Tooltip / Popover | `--z-tooltip` | 3000 |

Always use tokens rather than raw z-index values. This prevents stacking context conflicts as the layout grows.

---

## Scroll Behaviour

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Anchor links within the page (e.g. nav → `#features`) use smooth scrolling on desktop, instant on reduced-motion.

### Scroll Offset for Sticky Header

All section anchors need a scroll margin to prevent the sticky header from covering the target:

```css
section[id] {
  scroll-margin-top: var(--header-height); /* 64px */
}
```

---

## Responsive Design Patterns

### Hiding Decorative Elements on Mobile

Floating icons, parallax shapes, and other decorative visuals are hidden on mobile to reduce visual noise and improve performance:

```css
@media (max-width: 768px) {
  .floatingElements {
    display: none;
  }
}
```

### Touch Targets

All interactive elements on mobile must meet 48×48px minimum touch target size. Buttons enforce this via `min-height` and `min-width` tokens. Inline text links should be wrapped in a `<span>` with adequate padding if they're too small.

### Viewport Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Never set `maximum-scale=1` — this prevents users from zooming, violating WCAG 1.4.4.

---

## Performance Layout Notes

- Avoid layout-triggering properties in animations (`width`, `height`, `top`, `left`, `margin`). Use `transform` and `opacity` exclusively.
- Use `will-change: transform` only on actively animating elements; remove it after the animation completes.
- Prefer CSS Grid over Flexbox for two-dimensional layouts (grid > nested flexbox chains).
- Use `content-visibility: auto` on below-the-fold sections to defer layout and paint work.
