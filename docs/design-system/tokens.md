# Design Tokens

All tokens live in `src/styles/variables.css` as CSS custom properties on `:root`. Dark mode tokens are declared on `[data-theme='dark']` and mirrored inside `@media (prefers-color-scheme: dark)` for system-preference support.

---

## Color Tokens

### Philosophy

Paperlyte uses a **warm monochrome palette** ("Editorial" direction) — a warm near-black and off-white rather than neutral gray/pure white. There is no brand accent color — contrast and weight carry all visual hierarchy. In dark mode the palette inverts: warm off-white becomes the primary interactive color and warm near-black becomes the canvas.

This deliberate constraint:

- Keeps focus on the writing surface (the product itself)
- Ages better than trend-dependent accent colors
- Achieves maximum contrast ratios with minimal token count
- The warm (vs. neutral-gray) undertone reads as more paper-like and less generic than pure black/white

### Light Mode

| Token                             | Value                     | Role                                                     |
| ---------------------------------- | ------------------------- | --------------------------------------------------------- |
| `--color-primary`                 | `#14110f`                 | Warm near-black — all interactive elements, CTA buttons   |
| `--color-primary-dark`            | `#050403`                 | Deeper black — hover state of primary                     |
| `--color-primary-light`           | `#3a352e`                 | Warm dark gray — subtle accents                           |
| `--color-primary-faint`           | `rgba(20,17,15, 0.08)`    | Hover tints, focus halos                                  |
| `--color-primary-fainter`         | `rgba(20,17,15, 0.04)`    | Very subtle backgrounds                                   |
| `--color-background`              | `#fcfcfa`                 | Warm off-white page canvas                                 |
| `--color-surface`                 | `#f4f2ec`                 | Warm paper — cards, panels                                 |
| `--color-surface-dark`            | `#14110f`                 | Dark surface sections (CTA stripe)                         |
| `--color-text-primary`            | `#14110f`                 | Headings, body copy                                        |
| `--color-text-secondary`          | `#57524b`                 | Supporting / metadata text                                 |
| `--color-text-tertiary`           | `#6f685e`                 | Muted labels — meets WCAG AA 4.5:1, safe for body text     |
| `--color-text-on-primary`         | `#fcfcfa`                 | Text on primary-colored backgrounds                        |
| `--color-text-on-dark`            | `#fcfcfa`                 | Text on `--color-surface-dark`                             |
| `--color-text-on-dark-secondary`  | `rgba(252,252,250, 0.72)` | Secondary text on dark surfaces                             |
| `--color-border`                  | `#e2dfd6`                 | Borders, dividers                                           |
| `--color-border-light`            | `#ecebe3`                 | Subtle borders, section separators                          |

### Dark Mode

| Token                             | Value                     | Role                                                        |
| ---------------------------------- | ------------------------- | -------------------------------------------------------------|
| `--color-primary`                 | `#fcfcfa`                 | Warm off-white — interactive elements in dark mode           |
| `--color-primary-dark`            | `#f1efe9`                 | Dimmer off-white — hover state                                |
| `--color-primary-light`           | `#e6e3dc`                 | Warm light gray — accents                                     |
| `--color-primary-faint`           | `rgba(252,252,250, 0.10)` | Hover tints                                                    |
| `--color-primary-fainter`         | `rgba(252,252,250, 0.05)` | Very subtle backgrounds                                        |
| `--color-background`              | `#14110f`                 | Warm near-black — deep canvas                                  |
| `--color-surface`                 | `#201c18`                 | Warm dark surface — card lift                                   |
| `--color-surface-dark`            | `#0a0806`                 | Deepest warm surface                                            |
| `--color-text-primary`            | `#f5f3ee`                 | Warm off-white — primary text                                   |
| `--color-text-secondary`          | `#a69f92`                 | Warm light gray — supporting text                                |
| `--color-text-tertiary`           | `#8f897e`                 | Warm taupe — muted labels, meets WCAG AA 4.5:1                   |
| `--color-text-on-primary`         | `#14110f`                 | Warm near-black text on off-white buttons (dark mode)             |
| `--color-text-on-dark`            | `#fcfcfa`                 | Retained                                                          |
| `--color-text-on-dark-secondary`  | `rgba(252,252,250, 0.72)` | Retained                                                          |
| `--color-border`                  | `#33302a`                 | Warm dark border                                                  |
| `--color-border-light`            | `#24211c`                 | Warm subtle border                                                |

### Semantic Colors

| Token                     | Light                    | Dark                       | Usage                                                    |
| -------------------------- | ------------------------- | --------------------------- | --------------------------------------------------------- |
| `--color-success`         | `#22c55e`                 | `#4ade80`                   | Success states (icons + descriptive text always paired)   |
| `--color-success-bg`      | `rgba(34,197,94, 0.10)`   | `rgba(74,222,128, 0.15)`    | Success alert backgrounds                                  |
| `--color-success-border`  | `rgba(34,197,94, 0.30)`   | `rgba(74,222,128, 0.35)`    | Success alert borders                                      |
| `--color-error`           | `#dc2626`                 | `#f87171`                   | Error states                                                |
| `--color-error-bg`        | `rgba(239,68,68, 0.10)`   | `rgba(248,113,113, 0.15)`   | Error alert backgrounds                                     |
| `--color-error-border`    | `rgba(239,68,68, 0.30)`   | `rgba(248,113,113, 0.35)`   | Error alert borders                                         |

### WCAG Contrast Matrix

| Foreground | Background | Ratio  | Level | Notes                              |
| ---------- | ---------- | ------ | ----- | ----------------------------------- |
| `#14110f`  | `#fcfcfa`  | 18.3:1 | AAA   | Body text / primary (light)         |
| `#57524b`  | `#fcfcfa`  | 7.5:1  | AAA   | Supporting text (light)             |
| `#6f685e`  | `#fcfcfa`  | 5.4:1  | AA    | Tertiary/muted text (light)         |
| `#fcfcfa`  | `#14110f`  | 18.3:1 | AAA   | Text on primary button              |
| `#f5f3ee`  | `#14110f`  | 17.0:1 | AAA   | Body text (dark)                    |
| `#a69f92`  | `#14110f`  | 7.2:1  | AAA   | Supporting text (dark)              |
| `#8f897e`  | `#14110f`  | 5.4:1  | AA    | Tertiary/muted text (dark)          |
| `#14110f`  | `#fcfcfa`  | 18.3:1 | AAA   | Dark text on off-white button       |

> **Rule:** `--color-text-tertiary` reaches AA (4.5:1+) on both `--color-background` and `--color-surface` in both themes, so it's safe for small supporting text — not just large text/icons.

### Color State Guidelines

```text
Default       --color-primary
Hover         --color-primary-dark  +  translateY(-1px)  +  box-shadow
Active        --color-primary-dark  +  translateY(0)
Focus         outline: 2px solid --color-primary  outline-offset: 2px
Disabled      opacity: 0.50  +  cursor: not-allowed
```

---

## Typography Tokens

> Full type system documentation in [`typography.md`](./typography.md).

| Token                     | Value                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------|
| `--font-family`           | `'Instrument Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`     |
| `--font-size-xs`          | `0.75rem` (12px)                                                                              |
| `--font-size-sm`          | `0.875rem` (14px)                                                                             |
| `--font-size-base`        | `1rem` (16px)                                                                                 |
| `--font-size-lg`          | `clamp(1rem, 0.9286rem + 0.3571vw, 1.125rem)`                                                 |
| `--font-size-xl`          | `clamp(1.125rem, 1.0179rem + 0.5357vw, 1.25rem)`                                              |
| `--font-size-2xl`         | `clamp(1.25rem, 1.0714rem + 0.8929vw, 1.5rem)`                                                |
| `--font-size-3xl`         | `clamp(1.5rem, 1.1786rem + 1.6071vw, 1.875rem)`                                               |
| `--font-size-4xl`         | `clamp(1.75rem, 1.2143rem + 2.6786vw, 2.25rem)`                                               |
| `--font-size-5xl`         | `clamp(2rem, 1.2857rem + 3.5714vw, 3rem)`                                                     |
| `--font-weight-normal`    | `400`                                                                                          |
| `--font-weight-medium`    | `500`                                                                                          |
| `--font-weight-semibold`  | `600`                                                                                          |
| `--font-weight-bold`      | `700`                                                                                          |
| `--line-height-tight`     | `1.25`                                                                                         |
| `--line-height-normal`    | `1.5`                                                                                          |
| `--line-height-relaxed`   | `1.75`                                                                                         |

---

## Spacing Tokens

Spacing uses a fixed scale with responsive overrides at tablet (768px) and mobile (480px).

| Token           | Default         | Tablet ≤768px | Mobile ≤480px |
| --------------- | --------------- | ------------- | ------------- |
| `--spacing-xs`  | `0.5rem` (8px)  | —             | —             |
| `--spacing-sm`  | `1rem` (16px)   | —             | —             |
| `--spacing-md`  | `1.5rem` (24px) | —             | `1rem`        |
| `--spacing-lg`  | `2rem` (32px)   | —             | —             |
| `--spacing-xl`  | `3rem` (48px)   | —             | —             |
| `--spacing-2xl` | `4rem` (64px)   | —             | `3rem`        |
| `--spacing-3xl` | `6rem` (96px)   | `4rem`        | `3rem`        |

### Usage Pattern

Use spacing tokens exclusively — never raw pixel or rem values. This ensures responsive behaviour is inherited automatically.

```css
/* Correct */
padding: var(--spacing-md) var(--spacing-lg);

/* Wrong */
padding: 24px 32px;
```

---

## Border Radius Tokens

| Token                   | Value           | Usage                          |
| ------------------------ | --------------- | ------------------------------- |
| `--border-radius-sm`    | `0.25rem` (4px) | Tags, badges, small chips       |
| `--border-radius-md`    | `0.5rem` (8px)  | Cards, input fields, modals     |
| `--border-radius-lg`    | `1rem` (16px)   | Large cards, feature tiles      |
| `--border-radius-full`  | `9999px`        | Buttons (signature pill shape)  |

> **Pill buttons are a brand signature.** All `<Button>` components default to `--border-radius-full`. Do not override this without design approval.

---

## Shadow Tokens

| Token          | Value                                 | Usage                          |
| --------------- | -------------------------------------- | -------------------------------- |
| `--shadow-sm`  | `0 1px 2px 0 rgba(0,0,0, 0.05)`       | Subtle lift for cards           |
| `--shadow-md`  | `0 4px 6px -1px rgba(0,0,0, 0.10)`    | Button hover, dropdown panels   |
| `--shadow-lg`  | `0 10px 15px -3px rgba(0,0,0, 0.10)`  | Modal dialogs, popovers         |
| `--shadow-xl`  | `0 20px 25px -5px rgba(0,0,0, 0.10)`  | Hero decorative elements        |

---

## Transition Tokens

| Token                        | Value                                 | Usage                                          |
| ------------------------------ | -------------------------------------- | ------------------------------------------------ |
| `--transition-fast`          | `150ms cubic-bezier(0.4, 0, 0.2, 1)`  | Color changes, opacity fades                    |
| `--transition-base`          | `250ms cubic-bezier(0.4, 0, 0.2, 1)`  | Most interactive states                         |
| `--transition-slow`          | `350ms cubic-bezier(0.4, 0, 0.2, 1)`  | Layout shifts, reveals                          |
| `--animation-duration`       | `250ms`                                | Default animation duration                       |
| `--reduced-motion-duration`  | `0.01ms`                               | Applied when `prefers-reduced-motion: reduce`    |

**Always** respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: var(--reduced-motion-duration) !important;
    transition-duration: var(--reduced-motion-duration) !important;
  }
}
```

---

## Z-Index Tokens

| Token          | Value  | Layer                  |
| --------------- | ------ | ------------------------ |
| `--z-header`   | `1000` | Sticky navigation       |
| `--z-modal`    | `2000` | Modal dialogs, drawers  |
| `--z-tooltip`  | `3000` | Tooltips, popovers      |

---

## Icon Size Tokens

| Token                | Value           | Usage                 |
| ---------------------- | --------------- | ------------------------ |
| `--icon-size-sm`     | `3.5rem` (56px) | Feature card icons     |
| `--icon-size-base`   | `4rem` (64px)   | Hero floating icons     |

---

## Layout Tokens

| Token                    | Value    | Usage                              |
| -------------------------- | -------- | ------------------------------------ |
| `--max-width`             | `1280px` | Outer page container                |
| `--max-width-content`     | `1024px` | Prose / text-heavy sections         |
| `--header-height`         | `64px`   | Reserved for sticky header offset   |
