# Motion & Animation Guidelines

---

## Principles

### 1. Motion Serves Meaning
Every animation must communicate something: state change, hierarchy, direction of travel, or delight on first impression. Decorative animations that do not convey meaning should be minimal or absent.

### 2. Performance Over Flourish
All animations run exclusively on `transform` and `opacity` — the two CSS properties that can be composited on the GPU without triggering layout or paint. Any animation touching `width`, `height`, `top`, `left`, or `margin` is prohibited.

### 3. One Orchestrated Moment
A single well-choreographed page-load sequence (staggered hero reveal) creates more delight than scattered micro-interactions. Concentrate animation energy at high-impact moments.

### 4. Respect Reduced Motion
`prefers-reduced-motion: reduce` is a user preference that must be honoured. All animated components check `useReducedMotion()` before applying any transition. When reduced motion is active, elements appear instantly at their final state.

---

## Timing Tokens

| Token | Value | Suitable for |
|---|---|---|
| `--transition-fast` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Colour swaps, opacity fades, icon changes |
| `--transition-base` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` | Button hover, card lift, nav link underline |
| `--transition-slow` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` | Panel slide-in, layout shifts |
| `--animation-duration` | `250ms` | Default CSS animation duration |
| `--reduced-motion-duration` | `0.01ms` | Applied globally under `prefers-reduced-motion: reduce` |

All three transition tokens share the same easing curve: `cubic-bezier(0.4, 0, 0.2, 1)` — a standard ease-in-out that feels snappy on entry and smooth on exit. This is not the same as CSS `ease-out`; the curve is explicitly set on every token rather than relying on a named keyword.

---

## Easing Reference

| Curve | CSS | When |
|---|---|---|
| Ease-out (decelerate) | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| Ease-in (accelerate) | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| Standard (ease-in-out) | `cubic-bezier(0.4, 0, 0.2, 1)` | Interactive state transitions |
| Spring-like | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Delightful button presses, badge pops |

---

## Scroll-Triggered Entrance Animations

All entrance animations are powered by `IntersectionObserver` via the `AnimatedElement` component and the `useIntersectionObserver` hook.

### Available Animations

| Name | Transform | Use |
|---|---|---|
| `fadeIn` | `opacity: 0 → 1` | Default; safe for any content |
| `slideUp` | `translateY(24px) → 0` + fade | Feature cards, testimonials |
| `slideInLeft` | `translateX(-24px) → 0` + fade | Left-side content in split layouts |
| `slideInRight` | `translateX(24px) → 0` + fade | Right-side content in split layouts |
| `scale` | `scale(0.95) → 1` + fade | Modals, cards, highlight elements |

### Stagger Pattern

For grids and lists, stagger `delay` by 80–120ms per item:

```tsx
{features.map((feature, i) => (
  <AnimatedElement animation="slideUp" delay={i * 100} key={feature.id}>
    <FeatureCard {...feature} />
  </AnimatedElement>
))}
```

**Max stagger:** Keep total stagger delay under 600ms (6 items × 100ms). Beyond this, later items feel abandoned.

### IntersectionObserver Configuration

```ts
{
  threshold: 0.1,   // Fire when 10% of element enters viewport
  rootMargin: '0px' // No extension — fire precisely at viewport edge
}
```

Once an element has entered and animated, do not replay the animation on scroll-out. Entrance animations fire once only.

---

## Micro-Interactions

### Button Hover

```css
/* Defined in Button.module.css */
.primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.primary:active:not(:disabled) {
  transform: translateY(0);
}
```

The `translateY(-1px)` lift is intentionally subtle — 1px feels responsive without feeling jittery.

### Nav Link Underline

```css
.navLink::after {
  content: '';
  display: block;
  height: 1px;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.navLink:hover::after,
.navLink[aria-current="page"]::after {
  transform: scaleX(1);
}
```

### Theme Toggle

Crossfade between sun and moon icons using `opacity` transitions. The icon at rest has `opacity: 1`; the entering icon starts at `opacity: 0` and `scale(0.8)`, transitioning to full opacity and scale.

---

## Hero Reveal Sequence

The landing page hero uses a simple, staggered `fadeIn` sequence on initial render:

| Element | Animation | Delay (staggered from hero mount) |
|---|---|---|
| Eyebrow label | `fadeIn` | 0ms |
| H1 headline | `fadeIn` | 100ms |
| Subheading | `fadeIn` | 200ms |
| CTA buttons | `fadeIn` | 300ms |
| Floating icon cluster | `fadeIn` | 400ms |

Delays are implemented via the shared `AnimatedElement` component and are relative to the hero component mounting (not strictly to `DOMContentLoaded`). When `prefers-reduced-motion: reduce` is active, all elements appear at their final state immediately with no delay.

---

## Floating Elements

Decorative icons around the hero use a CSS keyframe loop to create a gentle float effect:

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-20px); }
}

.floatingIcon {
  animation: float 3s ease-in-out infinite;
  will-change: transform;
}
```

Key constraints:
- `will-change: transform` — hints compositor to promote element to its own layer
- `animation-play-state: paused` when element leaves viewport (via IntersectionObserver)
- Hidden at ≤ 768px (`display: none`) — not relevant on mobile and adds unnecessary paint cost

---

## Parallax

Parallax scrolling is implemented via JavaScript scroll listeners (not CSS `perspective`) for cross-browser reliability. The `ParallaxLayer` component uses `requestAnimationFrame` internally.

```text
speed: 0     → no movement (static background)
speed: 0.15  → very subtle drift (background shapes)
speed: 0.3   → moderate (mid-ground elements)
speed: 0.5   → strong (foreground elements)
speed: -0.2  → reverse direction (creates depth)
```

**Do not use parallax on text content** — it makes copy feel unstable and causes motion sickness for sensitive users. Apply only to decorative shapes and images.

Parallax is automatically disabled when `prefers-reduced-motion: reduce` is active — the `ParallaxLayer` falls back to a static position.

---

## Counter Animation

The `CounterAnimation` component animates numeric values using `requestAnimationFrame`. Three easing options:

| Easing | Curve | Feel |
|---|---|---|
| `linear` | Constant rate | Mechanical, data-table-like |
| `easeOutQuart` | Fast start, slow finish | Natural, recommended |
| `easeOutExpo` | Very fast start, long tail | Energetic, for small numbers |

Default duration: 2000ms. Reduce to 1200ms for numbers below 100; increase to 2500ms for large numbers (>10,000) to give the viewer time to register the count.

---

## SVG Path Animation

SVG illustrations use stroke-dashoffset animation to draw paths in sequence:

```css
.path {
  stroke-dasharray: var(--path-length); /* measured at runtime */
  stroke-dashoffset: var(--path-length);
  animation: drawPath var(--animation-duration) ease-out forwards;
}

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
```

The `SVGPathAnimation` component measures each `<path>` length at mount via `getTotalLength()` and sets the CSS variable dynamically.

---

## TextReveal Animation

Word-by-word or character-by-character text entrance:

- Each word/character wraps in a `<span>` with `overflow: hidden`
- Inner `<span>` translates from `translateY(100%)` to `translateY(0)`
- Stagger: 50ms default (80ms for character mode to avoid flickering)

```css
.wordWrapper { overflow: hidden; display: inline-block; }
.word {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
  animation: revealWord 400ms ease-out forwards;
  animation-delay: var(--stagger-delay);
}

@keyframes revealWord {
  to { transform: translateY(0); opacity: 1; }
}
```

---

## Reduced Motion Implementation

Every component that animates must include this guard:

```tsx
import { useReducedMotion } from '@hooks/useReducedMotion'

const prefersReducedMotion = useReducedMotion()

if (prefersReducedMotion) {
  // Render at final state immediately — no transitions, no delays
  return <div className={styles.visible}>{children}</div>
}
```

At the CSS level, the global reset applies:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The `0.01ms` value (rather than `0ms`) prevents some browser bugs where `animationend` events never fire with zero duration.

---

## Animation Checklist

Before shipping any animation:

- [ ] Uses only `transform` and/or `opacity` (no layout-triggering properties)
- [ ] `useReducedMotion` check in place
- [ ] `will-change` applied only during animation; removed after (or via component unmount)
- [ ] Total page-load stagger delay ≤ 600ms
- [ ] `prefers-reduced-motion` tested in browser DevTools and on macOS Reduce Motion setting
- [ ] Passes Lighthouse Performance ≥ 90 after addition
