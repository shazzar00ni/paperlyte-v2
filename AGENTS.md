# Paperlyte Agent Instructions

## Project Overview

**Paperlyte** is a lightning-fast, distraction-free note-taking application. This repository contains the **landing page** for Paperlyte, built with React 19, TypeScript, and Vite. The landing page is designed to communicate the product's value proposition to users frustrated with overly complex tools like Notion, Evernote, and OneNote.

**Core Promise**: "Your thoughts, unchained."

**This is NOT the full note-taking application** - this is a marketing landing page with:

- Hero section with value proposition
- Problem/Solution sections
- Features showcase
- Email capture (waitlist)
- FAQ section
- Testimonials
- Competitor comparison
- Call-to-action sections
- Privacy and Terms pages

**Note**: A Pricing component exists in the codebase but is not currently rendered on the landing page.

## Build/Lint/Test Commands

### Core Commands

```bash
npm run dev              # Start Vite dev server (port 3000)
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build locally
npm run ci               # Full pipeline: lint, type-check, test, build
```

### Testing

```bash
npm run test             # Run all Vitest tests (default watch mode)
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:report  # Show Playwright HTML report
```

**Running a Single Test:**

```bash
# Run specific test file
npm run test -- src/components/ui/Button/Button.test.tsx

# Run test with pattern match
npm run test -- --testNamePattern="should handle click events"

# Run single test in a file with Vitest directly
npx vitest run src/utils/analytics.test.ts
```

### Linting & Formatting

```bash
npm run lint             # ESLint with all warnings as errors
npm run format           # Format all files with Prettier
npm run format:check     # Check Prettier formatting
```

### Dependency Management

```bash
npm run generate:icons   # Generate optimized icon files from SVG
npm run generate:mockups # Generate optimized mockup images
npm run size             # Check bundle size with size-limit
npm run lighthouse       # Run Lighthouse CI performance audit
npm audit                # Audit dependencies for vulnerabilities (native npm command)
```

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` or specific types instead
- Use interfaces for object shapes, types for unions/primitives
- Enable `strict: true` in tsconfig.json

### Naming Conventions

- **Components**: PascalCase (e.g., `NoteEditor.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables/Functions**: camelCase (e.g., `saveNote`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_NOTE_LENGTH`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `ModalProps`)
- **Types**: PascalCase (e.g., `Note`, `WaitlistEntry`)

### Imports

```typescript
// Absolute imports using path aliases
import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { useAnalytics } from '@hooks/useAnalytics'
import { trackEvent } from '@utils/analytics'

// Available path aliases:
// @/               → src/
// @components/     → src/components/
// @hooks/          → src/hooks/
// @constants/      → src/constants/
// @utils/          → src/utils/
// @styles/         → src/styles/

// Relative imports for same-level files
import { formatDate } from './dateUtils'
import styles from './Component.module.css'

// Import ordering: React → External → Internal (@ aliases) → Relative
```

### React Patterns

- Use functional components with hooks (no class components)
- Use custom hooks for shared logic (useAnalytics, useTheme, useParallax, etc.)
- Proper dependency arrays in `useEffect`
- Loading states for all async operations
- Error boundaries for all page components (ErrorBoundary wrapper in App.tsx)
- Use `useReducedMotion` hook to respect user motion preferences

### Error Handling

```typescript
try {
  const result = await submitWaitlistForm(email)
  if (result) {
    // Success path
  }
} catch (error) {
  monitoring.logError(error as Error, {
    feature: 'waitlist',
    action: 'submit_form',
  })
  // Show user-friendly error message
}
```

- Always use try/catch for async operations
- Differentiate network, validation, and runtime errors
- Provide user-friendly messages, log technical details
- Use `monitoring.logError()` from `src/utils/monitoring.ts`
- Never expose sensitive information in error messages

### Analytics & Monitoring

**Analytics Tracking** (`src/utils/analytics.ts`):

- Track page views with `trackPageView()`
- Track user interactions with `trackEvent()`
- Track scroll depth automatically via `useAnalytics()` hook
- **NEVER send PII** (emails, passwords, tokens) to analytics
- All events are automatically sanitized to remove PII

**Monitoring** (`src/utils/monitoring.ts`):

- Log errors with context using `monitoring.logError(error, context)`
- Add breadcrumbs with `monitoring.addBreadcrumb(message, category)`
- Integrates with Sentry for production error tracking

**Custom Hooks**:

- `useAnalytics()` - Initialize analytics with page view and scroll depth tracking
- `useTheme()` - Manage light/dark theme with system preference detection
- `useParallax()` - Create parallax scroll effects
- `useScrollPosition()` - Track scroll position
- `useReducedMotion()` - Detect user motion preferences
- `useMediaQuery()` - Responsive design hook
- `useIntersectionObserver()` - Trigger animations on scroll

**Example Usage**:

```typescript
import { useAnalytics } from '@hooks/useAnalytics'
import { trackEvent } from '@utils/analytics'
import { monitoring } from '@utils/monitoring'

function EmailCapture() {
  // Initialize analytics
  useAnalytics()

  const handleSubmit = async (email: string) => {
    // Add breadcrumb for debugging
    monitoring.addBreadcrumb('Email capture form submitted', 'user_action')

    try {
      // Track event (NO PII)
      trackEvent('Waitlist_Join', {
        button_location: 'hero_section',
      })

      // Submit form...
    } catch (error) {
      // Log error with context
      monitoring.logError(error as Error, {
        feature: 'email_capture',
        action: 'submit',
      })
    }
  }

  return (/* component JSX */)
}
```

### CSS & Styling

- Use CSS Modules for component-specific styles (`Component.module.css`)
- Global styles in `src/styles/` directory
- CSS variables for theming in `src/styles/variables.css`
- Use CSS Grid and Flexbox for layouts
- Include dark mode support with `prefers-color-scheme` media query
- Use modern units (rem, vh, vw) instead of pixels
- Respect `prefers-reduced-motion` for all animations
- Follow the monochrome design aesthetic (near-black #1a1a1a and white #ffffff)

**Font System**:

- **UI/Body**: Inter (via @fontsource/inter)
- **Headlines**: Playfair Display (self-hosted variable font)
- Icons: Font Awesome (via @fortawesome packages)

## File Structure

```
paperlyte-v2/
├── src/
│   ├── components/           # React components
│   │   ├── ErrorBoundary/    # Error boundary wrapper
│   │   ├── layout/           # Layout components
│   │   │   ├── Header/       # Site header with navigation
│   │   │   ├── Footer/       # Site footer
│   │   │   └── Section/      # Reusable section wrapper
│   │   ├── pages/            # Full page components
│   │   │   ├── Privacy/      # Privacy policy page
│   │   │   ├── Terms/        # Terms of service page
│   │   │   ├── NotFoundPage/ # 404 page
│   │   │   ├── OfflinePage/  # Offline page
│   │   │   └── ServerErrorPage/ # 500 error page
│   │   ├── sections/         # Landing page sections
│   │   │   ├── Hero/         # Hero section
│   │   │   ├── Problem/      # Problem statement
│   │   │   ├── Solution/     # Solution overview
│   │   │   ├── Features/     # Features grid
│   │   │   ├── Mobile/       # Mobile app showcase
│   │   │   ├── Statistics/   # Usage statistics
│   │   │   ├── Comparison/   # Competitor comparison
│   │   │   ├── Testimonials/ # User testimonials
│   │   │   ├── Pricing/      # Pricing information (not currently rendered)
│   │   │   ├── EmailCapture/ # Email capture form
│   │   │   ├── FAQ/          # Frequently asked questions
│   │   │   └── CTA/          # Call-to-action
│   │   └── ui/               # Reusable UI components
│   │       ├── Button/       # Button component
│   │       ├── Icon/         # Icon wrapper
│   │       ├── ThemeToggle/  # Dark/light theme toggle
│   │       ├── AnimatedElement/ # Animation wrapper
│   │       ├── TextReveal/   # Text reveal animation
│   │       ├── ParallaxLayer/ # Parallax effect
│   │       ├── FloatingElement/ # Floating animation
│   │       ├── CounterAnimation/ # Number counter
│   │       ├── SVGPathAnimation/ # SVG path animation
│   │       ├── EmailCapture/ # Email form component
│   │       └── FeedbackWidget/ # Feedback widget
│   ├── hooks/                # Custom React hooks
│   │   ├── useAnalytics.ts   # Analytics initialization
│   │   ├── useTheme.ts       # Theme management
│   │   ├── useParallax.ts    # Parallax scroll effects
│   │   ├── useScrollPosition.ts # Scroll tracking
│   │   ├── useReducedMotion.ts # Motion preference detection
│   │   ├── useMediaQuery.ts  # Responsive design
│   │   └── useIntersectionObserver.ts # Scroll animations
│   ├── utils/                # Utility functions
│   │   ├── analytics.ts      # Analytics tracking (GA4)
│   │   ├── monitoring.ts     # Error monitoring (Sentry)
│   │   ├── validation.ts     # Form validation
│   │   ├── env.ts            # Environment variables
│   │   ├── keyboard.ts       # Keyboard shortcuts
│   │   ├── navigation.ts     # Navigation utilities
│   │   ├── metaTags.ts       # SEO meta tags
│   │   └── iconLibrary.ts    # Font Awesome configuration
│   ├── analytics/            # Analytics modules
│   │   ├── index.ts          # Main analytics API
│   │   ├── config.ts         # Analytics configuration
│   │   ├── types.ts          # TypeScript types
│   │   ├── scrollDepth.ts    # Scroll depth tracking
│   │   ├── webVitals.ts      # Core Web Vitals tracking
│   │   └── providers/        # Analytics provider integrations
│   ├── constants/            # Application constants
│   │   ├── config.ts         # App configuration
│   │   ├── features.ts       # Feature definitions
│   │   ├── pricing.ts        # Pricing tiers
│   │   ├── faq.ts            # FAQ content
│   │   ├── testimonials.ts   # Testimonial data
│   │   ├── comparison.ts     # Competitor comparison data
│   │   └── legal.ts          # Legal page links
│   ├── styles/               # Global styles
│   │   ├── reset.css         # CSS reset
│   │   ├── variables.css     # CSS custom properties
│   │   ├── typography.css    # Typography styles
│   │   └── utilities.css     # Utility classes
│   ├── test/                 # Test utilities
│   │   └── setup.ts          # Vitest setup file
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global CSS imports
├── tests/                    # E2E tests
│   └── e2e/                  # Playwright E2E tests
├── docs/                     # Project documentation
├── scripts/                  # Build and utility scripts
│   ├── generate-icons.js     # Icon generation
│   ├── generate-mockups.js   # Mockup generation
│   ├── inject-dates.js       # Date injection
│   └── generate-sitemap.cjs  # Sitemap generation
├── public/                   # Static assets
│   ├── mockups/              # Product mockup images
│   └── favicon.svg           # Favicon source
├── netlify/                  # Netlify serverless functions
├── .github/                  # GitHub Actions workflows
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json             # TypeScript root config
├── tsconfig.app.json         # App TypeScript config
├── netlify.toml              # Netlify deployment config
└── vercel.json               # Vercel deployment config
```

## Development Workflow

1. Create detailed plan before editing large files (>300 lines)
2. Run tests before committing: `npm run test`
3. Run linting: `npm run lint`
4. Type checking is performed automatically during build: `npm run build` (runs `tsc -b`)
5. Check bundle size: `npm run size`
6. Test E2E flows: `npm run test:e2e`
7. Git hooks (via Husky) enforce pre-commit checks automatically

## Testing Infrastructure

**Unit/Integration Tests (Vitest)**:

- Test framework: Vitest with jsdom environment
- Test utilities: @testing-library/react, @testing-library/user-event
- Setup file: `src/test/setup.ts`
- Coverage provider: v8 with text, JSON, and HTML reports
- Run with: `npm run test` or `npm run test:coverage`

**E2E Tests (Playwright)**:

- Framework: Playwright
- Location: `tests/e2e/`
- Run with: `npm run test:e2e` or `npm run test:e2e:ui`

**Test Patterns**:

```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})

// Hook test example
import { renderHook } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  it('returns current theme', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })
})
```

## Key Patterns

### Component Structure

```typescript
// Standard landing page section component
import { Section } from '@components/layout/Section'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import styles from './Features.module.css'

export function Features() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <Section id="features" ref={ref} className={styles.features}>
      <h2 className={isVisible ? styles.fadeIn : ''}>Our Features</h2>
      {/* Feature content */}
    </Section>
  )
}
```

### Component Analytics

```typescript
import { useAnalytics } from '@hooks/useAnalytics'
import { trackEvent } from '@utils/analytics'
import { monitoring } from '@utils/monitoring'

function EmailCapture() {
  // Initialize analytics on mount
  useAnalytics()

  const handleSubmit = async (email: string) => {
    // Add debug breadcrumb
    monitoring.addBreadcrumb('Email capture form submitted', 'user_action')

    // Track event (never include PII like email addresses)
    trackEvent('Waitlist_Join', {
      form_location: 'hero_section',
    })

    // Submit form...
  }

  return (/* JSX */)
}
```

### Custom Hook Usage

```typescript
import { useTheme } from '@hooks/useTheme'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { useParallax } from '@hooks/useParallax'

function ParallaxHero() {
  const { theme } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const { offset } = useParallax({ speed: 0.5 })

  return (
    <div
      style={{
        transform: prefersReducedMotion ? 'none' : `translateY(${offset}px)`,
      }}
      className={theme === 'dark' ? 'dark-mode' : 'light-mode'}
    >
      {/* Hero content */}
    </div>
  )
}
```

### Form Validation

```typescript
import { validateEmail } from '@utils/validation'

function EmailForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid email')
      return
    }

    // Submit valid email...
  }

  return (/* JSX */)
}
```

### Environment Variables

```typescript
import { env } from '@utils/env'

// Access environment variables safely
const analyticsId = env.get('VITE_GA_MEASUREMENT_ID')
const sentryDsn = env.get('VITE_SENTRY_DSN')
const isDev = env.isDevelopment()
const isProd = env.isProduction()
```

## Accessibility

- WCAG 2.1 AA minimum compliance (target: >95 Lighthouse score)
- Semantic HTML elements (header, nav, main, section, article, footer)
- Proper ARIA roles and attributes
- Color contrast checks (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation support (focus visible states)
- Skip to main content link
- Alt text for all images
- Screen reader friendly markup
- Respect `prefers-reduced-motion` for animations
- Focus management in modals and overlays

## Performance Optimization

**Build Configuration**:

- Vite 7 with esbuild minification
- Manual chunk splitting for vendor code
- React vendor bundle (~190KB) - changes rarely
- Font Awesome split into separate chunk (~100KB+)
- CSS code splitting enabled
- Target: ES2020 for modern browsers

**Image Optimization**:

- Modern formats: AVIF (40-50% smaller), WebP (25-35% smaller)
- PNG fallback for compatibility
- Automatic format selection via `<picture>` element
- Lazy loading for below-the-fold images (`loading="lazy"`)
- Async decoding (`decoding="async"`)
- Preloading critical hero images
- Generation scripts: `npm run generate:icons` and `npm run generate:mockups`

**Performance Targets**:

- Page Load: < 2 seconds (initial load)
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Core Web Vitals: Pass all metrics
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- Bundle Size Limits:
  - Main JS bundle: < 150 KB (gzipped)
  - Main CSS bundle: < 30 KB (gzipped)

**Monitoring**:

- Lighthouse CI automated audits (`npm run lighthouse`)
- Bundle size checks (`npm run size`)
- Core Web Vitals tracking in analytics

## Deployment

**Supported Platforms**:

- **Netlify** (primary): Configuration in `netlify.toml`
- **Vercel** (alternative): Configuration in `vercel.json`

**Netlify Configuration**:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20
- Serverless functions in `netlify/functions/`
- Security headers configured
- SPA routing with redirects

**Vercel Configuration**:

- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Production CSP without `unsafe-eval`
- Automatic HTTPS and CDN

**Build Process**:

1. `prebuild`: Generate icons and mockups
2. `build`: TypeScript check + Vite build + inject dates
3. `postbuild`: Generate sitemap

**Environment Variables**:

- `VITE_GA_MEASUREMENT_ID` - Google Analytics 4 ID
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_ENVIRONMENT` - Environment name (development, production)
- `CODECOV_TOKEN` - Codecov upload token (CI only)
- `LIGHTHOUSE_RUNS` - Number of Lighthouse runs (CI: 3, local: 1)

## Security

**Content Security Policy (CSP)**:

- Development: Relaxed CSP with `unsafe-eval` for HMR (meta tag)
- Production: Strict CSP via HTTP headers (no `unsafe-eval`)
- Self-hosted fonts and icons (no external CDNs)

**Security Headers** (Netlify/Vercel):

- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Disable unnecessary features
- `Strict-Transport-Security` - Force HTTPS (Vercel)

**Privacy**:

- No PII sent to analytics (automatic sanitization)
- Cookie-less analytics (GA4 without cookies where possible)
- GDPR-compliant tracking
- Privacy policy page at `/privacy`

## Landing Page Components

The landing page is composed of the following sections (rendered in App.tsx in this order):

1. **Header** (`@components/layout/Header`)
   - Sticky navigation
   - Theme toggle
   - Navigation links
   - CTA button

2. **Hero** (`@components/sections/Hero`)
   - Value proposition
   - Primary CTA
   - Animated background elements
   - Parallax effects

3. **Problem** (`@components/sections/Problem`)
   - Pain points of existing solutions
   - User frustrations

4. **Solution** (`@components/sections/Solution`)
   - How Paperlyte solves the problems
   - Key differentiators

5. **Features** (`@components/sections/Features`)
   - Feature grid with icons
   - Performance metrics
   - Interactive animations

6. **Mobile** (`@components/sections/Mobile`)
   - Mobile app showcase
   - Cross-platform sync
   - Mockup images

7. **Statistics** (`@components/sections/Statistics`)
   - Usage statistics
   - Counter animations
   - Social proof

8. **Comparison** (`@components/sections/Comparison`)
   - Competitor comparison table
   - Feature checkmarks
   - Data from `@constants/comparison`

9. **Testimonials** (`@components/sections/Testimonials`)
   - User testimonials
   - Star ratings
   - Data from `@constants/testimonials`

10. **EmailCapture** (`@components/sections/EmailCapture`)
    - Waitlist signup form
    - Email validation
    - Analytics tracking

11. **FAQ** (`@components/sections/FAQ`)
    - Frequently asked questions
    - Expandable accordions
    - Data from `@constants/faq`

12. **CTA** (`@components/sections/CTA`)
    - Final call-to-action
    - Multiple signup options

13. **Footer** (`@components/layout/Footer`)
    - Legal links (Privacy, Terms)
    - Social media links
    - Copyright information

14. **FeedbackWidget** (`@components/ui/FeedbackWidget`)
    - Floating feedback button
    - User feedback form

**Note**: A `Pricing` component exists at `@components/sections/Pricing/` but is not currently rendered in App.tsx.

## Available Constants

All content data is centralized in `src/constants/`:

- **config.ts** - App configuration (name, description, URLs, social links)
- **features.ts** - Feature definitions with icons and descriptions
- **pricing.ts** - Pricing tiers and feature lists
- **faq.ts** - FAQ questions and answers
- **testimonials.ts** - User testimonials with ratings
- **comparison.ts** - Competitor comparison data
- **legal.ts** - Legal page links and information
- **downloads.ts** - Download links for different platforms
- **waitlist.ts** - Waitlist configuration

**Example Usage**:

```typescript
import { FEATURES } from '@constants/features'
import { PRICING_TIERS } from '@constants/pricing'
import { FAQ_ITEMS } from '@constants/faq'

function Features() {
  return (
    <div>
      {FEATURES.map((feature) => (
        <div key={feature.id}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
```

## Available Utilities

### Analytics (`@utils/analytics`)

- `trackPageView(page)` - Track page views
- `trackEvent(eventName, properties)` - Track custom events
- `initializeAnalytics()` - Initialize GA4
- Automatic PII sanitization

### Monitoring (`@utils/monitoring`)

- `monitoring.logError(error, context)` - Log errors with context
- `monitoring.addBreadcrumb(message, category)` - Add debug breadcrumbs
- Sentry integration for production

### Validation (`@utils/validation`)

- `validateEmail(email)` - Email validation with detailed feedback
- `sanitizeInput(input)` - Input sanitization
- Returns `{ isValid: boolean, error?: string }`

### Navigation (`@utils/navigation`)

- `smoothScrollTo(elementId)` - Smooth scroll to element
- `scrollToTop()` - Scroll to page top
- `getScrollProgress()` - Get current scroll progress (0-1)

### Environment (`@utils/env`)

- `env.get(key)` - Get environment variable
- `env.isDevelopment()` - Check if development
- `env.isProduction()` - Check if production
- Type-safe environment variable access

### Keyboard (`@utils/keyboard`)

- Keyboard shortcut handling
- Accessibility keyboard navigation helpers

### Meta Tags (`@utils/metaTags`)

- `updateMetaTags(title, description)` - Update page meta tags
- SEO optimization helpers

### Icon Library (`@utils/iconLibrary`)

- Font Awesome library initialization
- Icon registration and configuration

## Important Project-Specific Notes

### This is a Landing Page, NOT the Full App

- This repository contains the **marketing website** for Paperlyte
- It does NOT contain the actual note-taking application
- No localStorage, no data persistence, no note editing features
- Focus is on marketing, conversion, and email capture
- The actual note-taking app will be a separate project

### Fonts and Icons

- **All assets are self-hosted** (no external CDNs)
- Fonts: @fontsource/inter package for UI text
- Icons: @fortawesome packages (not CDN)
- This is critical for CSP compliance and performance

### Design Philosophy

- Monochrome aesthetic: near-black (#1a1a1a) and white (#ffffff)
- Dual typography: Inter for UI, Playfair Display for headlines
- Pill-shaped buttons (border-radius: 9999px)
- Subtle animations with motion preferences respected
- Mobile-first responsive design

### Common Mistakes to Avoid

- ❌ Don't add note-taking features (this is just a landing page)
- ❌ Don't reference dataService or localStorage (not implemented here)
- ❌ Don't send PII to analytics (always sanitize)
- ❌ Don't use external CDNs for fonts/icons (breaks CSP)
- ❌ Don't ignore accessibility (keyboard nav, ARIA, semantic HTML)
- ❌ Don't add animations without checking `prefers-reduced-motion`
- ❌ Don't use Tailwind CSS (this project uses CSS Modules)
- ✅ Do use path aliases (@components, @hooks, @utils)
- ✅ Do test with both light and dark themes
- ✅ Do run Lighthouse audits for performance
- ✅ Do validate emails before submission
- ✅ Do track events without PII

### Related Documentation

- **CLAUDE.md** - High-level design philosophy and guidance
- **README.md** - Project overview and setup instructions
- **docs/DESIGN-SYSTEM.md** - Comprehensive design system documentation
- **docs/ACCESSIBILITY.md** - Accessibility guidelines and checklist
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security practices and vulnerability reporting
