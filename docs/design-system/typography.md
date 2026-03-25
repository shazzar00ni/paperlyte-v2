# Typography

Paperlyte uses a **dual-font system** that pairs editorial gravitas with utilitarian clarity.

---

## Font Families

### Playfair Display — Headlines

```css
font-family: 'Playfair Display', serif;
```

- **Role:** All headings (h1–h6), section titles, pull quotes
- **Weights used:** Bold (700), occasionally ExtraBold (800) for hero headlines
- **Style notes:** Italic variants are encouraged for emphasis phrases within headlines — they add warmth and editorial feel without requiring colour
- **Source:** Self-hosted variable font at `/fonts/PlayfairDisplay-Variable.woff2`
- **Font display:** `swap` — body text renders first; Playfair Display swaps in

**Why Playfair Display?** It evokes the tactile quality of paper and print — reinforcing "Paperlyte" as a product that feels like writing on a premium surface. Its high contrast strokes feel fast and sharp at large sizes.

### Inter — UI and Body

```css
font-family:
  'Inter',
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

- **Role:** All body copy, UI labels, buttons, navigation, metadata
- **Weights used:** Normal (400), Medium (500), Semibold (600), Bold (700)
- **Source:** Self-hosted variable font at `/fonts/Inter-Variable.woff2`
- **Font display:** `swap`

The system-font fallback stack (`system-ui, -apple-system…`) ensures zero-flash, accessible rendering before the font loads. The design is tuned to look acceptable in system fonts.

---

## Type Scale

All sizes use `clamp()` for fluid scaling between mobile and desktop breakpoints. The minimum viewport is 320px; the maximum is 1280px.

| Token              | Mobile            | Desktop           | Element               |
| ------------------ | ----------------- | ----------------- | --------------------- |
| `--font-size-5xl`  | `2rem` (32px)     | `3rem` (48px)     | Hero headline (h1)    |
| `--font-size-4xl`  | `1.75rem` (28px)  | `2.25rem` (36px)  | Section headline (h2) |
| `--font-size-3xl`  | `1.5rem` (24px)   | `1.875rem` (30px) | Sub-section (h3)      |
| `--font-size-2xl`  | `1.25rem` (20px)  | `1.5rem` (24px)   | Card headline (h4)    |
| `--font-size-xl`   | `1.125rem` (18px) | `1.25rem` (20px)  | Large body / h5       |
| `--font-size-lg`   | `1rem` (16px)     | `1.125rem` (18px) | Lead paragraph        |
| `--font-size-base` | `1rem` (16px)     | `1rem` (16px)     | Body copy             |
| `--font-size-sm`   | `0.875rem` (14px) | `0.875rem` (14px) | Captions, labels      |
| `--font-size-xs`   | `0.75rem` (12px)  | `0.75rem` (12px)  | Fine print, tags      |

> **16px floor:** `--font-size-base` never scales below 16px. This prevents iOS Safari from auto-zooming on form inputs and maintains comfortable reading on small screens.

---

## Line Heights

| Token                   | Value  | Usage                                         |
| ----------------------- | ------ | --------------------------------------------- |
| `--line-height-tight`   | `1.25` | Headlines — keeps multi-line headings compact |
| `--line-height-normal`  | `1.5`  | Short body, UI labels                         |
| `--line-height-relaxed` | `1.75` | Long-form paragraphs, feature descriptions    |

**Rule:** Paragraphs (`<p>`) always use `--line-height-relaxed`. Headings always use `--line-height-tight`. Never apply relaxed line-height to headings — it makes large Playfair Display text feel sluggish.

---

## Font Weights

| Token                    | Value | Usage                        |
| ------------------------ | ----- | ---------------------------- |
| `--font-weight-normal`   | `400` | Body copy, supporting text   |
| `--font-weight-medium`   | `500` | Buttons, nav links, emphasis |
| `--font-weight-semibold` | `600` | Sub-headings, card titles    |
| `--font-weight-bold`     | `700` | Headlines, CTAs              |

---

## Heading Defaults

Defined globally in `src/styles/typography.css`:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Playfair Display', serif;
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

h1 {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-md);
}
h2 {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
}
h3 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}
h4 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-sm);
}
h5 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}
h6 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}
```

---

## Paragraph Defaults

```css
p {
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
```

Body paragraphs use `--color-text-secondary` (#6b7280) by default — this subtle grey keeps long-form text comfortable to read without competing with headline hierarchy. For higher-emphasis body copy, apply `color: var(--color-text-primary)` explicitly.

---

## Text Utility Classes

Defined in `src/styles/typography.css`:

```css
.text-primary {
  color: var(--color-primary);
}
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}

.font-normal {
  font-weight: var(--font-weight-normal);
}
.font-medium {
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  font-weight: var(--font-weight-semibold);
}
.font-bold {
  font-weight: var(--font-weight-bold);
}
```

---

## Editorial Patterns

### Italic Emphasis in Headlines

Wrap key phrases in `<em>` inside headline elements to add warmth without a colour accent:

```html
<h1>Your thoughts, <em>unchained.</em></h1>
```

CSS output: Playfair Display italic at the parent's weight. Do not use `font-style: italic` on entire headings — it becomes unreadable at large sizes.

### Subheadings / Eyebrow Labels

Small all-caps labels above section headlines:

```html
<p class="eyebrow">Why Paperlyte</p>
<h2>Built for how you think</h2>
```

```css
.eyebrow {
  font-family: var(--font-family); /* Inter */
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}
```

### Pull Stats

Feature metrics displayed in large Playfair Display numerals:

```html
<span class="stat-number">10ms</span> <span class="stat-label">keystroke response</span>
```

```css
.stat-number {
  font-family: 'Playfair Display', serif;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}
.stat-label {
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

---

## Accessibility

- **Minimum body text:** 16px (1rem) — below this, readability degrades and iOS Safari may zoom inputs
- **Contrast:** All text meets WCAG 2.1 AA (see [tokens.md](./tokens.md) for full contrast matrix)
- **Line length:** Target 60–75 characters per line. Use `max-width: var(--max-width-content)` on text sections
- **Avoid justified text** (`text-align: justify`) — creates uneven word spacing that harms readability for dyslexic users
- **Font loading:** Both fonts use `font-display: swap`. Ensure fallback stacks are metrically similar to prevent layout shift

---

## Prohibited Patterns

| Pattern                                                | Reason                                          |
| ------------------------------------------------------ | ----------------------------------------------- |
| Using `font-size` below `--font-size-sm` for body text | Accessibility violation                         |
| Raw pixel values (`font-size: 14px`)                   | Prevents user browser font-size scaling         |
| `text-align: justify`                                  | Harms readability for dyslexic users            |
| Playfair Display for body copy                         | Not optimised for small sizes; harms legibility |
| Inter for primary headlines                            | Lacks the editorial weight the brand requires   |
| `letter-spacing` on lowercase body copy                | Impairs readability of Inter at normal sizes    |
