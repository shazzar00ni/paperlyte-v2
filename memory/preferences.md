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
- URL validation required on any component that renders `<a>` tags with dynamic hrefs
- Prefer tracking analytics events via the `useAnalytics()` hook in components; direct analytics utility calls may still exist in older code and should be migrated when touched

## Workflow

- Vitest for unit/component tests, Playwright for E2E
- Coverage thresholds: 70% minimum overall in Vitest (lines, functions, branches, statements) and 80% patch coverage target in Codecov for PR changes
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

## Component Organisation

- `src/components/` is primarily divided into four sub-trees: `ui/` (reusable primitives — Button, Icon, AnimatedElement, FloatingElement, etc.), `layout/` (Header, Footer, Section), `sections/` (landing page sections — Hero, Features, FAQ, Comparison, etc.), `pages/` (routable pages — Privacy, Terms, NotFoundPage, ServerErrorPage, OfflinePage). Note: `ErrorBoundary/` sits at the top level outside these sub-trees.
- Components generally live in their own folder and prefer the structure: `ComponentName.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`, `index.ts` (barrel re-export). Known exceptions exist — e.g. `Icon/` uses `Icon.css` (not a CSS Module) and includes an extra `icons.ts`.
- Within `src/components/**`, import via path alias where available, e.g. `@components/ui/Button`, rather than deep relative paths. Outside `src/components/` (e.g. analytics modules) relative imports are still in use.

## Animations

- Scroll-triggered entrance animations use `AnimatedElement` (wrapper component) + `useIntersectionObserver` (fires once at 10% viewport visibility by default) + `useReducedMotion` (zeroes animation when `prefers-reduced-motion: reduce` is set)
- Animation delay is injected as the CSS custom property `--animation-delay` via `useEffect` to enable staggered reveals without prop-drilling
- This is the only approved pattern for scroll-triggered effects — do not introduce a separate animation library

## Icons

- Icon names use the `fa-` prefix (`fa-bolt`, `fa-github`). New icons must be registered in `src/utils/iconLibrary.ts` via `library.add()` before use; unregistered names fall back to a FontAwesome runtime lookup (dev-only console warning for the first fallback), and if still not found in the FA library render a `?` placeholder span with an unconditional console warning in both dev and prod
- Meaningful icons (conveying information) must receive an `ariaLabel` prop — this ensures an accessible label and `role="img"`. On the custom SVG render path a `<title>` element is also added; the FontAwesomeIcon fallback path sets `aria-label`/`role` but does not add a `<title>`. Decorative icons must omit `ariaLabel` entirely — `aria-hidden="true"` is applied automatically
- Multi-token names (`"fa-spinner fa-spin"`) are supported: the first token is the icon, subsequent tokens become extra CSS classes on the rendered element

## Security Layers

- The codebase maintains five distinct security layers — all must be preserved when touching related code:
  1. **Edge** — WAF edge function (`netlify/edge-functions/waf.ts`) blocks malicious requests before origin
  2. **Transport** — HTTP security headers in `netlify.toml` and `vercel.json` (these two files must stay identical on CSP values; drift is a known bug source)
  3. **CSP** — Two-tier: relaxed meta tag injected by Vite plugin in dev, strict HTTP header in prod
  4. **App boundary** — `isSafeUrl()` from `@utils/navigation` on any dynamic `href`; `safePropertyAccess()` from `@utils/security` guards all dynamic object lookups against prototype pollution
  5. **Input** — `validateEmail()`, `sanitizeInput()`, `encodeHtmlEntities()` from `@utils/validation`; rate limiting (3 req/min/IP) + Zod schema validation in serverless functions
