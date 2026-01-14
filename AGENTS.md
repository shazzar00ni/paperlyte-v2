# Paperlyte Agent Instructions

## Project Overview

This is the **landing page** for Paperlyte, a privacy-focused note-taking application. The landing page is built with React 19, TypeScript, and Vite. It features a modern design with animations, analytics tracking, and an email waitlist capture system. This is a static marketing site - the actual note-taking application will be a separate repository.

## Build/Lint/Test Commands

### Core Commands

```bash
npm run dev              # Start Vite dev server (port 3000)
npm run build            # TypeScript check + Vite build + inject dates + generate sitemap
npm run preview          # Preview production build locally
```

### Testing

```bash
npm run test             # Run all tests with Vitest
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:report  # Show Playwright test report
```

**Running a Single Test:**

```bash
# Run specific test file
npm run test -- src/components/ui/Button/Button.test.tsx

# Run test with pattern match
npm run test -- --testNamePattern="should render children"

# Run single test file directly
npx vitest run src/utils/analytics.test.ts
```

### Linting & Formatting

```bash
npm run lint             # ESLint with strict rules
npm run format           # Format all files with Prettier
npm run format:check     # Check Prettier formatting
```

### Asset Generation

```bash
npm run generate:icons   # Generate optimized app icons and favicons
npm run generate:mockups # Generate optimized mockup images (WebP, AVIF, PNG)
```

### Performance & SEO

```bash
npm run lighthouse       # Run Lighthouse CI audit
npm run size             # Check bundle size limits
```

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` or specific types instead
- Use interfaces for object shapes, types for unions/primitives
- Enable `strict: true` in tsconfig.json

### Naming Conventions

- **Components**: PascalCase (e.g., `EmailCapture.tsx`, `Hero.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables/Functions**: camelCase (e.g., `trackEvent`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `ANALYTICS_EVENTS`, `API_ENDPOINT`)
- **Interfaces**: PascalCase with descriptive names (e.g., `ButtonProps`, `AnalyticsEventParams`)
- **Types**: PascalCase (e.g., `ThemeMode`, `ScrollPosition`)

### Imports

```typescript
// Absolute imports for project modules (using path aliases)
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { trackEvent } from '@/utils/analytics'

// Relative imports for same-level or parent imports
import { sanitizeEmail } from './validation'
import { logError } from '../utils/monitoring'

// Import ordering: React → External → Internal → Relative
```

### React Patterns

- Use functional components with hooks (no class components)
- Use custom hooks for shared logic
- Proper dependency arrays in `useEffect`
- Loading states for all async operations
- Error boundaries for all page components

### Error Handling

```typescript
try {
  const result = await submitWaitlistEmail(email)
  if (result.success) {
    // Success path
  }
} catch (error) {
  logError(error as Error, {
    severity: 'medium',
    tags: {
      feature: 'waitlist',
      action: 'submit_email',
    }
  }, 'EmailCapture')
}
```

- Always use try/catch for async operations
- Provide user-friendly messages, log technical details
- Use `logError()` from `src/utils/monitoring.ts` with appropriate severity and context
- Errors are sent to Sentry in production and logged to console in development

### Analytics & Monitoring

- Track events with `trackEvent()` from `src/utils/analytics.ts`
- Track page views with `trackPageView()`
- Never send PII (emails, passwords, etc.) - analytics automatically strips PII
- Use specific event helpers: `trackCtaClick()`, `trackExternalLinkClick()`
- All analytics events are sent to Google Analytics (gtag.js)
- Use Sentry for error tracking (configured via environment variables)

### CSS & Styling

- Use CSS Modules for component styles (e.g., `Button.module.css`)
- Global styles in `src/styles/` directory
- Use CSS custom properties (variables) from `src/styles/variables.css`
- Include dark mode support with `prefers-color-scheme`
- Use modern units (rem, vh, vw) instead of pixels
- Support `prefers-reduced-motion` for accessible animations
- Monochrome design aesthetic with sophisticated black/white palette
- Typography: Inter for UI, Playfair Display for headlines

## File Structure

```
paperlyte-v2/
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Header, Footer, Section)
│   │   ├── sections/     # Landing page sections (Hero, Features, CTA, etc.)
│   │   ├── pages/        # Page components (Privacy, Terms, NotFound, etc.)
│   │   ├── ui/           # Reusable UI components (Button, EmailCapture, ThemeToggle, etc.)
│   │   └── ErrorBoundary/ # Error boundary component
│   ├── hooks/            # Custom React hooks
│   │   ├── useAnalytics.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useParallax.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useScrollPosition.ts
│   │   └── useTheme.ts
│   ├── utils/            # Utility functions
│   │   ├── analytics.ts  # Google Analytics tracking
│   │   ├── monitoring.ts # Error logging and Sentry integration
│   │   ├── validation.ts # Input validation and sanitization
│   │   ├── keyboard.ts   # Keyboard shortcut handling
│   │   └── navigation.ts # Navigation utilities
│   ├── analytics/        # Analytics configuration and providers
│   ├── constants/        # Constants and configuration
│   ├── styles/           # Global styles and CSS variables
│   │   ├── reset.css     # Modern CSS reset
│   │   ├── variables.css # Design system variables
│   │   ├── typography.css # Typography styles
│   │   └── utilities.css # Utility classes
│   ├── test/             # Shared test utilities
│   ├── assets/           # Static assets
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── tests/                # E2E and integration tests
├── scripts/              # Build and generation scripts
│   ├── generate-icons.js
│   ├── generate-mockups.js
│   ├── inject-dates.js
│   └── generate-sitemap.cjs
├── public/               # Static public assets
│   └── mockups/          # App mockup images
├── docs/                 # Project documentation
└── .github/              # GitHub Actions workflows
```

## Development Workflow

1. Create detailed plan before editing large files (>300 lines)
2. Run tests before committing: `npm run test`
3. Run linting: `npm run lint`
4. Ensure type checking passes (included in build)
5. Test E2E flows for critical features: `npm run test:e2e`
6. Check bundle size: `npm run size`

## Key Patterns

### Analytics Tracking
```typescript
// Track custom events
trackEvent('Waitlist_Join', {
  button_location: 'hero',
  user_tier: 'free'
})

// Track CTA clicks
trackCtaClick('Get Early Access', 'hero')

// Track external links
trackExternalLinkClick('Twitter', 'https://twitter.com/paperlyte')
```

### Component with Intersection Observer
```typescript
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const MyComponent = () => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    triggerOnce: true
  })
  
  return (
    <div ref={ref} className={isIntersecting ? 'visible' : 'hidden'}>
      Content
    </div>
  )
}
```

### Theme Toggle
```typescript
import { useTheme } from '@/hooks/useTheme'

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

### Responsive Media Queries
```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery'

const MyComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? <MobileView /> : <DesktopView />
}
```

## Accessibility

- WCAG 2.1 AA minimum compliance
- Semantic HTML elements
- Proper ARIA roles and attributes
- Color contrast checks
- Alt text for images
