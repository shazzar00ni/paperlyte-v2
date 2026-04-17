# Decisions

This file tracks key architectural, design, and technical decisions made during development.

## Format

- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Alternatives considered**: What else was considered

---

## Architecture

- **Date**: (initial setup)
- **Decision**: Single-page landing page with no client-side router
- **Rationale**: Product is a marketing/waitlist page; no multi-route navigation needed; anchor links + smooth scroll suffice
- **Alternatives considered**: React Router

- **Date**: (initial setup)
- **Decision**: No global state library
- **Rationale**: Landing page has minimal shared state; component-level hooks plus custom hooks (`useTheme`, `useAnalytics`, etc.) cover all needs
- **Alternatives considered**: Zustand, Context API

- **Date**: (initial setup)
- **Decision**: CSS Modules for all component styles
- **Rationale**: Scoped by default, no naming collisions, no runtime overhead
- **Alternatives considered**: Tailwind CSS, styled-components, vanilla CSS

- **Date**: (initial setup)
- **Decision**: TypeScript path aliases (`@/*`, `@components/*`, `@hooks/*`, etc.)
- **Rationale**: Cleaner imports, avoids deep relative paths
- **Alternatives considered**: Relative paths only

- **Date**: (initial setup)
- **Decision**: Manual chunk splitting in Vite — `react-vendor` and `fontawesome` chunks
- **Rationale**: Stable third-party bundles cache independently from app code; improves repeat-visit performance
- **Alternatives considered**: Default Vite chunking

- **Date**: (initial setup)
- **Decision**: Self-hosted Inter font via `@fontsource/inter` (Latin subset only)
- **Rationale**: Saves ~800KB vs full font; no third-party DNS lookup; GDPR safer
- **Alternatives considered**: Google Fonts CDN

## Analytics

- **Date**: (initial setup)
- **Decision**: Privacy-first analytics — cookie-less, GDPR-compliant, respects DNT
- **Rationale**: Paperlyte brand value is privacy; using tracking cookies would undermine trust
- **Alternatives considered**: Google Analytics, Mixpanel

- **Date**: (initial setup)
- **Decision**: Plausible Analytics as primary provider via provider-abstraction interface
- **Rationale**: Privacy-friendly, lightweight, easy to swap via environment config
- **Alternatives considered**: Fathom, Umami, Simple Analytics (stubs exist for all three)

- **Date**: (initial setup)
- **Decision**: Analytics initialized via `useAnalytics()` hook in App.tsx; singleton pattern
- **Rationale**: Single initialization point; hook ensures correct React lifecycle
- **Alternatives considered**: Module-level initialization

## Error & Performance Monitoring

- **Date**: (initial setup)
- **Decision**: Sentry for error monitoring with sensitive query parameter filtering
- **Rationale**: Production visibility into errors; filtering prevents accidental PII capture
- **Alternatives considered**: Datadog, Bugsnag, no monitoring

- **Date**: (initial setup)
- **Decision**: Vercel Analytics for performance metrics
- **Rationale**: <1KB, cookie-less, zero-config with Vercel hosting
- **Alternatives considered**: Custom performance tracking

## Security

- **Date**: (initial setup)
- **Decision**: Two-tier CSP — relaxed in dev (allows unsafe-eval for Vite HMR), strict in prod via `vercel.json` headers
- **Rationale**: Dev ergonomics vs. production security; CSP meta tags not sufficient for frame-ancestors
- **Alternatives considered**: Single CSP for both environments

- **Date**: (initial setup)
- **Decision**: URL validation (`isSafeUrl()`) in polymorphic Button component
- **Rationale**: Button renders as `<a>` when given href; must block `javascript:`, `data:`, `vbscript:` protocols
- **Alternatives considered**: No validation (unsafe), allow-list of domains

## Email / Waitlist

- **Date**: (initial setup)
- **Decision**: Email subscribe handled by Netlify function server-side, not client-side
- **Rationale**: Keeps API keys off the client; privacy-first; avoids exposing email provider credentials
- **Alternatives considered**: Client-side SDK calls to ConvertKit/Mailchimp

## Testing

- **Date**: (initial setup)
- **Decision**: Vitest for unit/component tests, Playwright for E2E
- **Rationale**: Vitest is Vite-native (fast, no config mismatch); Playwright is the modern standard for E2E
- **Alternatives considered**: Jest + Cypress

- **Date**: (initial setup)
- **Decision**: Coverage threshold set at 70% (lines, functions, branches, statements)
- **Rationale**: Enforces baseline quality without being prohibitively strict for a landing page
- **Alternatives considered**: 80%, 60%, no threshold

## PWA

- **Date**: (initial setup)
- **Decision**: Web manifest present but no service worker implemented yet
- **Rationale**: PWA manifest enables "add to home screen" and branding; SW deferred until offline-first is a real requirement
- **Alternatives considered**: Full PWA with Workbox from the start
