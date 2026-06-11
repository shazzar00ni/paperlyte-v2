# User

This file tracks information about the user's goals, context, and working style.

## Format

- **Category**: Area this applies to (goals, context, communication style, etc.)
- **Notes**: Relevant details

---

## Project Context

- **Category**: Context
- **Notes**: Paperlyte — a lightning-fast, distraction-free note-taking app; MVP landing page stage; React 19, TypeScript, Vite stack. Core promise: "Your thoughts, unchained." Key differentiators: sub-10ms keystroke response, inline #tag organization, cross-platform sync, distraction-free UI, local-first + E2E encrypted sync, offline-first.

## Current Phase

- **Category**: Development phase
- **Notes**: Phase 1 (MVP Landing Page) — all core sections implemented: Hero, Problem, Solution, Features, Mobile, Statistics, Comparison, Testimonials, EmailCapture, FAQ, CTA. Phase 2 (Conversion Optimization) is next: optimize the existing EmailCapture/newsletter flow, upgrade testimonials into a slider, refine the existing comparison section, add a pricing teaser, and improve FAQ content/UX.

## Tech Stack Summary

- **Category**: Stack
- **Notes** (updated 2026-06-11): React 19.2.7, TypeScript 6.0 (strict), Vite 8 (Rolldown bundler — builds in ~0.6s), Vitest 4, ESLint 10, Playwright 1.59. Analytics: Google Analytics/gtag via `@utils/analytics` (Plausible migration still planned, not wired). Errors: Sentry 10. Email: Netlify Functions. Fonts: self-hosted — @fontsource/inter static weights plus variable-font files in `public/fonts/` (Playfair Display variable valid; Inter variable file corrupted as of 2026-06-11). Icons: custom bundled SVG paths (`src/components/ui/Icon/icons.ts`). Service worker (`public/sw.js`) provides offline support.

## Hosting / Deployment

- **Category**: Infrastructure
- **Notes**: Supports both Vercel and Netlify configurations. Vercel config includes CSP headers in `vercel.json`, and Netlify is also configured for email subscribe handling and edge/functions.

## Quality Targets

- **Category**: Performance goals
- **Notes**: Page load <2s, Lighthouse performance >90, Lighthouse accessibility >95, all Core Web Vitals passing, bounce rate <45%, avg session >2 minutes.

## Working Style

- **Category**: Communication
- **Notes**: Uses Claude Code CLI for development assistance. Prefers concise responses. Delegates implementation tasks directly rather than asking for options first.

## Key Docs

- **Category**: Reference
- **Notes**: `docs/DESIGN-SYSTEM.md` — comprehensive design documentation. `docs/ROADMAP.md` — product roadmap. `docs/TECHNICAL-DEBT.md` — known tech debt. `docs/CHANGELOG.md` — version history. `docs/design-system/` — detailed design tokens, typography, layout, motion guides.

## Known Tech Debt (Pre-Launch Blockers)

- **Category**: Tech debt
- **Notes** (updated 2026-06-11, see `docs/audit-results/baseline-audit-2026-06-11.md`): `src/constants/legal.ts` still has 14 placeholders (legal entity name, address, jurisdiction, governing law, linkedin/discord, and 4 document links whose target docs already exist in `docs/`) — sole remaining launch-blocker class. `social.github`/`twitter` are now real, so download URL construction works; iOS/Android store URLs are populated but unverified until store listings exist. NEW finding: `public/fonts/Inter-Variable.woff2` is a corrupted file (HTML, not WOFF2) — preloaded but silently falls back to `@fontsource/inter`; also a redundant dual Inter loading strategy (fontsource static + variable font). December 2025 audit gaps (test coverage, code splitting, image optimization, Lighthouse CI, `.env` in `.gitignore`) are all resolved; coverage is now ~95% lines across 1,757 tests and local Lighthouse scores are 100/100/100/100.
