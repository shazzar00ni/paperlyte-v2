# AI PR Reviewer Instructions

## Purpose
- Paperlyte-v2 is the marketing landing page for Paperlyte (not the full note-taking app).
- It communicates product value, captures waitlist interest, and prioritizes performance, accessibility, privacy, and security.

## Architecture
- React + TypeScript single-page app (no client router).
- Section-based composition in `src/App.tsx`; some sections are lazy-loaded via `React.lazy`/`Suspense`.
- Component-local state with custom hooks; shared logic in `src/hooks` and `src/utils`.
- Content is data-driven via `src/constants/*`.

## Folder Structure
- `src/components/sections/`: Landing page sections (Hero, Features, FAQ, CTA, etc.).
- `src/components/ui/`: Reusable UI primitives and widgets.
- `src/components/layout/`: Page shell (Header, Footer, Section).
- `src/components/pages/`: Standalone legal/error pages.
- `src/hooks/`: Shared hooks (analytics, theme, motion/media, scroll/parallax).
- `src/utils/`: Validation, analytics, monitoring, env/navigation/security helpers.
- `src/constants/`: Static copy/data for sections.
- `src/analytics/`: Analytics abstraction and providers.
- `tests/e2e/`: Playwright end-to-end tests.
- `netlify/functions/`: Serverless endpoints.

## Stack
- TypeScript (strict), React 19, Vite.
- CSS Modules + global design tokens in `src/styles/variables.css`.
- Vitest + Testing Library for unit/component tests; Playwright for E2E.
- ESLint (flat config) + Prettier.
- Sentry (`@sentry/react`) and internal analytics utilities/providers.

## Testing
- Unit/component tests are co-located as `*.test.ts(x)` under `src/**`.
- E2E tests are in `tests/e2e/`.
- Expect tests for new behavior and changed logic (especially hooks/utilities).
- CI enforces lint/type/build/test and coverage checks.

## Code Style & Conventions
- Avoid `any`; keep TypeScript strictness intact.
- Naming: PascalCase (components/types), camelCase (functions/vars), SCREAMING_SNAKE_CASE (constants).
- Prefer path aliases (`@components`, `@hooks`, `@utils`, etc.) over deep relative imports.
- Prettier formatting is required (single quotes, no semicolons, 100-char width).
- Accessibility and reduced-motion support are mandatory.
- Prefer design tokens over hardcoded style values.

## PR-Specific Rules
- Target `main` from focused feature branches; avoid mixed-scope PRs.
- PR title should follow conventional-commit format (`type(scope): summary`).
- New dependencies require justification and bundle-size awareness.
- Never commit secrets or real environment values.

## Common Pitfalls
- Treating this repo like the full product instead of a landing page.
- Bypassing safe navigation/URL validation helpers for dynamic links.
- Sending PII (especially emails) in analytics payloads.
- Missing tests for changed behavior.
- Hardcoded colors/spacing instead of CSS variables.
- Accessibility regressions (unlabeled icon-only controls, poor keyboard support, motion issues).

## Out of Scope
- `memory/` files (agent/session context).
- Full-app feature requirements not relevant to the landing page repository.
- Pure formatting nits already enforced by Prettier/ESLint.
