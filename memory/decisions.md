# Decisions

This file tracks key architectural, design, and technical decisions made during development.

## Format

- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Alternatives considered**: What else was considered

---

## Architecture

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Single-page landing page with no client-side router
- **Rationale**: Product is a marketing/waitlist page; no multi-route navigation needed; anchor links + smooth scroll suffice
- **Alternatives considered**: React Router

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: No global state library
- **Rationale**: Landing page has minimal shared state; component-level hooks plus custom hooks (`useTheme`, `useAnalytics`, etc.) cover all needs
- **Alternatives considered**: Zustand, Context API

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: CSS Modules for all component styles
- **Rationale**: Scoped by default, no naming collisions, no runtime overhead
- **Alternatives considered**: Tailwind CSS, styled-components, vanilla CSS

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: TypeScript path aliases (`@/*`, `@components/*`, `@hooks/*`, etc.)
- **Rationale**: Cleaner imports, avoids deep relative paths
- **Alternatives considered**: Relative paths only

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Manual chunk splitting in Vite — `react-vendor` and `fontawesome` chunks
- **Rationale**: Stable third-party bundles cache independently from app code; improves repeat-visit performance
- **Alternatives considered**: Default Vite chunking

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Self-hosted Inter font via `@fontsource/inter` (Latin subset only)
- **Rationale**: Saves ~800KB vs full font; no third-party DNS lookup; GDPR safer
- **Alternatives considered**: Google Fonts CDN

## Analytics

- **Date**: YYYY-MM-DD (unknown), clarified 2026-04-18
- **Decision**: Privacy-first analytics is the stated goal; current runtime uses GA4 (`@utils/analytics`) which does not fully meet that bar — migration to the Plausible module is a known future step
- **Rationale**: Paperlyte brand value is privacy; GA4 is a pragmatic interim choice while the provider-abstraction layer matures
- **Alternatives considered**: Plausible (target), Fathom, Umami, Mixpanel

- **Date**: YYYY-MM-DD (unknown), later clarified 2026-04-18, corrected 2026-06-11
- **Decision**: `useAnalytics()` routes analytics events through `@utils/analytics` (gtag/GA4 wrapper); the Plausible module (`src/analytics/`) exists as an abstraction/provider candidate but is not wired into runtime initialization
- **Rationale**: Reflects the actual current integration state in the codebase while preserving flexibility to switch providers later
- **Important caveat (2026-06-11 audit)**: production analytics is currently **disconnected end-to-end** — no production file loads the gtag script (`window.gtag` exists only as a type declaration plus guarded calls), and `analytics.init()`/`getAnalyticsConfig()` are called only in tests. All conversion events (waitlist, CTA, navigation, scroll depth) are silent no-ops in production
- **Alternatives considered**: Plausible as the active provider, Fathom, Umami, Simple Analytics

- **Date**: YYYY-MM-DD (unknown), later clarified 2026-04-18
- **Decision**: Analytics usage is exposed via the `useAnalytics()` hook, but current runtime behavior is backed by the GA4 utility (`@utils/analytics`) rather than App-level Plausible singleton initialization
- **Rationale**: Keeps analytics calls centralized behind a hook while accurately documenting that the active implementation is `@utils/analytics` today
- **Alternatives considered**: Module-level initialization, wiring the existing Plausible singleton into runtime

## Error & Performance Monitoring

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Sentry for error monitoring with sensitive query parameter filtering
- **Rationale**: Production visibility into errors; filtering prevents accidental PII capture
- **Alternatives considered**: Datadog, Bugsnag, no monitoring

- **Date**: 2026-04-20
- **Decision**: Removed `@vercel/analytics` — component stripped from `App.tsx`, dependency removed from `package.json`
- **Rationale**: Site is deployed on Netlify; `/_vercel/insights/script.js` does not exist there, causing a MIME-type console error that degraded the Lighthouse Best Practices score
- **Alternatives considered**: Conditional rendering per platform, keeping it for a future Vercel deployment

- **Date**: 2026-04-20 (known pre-existing issue, resolved 2026-05-30)
- **Decision**: `worker-src 'self' blob:'` in production CSP — enables Sentry Session Replay workers
- **Rationale**: Sentry `replayIntegration()` uses blob: URL workers. Updated from `worker-src 'none'` to `worker-src 'self' blob:` in both `netlify.toml` and `vercel.json` to unblock it.
- **Alternatives considered**: `worker-src 'none'` (silently disables Replay), removing `replayIntegration()` entirely

- **Date**: 2026-05-30
- **Decision**: Resolved two CSP console errors: (1) Font Awesome JS inline-style violation; (2) Vercel analytics MIME-type error
- **Rationale**: Font Awesome JS was removed and replaced with custom bundled SVG paths (`src/components/ui/Icon/icons.ts`). Font Awesome JS injected inline styles via `setAttribute('style', ...)`, which the strict `style-src 'self'` CSP blocked. `@vercel/analytics` was removed because the site runs on Netlify — the script URL `/_vercel/insights/script.js` returns HTML 404, causing a MIME-type rejection. Both fixes were already on `main`; this PR documents and deploys them.
- **Alternatives considered**: Adding `'unsafe-inline'` to `style-src` (weakens CSP), adding the specific sha256 hash for the Font Awesome style (fragile — breaks on library updates)

## Security

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Two-tier CSP — relaxed in dev (allows unsafe-eval for Vite HMR), strict in prod via hosting-provided HTTP headers (`vercel.json` / `netlify.toml`)
- **Rationale**: Dev ergonomics vs. production security; CSP meta tags not sufficient for frame-ancestors
- **Note**: `netlify.toml` and `vercel.json` must always have identical CSP values. Drift between them is a common bug source — any future CSP change must update both files.
- **Alternatives considered**: Single CSP for both environments

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: URL validation (`isSafeUrl()`) in polymorphic Button component
- **Rationale**: Button renders as `<a>` when given href; must block `javascript:`, `data:`, `vbscript:` protocols
- **Alternatives considered**: No validation (unsafe), allow-list of domains

- **Date**: 2026-05-06
- **Decision**: `.npmrc` (content must be exactly `legacy-peer-deps=true`), `docs/ROADMAP.md`, `docs/gitVersionControl.md`, `docs/review.md`, and the `hasDangerousProtocol`/`isRelativeUrl` helpers in `src/utils/navigation.ts` are required files that must never be deleted from any branch
- **Rationale**: Accidental deletion of these files on several branches blocked their PRs from merging (Issue #876). Restoration is done via `git checkout origin/main -- .npmrc docs/ROADMAP.md docs/gitVersionControl.md docs/review.md src/utils/navigation.ts`.
- **Alternatives considered**: Manual re-creation of file content

## Email / Waitlist

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Email subscribe handled by Netlify function server-side, not client-side
- **Rationale**: Keeps API keys off the client; privacy-first; avoids exposing email provider credentials
- **Alternatives considered**: Client-side SDK calls to ConvertKit/Mailchimp

## Testing

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Vitest for unit/component tests, Playwright for E2E
- **Rationale**: Vitest is Vite-native (fast, no config mismatch); Playwright is the modern standard for E2E
- **Alternatives considered**: Jest + Cypress

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Coverage threshold set at 70% (lines, functions, branches, statements)
- **Rationale**: Enforces baseline quality without being prohibitively strict for a landing page
- **Alternatives considered**: 80%, 60%, no threshold

## PWA

- **Date**: YYYY-MM-DD (unknown), superseded by 2026-06-11 observation
- **Decision**: Web manifest present; a hand-rolled service worker (`public/sw.js`) is now implemented — versioned cache name, offline.html fallback, cache-first for hashed `/assets/*` with eviction (60-entry cap, but pruning runs only in `onActivate()` — cache can exceed the cap between activations; incomplete eviction noted in 2026-06-11 audit)
- **Rationale**: PWA manifest enables "add to home screen"; SW added to deliver the offline-first brand promise on the landing page
- **Alternatives considered**: Workbox, no service worker

## Infrastructure / Edge

- **Date**: 2026-04-29
- **Decision**: Netlify WAF edge function runs on every non-asset request before origin
- **Rationale**: Blocks scanner UAs, path traversal, SQL/XSS injection signatures, oversized payloads (>512 KB), and illegal HTTP methods on `/.netlify/functions/*` at the CDN edge before any serverless function cold-start cost is incurred. Static assets (`/assets/*`, `/fonts/*`, images) are excluded via `excludedPath`. Every response — blocked or forwarded — receives an `X-Request-ID` UUID for log correlation.
- **Alternatives considered**: Application-level middleware, Netlify's built-in DDoS protection only

## Privacy / Storage

- **Date**: 2026-04-29
- **Decision**: Theme persistence is gated by `PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME` in `src/constants/config.ts`
- **Rationale**: Enforces a privacy-first default for persistent theme storage: the theme preference is only written to localStorage when explicitly permitted. It contains no PII, measurably improves UX across visits, and can be cleared by the user. Note: this decision covers theme persistence specifically — other localStorage usage (e.g. `FeedbackWidget` writes `paperlyte_feedback` directly) is not yet gated by this config.
- **Alternatives considered**: Always persist theme preference, sessionStorage for theme only

## Data Layer

- **Date**: 2026-04-29
- **Decision**: Much of the reusable section content is centralized in `src/constants/*.ts` as typed `as const` objects; some sections still define local data inline in their component files
- **Rationale**: Centralizing content separates it from presentation, enables type-safe access, snapshot testing of data shapes, and content updates without touching component files. Covers features, testimonials, FAQs, comparisons, pricing, downloads, waitlist copy, and legal metadata. Not yet universal — e.g. `Solution.tsx` defines `VALUE_PROPS` inline.
- **Alternatives considered**: All content inline in JSX, headless CMS (deferred to later phase), MDX files

## Serverless Functions

- **Date**: 2026-04-29
- **Decision**: Netlify Functions validate external API responses at runtime using Zod; TypeScript types are derived from Zod schemas via `z.infer<>`
- **Rationale**: External APIs (ConvertKit, etc.) can change their response shape without warning; runtime validation catches this in production and prevents silent data corruption. Deriving TypeScript types from the schema guarantees type/schema consistency — no drift possible.
- **Alternatives considered**: Trust TypeScript types only (no runtime check), manual type guards

## React

- **Date**: 2026-04-29
- **Decision**: React is used with standard `@vitejs/plugin-react` — the React Compiler is not configured; `useMemo`/`useCallback`/`memo` should only be added when profiling shows a clear need
- **Rationale**: The Vite config uses `react()` with no Babel plugin or `babel-plugin-react-compiler` dependency, so automatic compiler memoization cannot be assumed. Avoid adding manual memoization by default — only add it when a measured performance problem exists. Note: some code comments in the repo incorrectly state the compiler is active; these are aspirational/stale and should be corrected when encountered.
- **Alternatives considered**: Enable React Compiler via `babel-plugin-react-compiler`, manual memoization everywhere

## CSS / Theming

- **Date**: 2026-04-29
- **Decision**: Dark-mode CSS tokens are intentionally duplicated in two blocks in `src/styles/variables.css`
- **Rationale**: Two distinct use cases require separate selectors: (1) `[data-theme='dark']` for explicit user toggle, (2) `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }` for system preference when no explicit choice has been made. The `:root:not([data-theme='light'])` guard is critical — it prevents system preference from overriding an explicit light-mode choice. Any palette change must update both blocks in sync; drift is a known bug source.
- **Alternatives considered**: Single CSS custom property override, JavaScript-only theming

## Documentation / Roadmap

- **Date**: 2026-06-17
- **Decision**: `docs/ROADMAP.md` holds **two** separate roadmaps under two top-level headings: "Landing Page/Waitlist Signup" and "MVP to Launch" (the note-editor app). The landing-page roadmap was expanded from a lone Phase 0 to full Phases 0–6 with per-feature status labels (PR #1142)
- **Rationale**: The landing-page roadmap previously stopped at Phase 0; Phases 1–6 now document shipped vs. pending work so the doc reflects reality. Statuses derived from the actual codebase + the 2026-06-11 audit
- **Note**: Phase 0 originally mis-stated the stack as "Next.js" + "Tailwind CSS"; corrected to **Vite + React / CSS Modules** (the actual stack per `package.json` and project guidelines). When editing, do not conflate the two roadmaps — the MVP-to-Launch (editor) roadmap is intentionally separate
- **Alternatives considered**: Splitting into two files (rejected — `docs/ROADMAP.md` is a required, never-delete file per Issue #876)
