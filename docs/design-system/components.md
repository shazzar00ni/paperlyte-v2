# Component Specifications

All components live under `src/components/`. A typical component directory contains:

- `ComponentName.tsx` — implementation
- `ComponentName.module.css` — scoped styles
- `ComponentName.test.tsx` — unit tests
- `index.ts` — named export

Note: Most components follow this structure and use CSS Modules for styling. Some components (for example, `Icon`) instead use a plain `ComponentName.css` file where appropriate.
Import via path alias: `import { Button } from '@components/ui/Button'`

---

## Primitive Components (`ui/`)

### Button

**File:** `src/components/ui/Button/Button.tsx`

The foundational interactive element. Renders as a `<button>` or `<a>` depending on whether `href` is provided. All URLs are validated against a safe-URL allowlist before rendering.

#### Props

| Prop            | Type                                  | Default     | Description                                  |
| --------------- | ------------------------------------- | ----------- | -------------------------------------------- |
| `children`      | `ReactNode`                           | required    | Button label or content                      |
| `variant`       | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style                                 |
| `size`          | `'small' \| 'medium' \| 'large'`      | `'medium'`  | Padding and font-size                        |
| `href`          | `string`                              | —           | Renders as `<a>` with external link handling |
| `onClick`       | `() => void`                          | —           | Click handler                                |
| `icon`          | `string`                              | —           | Icon name from icon library                  |
| `iconAriaLabel` | `string`                              | —           | Accessible label for icon                    |
| `disabled`      | `boolean`                             | `false`     | Disables interaction; prevents unsafe href   |
| `className`     | `string`                              | `''`        | Additional CSS classes                       |
| `ariaLabel`     | `string`                              | —           | Accessible label for the button              |
| `type`          | `'button' \| 'submit' \| 'reset'`     | `'button'`  | Form submission type                         |

#### Variants

**Primary** — Full black background, white text. Used for all primary CTAs.

```tsx
<Button variant="primary">Join the Waitlist</Button>
```

**Secondary** — Transparent with border. Used for secondary actions alongside a primary button.

```tsx
<Button variant="secondary" icon="arrow-right">
  See Features
</Button>
```

**Ghost** — No border, no background. Used in navigation and low-emphasis contexts.

```tsx
<Button variant="ghost">Learn More</Button>
```

#### Sizes

| Size     | Min-height | Padding        | Font size          |
| -------- | ---------- | -------------- | ------------------ |
| `small`  | 48px       | 0.5rem 1.25rem | `--font-size-sm`   |
| `medium` | 48px       | 0.75rem 1.5rem | `--font-size-base` |
| `large`  | 52px       | 1rem 2rem      | `--font-size-base` |

> **Minimum touch target:** All sizes enforce `min-height: 48px` and `min-width: 48px` to meet WCAG 2.1 criterion 2.5.5 (Target Size).

#### States

| State    | Effect                                                         |
| -------- | -------------------------------------------------------------- |
| Default  | `--color-primary` background                                   |
| Hover    | `--color-primary-dark`, `translateY(-1px)`, `--shadow-md`      |
| Active   | `translateY(0)`                                                |
| Focus    | `outline: 2px solid --color-primary`, `outline-offset: 2px`    |
| Disabled | `opacity: 0.50`, `cursor: not-allowed`, `pointer-events: none` |

#### Security

External `href` values containing `javascript:`, `data:`, or `vbscript:` protocols are rejected. An unsafe URL renders as a disabled `<button>` instead. In development, a `console.warn` is emitted to assist debugging.

---

### Icon

**File:** `src/components/ui/Icon/Icon.tsx`

Renders Font Awesome icons with a custom SVG path fallback. Supports solid, regular, and brand icon variants. Only icons explicitly registered in `src/utils/iconLibrary.ts` are available — unrecognised names render the `circle-question` placeholder.

#### Props

| Prop        | Type                                           | Default   | Description                                                                       |
| ----------- | ---------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `name`      | `string`                                       | required  | Icon name — see **Naming conventions** below                                      |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2x' \| '3x'` | `'md'`    | Pixel dimensions                                                                  |
| `variant`   | `'solid' \| 'brands' \| 'regular'`             | `'solid'` | Icon style; brand icons are also auto-detected, see below                         |
| `className` | `string`                                       | —         | Additional CSS classes                                                            |
| `ariaLabel` | `string`                                       | —         | Accessible label; sets `role="img"` when provided, `aria-hidden="true"` otherwise |
| `color`     | `string`                                       | —         | CSS color override                                                                |
| `style`     | `CSSProperties`                                | —         | Inline style override                                                             |

#### Naming Conventions

The `name` prop accepts two forms — both resolve to the same icon:

| Form                      | Example   | Notes                                                     |
| ------------------------- | --------- | --------------------------------------------------------- |
| Bare kebab-case name      | `bolt`    | Preferred                                                 |
| `fa-`-prefixed class name | `fa-bolt` | Supported for compatibility; `fa-` is stripped internally |

The component passes `name` through `convertIconName()` in `src/utils/iconLibrary.ts`, which maps `fa-` class names to bare names. **Names that are not in the library render the `circle-question` fallback** — check `validIconNames` in `iconLibrary.ts` before using a new name.

**Brand icons** (`GitHub`, `twitter`, `apple`, `windows`) are auto-detected via `isBrandIcon()` — passing `variant="brands"` is optional for these but recommended for clarity.

#### Registered Icon Names (solid unless noted)

```text
bolt          pen-nib       tags          mobile-screen  plane-slash
shield-halved feather       xmark         bars           envelope
star          heart         download      moon           sun
lock          check         circle-check  chevron-left   chevron-right
chevron-up    chevron-down  pause         play           note-sticky
pen           lightbulb     leaf          rocket         users
server        wifi          rotate-right  arrow-rotate-right
arrow-rotate-left book      magnifying-glass  plane      route
arrow-right   arrow-left    spinner

── brands ──
github  twitter  apple  windows
```

To add a new icon, import it from `@fortawesome/free-solid-svg-icons` (or brands), add it to `library.add()`, and add an entry to `iconNameMap` — all in `src/utils/iconLibrary.ts`.

#### Size Map

| Prop value | Pixel size |
| ---------- | ---------- |
| `sm`       | 16px       |
| `md`       | 20px       |
| `lg`       | 24px       |
| `xl`       | 32px       |
| `2x`       | 40px       |
| `3x`       | 48px       |

#### Accessibility

- Decorative icons (no `ariaLabel`): render with `aria-hidden="true"` — invisible to screen readers
- Semantic icons (with `ariaLabel`): render with `role="img"` and `aria-label`
- Never use an icon as the sole indicator of state without a text label

#### Usage

```tsx
// Decorative icon in a button
<Icon name="bolt" size="sm" />

// Semantic icon
<Icon name="check" size="md" ariaLabel="Feature included" />

// Brand icon (variant auto-detected, but explicit is clearer)
<Icon name="github" size="lg" variant="brands" />

// fa- prefix also works (stripped internally)
<Icon name="fa-tags" size="md" />
```

---

### AnimatedElement

**File:** `src/components/ui/AnimatedElement/AnimatedElement.tsx`

Scroll-triggered entrance animation wrapper. Uses `IntersectionObserver` for performance. Automatically falls back to instant display when `prefers-reduced-motion: reduce` is active.

#### Props

| Prop        | Type                                                                  | Default    | Description                                  |
| ----------- | --------------------------------------------------------------------- | ---------- | -------------------------------------------- |
| `children`  | `ReactNode`                                                           | required   | Content to animate                           |
| `animation` | `'fadeIn' \| 'slideUp' \| 'slideInLeft' \| 'slideInRight' \| 'scale'` | `'fadeIn'` | Entrance animation                           |
| `delay`     | `number`                                                              | `0`        | Delay in milliseconds before animation fires |
| `threshold` | `number`                                                              | `0.1`      | IntersectionObserver threshold (0–1)         |
| `className` | `string`                                                              | —          | Additional CSS classes                       |

#### Staggered Grid Example

```tsx
{
  features.map((feature, index) => (
    <AnimatedElement key={feature.id} animation="slideUp" delay={index * 100}>
      <FeatureCard {...feature} />
    </AnimatedElement>
  ))
}
```

#### Notes

- `threshold: 0.1` fires when 10% of the element enters the viewport — prevents content flashing in on fast scrolls
- Delays exceeding 600ms feel sluggish; keep stagger values below 150ms per item
- The wrapper renders as a plain `<div>` — ensure this does not break semantic structure (e.g. do not wrap `<li>` items)

---

### TextReveal

**File:** `src/components/ui/TextReveal/TextReveal.tsx`

Animates text entrance character-by-character or word-by-word. Designed for hero headlines and key phrases. Respects `prefers-reduced-motion`.

#### Props

| Prop        | Type                                                     | Default    | Description                              |
| ----------- | -------------------------------------------------------- | ---------- | ---------------------------------------- |
| `children`  | `string`                                                 | required   | Text to animate (plain string only)      |
| `as`        | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'p' \| 'span' \| 'div'` | `'span'`   | HTML tag to render as                    |
| `type`      | `'character' \| 'word'`                                  | `'word'`   | Animation unit                           |
| `animation` | `'fadeUp' \| 'fadeIn' \| 'slideUp' \| 'blur'`            | `'fadeUp'` | Entrance animation style                 |
| `delay`     | `number`                                                 | `0`        | Base delay in ms before animation starts |
| `stagger`   | `number`                                                 | `50`       | Delay in ms between each unit            |
| `threshold` | `number`                                                 | `0.2`      | IntersectionObserver threshold (0–1)     |
| `className` | `string`                                                 | —          | Additional CSS classes                   |

#### TextReveal Usage

```tsx
<TextReveal type="word" delay={200} stagger={80}>
  Your thoughts, unchained.
</TextReveal>
```

---

### FloatingElement

**File:** `src/components/ui/FloatingElement/FloatingElement.tsx`

CSS keyframe float animation for decorative elements (icons, shapes). Pauses when out of viewport. Hidden on mobile via media query in the section that uses it.

#### Props

| Prop              | Type                                       | Default      | Description                              |
| ----------------- | ------------------------------------------ | ------------ | ---------------------------------------- |
| `children`        | `ReactNode`                                | required     | Content to float                         |
| `duration`        | `number`                                   | `3`          | Animation duration in seconds            |
| `delay`           | `number`                                   | `0`          | Delay before animation starts in seconds |
| `distance`        | `number`                                   | `20`         | Float amplitude in pixels                |
| `direction`       | `'vertical' \| 'horizontal' \| 'circular'` | `'vertical'` | Float direction                          |
| `className`       | `string`                                   | —            | Additional CSS classes                   |
| `pauseWhenHidden` | `boolean`                                  | `true`       | Pause animation when out of viewport     |

---

### ParallaxLayer

**File:** `src/components/ui/ParallaxLayer/ParallaxLayer.tsx`

Performance-optimised parallax via `transform: translateY()` on scroll. Uses `will-change: transform` and passive scroll listeners to keep animation on the compositor thread.

#### Props

| Prop        | Type        | Default  | Description                                                    |
| ----------- | ----------- | -------- | -------------------------------------------------------------- |
| `children`  | `ReactNode` | required | Parallax content                                               |
| `speed`     | `number`    | `0.3`    | Multiplier: 0=static, 0.3=subtle, 1.0=strong, negative=reverse |
| `zIndex`    | `number`    | `0`      | Stacking layer                                                 |
| `className` | `string`    | —        | Additional CSS classes                                         |
| `absolute`  | `boolean`   | `false`  | `position: absolute` for background layers                     |

---

### CounterAnimation

**File:** `src/components/ui/CounterAnimation/CounterAnimation.tsx`

Animates a numeric value from `start` to `end` using easing. Fires when the element enters the viewport. Used for statistics sections.

#### Props

| Prop        | Type                                          | Default          | Description                 |
| ----------- | --------------------------------------------- | ---------------- | --------------------------- |
| `end`       | `number`                                      | required         | Target number               |
| `start`     | `number`                                      | `0`              | Starting number             |
| `duration`  | `number`                                      | `2000`           | Animation duration in ms    |
| `prefix`    | `string`                                      | —                | Prefix (e.g. `'$'`)         |
| `suffix`    | `string`                                      | —                | Suffix (e.g. `'+'`, `'ms'`) |
| `decimals`  | `number`                                      | `0`              | Decimal places              |
| `easing`    | `'linear' \| 'easeOutQuart' \| 'easeOutExpo'` | `'easeOutQuart'` | Easing curve                |
| `separator` | `boolean`                                     | `true`           | Thousands separator         |
| `className` | `string`                                      | —                | Additional CSS classes      |

```tsx
<CounterAnimation end={10} suffix="ms" duration={1500} />
```

---

### SVGPathAnimation

**File:** `src/components/ui/SVGPathAnimation/SVGPathAnimation.tsx`

Animates SVG `<path>` elements using stroke-dashoffset. Each direct child `<path>` is measured and animated. Fires on intersection.

#### Props

| Prop        | Type        | Default  | Description                  |
| ----------- | ----------- | -------- | ---------------------------- |
| `children`  | `ReactNode` | required | Direct `<path>` children     |
| `duration`  | `number`    | `2000`   | Animation duration in ms     |
| `delay`     | `number`    | `0`      | Delay before animation in ms |
| `className` | `string`    | —        | Additional CSS classes       |

> **Constraint:** Only direct `<path>` children are supported. Nested `<g>` groups are not traversed.

---

### EmailCapture

**File:** `src/components/ui/EmailCapture/EmailCapture.tsx`

Waitlist signup form with client-side validation, GDPR consent, and Netlify Function integration. Tracks signup events via the analytics utility.

#### Props

| Prop          | Type                     | Default              | Description         |
| ------------- | ------------------------ | -------------------- | ------------------- |
| `variant`     | `'inline' \| 'centered'` | `'inline'`           | Layout style        |
| `placeholder` | `string`                 | `'Enter your email'` | Input placeholder   |
| `buttonText`  | `string`                 | `'Join Waitlist'`    | Submit button label |

#### Validation Rules

1. Email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. GDPR checkbox must be checked before submission
3. Honeypot field rejects bot submissions silently

#### EmailCapture States

| State      | UI                                               |
| ---------- | ------------------------------------------------ |
| Idle       | Input + submit button                            |
| Submitting | Button shows loading spinner, input disabled     |
| Success    | Green check icon + "You're on the list!" message |
| Error      | Red error message below input                    |

---

### ThemeToggle

**File:** `src/components/ui/ThemeToggle/ThemeToggle.tsx`

Icon button toggling between light and dark mode. Reads and writes theme via the `useTheme` hook, which persists the preference to `localStorage` and sets `data-theme` on `<html>`.

```tsx
<ThemeToggle />
```

- Light mode: shows moon icon (`aria-label="Switch to dark mode"`)
- Dark mode: shows sun icon (`aria-label="Switch to light mode"`)

---

### FeedbackWidget

**File:** `src/components/ui/FeedbackWidget/FeedbackWidget.tsx`

Floating feedback button that opens a modal with a form for bug reports and feature ideas. Includes full keyboard navigation and focus trap.

#### Props

| Prop       | Type                                                | Default | Description           |
| ---------- | --------------------------------------------------- | ------- | --------------------- |
| `onSubmit` | `(data: FeedbackFormData) => Promise<void> \| void` | —       | Custom submit handler |

`FeedbackFormData`:

```ts
type FeedbackType = 'bug' | 'feature'
interface FeedbackFormData {
  type: FeedbackType
  message: string
}
```

---

## Layout Components (`layout/`)

### Header

**File:** `src/components/layout/Header/`

Sticky navigation with:

- Logo mark + wordmark
- Navigation links
- `ThemeToggle`
- "Join Waitlist" CTA button

Behaviour:

- Sticks at top with `position: sticky; top: 0; z-index: var(--z-header)`
- Adds a translucency/backdrop-filter blur on scroll
- Collapses to a hamburger menu on mobile (≤ 768px)
- Height: `var(--header-height)` = 64px

### Footer

**File:** `src/components/layout/Footer/`

Three-column layout on desktop, stacked on mobile:

- Column 1: Logo + tagline + social links (GitHub, Twitter)
- Column 2: Product links (Features, Pricing, Roadmap)
- Column 3: Legal links (Privacy Policy, Terms of Service, Cookie Policy)
- Bottom bar: copyright + "Made with ♥" attribution

### Section

**File:** `src/components/layout/Section/`

Reusable section wrapper that applies consistent vertical padding and optional background variants.

#### Props

| Prop         | Type                                  | Default     | Description                     |
| ------------ | ------------------------------------- | ----------- | ------------------------------- |
| `children`   | `ReactNode`                           | required    | Section content                 |
| `id`         | `string`                              | —           | HTML `id` for anchor navigation |
| `background` | `'default' \| 'surface' \| 'primary'` | `'default'` | Background variant              |
| `className`  | `string`                              | —           | Additional CSS classes          |

Background values:

- `default` → `--color-background`
- `surface` → `--color-surface`
- `primary` → primary brand background (inverted, white text; implemented via `.bg-primary`)

---

## Section Components (`sections/`)

Section components are page-level compositions. They consume primitives and layout components; they do not export reusable APIs.

| Component      | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `Hero`         | Landing page hero with headline, subheading, CTA pair, and floating elements |
| `Features`     | 6-card feature grid with icons, metrics, and animated entrances              |
| `Problem`      | Pain-point section contrasting legacy tools with Paperlyte                   |
| `Solution`     | Feature walkthrough with illustrative detail                                 |
| `Statistics`   | Animated counter stats (e.g. "10ms", "99.9% uptime")                         |
| `Testimonials` | Rotating quote cards                                                         |
| `Comparison`   | Feature comparison table vs. competitors                                     |
| `Pricing`      | Pricing tiers teaser                                                         |
| `CTA`          | Full-width waitlist signup strip                                             |
| `FAQ`          | Accordion-style FAQ list                                                     |
| `Mobile`       | Mobile app preview section                                                   |

For section-specific layout and copy guidelines, see [`landing-page.md`](./landing-page.md).

---

## Shared Hooks

| Hook                      | Purpose                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| `useIntersectionObserver` | Watches element visibility; used by animated components                        |
| `useReducedMotion`        | Returns `true` if `prefers-reduced-motion: reduce`; used to skip animations    |
| `useTheme`                | Reads/writes `data-theme` and `localStorage`; provides `theme` + `toggleTheme` |
| `useParallax`             | Returns a scroll offset `y` value for parallax calculations                    |

---

## Component Checklist

When adding a new component, verify:

- [ ] CSS Module scopes all class names
- [ ] `min-height: 48px` / `min-width: 48px` on interactive elements
- [ ] Focus style visible in all variants (`:focus-visible` outline)
- [ ] `aria-label` or visible label on icon-only controls
- [ ] `useReducedMotion` check before applying animations
- [ ] Named export in `index.ts`
- [ ] `*.test.tsx` file with render + accessibility tests
- [ ] Lint passes: `npm run lint`
