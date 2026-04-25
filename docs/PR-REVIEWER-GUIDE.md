# PR Reviewer Guide

## Purpose

Paperlyte is a React/TypeScript landing page for a distraction-free note-taking app. It is a single-page marketing site (no routing) with a strong emphasis on performance, accessibility, privacy, and security.

---

## Architecture

- **SPA, no router**: All navigation is anchor-link-based. Do not introduce `react-router` or any router.
- **No global state**: Each section uses component-local state and custom hooks. No Redux, Zustand, or Context for app state.
- **CSS Modules preferred**: No Tailwind, no styled-components. New component styles should live in `.module.css` files. A small number of legacy/global-scoped exceptions exist (e.g., `src/components/ui/Icon/Icon.css`) where global class names are required; new exceptions need explicit justification.
- **Design tokens via CSS variables**: Defined in `src/styles/variables.css`. Never hardcode colors, spacing, or transitions.

---

## Folder Structure

| Path | What lives here |
|---|---|
| `src/components/sections/` | One directory per landing page section (Hero, Features, CTA, etc.) |
| `src/components/ui/` | Reusable primitives (Button, Icon, AnimatedElement, etc.) |
| `src/components/layout/` | Header, Footer, Section wrapper |
| `src/components/pages/` | Standalone pages (404, Offline, Privacy, Terms) |
| `src/hooks/` | Custom React hooks (theme, media query, parallax, scroll, analytics) |
| `src/constants/` | Static data modules (features, testimonials, FAQ, pricing, comparison) |
| `src/utils/` | Pure utility functions (validation, analytics, security, env, metaTags) |
| `src/styles/` | Global CSS: `variables.css`, `reset.css`, `typography.css`, `utilities.css` |
| `src/analytics/` | Privacy-first analytics abstraction layer + providers |
| `tests/e2e/` | Playwright end-to-end tests |
| `docs/` | Project documentation (design system, architecture, roadmap, audits) |
| `memory/` | Claude Code session memory — not application code, do not review |
| `scripts/` | Build-time helpers (icon generation, sitemap, date injection) |

Each component follows a mandatory four-file structure:
```
ComponentName.tsx
ComponentName.module.css
ComponentName.test.tsx
index.ts  ← barrel export
```

---

## Stack

| Tool | Version | Role |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | ~5.9 | Strict typing everywhere |
| Vite | 7.x | Build tool, dev server (port 3000), manual chunking |
| Vitest | 4.x | Unit & component tests (jsdom environment) |
| Playwright | 1.59 | E2E tests (5 projects: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari) |
| ESLint 10 | flat config | Linting (includes React Hooks, React Refresh, Prettier rules) |
| Prettier 3 | `.prettierrc.json` | Formatting (no semi, single quotes, 100-char width) |
| CSS Modules | — | Component-scoped styles |
| Font Awesome | — | Icons via `src/utils/iconLibrary.ts` (tree-shaken) |
| @fontsource/inter | — | Self-hosted Inter (Latin subset only — GDPR compliance) |
| Sentry | 10.x | Error tracking (production only, with PII filtering) |
| @vercel/analytics | 2.x | Cookie-less page analytics |

Path aliases are configured (`@/*`, `@components/*`, `@hooks/*`, `@utils/*`, etc.) — always use these, never relative `../../` imports across module boundaries.

---

## Testing

- **Framework**: Vitest (unit/component) + Playwright (E2E)
- **Coverage threshold**: 70% on lines, functions, branches, and statements — PRs that drop below this will fail CI
- **Test location**: Co-located with source (`Component.test.tsx` next to `Component.tsx`); E2E in `tests/e2e/`
- **What to test**: Every new component needs a `.test.tsx`. New hooks, utils, and constants need paired `.test.ts` files.
- **Setup file**: `src/test/setup.ts` mocks `IntersectionObserver` and `matchMedia` — do not duplicate these mocks inline.
- **Snapshot tests**: Used in `src/constants/__snapshots__/`; update only intentionally.
- **E2E scope**: Cross-browser + mobile device matrix runs in CI with 2 retries.

---

## Code Style & Conventions

- **TypeScript**: Strict mode, no `any`. Explicit return types on exported functions.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, SCREAMING_SNAKE_CASE for top-level constants.
- **Imports**: Use path aliases (`@components/...`). Barrel imports from `index.ts` only.
- **Comments**: Only when the *why* is non-obvious. JSDoc is required on all public APIs (see CONTRIBUTING.md). No `// TODO` left in PRs.
- **No semi**: Prettier enforces this. Run `npm run format` before committing.
- **Accessibility**: Every interactive element needs an `aria-label` or visible label. Reduced-motion support is required (`prefers-reduced-motion`). Skip links and semantic HTML are not optional.
- **Analytics**: Always use the `useAnalytics()` hook — never call analytics utilities directly from components.
- **Security**: Dynamic `href` values must pass through `isSafeUrl()` (blocks `javascript:`, `data:`, `vbscript:`). User-facing strings must be sanitized via `src/utils/validation.ts`.

---

## PR-Specific Rules

- **Branch**: Feature branches off `main`; PRs target `main`.
- **Size**: Keep PRs focused. A PR that touches both a new section and refactors utilities is two PRs.
- **Bundle size**: Main JS must stay under 150 KB gzip, CSS under 30 KB gzip. CI enforces this (`npm run size`).
- **No new fonts without approval**: Each font adds significant weight. Self-hosting is required for GDPR compliance.
- **No new analytics providers** without updating the abstraction layer in `src/analytics/`.
- **Environment variables**: New vars must be added to `.env.example` with a description. Never commit real values.
- **Design tokens**: Any new color, spacing, or transition value must be added to `src/styles/variables.css` first, not inlined.
- **New dependencies**: Justify in the PR description. Check bundle impact with `npm run size`. Prefer zero-dependency solutions.

---

## Common Pitfalls

- **Hardcoded styles**: Reviewers should flag any CSS that duplicates values from `variables.css` instead of using the variable.
- **Missing `prefers-reduced-motion`**: Every animation must have a reduced-motion fallback. Check `.module.css` files.
- **Direct DOM manipulation**: Should never appear in components. All DOM effects belong in custom hooks.
- **Missing barrel exports**: If a new component doesn't export from its `index.ts`, the import alias breaks.
- **`any` types**: Flag immediately. Use `unknown` + type narrowing or a proper interface.
- **Inline event analytics**: Calling `window.gtag` or analytics utils directly in JSX is an anti-pattern; always go through `useAnalytics()`.
- **External URLs without `rel="noopener noreferrer"`**: The `Button` component handles this automatically — only flag if someone bypasses it with a raw `<a>` tag.
- **Missing accessibility attributes on icon-only buttons**: Font Awesome icons have `aria-hidden="true"` by default; a sibling `aria-label` on the button is required.
- **Test mocking `window` directly**: Use the helpers in `src/test/setup.ts` and `src/test/analytics-helpers.ts` instead.
- **Snapshot drift**: If a snapshot is updated in a PR without explanation, verify the change is intentional.

---

## Out of Scope

- **`memory/` directory**: Claude Code session state — ignore entirely during review.
- **`docs/` directory**: Documentation-only files — not subject to code style rules.
- **`scripts/` directory**: Build tooling — only review if a PR specifically modifies build behavior.
- **`vercel.json` CSP headers**: These are intentionally strict; do not suggest relaxing them.
- **Prettier formatting**: CI enforces it. Don't leave style comments — just ask the author to run `npm run format`.
- **`legacy-peer-deps` in `.npmrc`**: Known, intentional. Do not remove.
