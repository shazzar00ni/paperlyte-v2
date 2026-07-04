# Copilot Instructions for Paperlyte

## Project Overview

**Paperlyte** is a lightning-fast, distraction-free note-taking application. This repository contains the **landing page** only, built with React 19, TypeScript, and Vite. It is NOT the full note-taking application.

**Core Promise**: "Your thoughts, unchained."

The landing page includes: Hero, Problem/Solution, Features, Mobile, Statistics, Comparison, Testimonials, EmailCapture, FAQ, CTA sections, plus Privacy and Terms pages.

## Tech Stack

- **React** ^19.2.7 with TypeScript ~6.0.3 (strict mode)
- **Vite** 8.1.0 with @vitejs/plugin-react
- **CSS Modules** for component styling (no Tailwind)
- **Vitest** for unit/integration tests, **Playwright** for E2E
- **ESLint** ^10 with TypeScript ESLint
- **Prettier** for formatting

## Commands

```bash
npm run dev              # Dev server (port 3000)
npm run build            # TypeScript check + Vite build + inject dates
npm run lint             # ESLint
npm run format           # Prettier format
npm run test             # Vitest (watch mode)
npm run test:coverage    # Tests with coverage
npm run test:e2e         # Playwright E2E tests
npm run ci               # Full pipeline: lint, type-check, test, build
npm run size             # Bundle size check
```

## Commit Convention

Uses Conventional Commits enforced by commitlint (`@commitlint/config-conventional`).

```bash
npx commitlint --print-config json          # View rules
printf '%s' "<message>" | npx commitlint    # Validate message
```

Never use `git commit --no-verify`.

## Code Style

### TypeScript

- Explicit types for function parameters and return values
- No `any` — use `unknown` or specific types
- Interfaces for object shapes, types for unions/primitives
- `strict: true` in tsconfig

### Naming

- **Components**: PascalCase (`Hero.tsx`)
- **Utilities**: camelCase (`analytics.ts`)
- **Variables/Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Interfaces**: PascalCase with `Props` suffix for component props

### Imports

```typescript
// Order: React → External → Internal (@aliases) → Relative
import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { useAnalytics } from '@hooks/useAnalytics'
import styles from './Component.module.css'

// Available path aliases:
// @/            → src/
// @components/  → src/components/
// @hooks/       → src/hooks/
// @styles/      → src/styles/
// @types/       → src/types/
// @constants/   → src/constants/
// @utils/       → src/utils/
```

### React Patterns

- Functional components with hooks only (no class components)
- Custom hooks for shared logic
- Proper `useEffect` dependency arrays
- Error boundaries for page components
- `useReducedMotion` hook to respect motion preferences

### CSS & Styling

- CSS Modules for component styles (`Component.module.css`)
- CSS variables for theming (`src/styles/variables.css`)
- Monochrome design: near-black `#1a1a1a` and white `#ffffff`
- Dark mode via `prefers-color-scheme`
- Respect `prefers-reduced-motion` for all animations
- Modern units (rem, vh, vw) — avoid px
- Font system: Inter (body), Playfair Display (headlines), Font Awesome (icons)
- All fonts/icons self-hosted (no external CDNs)

## Key Constraints

- ❌ Don't add note-taking features (this is a landing page only)
- ❌ Don't send PII to analytics
- ❌ Don't use external CDNs (breaks CSP)
- ❌ Don't use Tailwind CSS (project uses CSS Modules)
- ❌ Don't ignore accessibility (WCAG 2.1 AA required)
- ❌ Don't add animations without `prefers-reduced-motion` check
- ✅ Use path aliases (@components, @hooks, @utils, etc.)
- ✅ Test with both light and dark themes
- ✅ Validate emails before submission
- ✅ Track events without PII

## Performance Targets

- Page Load: < 2 seconds
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Core Web Vitals: Pass all (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Main JS bundle: < 150 KB gzipped
- Main CSS bundle: < 30 KB gzipped

## Error Handling

- Always use try/catch for async operations
- Use `monitoring.logError(error, context)` from `@utils/monitoring`
- Never expose sensitive info in error messages
- Provide user-friendly messages

## Analytics

- Use `trackEvent()` and `trackPageView()` from `@utils/analytics`
- Use `monitoring.addBreadcrumb()` for debug context
- **Never include PII** (emails, passwords, tokens) in analytics events

## Accessibility

- Semantic HTML (header, nav, main, section, footer)
- ARIA roles and attributes where needed
- Color contrast: 4.5:1 normal text, 3:1 large text
- Keyboard navigation support
- Skip-to-main-content link
- Alt text for all images

## File Structure

```
src/
├── components/        # React components (layout/, pages/, sections/, ui/)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── analytics/         # Analytics modules
├── constants/         # Application constants and content data
├── styles/            # Global styles and CSS variables
├── test/              # Test setup
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Related Documentation

- `CLAUDE.md` — Claude Code agent guidance
- `AGENTS.md` — Comprehensive agent instructions
- `docs/DESIGN-SYSTEM.md` — Design system documentation
- `docs/ACCESSIBILITY.md` — Accessibility guidelines
- `docs/CONTRIBUTING.md` — Contribution guidelines
