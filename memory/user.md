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
- **Notes**: React 19.2, TypeScript 5.9 (strict), Vite 7.3. Testing: Vitest + Playwright. Analytics: Plausible (privacy-first). Errors: Sentry. Performance: Vercel Analytics. Email: Netlify Functions. Fonts: @fontsource/inter (self-hosted Latin subset). Icons: Font Awesome SVG core.

## Hosting / Deployment

- **Category**: Infrastructure
- **Notes**: Deployed on Vercel (CSP headers in vercel.json). Netlify functions also present (email subscribe handler, edge functions). Likely a Vercel-primary deployment with legacy Netlify artifacts.

## Quality Targets

- **Category**: Performance goals
- **Notes**: Page load <2s, Lighthouse performance >90, Lighthouse accessibility >95, all Core Web Vitals passing, bounce rate <45%, avg session >2 minutes.

## Working Style

- **Category**: Communication
- **Notes**: Uses Claude Code CLI for development assistance. Prefers concise responses. Delegates implementation tasks directly rather than asking for options first.

## Key Docs

- **Category**: Reference
- **Notes**: `docs/DESIGN-SYSTEM.md` — comprehensive design documentation. `docs/ROADMAP.md` — product roadmap. `docs/TECHNICAL-DEBT.md` — known tech debt. `docs/CHANGELOG.md` — version history. `docs/design-system/` — detailed design tokens, typography, layout, motion guides.
