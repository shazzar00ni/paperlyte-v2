# Design System

Full spec: `docs/DESIGN-SYSTEM.md` (⚠️ that doc still references a blue `#3b82f6` palette and Inter-only typography — it predates the monochrome redesign. Where it conflicts with these rules or `src/styles/variables.css`, **these rules and the runtime CSS take precedence**). This file summarises the rules you must follow when writing or modifying UI code.

## Visual Identity

- **Palette**: Near-black `#1a1a1a` and pure white `#ffffff` are the only base colours. All other values are derived from them via opacity or CSS custom properties.
- **Dark mode**: activated by the `[data-theme='dark']` data attribute on `<html>`. Colours invert — white becomes primary text.
- **Never**: purple gradients, blue-dominant palettes, sci-fi glows, or any palette that conflicts with the monochrome identity.

## Typography

- Headlines: **Playfair Display** (serif), self-hosted variable font in `public/fonts/` (loaded via `@font-face` in `src/styles/typography.css`). Use italic weight for emphasis.
- Body / UI: **Inter** (sans-serif), loaded via `@fontsource/inter` (Latin subset only — do not switch to a CDN). `font-display: swap` is required.
- Fluid type: use `clamp()` for all font sizes. Valid range is 12px–48px.
- **Never** use Arial, Roboto, system-ui, or other generic fallbacks as the primary font.

## Spacing

- Base unit: **8px**. All spacing values must be multiples of 8.
- Named scale: xs=8px, sm=16px, md=24px, lg=32px, xl=48px, 2xl=64px, 3xl=96px.
- Use CSS custom properties (e.g., `var(--space-md)`) — never hardcode pixel values.

## Border Radius

- Permitted values: 4px, 8px, 16px, `9999px`.
- Buttons **must** use `border-radius: 9999px` (pill shape — signature look).

## Motion & Animation

- Transition durations: 150ms (fast), 250ms (base), 350ms (slow) with `cubic-bezier` easing.
- Always add `@media (prefers-reduced-motion: reduce) { transition-duration: 0.01ms; animation-duration: 0.01ms; }` for any animated element.
- High-impact animations only: prefer staggered page-load reveals with `animation-delay` over scattered micro-interactions.
- Prefer CSS-only animations; use the Motion library for React only when CSS cannot achieve the effect.

## Buttons

- All buttons use `border-radius: 9999px`.
- The polymorphic `Button` component renders as `<a>` when given an `href`. URL validation via `isSafeUrl()` is **required** in that case.

## Icons

- Use Font Awesome SVG core only (tree-shaken). Never load the full icon kit.
- Meaningful icons: provide `ariaLabel`. Decorative icons: omit `ariaLabel` so screen readers skip them.

## Backgrounds

- Avoid solid colours. Layer CSS gradients or geometric patterns to create depth.
- Hero section uses parallax shapes with blur; maintain this pattern for any new hero-style section.

## What to Avoid

- Cookie-cutter layouts that could belong to any SaaS landing page.
- Overused font families (Inter is permitted here but only because it is already established; do not introduce it in new projects).
- Evenly distributed, timid colour palettes — dominant tones with sharp accents are preferred.
