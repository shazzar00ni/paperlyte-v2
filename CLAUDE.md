# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Paperlyte** is a lightning-fast, distraction-free note-taking application that prioritizes simplicity over feature bloat. This repository contains the **landing page** — a React single-page application that communicates the product's value proposition and captures waitlist signups.

**Core Promise**: "Your thoughts, unchained."

**Key Differentiators**:

- Zero-Lag Typing: Sub-10ms keystroke response
- Tag-Based Organization: Inline #tags instead of rigid folder hierarchies
- Cross-Platform Sync: Mac, Windows, Linux, iOS, Android, web
- Distraction-Free Writing: Interface that disappears when you start typing
- Private by Design: Local-first architecture with optional end-to-end encrypted sync
- Offline-First: Core writing and organization work fully offline, sync when connected

## Development Commands

```bash
# Start development server (port 3000, auto-opens browser)
npm run dev

# Build for production (TypeScript check + Vite build + inject dates + generate sitemap)
npm run build

# Preview production build (port 4173)
npm run preview

# Lint all files with ESLint
npm run lint

# Format code with Prettier
npm run format

# Check formatting without writing
npm run format:check

# Run unit tests (Vitest, watch mode)
npm run test

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage report
npm run test:coverage

# Run E2E tests (Playwright, requires build first)
npm run test:e2e

# Run E2E tests with interactive UI
npm run test:e2e:ui

# Run Lighthouse CI (builds first, then audits)
npm run lighthouse

# Check bundle size limits
npm run size

# Generate icons and mockups (runs automatically via prebuild)
npm run generate:icons
npm run generate:mockups
```

## Tech Stack

- **React**: ^19.2.4 (with React DOM ^19.2.4)
- **TypeScript**: ~5.9.3 with strict mode enabled
- **Build Tool**: Vite ^7.3.1 with @vitejs/plugin-react ^5.1.2
- **Unit Testing**: Vitest ^4.0.15 with React Testing Library ^16.3.2 (jsdom environment)
- **E2E Testing**: Playwright ^1.58.2 (Chromium, Firefox, WebKit, Pixel 5, iPhone 12)
- **Linting**: ESLint ^10.0.0 with TypeScript ESLint, React Hooks, React Refresh, and Prettier integration
- **Formatting**: Prettier ^3.8.1
- **Icons**: Font Awesome (tree-shaken, ^7.1.0)
- **Fonts**: Inter (self-hosted via @fontsource, Latin subset), Playfair Display (self-hosted in public/fonts/)
- **Error Monitoring**: Sentry ^10.38.0 (production only)
- **Analytics**: Vercel Analytics ^1.6.1 (production), event tracking utility with PII sanitization (`src/utils/analytics.ts`), and a Plausible-based privacy-first module (`src/analytics/` — infrastructure ready, not yet integrated into app)
- **Deployment**: Vercel (primary) and Netlify (secondary), with serverless functions on Netlify

## Project Structure

```
src/
├── main.tsx                    # Entry point: Sentry init, font imports, meta tags, React root
├── App.tsx                     # Root component: layout, section composition, analytics init
├── App.css                     # App-level styles
├── index.css                   # Global style imports (variables, reset, typography, utilities)
├── global.d.ts                 # Window interface extensions (gtag, plausible)
├── vite-env.d.ts               # Vite environment types
├── analytics/                  # Plausible-based analytics module (not yet wired into app)
│   ├── index.ts                # Analytics singleton (init, trackEvent, trackPageView)
│   ├── types.ts                # Analytics interfaces and event types
│   ├── config.ts               # Analytics configuration from env vars
│   ├── webVitals.ts            # Core Web Vitals tracking (LCP, FID, CLS)
│   ├── scrollDepth.ts          # Scroll depth milestones (25%, 50%, 75%, 100%)
│   └── providers/
│       └── plausible.ts        # Plausible Analytics provider
├── components/
│   ├── ErrorBoundary/          # React error boundary with fallback UI
│   ├── layout/
│   │   ├── Header/             # Sticky navigation header with theme toggle
│   │   ├── Footer/             # Footer with links and branding
│   │   └── Section/            # Section wrapper with consistent spacing
│   ├── pages/
│   │   ├── NotFoundPage/       # 404 error page
│   │   ├── OfflinePage/        # Offline fallback page
│   │   ├── ServerErrorPage/    # 5xx error page
│   │   ├── Privacy/            # Privacy policy (React component, not yet routed)
│   │   └── Terms/              # Terms of service (React component, not yet routed)
│   ├── sections/               # Landing page sections (rendered in order in App.tsx)
│   │   ├── Hero/               # Hero with CTA buttons and product mockups
│   │   ├── Problem/            # Customer pain points
│   │   ├── Solution/           # Product value proposition
│   │   ├── Features/           # Feature grid with icons and descriptions
│   │   ├── Mobile/             # Mobile-specific features
│   │   ├── Statistics/         # Metrics with counter animations
│   │   ├── Comparison/         # Feature comparison vs competitors
│   │   ├── Testimonials/       # Customer testimonials
│   │   ├── EmailCapture/       # Waitlist email capture
│   │   ├── FAQ/                # Accordion FAQ
│   │   ├── CTA/                # Final call-to-action
│   │   └── Pricing/            # Pricing plans
│   └── ui/                     # Reusable UI components
│       ├── Button/             # Multi-variant button (primary, secondary, ghost)
│       ├── Icon/               # Font Awesome icon wrapper with a11y
│       ├── AnimatedElement/    # Intersection-based fade-in animations
│       ├── TextReveal/         # Staggered text reveal on scroll
│       ├── CounterAnimation/   # Animated number counter
│       ├── ParallaxLayer/      # Parallax scroll effect
│       ├── SVGPathAnimation/   # SVG path stroke animation
│       ├── FloatingElement/    # Floating animated elements
│       ├── ThemeToggle/        # Dark/light mode toggle
│       ├── FeedbackWidget/     # Feedback/survey widget
│       └── EmailCapture/       # Email form component
├── constants/                  # Static data (features, pricing, FAQ, testimonials, etc.)
│   ├── config.ts               # App metadata, contact info, social links
│   ├── features.ts             # Feature list data
│   ├── comparison.ts           # Comparison table data
│   ├── pricing.ts              # Pricing plans
│   ├── faq.ts                  # FAQ content
│   ├── testimonials.ts         # Customer testimonials
│   ├── downloads.ts            # Download links by platform
│   ├── waitlist.ts             # Waitlist configuration
│   └── legal.ts                # Legal text templates
├── hooks/                      # Custom React hooks
│   ├── useTheme.ts             # Theme state with localStorage persistence
│   ├── useIntersectionObserver.ts # Intersection Observer for scroll animations
│   ├── useScrollPosition.ts    # Track scroll position
│   ├── useParallax.ts          # Parallax effect
│   ├── useMediaQuery.ts        # Responsive media query
│   ├── useReducedMotion.ts     # Respect prefers-reduced-motion
│   └── useAnalytics.ts         # Analytics initialization on mount
├── styles/                     # Global styles (CSS custom properties)
│   ├── variables.css           # Design tokens: colors, spacing, typography, animation, z-index
│   ├── reset.css               # CSS reset/normalize
│   ├── typography.css          # Font faces, heading styles
│   └── utilities.css           # Utility classes
├── utils/                      # Utility functions
│   ├── analytics.ts            # Event tracking with PII sanitization (uses gtag when available)
│   ├── env.ts                  # Environment configuration and meta tag updates
│   ├── validation.ts           # Form validation (email, required fields)
│   ├── security.ts             # URL validation, safe keys
│   ├── navigation.ts           # Scroll-to-section utilities
│   ├── metaTags.ts             # Dynamic meta tag management
│   ├── iconLibrary.ts          # Font Awesome tree-shaken icon setup
│   ├── keyboard.ts             # Keyboard event utilities
│   └── monitoring.ts           # Error monitoring / Sentry integration
├── test/                       # Test setup
│   ├── setup.ts                # Vitest setup: IntersectionObserver + matchMedia mocks
│   ├── analytics-helpers.ts    # Analytics testing utilities
│   └── iconTestHelpers.ts      # Icon component test helpers
└── assets/                     # Static assets

public/
├── fonts/                      # Self-hosted fonts (Inter, Playfair Display)
├── mockups/                    # Product mockup images (SVG, PNG, WebP, AVIF)
├── favicon.svg                 # Favicon
├── robots.txt                  # Search engine crawl rules
├── site.webmanifest            # PWA manifest
├── privacy.html                # Static privacy page (actively served at /privacy)
└── terms.html                  # Static terms page (actively served at /terms)

docs/                           # Project documentation
├── DESIGN-SYSTEM.md            # Complete design system reference
├── ACCESSIBILITY.md            # WCAG compliance standards
├── SECURITY.md                 # Security implementation details
├── TECHNICAL-DEBT.md           # Known technical debt
├── Project_Architecture_Blueprint.md # Architecture overview
└── [15+ additional docs]       # Legal, audit, setup guides

tests/
└── e2e/
    └── landing-page.spec.ts    # Playwright E2E tests

netlify/
└── functions/
    └── subscribe.ts            # Serverless email subscription function

scripts/                        # Build and utility scripts
├── generate-icons.js           # Generate icon assets
├── generate-mockups.js         # Generate product mockups
├── inject-dates.js             # Inject build dates into output
├── generate-sitemap.cjs        # Post-build sitemap generation
└── check-legal-placeholders.ts # Validate legal content
```

## Architecture

### Page Structure

The app is a static landing page (no client-side routing). Navigation uses scroll-to-section with hash anchors (#hero, #features, etc.).

```
App
├── ErrorBoundary
├── Skip link (a11y)
├── Header (sticky nav + ThemeToggle)
├── main
│   ├── Hero → Problem → Solution → Features → Mobile
│   ├── Statistics → Comparison → Testimonials
│   └── EmailCapture → FAQ → CTA
├── Footer
├── FeedbackWidget
└── Vercel Analytics
```

### Data Flow

- **Static data**: Constants files in `src/constants/` — no API calls
- **Component state**: React `useState()` for local state
- **Theme**: `useTheme()` hook with localStorage persistence and `[data-theme]` attribute
- **Analytics** (dual stack):
  - **Active**: `useAnalytics()` hook → `src/utils/analytics.ts` (event tracking with PII sanitization, uses `window.gtag` when available). This is what `App.tsx` currently uses.
  - **Planned**: `src/analytics/` module (Plausible-based singleton with Web Vitals and scroll depth tracking). Infrastructure is built but not yet imported by any app component.
  - **Production**: `<Analytics />` from `@vercel/analytics` rendered in `App.tsx`
- **Error monitoring**: Sentry initialized in `main.tsx` (production only)

### Path Aliases

Configured in both `tsconfig.app.json` and `vite.config.ts`:

```
@/*           → src/*
@components/* → src/components/*
@hooks/*      → src/hooks/*
@styles/*     → src/styles/*
@types/*      → src/types/*
@constants/*  → src/constants/*
@utils/*      → src/utils/*
```

### CSS Architecture

- **CSS Modules**: Each component has a `[Component].module.css` file (scoped styles)
- **CSS Custom Properties**: Design tokens defined in `src/styles/variables.css`
- **Theme support**: Dark mode via `[data-theme='dark']` selector and `@media (prefers-color-scheme: dark)`
- **Responsive**: Mobile-first design, fluid typography with `clamp()`, tablet breakpoint at 768px
- **Animations**: CSS transitions with cubic-bezier easing; all animations respect `prefers-reduced-motion: reduce`

### Build Pipeline

```
prebuild:  generate:icons + generate:mockups
build:     tsc -b → vite build → inject-dates.js
postbuild: generate-sitemap.cjs
```

Production builds split into chunks: `react-vendor` (React/ReactDOM), `fontawesome` (icons), and main app bundle. Bundle size limits enforced: 150 KB JS / 30 KB CSS (gzipped).

## TypeScript Configuration

Project references with two configs:

- `tsconfig.app.json`: Application code (src/) — strict mode, ES2022 target, bundler module resolution, `noEmit: true`
- `tsconfig.node.json`: Build tooling configuration

Key strict settings: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`

## Testing

### Unit Tests (Vitest)

- **Test files** co-located with source files (`*.test.ts` / `*.test.tsx`)
- **Environment**: jsdom with IntersectionObserver and matchMedia mocks in `src/test/setup.ts`
- **Coverage thresholds**: 70% minimum for lines, functions, branches, and statements
- **Run**: `npm test` (watch mode) or `npm run test:coverage` (with report)

### E2E Tests (Playwright)

- **Location**: `tests/e2e/landing-page.spec.ts`
- **Browsers**: Chromium, Firefox, WebKit + Pixel 5 + iPhone 12 mobile viewports
- **Base URL**: `http://localhost:4173` (production preview server)
- **Run**: `npm run test:e2e` (auto-starts preview server locally)

## ESLint Configuration

Flat config format (`eslint.config.js`) with:

- JavaScript recommended rules (`@eslint/js`)
- TypeScript ESLint recommended rules
- React Hooks rules (enforces hooks best practices)
- React Refresh rules (ensures HMR compatibility)
- Prettier integration (disables conflicting rules via `eslint-config-prettier`)
- Ignores `dist/` directory

## CI/CD

### GitHub Workflows (`.github/workflows/`)

| Workflow               | Trigger     | Purpose                                    |
| ---------------------- | ----------- | ------------------------------------------ |
| `ci.yml`               | Push/PR     | Main pipeline: lint, test, build, coverage |
| `pr-quality-check.yml` | PR          | Type checking and test gates               |
| `eslint.yml`           | PR          | ESLint linting                             |
| `snyk-security.yml`    | Schedule/PR | Snyk vulnerability scanning                |
| `codacy.yml`           | Push/PR     | Codacy code quality                        |
| `codescan.yml`         | Push/PR     | CodeQL security scanning                   |

### Deployment

- **Vercel** (primary): Config in `vercel.json` — CSP headers, security headers, redirects
- **Netlify** (secondary): Config in `netlify.toml` — build config, security headers, caching, serverless functions
- **Lighthouse CI**: Config in `.lighthouserc.json` — performance threshold enforcement

## Environment Variables

### Client-Side (`VITE_` prefix)

All client-side env vars use the `VITE_` prefix and are embedded into the browser bundle by Vite. Add these to your local `.env` file (see `.env.example` for the full list).

- `VITE_BASE_URL` — Application base URL
- `VITE_ANALYTICS_ENABLED` / `VITE_ANALYTICS_PROVIDER` / `VITE_ANALYTICS_DOMAIN` — Analytics config
- `VITE_SENTRY_DSN` / `VITE_SENTRY_ENVIRONMENT` / `VITE_SENTRY_SAMPLE_RATE` — Error monitoring
- `VITE_SEO_KEYWORDS` / `VITE_OG_IMAGE` — SEO configuration

### CI-Only Secrets (GitHub Actions)

These are configured as repository secrets in GitHub Actions. They are **not** client-side variables and should **never** be added to `.env` files.

- `CODECOV_TOKEN` — Codecov bundle analysis upload
- `CODACY_PROJECT_TOKEN` — Codacy code quality reporting

## Design System

**See `/docs/DESIGN-SYSTEM.md` for comprehensive design documentation.**

### Visual Identity

- **Color Palette**: Sophisticated monochrome — near-black (#1a1a1a) and pure white (#ffffff), inverted in dark mode
- **Typography**: Dual font system — Inter (sans-serif) for UI/body, Playfair Display (serif) for headlines
- **Buttons**: Pill-shaped (border-radius: 9999px)
- **Iconography**: Font Awesome icons, tree-shaken (only used icons imported in `utils/iconLibrary.ts`)
- **Animation**: Subtle, hardware-accelerated CSS transforms, respects `prefers-reduced-motion`

### Frontend Aesthetics

Avoid generic "AI slop" aesthetics. Make creative, distinctive choices:

- **Typography**: Beautiful, unique fonts — avoid generic choices (Arial, Roboto, system fonts)
- **Color**: Cohesive aesthetic with CSS variables. Dominant colors with sharp accents over timid palettes
- **Motion**: High-impact orchestrated reveals over scattered micro-interactions. CSS-only preferred
- **Backgrounds**: Atmosphere and depth with gradients and patterns, not solid colors

Avoid: overused font families, clichéd purple gradients, predictable layouts, cookie-cutter patterns. Think outside the box with each generation.

### UX Principles

1. **Speed First**: Every interaction feels instantaneous
2. **Clarity Over Cleverness**: Clear communication over creative copy
3. **Mobile Excellence**: Mobile as good as desktop (60%+ mobile traffic expected)
4. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
5. **Progressive Enhancement**: Core content accessible without JavaScript

## Performance & Quality Targets

- **Page Load Speed**: <2 seconds initial load
- **Lighthouse Performance**: >90 score
- **Lighthouse Accessibility**: >95 score
- **Core Web Vitals**: Must pass all metrics (tracked via `src/analytics/webVitals.ts`)
- **Bundle Size**: JS <150 KB gzipped, CSS <30 KB gzipped (enforced via size-limit)

## Important Constraints

- **No Feature Bloat**: Paperlyte's core value is simplicity — avoid over-engineering
- **Mobile-First**: Design and develop for mobile first, then enhance for desktop
- **Accessibility Required**: Not optional — every feature must be accessible
- **Performance Budget**: If a feature slows the page, it doesn't ship
- **Reduced Motion**: Always respect `prefers-reduced-motion` for animations
- **Privacy-First**: Cookie-less analytics, PII sanitization, local-first data storage
- **Self-Hosted Assets**: Fonts and icons are self-hosted for security and performance (no external CDN calls)
