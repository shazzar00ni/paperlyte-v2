# Preferences

This file tracks coding style, design, and workflow preferences for this project.

## Format

- **Category**: Area this preference applies to (code style, design, workflow, etc.)
- **Preference**: The specific preference
- **Context**: Why this preference exists

---

## Design

- Use Inter (sans-serif) for UI/body text and Playfair Display (serif) for headlines (`src/**/*.css`); Inter is loaded via `@fontsource/inter` (Latin subset only — saves ~800KB)
- Follow monochrome design aesthetic with near-black (`#1a1a1a`) and white (`#ffffff`) as primary palette (`src/**/*.css`)
- Dark mode uses `[data-theme='dark']` data attribute; colors invert (white becomes primary text)
- Avoid clichéd decorative choices (purple gradients, sci-fi glows, overly predictable layouts) that conflict with the monochrome identity
- Within the monochrome palette, use dominant near-black/white with sharp accent contrasts; avoid evenly-distributed timid palettes
- Animate high-impact moments (page load staggered reveals with `animation-delay`) over scattered micro-interactions
- Spacing uses 8px base unit: xs=8, sm=16, md=24, lg=32, xl=48, 2xl=64, 3xl=96
- Border radius: 4px, 8px, 16px, 9999px (full/pill); pill shape is signature for buttons
- Fluid typography with `clamp()` for responsive scaling (12px–48px range)
- Transitions: 150ms (fast), 250ms (base), 350ms (slow) with cubic-bezier easing

## Code

- Design and develop for mobile-first, then enhance for desktop (`src/**/*.{tsx,css}`)
- No feature bloat — simplicity is the core value
- Accessibility required (WCAG 2.1 AA); skip links, semantic HTML, aria attributes, focus styles
- Performance budget is strict: <2s load, >90 Lighthouse performance score, >95 Lighthouse accessibility score
- CSS Modules for all component styles — no styled-components, no Tailwind
- TypeScript strict mode everywhere; no `any` types
- Component folder structure: `ComponentName.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`, `index.ts` (barrel)
- URL validation required on any component that renders `<a>` tags with dynamic hrefs
- Prefer tracking analytics events via the `useAnalytics()` hook in components; direct analytics utility calls may still exist in older code and should be migrated when touched

## Workflow

- Vitest for unit/component tests, Playwright for E2E
- Coverage threshold: 70% minimum (lines, functions, branches, statements)
- ESLint flat config format; Prettier for formatting
- Bundle size limits enforced: main JS <150KB gzipped, CSS <30KB gzipped
- Sentry error monitoring active in production; filter sensitive query params before sending
- Analytics config via environment variables: `VITE_ANALYTICS_ENABLED`, `VITE_ANALYTICS_PROVIDER`, `VITE_ANALYTICS_DOMAIN`
- Dev server runs on port 3000

## Accessibility

- Always respect `prefers-reduced-motion: reduce` — transition durations set to 0.01ms
- `Skip to main content` skip link at top of page
- 2px focus outline with 2px offset on all interactive elements
- Meaningful icons must have `ariaLabel`; decorative icons should omit `ariaLabel` so they remain hidden from assistive technology
- Color contrast verified against WCAG AA/AAA matrix (see docs/DESIGN-SYSTEM.md)
