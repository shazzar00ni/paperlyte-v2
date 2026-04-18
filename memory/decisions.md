# Decisions

This file tracks key architectural, design, and technical decisions made during development.

## Format

- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Alternatives considered**: What else was considered

---

## Architecture

- **Date**: unknown
- **Decision**: Single-page landing page with no client-side router
- **Rationale**: Product is a marketing/waitlist page; no multi-route navigation needed; anchor links + smooth scroll suffice
- **Alternatives considered**: React Router

- **Date**: unknown
- **Decision**: No global state library
- **Rationale**: Landing page has minimal shared state; component-level hooks plus custom hooks (`useTheme`, `useAnalytics`, etc.) cover all needs
- **Alternatives considered**: Zustand, Context API

- **Date**: unknown
- **Decision**: CSS Modules for all component styles
- **Rationale**: Scoped by default, no naming collisions, no runtime overhead
- **Alternatives considered**: Tailwind CSS, styled-components, vanilla CSS

- **Date**: unknown
- **Decision**: TypeScript path aliases (`@/*`, `@components/*`, `@hooks/*`, etc.)
- **Rationale**: Cleaner imports, avoids deep relative paths
- **Alternatives considered**: Relative paths only

- **Date**: unknown
- **Decision**: Manual chunk splitting in Vite — `react-vendor` and `fontawesome` chunks
- **Rationale**: Stable third-party bundles cache independently from app code; improves repeat-visit performance
- **Alternatives considered**: Default Vite chunking

- **Date**: unknown
- **Decision**: Self-hosted Inter font via `@fontsource/inter` (Latin subset only)
- **Rationale**: Saves ~800KB vs full font; no third-party DNS lookup; GDPR safer
- **Alternatives considered**: Google Fonts CDN

## Analytics

- **Date**: unknown, clarified 2026-04-18
- **Decision**: Privacy-first analytics is the stated goal; current runtime uses GA4 (`@utils/analytics`) which does not fully meet that bar — migration to the Plausible module is a known future step
- **Rationale**: Paperlyte brand value is privacy; GA4 is a pragmatic interim choice while the provider-abstraction layer matures
- **Alternatives considered**: Plausible (target), Fathom, Umami, Mixpanel

- **Date**: unknown, later clarified 2026-04-18
- **Decision**: `useAnalytics()` currently routes analytics events through `@utils/analytics` (gtag/GA4); the Plausible module (`src/analytics/`) exists as an abstraction/provider candidate but is not yet wired into runtime initialization
- **Rationale**: Reflects the actual current integration state in the codebase while preserving flexibility to switch providers later
- **Alternatives considered**: Plausible as the active provider, Fathom, Umami, Simple Analytics

- **Date**: unknown, later clarified 2026-04-18
- **Decision**: Analytics usage is exposed via the `useAnalytics()` hook, but current runtime behavior is backed by the GA4 utility (`@utils/analytics`) rather than App-level Plausible singleton initialization
- **Rationale**: Keeps analytics calls centralized behind a hook while accurately documenting that the active implementation is `@utils/analytics` today
- **Alternatives considered**: Module-level initialization, wiring the existing Plausible singleton into runtime

## Error & Performance Monitoring

- **Date**: unknown
- **Decision**: Sentry for error monitoring with sensitive query parameter filtering
- **Rationale**: Production visibility into errors; filtering prevents accidental PII capture
- **Alternatives considered**: Datadog, Bugsnag, no monitoring

- **Date**: unknown
- **Decision**: Vercel Analytics for performance metrics
- **Rationale**: <1KB, cookie-less performance metrics with a lightweight integration; `@vercel/analytics` is used even when deploying on Netlify
- **Alternatives considered**: Custom performance tracking

## Security

- **Date**: unknown
- **Decision**: Two-tier CSP — relaxed in dev (allows unsafe-eval for Vite HMR), strict in prod via hosting-provided HTTP headers (`vercel.json` / `netlify.toml`)
- **Rationale**: Dev ergonomics vs. production security; CSP meta tags not sufficient for frame-ancestors
- **Alternatives considered**: Single CSP for both environments

- **Date**: unknown
- **Decision**: URL validation (`isSafeUrl()`) in polymorphic Button component
- **Rationale**: Button renders as `<a>` when given href; must block `javascript:`, `data:`, `vbscript:` protocols
- **Alternatives considered**: No validation (unsafe), allow-list of domains

## Email / Waitlist

- **Date**: unknown
- **Decision**: Email subscribe handled by Netlify function server-side, not client-side
- **Rationale**: Keeps API keys off the client; privacy-first; avoids exposing email provider credentials
- **Alternatives considered**: Client-side SDK calls to ConvertKit/Mailchimp

## Testing

- **Date**: unknown
- **Decision**: Vitest for unit/component tests, Playwright for E2E
- **Rationale**: Vitest is Vite-native (fast, no config mismatch); Playwright is the modern standard for E2E
- **Alternatives considered**: Jest + Cypress

- **Date**: unknown
- **Decision**: Coverage threshold set at 70% (lines, functions, branches, statements)
- **Rationale**: Enforces baseline quality without being prohibitively strict for a landing page
- **Alternatives considered**: 80%, 60%, no threshold

## PWA

- **Date**: unknown
- **Decision**: Web manifest present but no service worker implemented yet
- **Rationale**: PWA manifest enables "add to home screen" and branding; SW deferred until offline-first is a real requirement
- **Alternatives considered**: Full PWA with Workbox from the start
