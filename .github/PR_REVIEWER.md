# PR Reviewer Guide — Paperlyte Landing Page

## Purpose
Marketing/landing page for the Paperlyte note-taking app. React 19 + TypeScript + Vite SPA — no actual note-taking functionality, purely conversion-focused.

## Architecture
- Component-based React SPA with CSS Modules
- Section-per-file layout: each landing page section is an isolated component
- Data-driven: all content (features, testimonials, FAQ, etc.) lives in `src/constants/`
- Custom hooks for cross-cutting concerns (analytics, theme, parallax, scroll, motion)

## Folder Structure

| Path | Contents |
|------|----------|
| `src/components/sections/` | Landing page sections (Hero, Features, FAQ, etc.) |
| `src/components/ui/` | Reusable UI primitives (Button, Icon, AnimatedElement, etc.) |
| `src/components/layout/` | Header, Footer, Section wrapper |
| `src/components/pages/` | Full-page routes (Privacy, Terms, 404, 500, Offline) |
| `src/hooks/` | Custom hooks: useTheme, useAnalytics, useParallax, useReducedMotion, etc. |
| `src/utils/` | analytics.ts, monitoring.ts, validation.ts, env.ts, metaTags.ts |
| `src/analytics/` | Analytics module with provider integrations |
| `src/constants/` | All page content data (features, faq, testimonials, comparison, pricing) |
| `src/styles/` | Global CSS: reset, variables, typography, utilities |
| `netlify/functions/` | Serverless functions |
| `tests/e2e/` | Playwright E2E tests |

## Stack
- **React 19** with functional components and hooks only (no class components)
- **TypeScript** strict mode — no `any`, use `unknown` or specific types
- **Vite 8** — `bundler` module resolution, path aliases required
- **CSS Modules** — component styles; global variables in `src/styles/variables.css`
- **Vitest** + jsdom for unit/integration tests; **Playwright** for E2E
- **Font Awesome** via `@fortawesome` npm packages (never CDN)
- **Inter** via `@fontsource/inter`; **Playfair Display** self-hosted
- **Sentry** for error monitoring; **GA4** for analytics

## Testing
- Unit tests: co-located with components (`Component.test.tsx`); run `npm run test`
- E2E tests: `tests/e2e/`; run `npm run test:e2e`
- Coverage: `npm run test:coverage`
- PRs should maintain existing coverage; new components/hooks warrant new tests

## Code Style & Conventions
- **Path aliases required**: `@components/`, `@hooks/`, `@utils/`, `@constants/`, `@styles/`, `@/`
- **Import order**: React → external → `@` aliases → relative
- **Naming**: PascalCase components/interfaces, camelCase vars/functions, SCREAMING_SNAKE_CASE constants
- **Component props interfaces**: suffix with `Props` (e.g. `ButtonProps`)
- **CSS**: Modules only — no inline styles, no Tailwind, no external CSS frameworks
- **Error handling**: async ops always in try/catch; use `monitoring.logError()` for errors
- **Analytics**: `trackEvent()` for interactions — **never include PII**

## PR-Specific Rules
- **Branch from `master`**; target PRs at `master`
- Run `npm run ci` (lint + type-check + test + build) before requesting review
- TypeScript errors = PR blocked; no `// @ts-ignore` without documented justification
- ESLint warnings are treated as errors (`--max-warnings 0`)
- Bundle size limits enforced: main JS < 150 KB gzipped, main CSS < 30 KB gzipped — run `npm run size`
- No external CDNs for fonts/icons (CSP compliance requirement)
- Husky pre-commit hooks run automatically; do not use `--no-verify`

## Common Pitfalls
- **Adding note-taking features** — this is a marketing page only; no localStorage, no data persistence
- **Sending PII to analytics** — emails, names, etc. must never appear in `trackEvent()` calls
- **Missing `prefers-reduced-motion` check** — all animations must use `useReducedMotion()` hook or CSS media query
- **Skipping dark mode** — all new UI must support both themes; test with `useTheme()`
- **Using relative imports across directories** — always use `@` aliases for cross-directory imports
- **Forgetting accessibility** — semantic HTML, ARIA attributes, and keyboard navigation are required, not optional
- **The `Pricing` component is not rendered** in `App.tsx` — don't accidentally render it or treat its absence as a bug
- **`src/analytics/` vs `src/utils/analytics.ts`** — different concerns; don't conflate them

## Out of Scope
- The actual Paperlyte note-taking application (separate repo)
- `dependabot` bump PRs — approve if CI passes, no functional review needed
- `docs/` content changes (non-code) — light review only unless they affect security or legal
- `public/` static assets — verify format/size optimization but no code review needed
