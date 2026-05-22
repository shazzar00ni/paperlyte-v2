# Newcomer Guide: Paperlyte Landing Page

## What this repository is

This repository is the **marketing landing page** for Paperlyte, not the full note-taking app.
Its purpose is to communicate product value, demonstrate feature highlights, and convert visitors via waitlist capture.

## High-level structure

- `src/main.tsx` bootstraps the app, loads fonts and icons, initializes Sentry in production, and updates environment-aware meta tags.
- `src/App.tsx` composes the landing page sections in order and wraps boundaries with `ErrorBoundary` + `Suspense` for resilience and performance.
- `src/components/layout/` contains shared page structure (header/footer/section wrappers).
- `src/components/sections/` contains top-level landing-page sections (Hero, Problem, Solution, Features, etc.).
- `src/components/ui/` contains reusable UI building blocks and widgets.
- `src/hooks/` contains behavior hooks (analytics, media query, intersection observer, reduced motion, theme).
- `src/constants/` centralizes content/configuration data used by sections.
- `src/utils/` and `src/analytics/` handle analytics, monitoring, environment helpers, and supporting utilities.
- `tests/e2e/` contains Playwright end-to-end tests.

## Build, test, and quality workflow

Core commands:

- `npm run dev` — local development server.
- `npm run build` — TypeScript build + production bundle + date injection.
- `npm run lint` — ESLint checks.
- `npm run test` — Vitest unit/integration tests.
- `npm run test:e2e` — Playwright end-to-end tests.

Supporting commands:

- `npm run prebuild` auto-generates icons and mockups through the build lifecycle.
- `npm run size` verifies bundle-size budgets.

## Important conventions and constraints

1. **Landing page scope first**
   - Avoid building note-editing or persistence-heavy application features here.

2. **Privacy-safe analytics**
   - Do not send PII (emails/tokens/passwords) in analytics events.
   - `useAnalytics` is the common entry point for tracking behavior.

3. **Performance-aware composition**
   - Below-the-fold sections are lazy-loaded in `App.tsx`.
   - Vite chunk splitting isolates large, rarely-changing vendor bundles.

4. **Security posture**
   - Development uses CSP injection for HMR compatibility.
   - Production CSP is enforced via deployment headers/config.
   - Sentry setup strips query params from request URLs before send.

5. **Import strategy**
   - Prefer path aliases (`@`, `@components`, `@hooks`, `@constants`, `@utils`) over deep relative paths.

## Suggested onboarding path

1. Read `src/App.tsx` to understand rendering order and lazy boundaries.
2. Trace one full section (e.g., Hero or EmailCapture) from constants → section component → UI components.
3. Review `src/hooks/useAnalytics.ts` and analytics utilities before adding events.
4. Review `vite.config.ts` for aliases, chunking, and CSP behavior.
5. Run `npm run test` and `npm run test:e2e` to learn expected user-facing behavior.

## Next things to learn deeply

- Accessibility standards implemented in the project (`docs/ACCESSIBILITY.md`).
- Design system conventions (`docs/DESIGN-SYSTEM.md` and `docs/design-system/*`).
- Security and deployment details (`docs/SECURITY.md`, `netlify.toml`, `vercel.json`).
- CI/CD and quality checks (`docs/CI-CD-PIPELINE.md`, GitHub workflows).
