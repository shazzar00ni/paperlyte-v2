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

- **Date**: YYYY-MM-DD (unknown), later clarified 2026-04-18
- **Decision**: `useAnalytics()` currently routes analytics events through `@utils/analytics` (gtag/GA4); the Plausible module (`src/analytics/`) exists as an abstraction/provider candidate but is not yet wired into runtime initialization
- **Rationale**: Reflects the actual current integration state in the codebase while preserving flexibility to switch providers later
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

- **Date**: 2026-04-30
- **Decision**: Re-added `@vercel/analytics@^2.0.1`, gated to Vercel deployments only via `import.meta.env.VITE_DEPLOY_TARGET === 'vercel'` in `src/App.tsx`. The env var is set in `vercel.json` (`build.env.VITE_DEPLOY_TARGET = "vercel"`) and is undefined on Netlify builds, so `<Analytics />` is tree-shaken/no-op on Netlify. CSP entries (`https://va.vercel-scripts.com`, `https://vitals.vercel-insights.com`) added to both `vercel.json` and `netlify.toml` to keep the configs in sync. `<Analytics />` is rendered inside its own `<ErrorBoundary>` outside the main app tree so a library render failure cannot blank the page
- **Rationale**: v2 loads from `https://va.vercel-scripts.com` (external) instead of v1's same-origin `/_vercel/insights/script.js`, avoiding the original MIME-type error. Vercel-only gating prevents dead-end network requests on Netlify and keeps the previous decision's intent (no Lighthouse regression on the primary deployment)
- **Alternatives considered**: Render unconditionally and accept Netlify network noise; keep removed and rely solely on Plausible/GA4; switch primary deployment to Vercel

- **Date**: 2026-04-20 (known pre-existing issue)
- **Decision**: `worker-src 'none'` in production CSP — Sentry Session Replay likely silently disabled
- **Rationale**: Sentry `replayIntegration()` is configured in `src/main.tsx` but its web-worker transport is blocked by the current CSP. This is a pre-existing issue unrelated to the CSP/analytics PR. To enable Replay, `worker-src 'self' blob:` would need to be added to both `netlify.toml` and `vercel.json`.
- **Alternatives considered**: `worker-src 'self' blob:` (would enable Replay), removing `replayIntegration()` entirely

## Security

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Two-tier CSP — relaxed in dev (allows unsafe-eval for Vite HMR), strict in prod via hosting-provided HTTP headers (`vercel.json` / `netlify.toml`)
- **Rationale**: Dev ergonomics vs. production security; CSP meta tags not sufficient for frame-ancestors
- **Note**: `netlify.toml` and `vercel.json` should have identical CSP values **except** where the runtime intentionally differs per platform. As of 2026-04-30, `@vercel/analytics` is rendered on Vercel only (gated via `VITE_DEPLOY_TARGET`), so its origins (`va.vercel-scripts.com`, `vitals.vercel-insights.com`) appear in `vercel.json` but not `netlify.toml`. Any new CSP change unrelated to platform-gated runtime must still update both files in lockstep.
- **Alternatives considered**: Single CSP for both environments

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: URL validation (`isSafeUrl()`) in polymorphic Button component
- **Rationale**: Button renders as `<a>` when given href; must block `javascript:`, `data:`, `vbscript:` protocols
- **Alternatives considered**: No validation (unsafe), allow-list of domains

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

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Web manifest present but no service worker implemented yet
- **Rationale**: PWA manifest enables "add to home screen" and branding; SW deferred until offline-first is a real requirement
- **Alternatives considered**: Full PWA with Workbox from the start
