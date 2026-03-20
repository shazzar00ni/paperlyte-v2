# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Paperlyte** is a lightning-fast, distraction-free note-taking application that prioritizes simplicity over feature bloat. The landing page aims to communicate this value proposition to frustrated note-takers who are overwhelmed by complex tools like Notion, Evernote, and OneNote.

**Core Promise**: "Your thoughts, unchained."

**Key Differentiators**:

- Zero-Lag Typing: Sub-10ms keystroke response so typing feels instant, even in large docs
- Tag-Based Organization: Inline #tags instead of rigid folder hierarchies
- Cross-Platform Sync: Mac, Windows, Linux, iOS, Android, web
- Distraction-Free Writing: Interface that disappears when you start typing
- Private by Design: Local-first architecture with optional end-to-end encrypted sync
- Offline-First: Core writing and organization work fully offline, sync when connected

This is a React + TypeScript + Vite application currently implementing its Phase 1 MVP landing page.

## Development Commands

```bash
# Start development server with HMR (port 3000)
npm run dev

# Build for production (TypeScript check + Vite build + date injection)
npm run build

# Lint all files (ESLint flat config)
npm run lint

# Format code (Prettier)
npm run format

# Preview production build locally
npm run preview

# Run unit tests (Vitest)
npm run test

# Unit tests with coverage report
npm run test:coverage

# Run E2E tests (Playwright — requires preview server running)
npm run test:e2e

# Lighthouse CI performance audit
npm run lighthouse

# Check bundle size limits (150KB JS, 30KB CSS gzipped)
npm run size

# Generate Font Awesome icon library
npm run generate:icons

# Generate product mockup images
npm run generate:mockups
```

## Tech Stack

- **React**: 19.2.4 (with React DOM 19.2.4)
- **TypeScript**: ~5.9.3 with strict mode enabled
- **Build Tool**: Vite 8.x with @vitejs/plugin-react
- **Linting**: ESLint 10.x (flat config) with TypeScript ESLint, React Hooks, React Refresh, and Prettier plugins
- **Formatting**: Prettier 3.8.x
- **Unit Testing**: Vitest 4.x with jsdom environment
- **E2E Testing**: Playwright 1.58.x (Chromium, Firefox, WebKit, Pixel 5, iPhone 12)
- **Icons**: Font Awesome (self-hosted via JS, tree-shaken, CSP-compliant)
- **Analytics**: Vercel Analytics 2.x (privacy-first, disabled by default)
- **Error Monitoring**: Sentry 10.x (production only, session replay with redaction)
- **Fonts**: Self-hosted variable fonts (Inter, Playfair Display) in woff2 format

## Project Structure

```
src/
├── main.tsx                    # Entry point: StrictMode, Sentry init, icon library, meta tags
├── App.tsx                     # Root component composing all page sections
├── App.css                     # Root layout styles (flex column, full viewport height)
├── index.css                   # Global styles (imports CSS foundation modules)
├── vite-env.d.ts               # Vite environment types
├── global.d.ts                 # Global Window interface extensions
│
├── styles/                     # CSS foundation (imported by index.css)
│   ├── variables.css           # All design tokens (colors, spacing, type, shadows, transitions)
│   ├── reset.css               # Modern CSS reset + accessibility defaults
│   ├── typography.css          # Font-face declarations + heading defaults
│   └── utilities.css           # Utility classes (container, sr-only, skip-link, flex, spacing)
│
├── components/
│   ├── ErrorBoundary/          # Error boundary wrapper
│   ├── layout/
│   │   ├── Header/             # Sticky navigation header
│   │   ├── Footer/             # Footer with social/legal links
│   │   └── Section/            # Page section wrapper
│   ├── sections/               # Full page sections (each has .tsx + .module.css)
│   │   ├── Hero/               # Hero with value proposition + parallax background
│   │   ├── Problem/            # Problem statement
│   │   ├── Solution/           # Solution overview
│   │   ├── Features/           # Feature grid (6 core features with metrics + icons)
│   │   ├── Mobile/             # Mobile features highlight
│   │   ├── Statistics/         # Key metrics counters
│   │   ├── Comparison/         # Competitor comparison table
│   │   ├── Testimonials/       # User testimonials slider
│   │   ├── EmailCapture/       # Newsletter signup section
│   │   ├── FAQ/                # FAQ accordion
│   │   ├── CTA/                # Call-to-action with waitlist buttons
│   │   └── Pricing/            # Pricing tiers (future phase placeholder)
│   └── ui/                     # Primitive UI components
│       ├── Button/             # Pill-shaped button (primary CTA)
│       ├── Icon/               # Font Awesome icon wrapper
│       ├── ThemeToggle/        # Dark/light mode toggle
│       ├── AnimatedElement/    # Scroll-triggered animation wrapper (IntersectionObserver)
│       ├── FloatingElement/    # Floating animated decorative elements
│       ├── ParallaxLayer/      # Parallax scroll effect component
│       ├── TextReveal/         # Text reveal animation
│       ├── CounterAnimation/   # Animated number counters for statistics
│       ├── SVGPathAnimation/   # SVG path draw animation
│       ├── EmailCapture/       # Email input field
│       └── FeedbackWidget/     # User feedback submission widget
│
├── hooks/                      # Custom React hooks (each has a *.test.ts)
│   ├── useTheme.ts             # Theme management (dark/light, persisted preference)
│   ├── useAnalytics.ts         # Analytics events + scroll depth tracking
│   ├── useIntersectionObserver.ts  # Scroll animation trigger
│   ├── useParallax.ts          # Parallax scroll effect
│   ├── useScrollPosition.ts    # Scroll position tracking
│   ├── useMediaQuery.ts        # Responsive breakpoint detection
│   └── useReducedMotion.ts     # Detects prefers-reduced-motion
│
├── utils/                      # Utility functions
│   ├── env.ts                  # Environment setup + meta tag injection
│   ├── analytics.ts            # Analytics event tracking wrappers
│   ├── monitoring.ts           # Sentry error monitoring initialization
│   ├── security.ts             # CSP + XSS prevention utilities
│   ├── validation.ts           # Form validation helpers
│   ├── keyboard.ts             # Keyboard event helpers (a11y)
│   ├── navigation.ts           # Navigation utilities
│   ├── metaTags.ts             # Meta tag management
│   ├── iconLibrary.ts          # Font Awesome icon registration (tree-shaken)
│   └── test/                   # Testing utilities and helpers
│
├── constants/                  # Data-driven content constants
│   ├── config.ts               # App configuration constants
│   ├── features.ts             # Feature definitions (6 core features)
│   ├── comparison.ts           # Competitor comparison table data
│   ├── testimonials.ts         # Testimonial data
│   ├── faq.ts                  # FAQ content
│   ├── pricing.ts              # Pricing tier data
│   ├── downloads.ts            # Platform download links
│   ├── legal.ts                # Legal/compliance constants
│   └── waitlist.ts             # Waitlist-related constants
│
├── analytics/
│   └── providers/              # Analytics service integrations (Plausible, Fathom, Umami, Vercel)
│
├── assets/                     # Static images (imported by components)
└── test/
    ├── setup.ts                # Vitest global setup
    └── docs/                   # Test documentation

public/
├── fonts/
│   ├── Inter-Variable.woff2           # Self-hosted Inter variable font (100–900)
│   └── PlayfairDisplay-Variable.woff2 # Self-hosted Playfair Display variable font (400–900)
├── mockups/                    # Product mockup images (AVIF, WebP, PNG, SVG variants)
├── favicon.svg                 # SVG favicon
├── favicon.ico                 # Legacy favicon
├── favicon-*.png               # Multiple PNG favicon sizes
├── apple-touch-icon.png        # iOS bookmark icon
├── site.webmanifest            # PWA manifest
├── privacy.html                # Static privacy policy page
└── terms.html                  # Static terms of service page

docs/
├── design-system/              # Design system documentation (v3.0.0)
│   ├── README.md               # Design system overview
│   ├── tokens.md               # Design token reference
│   ├── typography.md           # Typography system
│   ├── components.md           # Component API reference
│   ├── layout.md               # Layout & grid system
│   ├── motion.md               # Animation principles
│   └── landing-page.md         # Landing page specifications
├── SECURITY.md
├── CI-CD-PIPELINE.md
├── LIGHTHOUSE-CI.md
├── TECHNICAL-DEBT.md
├── ROADMAP.md
├── ACCESSIBILITY-REMEDIATION-PLAN.md
└── Project_Architecture_Blueprint.md

scripts/
├── generate-icons.js           # Font Awesome icon generation
├── generate-mockups.js         # Product mockup generation
├── inject-dates.js             # Injects build date into output
└── generate-sitemap.cjs        # Sitemap generation

tests/
└── e2e/                        # Playwright E2E tests
```

## TypeScript Configuration

The project uses TypeScript's project references with two configs:

- `tsconfig.app.json`: Application code (`src/`) — strict mode, ES2022 target, bundler module resolution, path aliases
- `tsconfig.node.json`: Build tooling (`vite.config.ts`) — ES2023 target

Key compiler settings:

- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- JSX mode: `react-jsx` (automatic runtime, no React import needed)
- Module resolution: `bundler` (Vite-specific)
- `noEmit: true` (Vite handles transpilation)

### Path Aliases

Configured in both `tsconfig.app.json` and `vite.config.ts`:

```typescript
@               → src/
@components     → src/components/
@hooks          → src/hooks/
@styles         → src/styles/
@utils          → src/utils/
@constants      → src/constants/
@types          → src/types/  (if present)
```

Always use these aliases for cross-directory imports.

## ESLint Configuration

ESLint uses the flat config format (`eslint.config.js`) including:

- TypeScript ESLint recommended rules
- React Hooks rules (enforces hooks best practices)
- React Refresh rules (ensures HMR compatibility)
- Prettier integration (disables formatting-conflicting rules)
- ECMAScript 2020 globals, browser environment
- Ignores `dist/` directory

Run `npm run lint` before committing. Run `npm run format` to auto-fix formatting.

## CSS Architecture

### Design Tokens (`src/styles/variables.css`)

All values are CSS custom properties. Never hardcode colors, spacing, or font sizes — always use variables.

**Light mode (default):**
- `--color-primary`: `#1a1a1a` (near black)
- `--color-bg`: `#ffffff`
- `--color-surface`: `#f9fafb`
- `--color-text-primary`: `#111827`
- `--color-text-secondary`: `#6b7280`
- `--color-border`: `#e5e7eb`

**Dark mode** (via `[data-theme='dark']` or `prefers-color-scheme: dark`): palette inverts — white becomes primary, dark slate becomes background.

**Spacing scale** (8px base): `--space-xs` through `--space-3xl` (8px → 96px)

**Border radii**: `--radius-sm` (4px) through `--radius-full` (9999px — pill buttons)

**Z-index layers**: header 1000, modal 2000, tooltip 3000

**Transitions**: `--transition-fast` (150ms), `--transition-base` (250ms), `--transition-slow` (350ms)

### Component Styling

- Use **CSS Modules** (`.module.css`) for all component-scoped styles
- Import as `import styles from './ComponentName.module.css'`
- Use design token variables, never hardcode values

### Motion & Accessibility

- Always respect `prefers-reduced-motion` — `reset.css` sets animations to 0.01ms by default when motion is reduced
- The `useReducedMotion` hook provides programmatic access to this preference
- Wrap animated components with `<AnimatedElement>` for scroll-triggered reveals

## Entry Point

`src/main.tsx`:
1. Initializes Sentry (production only)
2. Registers Font Awesome icon library (`iconLibrary.ts`)
3. Calls `updateMetaTags()` for environment-aware SEO meta tags
4. Renders `<App>` in React StrictMode

`src/App.tsx` composes all page sections in order and integrates:
- Skip link for keyboard accessibility
- `<ErrorBoundary>` wrapper
- Vercel `<Analytics>` component
- Scroll depth tracking via `useAnalytics()`

## Design System

**See `docs/design-system/README.md` for comprehensive design documentation (v3.0.0).**

### Visual Identity

- **Color Palette**: Sophisticated monochrome — near-black (#1a1a1a) and pure white (#ffffff); no accent color, contrast is the accent
- **Typography**: Dual font system — Playfair Display (serif) for headlines, Inter (sans-serif) for UI/body
- **Buttons**: Pill-shaped (`border-radius: 9999px`) for signature look
- **Iconography**: Font Awesome icons, self-hosted, tree-shaken
- **Animation**: Subtle, performance-optimized, respects `prefers-reduced-motion`

### Frontend Aesthetics

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:

- Typography: Choose fonts that are beautiful, unique, and interesting.
- Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic.
- Use CSS variables for consistency.
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- Draw from IDE themes and cultural aesthetics for inspiration.

Motion:
Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds:
Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid the following generic AI-generated aesthetics:

- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!

### Key Design Features

- **Monochrome Palette**: Black/white design inverts in dark mode (white becomes primary)
- **Serif Headlines**: Large Playfair Display headlines with italic emphasis
- **Pill Buttons**: All buttons use full border-radius for signature look
- **Hero Parallax**: Subtle background shapes with blur effects
- **Floating Elements**: Animated icons and decorative elements (hidden on mobile)

### UX Principles

1. **Speed First**: Every interaction should feel instantaneous
2. **Clarity Over Cleverness**: Clear communication over creative copy
3. **Mobile Excellence**: Mobile experience must be as good as desktop (60%+ mobile traffic expected)
4. **Accessibility**: Usable by everyone, regardless of ability
5. **Progressive Enhancement**: Core content must be accessible without JavaScript

## Testing

### Unit Tests (Vitest)

- **Config**: `vitest.config.ts` — jsdom environment, v8 coverage
- **Coverage thresholds**: 70% lines, functions, branches, statements
- **Test files**: colocated with source as `*.test.ts` / `*.test.tsx`
- **Setup**: `src/test/setup.ts` runs before all tests
- Run: `npm run test` (watch) or `npm run test:coverage`

### E2E Tests (Playwright)

- **Config**: `playwright.config.ts`
- **Test directory**: `tests/e2e/`
- **Base URL**: `http://localhost:4173` (Vite preview server)
- **Browsers**: Chromium, Firefox, WebKit, Pixel 5 (mobile), iPhone 12 (mobile)
- **CI**: 2 retries on failure, screenshots on failure
- Run: Start preview server first (`npm run preview`), then `npm run test:e2e`

### Lighthouse CI

- **Config**: `.lighthouserc.json`
- **Thresholds**: Performance >90, Accessibility >95, Best Practices >90, SEO >90
- Run: `npm run lighthouse`

## Performance & Quality Targets

These targets are critical to the product's "lightning-fast" value proposition:

- **Page Load Speed**: <2 seconds initial load
- **Lighthouse Performance**: >90 score
- **Lighthouse Accessibility**: >95 score (WCAG 2.1 AA compliance)
- **Core Web Vitals**: Must pass all metrics
- **Bundle Size**: Main JS ≤150 KB gzipped, Main CSS ≤30 KB gzipped
- **Bounce Rate**: Target <45% for organic traffic
- **Engagement Time**: Average session >2 minutes

Check bundle size with `npm run size` before merging any PR that changes dependencies.

## Security

### Content Security Policy (CSP)

- **Dev**: Relaxed CSP allowing `'unsafe-eval'` (Vite HMR) and `'unsafe-inline'` (dev CSS)
- **Production**: Strict CSP delivered via HTTP headers in `vercel.json` — `frame-ancestors 'none'`
- All fonts and icons are self-hosted — no external CDN dependencies that would require CSP exceptions

### Error Monitoring

- Sentry is initialized in production only (check `import.meta.env.PROD`)
- Session replay enabled with sensitive data redaction
- Query parameters stripped from URLs before reporting

### Environment Variables

All environment variables are prefixed with `VITE_` for browser exposure. See `.env.example` for all available variables:
- `VITE_BASE_URL` — App base URL
- `VITE_SENTRY_DSN` — Sentry error monitoring
- `VITE_ANALYTICS_*` — Analytics provider configuration (Plausible, Fathom, Umami)
- `VITE_OG_IMAGE` — Open Graph image URL

Never commit `.env.production` or any file with real secrets.

## Deployment

### Vercel (Primary)

- Config: `vercel.json`
- Strict CSP headers, SPA rewrite rules
- Analytics conditionally enabled

### Netlify (Alternative)

- Config: `netlify.toml`
- Build command: `npm run build`, publish: `dist/`

## Development Phases

### Phase 1: MVP Landing Page (Current — Substantially Complete)

All core sections implemented:
- Hero, Problem, Solution, Features (6 features), Mobile, Statistics
- Comparison table, Testimonials, EmailCapture, FAQ, CTA
- Sticky navigation header, Footer

### Phase 2: Conversion Optimization (Post-Launch)

- Email capture form backend integration
- A/B testing setup
- Pricing section activation
- Analytics funnel tracking

### Phase 3: Advanced Features (Growth Stage)

- Privacy-first analytics (cookie-less, GDPR-compliant)
- Dark mode toggle with system preference detection
- Advanced scroll animations and parallax effects
- Social sharing functionality

## Important Constraints

- **No Feature Bloat**: Paperlyte's core value is simplicity — avoid over-engineering
- **Mobile-First**: Design and develop for mobile first, then enhance for desktop
- **Accessibility Required**: Not optional — every feature must be accessible (WCAG 2.1 AA minimum)
- **Performance Budget**: If a feature slows the page, it doesn't ship. Check with `npm run size` and `npm run lighthouse`
- **Reduced Motion**: Always respect `prefers-reduced-motion` for all animations
- **Self-Hosted Assets**: Fonts and icons must stay self-hosted to maintain CSP compliance and performance
- **CSS Variables Only**: Never hardcode design values — always use tokens from `variables.css`
- **No External CDNs**: All assets must be self-hosted or bundled
