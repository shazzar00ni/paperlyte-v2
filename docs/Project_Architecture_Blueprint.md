# Project Architecture Blueprint

## Introduction

This document serves as a comprehensive architectural reference for the Paperlyte landing page application. It covers the complete technical architecture including component structure, styling system, state management patterns, analytics implementation, testing strategy, and deployment infrastructure.

**Target Audience:** This document is designed for developers who need to understand, maintain, or extend the Paperlyte landing page codebase. Whether you're implementing new features, debugging issues, or onboarding to the project, this blueprint provides the strategic architectural vision and technical patterns used throughout the application.

**Relationship to DESIGN-SYSTEM.md:** While this document focuses on architectural patterns and strategic technical decisions, the [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) provides tactical implementation details for the visual design system including colors, typography, spacing, and component styling guidelines. These documents are complementary—reference this blueprint for "how the system is architected" and the design system for "how components should look and behave visually."

---

## Table of Contents

1. [Architectural Guiding Principles](#architectural-guiding-principles)
2. [Executive Summary](#executive-summary)
3. [Architecture Detection & Analysis](#architecture-detection--analysis)
4. [Architecture Visualization](#architecture-visualization)
5. [Core Architectural Components](#core-architectural-components)
6. [Layers and Dependencies](#layers-and-dependencies)
7. [Data Architecture](#data-architecture)
8. [Cross-Cutting Concerns](#cross-cutting-concerns)
9. [Service Communication Patterns](#service-communication-patterns)
10. [Technology-Specific Patterns (React)](#technology-specific-patterns-react)
11. [Implementation Patterns](#implementation-patterns)
12. [Testing Architecture](#testing-architecture)
13. [Deployment Architecture](#deployment-architecture)
14. [Extension and Evolution Patterns](#extension-and-evolution-patterns)
15. [Code Examples](#code-examples)
16. [Architectural Decision Records](#architectural-decision-records)
17. [Governance & Development Blueprint](#governance--development-blueprint)
18. [Quick Reference](#quick-reference)

---

## Architectural Guiding Principles

The Paperlyte landing page architecture is built on the following core principles that guide all technical decisions:

1. **Simplicity First**
   - Favor straightforward solutions over clever abstractions. The codebase uses vanilla CSS over CSS-in-JS, plain React hooks over heavy state management libraries, and standard patterns over framework-specific conventions.

2. **Composition Over Inheritance**
   - Build complex interfaces from simple, reusable components. Each component has a single responsibility and can be composed with others to create rich user experiences without deep inheritance hierarchies.

3. **Accessibility-First Development**
   - Accessibility is not an afterthought—it's a core architectural requirement. All components are built with WCAG 2.1 AA compliance in mind, with semantic HTML, proper ARIA attributes, keyboard navigation, and screen reader support baked into the foundation.

4. **Privacy-First Architecture**
   - User privacy is a fundamental design constraint, not a feature. The application uses cookie-less analytics, respects Do Not Track headers, never stores PII, and implements comprehensive data sanitization throughout the codebase.

5. **Performance as a Feature**
   - Every architectural decision considers performance impact. The application uses code splitting, lazy loading, optimized assets, and minimal dependencies to ensure fast load times and smooth interactions.

6. **Developer Experience Matters**
   - Clear code organization, comprehensive TypeScript types, consistent patterns, and thorough documentation make the codebase maintainable and enjoyable to work with.

**Connection to UX Principles:** These architectural principles directly enable the 5 UX principles defined in DESIGN-SYSTEM.md: Speed First, Clarity Over Cleverness, Mobile Excellence, Accessibility, and Progressive Enhancement. The technical architecture implements the design philosophy.

---

## Executive Summary

Paperlyte's landing page is a modern React 19 component-based single-page application (SPA) built with TypeScript and Vite. The architecture emphasizes simplicity, performance, and privacy through vanilla CSS with design tokens, custom React hooks for cross-cutting concerns, and cookie-less analytics.

### Key Architectural Characteristics

1. **React Component-Based SPA**
   - **30+ components** organized by feature (layout, sections, pages, ui)
   - **TypeScript strict mode** for type safety throughout
   - **Feature-based structure** (components/, hooks/, utils/, styles/)
   - Component composition pattern with props interfaces for all components

2. **Vanilla CSS with Design Tokens**
   - **120+ CSS custom properties** defining the design system
   - **CSS Modules** for component-scoped styling
   - **Zero CSS-in-JS dependencies**—pure CSS with modern features
   - **Monochrome design aesthetic** with sophisticated black/white palette
   - **Dark mode support** via CSS custom properties and `prefers-color-scheme`

3. **Custom Hooks Pattern**
   - **7 custom hooks** encapsulating cross-cutting concerns:
     - `useAnalytics` - Event tracking abstraction
     - `useIntersectionObserver` - Scroll-based animations
     - `useMediaQuery` - Responsive behavior
     - `useParallax` - Smooth scroll effects
     - `useReducedMotion` - Accessibility-aware animations
     - `useScrollPosition` - Scroll state management
     - `useTheme` - Dark mode toggling
   - Reusable logic extracted from components for maintainability

4. **Privacy-First Analytics**
   - **Cookie-less analytics** integration (GDPR-compliant)
   - **DNT (Do Not Track) header respect** built into tracking logic
   - **Automatic PII stripping** from all analytics events
   - **No user identification** or session tracking
   - **Sentry error monitoring** with privacy safeguards in production

5. **Comprehensive Testing**
   - **Vitest** for unit and integration tests of components and hooks
   - **Playwright** for end-to-end testing across browsers and configurations
   - **Test coverage reporting** with 70% coverage thresholds
   - **Accessibility testing** integrated into test suites

6. **Dual-Platform Deployment**
   - **Netlify** primary deployment with serverless functions
   - **Vercel** secondary deployment for redundancy
   - **Automated CI/CD** via GitHub Actions
   - **Environment-specific configuration** (.env files)
   - **Performance monitoring** via Lighthouse CI

---

## Architecture Detection & Analysis

### Technology Stack Identification

The following technologies were identified through analysis of `package.json`, configuration files, and source code patterns:

#### Core Framework & Runtime

| Technology | Version | Purpose | Detection Source |
|------------|---------|---------|------------------|
| React | 19.2.x | UI library | `package.json` dependencies |
| React DOM | 19.2.x | DOM rendering | `package.json` dependencies |
| TypeScript | ~5.9.3 | Type safety | `package.json`, `tsconfig.*.json` |
| Vite | 7.x | Build tool & dev server | `vite.config.ts`, `package.json` |

#### Styling & Design

| Technology | Purpose | Detection Source |
|------------|---------|------------------|
| CSS Modules | Scoped component styles | `*.module.css` files |
| CSS Custom Properties | Design tokens | `src/styles/variables.css` |
| PostCSS + Autoprefixer | CSS processing | `postcss.config.js` |
| Font Awesome | Icon system | `@fortawesome/*` packages |
| Inter (Fontsource) | Typography | `@fontsource/inter` package |

#### Testing & Quality

| Technology | Purpose | Detection Source |
|------------|---------|------------------|
| Vitest | Unit/integration testing | `vitest.config.ts` |
| Playwright | E2E testing | `playwright.config.ts` |
| Testing Library | Component testing | `@testing-library/*` packages |
| ESLint | Code linting | `eslint.config.js` |
| Prettier | Code formatting | `.prettierrc.json` |

#### Monitoring & Analytics

| Technology | Purpose | Detection Source |
|------------|---------|------------------|
| Sentry | Error monitoring | `@sentry/react` package |
| Google Analytics | Event tracking | `src/analytics/` module |
| Lighthouse CI | Performance monitoring | `.lighthouserc.json` |
| Codecov | Coverage reporting | `codecov.yml` |

### Architectural Pattern Recognition

**Pattern: Component-Based Architecture**
- Evidence: All UI elements are React functional components
- Location: `src/components/` directory structure
- Characteristics: Props interfaces, composition over inheritance

**Pattern: Hooks-Based State Management**
- Evidence: No Redux, Zustand, or Context API for global state
- Location: `src/hooks/` directory with 7 custom hooks
- Characteristics: Local component state, custom hooks for shared logic

**Pattern: CSS Modules with Design Tokens**
- Evidence: `*.module.css` files paired with components
- Location: Component directories, `src/styles/variables.css`
- Characteristics: Scoped styles, CSS custom properties, no CSS-in-JS

**Pattern: Privacy-First Analytics**
- Evidence: PII filtering functions, DNT header checking
- Location: `src/utils/analytics.ts`, `src/analytics/`
- Characteristics: Data sanitization, cookie-less tracking

---

## Architecture Visualization

### High-Level System Architecture


### Component Tree Structure

```
<App>
├── <ErrorBoundary>
│   ├── <a href="#main"> (Skip link - accessibility)
│   ├── <Header>
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── <ThemeToggle>
│   │
│   ├── <main id="main">
│   │   ├── <Hero>
│   │   │   ├── <AnimatedElement>
│   │   │   └── <Button> (CTA)
│   │   │
│   │   ├── <Problem>
│   │   │   └── <AnimatedElement>
│   │   │
│   │   ├── <Solution>
│   │   │   └── <AnimatedElement>
│   │   │
│   │   ├── <Features>
│   │   │   ├── <AnimatedElement>
│   │   │   └── Feature cards with <Icon>
│   │   │
│   │   ├── <Mobile>
│   │   ├── <Statistics>
│   │   ├── <Comparison>
│   │   │
│   │   ├── <Testimonials>
│   │   │   └── Testimonial cards
│   │   │
│   │   ├── <EmailCapture>
│   │   │   └── Email form with validation
│   │   │
│   │   ├── <FAQ>
│   │   │   └── Expandable FAQ items
│   │   │
│   │   └── <CTA>
│   │       └── <Button>
│   │
│   ├── <Footer>
│   │   ├── Links
│   │   └── Social icons
│   │
│   └── <FeedbackWidget>
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW PATTERNS                            │
└──────────────────────────────────────────────────────────────────────┘

1. CONSTANTS → COMPONENTS (Static Data)
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │ src/constants/  │ ───▶ │    Component    │ ───▶ │   Rendered UI   │
   │ features.ts     │      │   <Features>    │      │  Feature cards  │
   │ pricing.ts      │      │   <Pricing>     │      │  Pricing tiers  │
   │ faq.ts          │      │   <FAQ>         │      │  FAQ items      │
   └─────────────────┘      └─────────────────┘      └─────────────────┘

2. USER INTERACTION → ANALYTICS (Event Tracking)
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │  User clicks    │ ───▶ │ trackEvent()    │ ───▶ │ sanitizeParams()│
   │  button/link    │      │ trackCTA()      │      │ filterPII()     │
   └─────────────────┘      └─────────────────┘      └────────┬────────┘
                                                              │
                                                              ▼
                                                     ┌─────────────────┐
                                                     │ window.gtag()   │
                                                     │ (GA4)           │
                                                     └─────────────────┘

3. THEME STATE → CSS VARIABLES (Theme Switching)
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │  useTheme()     │ ───▶ │ data-theme attr │ ───▶ │ CSS Variables   │
   │  toggleTheme()  │      │ on <html>       │      │ update colors   │
   └─────────────────┘      └─────────────────┘      └─────────────────┘

4. SCROLL POSITION → ANIMATIONS (Intersection Observer)
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │  User scrolls   │ ───▶ │ IntersectionObs │ ───▶ │ isVisible=true  │
   │                 │      │ threshold: 0.1  │      │ animate class   │
   └─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Core Architectural Components

### 1. Layout Components (`src/components/layout/`)

**Purpose:** Provide consistent page structure and navigation.

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| `Header` | Site navigation, branding | Sticky positioning, theme toggle, mobile menu |
| `Footer` | Site footer, links | Social links, legal links, copyright |
| `Section` | Reusable section wrapper | Background variants, padding options |

**Internal Structure (Header):**
```
Header/
├── Header.tsx          # Component logic, state management
├── Header.module.css   # Scoped styles
├── Header.test.tsx     # Unit tests
└── index.ts            # Public export
```

**Interaction Patterns:**
- Header uses `useTheme()` for dark mode toggle
- Header uses `useScrollPosition()` for sticky behavior
- Header uses `useMediaQuery()` for responsive menu

### 2. Section Components (`src/components/sections/`)

**Purpose:** Implement landing page content sections.

| Component | Responsibility | Data Source |
|-----------|---------------|-------------|
| `Hero` | Primary value proposition | Hardcoded content |
| `Features` | Feature showcase grid | `constants/features.ts` |
| `Pricing` | Pricing tier display | `constants/pricing.ts` |
| `Testimonials` | Customer testimonials | `constants/testimonials.ts` |
| `FAQ` | Expandable FAQ items | `constants/faq.ts` |
| `Comparison` | Competitor comparison | `constants/comparison.ts` |
| `EmailCapture` | Newsletter signup | Form state, API call |
| `CTA` | Final call-to-action | Hardcoded content |
| `Problem` | Problem statement | Hardcoded content |
| `Solution` | Solution pitch | Hardcoded content |
| `Statistics` | Metrics display | Hardcoded content |
| `Mobile` | Mobile-specific content | Hardcoded content |

**Internal Structure (Features):**
```
Features/
├── Features.tsx          # Maps FEATURES constant to cards
├── Features.module.css   # Grid layout, card styles
├── Features.test.tsx     # Render tests, accessibility
└── index.ts              # Export
```

### 3. UI Components (`src/components/ui/`)

**Purpose:** Reusable, atomic UI elements.

| Component | Responsibility | Variants/Props |
|-----------|---------------|----------------|
| `Button` | Interactive buttons | primary, secondary, ghost; sm, md, lg |
| `Icon` | Font Awesome wrapper | icon name, size, color |
| `AnimatedElement` | Scroll animations | fadeIn, slideUp, slideInLeft, slideInRight, scale |
| `ParallaxLayer` | Parallax effects | speed, disableOnMobile |
| `FloatingElement` | Float animations | duration, delay |
| `TextReveal` | Text reveal animation | delay, duration |
| `ThemeToggle` | Dark mode switch | Uses useTheme() |
| `FeedbackWidget` | Feedback collection | Expandable form |

**Component Composition Example:**
```tsx
<AnimatedElement animation="fadeIn" delay={200}>
  <Button variant="primary" size="lg">
    <Icon icon="rocket" />
    Get Started
  </Button>
</AnimatedElement>
```

### 4. Page Components (`src/components/pages/`)

**Purpose:** Full-page views for routes.

| Component | Route | Purpose |
|-----------|-------|---------|
| `Privacy` | /privacy | Privacy policy |
| `Terms` | /terms | Terms of service |
| `NotFoundPage` | /404 | 404 error page |
| `OfflinePage` | N/A | Offline fallback |
| `ServerErrorPage` | /500 | Server error page |

### 5. Custom Hooks (`src/hooks/`)

**Purpose:** Encapsulate reusable logic and cross-cutting concerns.

| Hook | Purpose | Returns |
|------|---------|---------|
| `useTheme()` | Theme management | `{ theme, toggleTheme }` |
| `useAnalytics()` | Analytics initialization | Tracking functions |
| `useIntersectionObserver()` | Scroll visibility | `{ ref, isVisible }` |
| `useParallax()` | Parallax calculation | `{ ref, offset, transform }` |
| `useMediaQuery()` | Responsive detection | `boolean` |
| `useReducedMotion()` | Motion preference | `boolean` |
| `useScrollPosition()` | Scroll tracking | `{ x, y }` |

### 6. Error Boundary (`src/components/ErrorBoundary/`)

**Purpose:** Global error catching and recovery.

**Features:**
- Catches render errors in child component tree
- Retry logic (max 3 retries before page reload)
- Development-only error details display
- Sentry integration for production error reporting

---

## Layers and Dependencies

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
│  Components (layout/, sections/, pages/, ui/)                           │
│  - React functional components                                          │
│  - CSS Modules for styling                                              │
│  - Props-based data flow                                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ uses
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                               │
│  Hooks (hooks/) + Analytics (analytics/)                                │
│  - Custom React hooks for shared logic                                  │
│  - Analytics event tracking and configuration                           │
│  - State management abstractions                                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ uses
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                            │
│  Utils (utils/) + Constants (constants/) + Styles (styles/)             │
│  - Pure utility functions (no React dependencies)                       │
│  - Static data constants                                                │
│  - CSS custom properties and global styles                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **Presentation → Application → Infrastructure**
   - Components may import from hooks, utils, constants, styles
   - Hooks may import from utils, constants
   - Utils and constants have no internal dependencies (leaf nodes)

2. **No Circular Dependencies**
   - Each layer only depends on layers below it
   - Enforced by directory structure and import conventions

3. **External Dependencies**
   - React and React DOM: Used in Presentation and Application layers
   - Font Awesome: Used in Presentation layer only
   - Sentry: Used in Infrastructure layer (monitoring utils)

### Dependency Matrix

| Module | Can Import From | Cannot Import From |
|--------|-----------------|-------------------|
| `components/` | hooks/, utils/, constants/, styles/ | - |
| `hooks/` | utils/, constants/ | components/ |
| `utils/` | constants/ | components/, hooks/ |
| `constants/` | - | components/, hooks/, utils/ |
| `styles/` | - | components/, hooks/, utils/, constants/ |
| `analytics/` | utils/, constants/ | components/, hooks/ |

---

## Data Architecture

### Domain Models

The application uses TypeScript interfaces to define data structures. All domain models are located in their respective constant files or component props interfaces.

#### Feature Model (`constants/features.ts`)

```typescript
interface Feature {
  icon: IconProp;           // Font Awesome icon identifier
  title: string;            // Feature name
  description: string;      // Feature description
  metric?: string;          // Optional performance metric
}
```

#### Pricing Plan Model (`constants/pricing.ts`)

```typescript
interface PricingPlan {
  name: string;             // Plan name (Free, Pro, Team)
  price: number | string;   // Monthly price
  period: string;           // Billing period
  features: string[];       // Included features list
  highlighted?: boolean;    // Featured plan flag
  cta: string;              // Call-to-action text
}
```

#### Testimonial Model (`constants/testimonials.ts`)

```typescript
interface Testimonial {
  quote: string;            // Testimonial text
  author: string;           // Author name
  role: string;             // Author title/role
  company?: string;         // Optional company name
  avatar?: string;          // Optional avatar URL
}
```

#### FAQ Model (`constants/faq.ts`)

```typescript
interface FAQItem {
  question: string;         // FAQ question
  answer: string;           // FAQ answer (may contain HTML)
}
```

### Data Access Patterns

**Pattern 1: Static Constants**

Most data is static and imported directly from constants:

```typescript
// Features.tsx
import { FEATURES } from '@constants/features';

export const Features = () => (
  <div className={styles.grid}>
    {FEATURES.map((feature, index) => (
      <FeatureCard key={index} {...feature} />
    ))}
  </div>
);
```

**Pattern 2: Form State**

Form data uses local component state:

```typescript
// EmailCapture.tsx
const [email, setEmail] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const validation = validateEmail(email);
  if (!validation.isValid) return;
  // Submit to API...
};
```

**Pattern 3: Persisted State**

Theme preference is persisted to localStorage:

```typescript
// useTheme.ts
const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored as 'light' | 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});

useEffect(() => {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

### Entity Relationships

```
┌─────────────────┐
│     App         │
└────────┬────────┘
         │ renders
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Features      │     │    Pricing      │     │  Testimonials   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │ maps                  │ maps                  │ maps
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Feature[]       │     │ PricingPlan[]   │     │ Testimonial[]   │
│ (constants)     │     │ (constants)     │     │ (constants)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Cross-Cutting Concerns

### 1. Error Handling

**Strategy:** Layered error handling with graceful degradation.

**Component Level (ErrorBoundary):**
```typescript
// Wraps entire app, catches render errors
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- Catches JavaScript errors in child component tree
- Displays user-friendly error message
- Retry button with max 3 attempts
- Auto page reload after max retries
- Sentry reporting in production

**Utility Level:**
```typescript
// Try-catch for analytics
try {
  window.gtag('event', eventName, params);
} catch (error) {
  console.error('Analytics error:', error);
}
```

### 2. Logging & Monitoring

**Development:**
- Console logging for analytics events
- React DevTools integration
- Vite HMR error overlay

**Production:**
- Sentry error monitoring (`@sentry/react`)
- Core Web Vitals tracking
- Custom error boundaries with reporting

**Configuration:**
```typescript
// src/utils/monitoring.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
});
```

### 3. Validation

**Email Validation (`utils/validation.ts`):**
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISPOSABLE_DOMAINS = ['tempmail.com', 'throwaway.com', ...];

export function validateEmail(email: string): ValidationResult {
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  const domain = email.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'Disposable emails not allowed' };
  }
  return { isValid: true };
}
```

**Input Sanitization (`utils/security.ts`):**
```typescript
export function sanitizeInput(input: string): string {
  return input
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;');
}
```

### 4. Authentication

**Status:** Not implemented (landing page only).

The landing page does not require authentication. Future app authentication will be handled separately.

### 5. Configuration Management

**Environment Variables:**

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SENTRY_DSN` | Sentry error reporting | Production only |
| `VITE_GA_ID` | Google Analytics ID | Production only |
| `VITE_BASE_URL` | Application base URL | Yes |

**File Structure:**
```
.env.example        # Template with all variables
.env.development    # Development defaults
.env.production     # Production values (not committed)
```

**Access Pattern:**
```typescript
const config = {
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  gaId: import.meta.env.VITE_GA_ID,
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://paperlyte.com',
};
```

### 6. Security

**Content Security Policy (CSP):**

Development (via Vite plugin):
```typescript
// Allows unsafe-eval for HMR
"script-src 'self' 'unsafe-eval'"
```

Production (via vercel.json/netlify.toml):
```json
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'"
}
```

**XSS Prevention:**
- Input sanitization via `sanitizeInput()`
- React's automatic escaping of JSX
- CSP headers blocking inline scripts

**Prototype Pollution Protection:**
```typescript
// utils/analytics.ts
function isSafePropertyKey(key: string): boolean {
  const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];
  return !UNSAFE_KEYS.includes(key);
}
```

---

## Service Communication Patterns

### External Services

The application communicates with the following external services:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVICE COMMUNICATION MAP                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────────────────────────────────────────┐
│   Browser   │ ──────▶ │              Netlify Functions                  │
│   Client    │ POST    │  /api/subscribe (email subscription)            │
└─────────────┘         └─────────────────────────────────────────────────┘
      │
      │ gtag()
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Google Analytics 4                               │
│  - Page views                                                           │
│  - Custom events (CTA clicks, form submissions)                         │
│  - Web Vitals metrics                                                   │
└─────────────────────────────────────────────────────────────────────────┘
      │
      │ Sentry.captureException()
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Sentry                                      │
│  - Error tracking                                                       │
│  - Performance monitoring                                               │
│  - Release tracking                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Communication Patterns

**Email Subscription API:**

```typescript
// EmailCapture component
const handleSubmit = async (email: string) => {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: sanitizeInput(email) }),
  });

  if (!response.ok) {
    throw new Error('Subscription failed');
  }

  return response.json();
};
```

**Analytics Event Tracking:**

```typescript
// utils/analytics.ts
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sanitizedParams = sanitizeAnalyticsParams(params);
  window.gtag('event', eventName, sanitizedParams);
}
```

### Resilience Strategies

**Graceful Degradation:**
- Analytics failures are caught and logged, not thrown
- Missing gtag doesn't break the application
- Sentry initialization failures don't affect core functionality

**Timeout Handling:**
- API calls use AbortController for timeouts
- Default timeout: 10 seconds for external API calls

**Offline Support:**
- OfflinePage component displays when offline
- Service worker can cache static assets (future enhancement)

---

## Technology-Specific Patterns (React)

### Component Composition

**Pattern: Wrapper Components**

Components wrap children to add behavior:

```typescript
// AnimatedElement wraps any content with scroll animation
<AnimatedElement animation="fadeIn">
  <div>Any content here</div>
</AnimatedElement>

// Section wraps content with consistent padding/background
<Section background="light" padding="lg">
  <Features />
</Section>
```

**Pattern: Compound Components**

Related components work together:

```typescript
// FAQ with expandable items
<FAQ>
  <FAQ.Item question="...">Answer</FAQ.Item>
  <FAQ.Item question="...">Answer</FAQ.Item>
</FAQ>
```

### State Management

**Pattern: Local Component State**

Simple useState for component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [email, setEmail] = useState('');
const [status, setStatus] = useState<Status>('idle');
```

**Pattern: Custom Hooks for Shared State**

Complex or shared logic extracted to hooks:

```typescript
// useTheme provides theme state and toggle
const { theme, toggleTheme } = useTheme();

// useIntersectionObserver provides visibility tracking
const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
```

**Pattern: No Global State Library**

The landing page doesn't require Redux, Zustand, or Context for global state. This keeps the bundle small and complexity low.

### Side Effects

**Pattern: useEffect for DOM Sync**

```typescript
// Sync theme to DOM attribute
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);

// Setup intersection observer
useEffect(() => {
  const observer = new IntersectionObserver(callback, options);
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

**Pattern: Cleanup Functions**

All effects with subscriptions include cleanup:

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}, []);
```

### Rendering Optimization

**Pattern: Conditional Animation**

Respect user preferences for reduced motion:

```typescript
const prefersReducedMotion = useReducedMotion();

return (
  <div className={prefersReducedMotion ? styles.static : styles.animated}>
    {children}
  </div>
);
```

**Pattern: Intersection Observer for Lazy Animations**

Only animate when visible:

```typescript
const { ref, isVisible } = useIntersectionObserver({ triggerOnce: true });

return (
  <div ref={ref} className={isVisible ? styles.visible : styles.hidden}>
    {children}
  </div>
);
```

**Pattern: CSS-Only Animations**

Prefer CSS animations over JavaScript for performance:

```css
/* CSS handles animation, React just toggles class */
.fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Data Fetching

**Pattern: Event-Driven Fetching**

Data is fetched on user action, not on mount:

```typescript
const handleSubmit = async () => {
  setStatus('loading');
  try {
    await fetch('/api/subscribe', { method: 'POST', body });
    setStatus('success');
    trackWaitlistSuccess();
  } catch {
    setStatus('error');
  }
};
```

The landing page doesn't use React Query, SWR, or similar libraries—simple fetch is sufficient for the limited API interactions.

---

## Implementation Patterns

### Component Implementation Pattern

**File Structure:**
```
ComponentName/
├── ComponentName.tsx        # Component implementation
├── ComponentName.module.css # Scoped styles
├── ComponentName.test.tsx   # Tests
└── index.ts                 # Public export
```

**Component Template:**
```typescript
// ComponentName.tsx
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ComponentName({
  children,
  variant = 'primary',
  className
}: ComponentNameProps) {
  return (
    <div className={`${styles.root} ${styles[variant]} ${className || ''}`}>
      {children}
    </div>
  );
}
```

**Index Export:**
```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Hook Implementation Pattern

**Template:**
```typescript
// useHookName.ts
import { useState, useEffect, useCallback } from 'react';

interface UseHookNameOptions {
  option1?: boolean;
  option2?: number;
}

interface UseHookNameReturn {
  value: string;
  setValue: (value: string) => void;
  isLoading: boolean;
}

export function useHookName(options: UseHookNameOptions = {}): UseHookNameReturn {
  const { option1 = true, option2 = 100 } = options;

  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Side effect logic
    return () => {
      // Cleanup
    };
  }, [option1, option2]);

  return { value, setValue, isLoading };
}
```

### Utility Function Pattern

**Template:**
```typescript
// utilityName.ts

/**
 * Description of what this utility does.
 * @param input - Description of input parameter
 * @returns Description of return value
 */
export function utilityName(input: string): string {
  // Implementation
  return result;
}
```

**Pure Functions:**
- No side effects
- No React dependencies
- Easily testable
- Can be used in any context

### CSS Module Pattern

**Naming Conventions:**
```css
/* ComponentName.module.css */

/* Root element */
.root { }

/* Variants */
.primary { }
.secondary { }

/* Sizes */
.small { }
.medium { }
.large { }

/* States */
.isActive { }
.isDisabled { }
.isLoading { }

/* Child elements */
.header { }
.content { }
.footer { }
```

**Design Token Usage:**
```css
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background: var(--color-primary);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
}

.button:hover {
  background: var(--color-primary-hover);
}
```

---

## Testing Architecture

### Test Strategy Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TESTING PYRAMID                                │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────┐
                        │    E2E      │  Playwright
                        │   Tests     │  (Critical paths)
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │   Integration       │  Vitest + Testing Library
                    │   Tests             │  (Component interactions)
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │              Unit Tests                    │  Vitest
         │  (Hooks, Utils, Pure functions)           │
         └───────────────────────────────────────────┘
```

### Unit Tests (Vitest)

**Location:** Colocated with source files (`*.test.ts`, `*.test.tsx`)

**Coverage Targets:**
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

**Example - Utility Test:**
```typescript
// validation.test.ts
describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(validateEmail('invalid').isValid).toBe(false);
  });

  it('rejects disposable domains', () => {
    expect(validateEmail('user@tempmail.com').isValid).toBe(false);
  });
});
```

**Example - Hook Test:**
```typescript
// useTheme.test.ts
describe('useTheme', () => {
  it('returns current theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(['light', 'dark']).toContain(result.current.theme);
  });

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme());
    const initial = result.current.theme;
    act(() => result.current.toggleTheme());
    expect(result.current.theme).not.toBe(initial);
  });
});
```

### Component Tests (Testing Library)

**Location:** Colocated with components (`*.test.tsx`)

**Example:**
```typescript
// Button.test.tsx
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies variant class', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('primary');
  });
});
```

### E2E Tests (Playwright)

**Location:** `tests/e2e/`

**Configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4173', // Preview server
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
```

**Example:**
```typescript
// landing-page.spec.ts
test('homepage loads and displays hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Paperlyte');
  await expect(page.getByRole('link', { name: /join.*waitlist/i })).toBeVisible();
});

test('email signup works', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

### Test Utilities

**Setup File (`src/test/setup.ts`):**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => cleanup());

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
```

---

## Deployment Architecture

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT TOPOLOGY                              │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────────────────────────────────────┐
    │   GitHub    │ push    │              GitHub Actions                  │
    │   Repo      │ ──────▶ │  - Lint & Type Check                        │
    │             │         │  - Unit Tests                                │
    │             │         │  - Build                                     │
    │             │         │  - E2E Tests                                 │
    │             │         │  - Lighthouse CI                             │
    └─────────────┘         └──────────────┬──────────────────────────────┘
                                           │
                            ┌──────────────┴──────────────┐
                            │                             │
                            ▼                             ▼
                  ┌─────────────────┐          ┌─────────────────┐
                  │    Netlify      │          │    Vercel       │
                  │   (Primary)     │          │  (Secondary)    │
                  │                 │          │                 │
                  │ - Static files  │          │ - Static files  │
                  │ - Functions     │          │ - Edge runtime  │
                  │ - Redirects     │          │ - Redirects     │
                  └────────┬────────┘          └────────┬────────┘
                           │                            │
                           └──────────────┬─────────────┘
                                          │
                                          ▼
                               ┌─────────────────┐
                               │   Cloudflare    │
                               │      CDN        │
                               │   (optional)    │
                               └─────────────────┘
```

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com"
        }
      ]
    }
  ]
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test -- --coverage
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli autorun
```

### Environment Configuration

| Environment | Purpose | Variables |
|-------------|---------|-----------|
| Development | Local development | `.env.development` |
| Preview | PR previews | Set in Netlify/Vercel |
| Production | Live site | `.env.production` (secrets in platform) |

---

## Extension and Evolution Patterns

### Adding a New Landing Page Section

**Steps:**

1. **Create component directory:**
   ```
   src/components/sections/NewSection/
   ├── NewSection.tsx
   ├── NewSection.module.css
   ├── NewSection.test.tsx
   └── index.ts
   ```

2. **Implement component:**
   ```typescript
   // NewSection.tsx
   import { AnimatedElement } from '@components/ui/AnimatedElement';
   import styles from './NewSection.module.css';

   export function NewSection() {
     return (
       <section className={styles.root} aria-labelledby="new-section-heading">
         <AnimatedElement animation="fadeIn">
           <h2 id="new-section-heading">Section Title</h2>
           {/* Content */}
         </AnimatedElement>
       </section>
     );
   }
   ```

3. **Add to App.tsx:**
   ```typescript
   import { NewSection } from '@components/sections/NewSection';

   // In render:
   <NewSection />
   ```

4. **Add tests:**
   ```typescript
   describe('NewSection', () => {
     it('renders heading', () => {
       render(<NewSection />);
       expect(screen.getByRole('heading')).toHaveTextContent('Section Title');
     });
   });
   ```

### Adding a New Custom Hook

**Steps:**

1. **Create hook file:**
   ```typescript
   // src/hooks/useNewHook.ts
   export function useNewHook(options?: Options): Return {
     // Implementation
   }
   ```

2. **Add types:**
   ```typescript
   interface Options {
     // ...
   }

   interface Return {
     // ...
   }
   ```

3. **Create tests:**
   ```typescript
   // src/hooks/useNewHook.test.ts
   describe('useNewHook', () => {
     it('returns expected value', () => {
       const { result } = renderHook(() => useNewHook());
       expect(result.current.value).toBeDefined();
     });
   });
   ```

### Adding a New External Integration

**Steps:**

1. **Add environment variable:**
   ```
   # .env.example
   VITE_NEW_SERVICE_KEY=your-key-here
   ```

2. **Create utility module:**
   ```typescript
   // src/utils/newService.ts
   const API_KEY = import.meta.env.VITE_NEW_SERVICE_KEY;

   export function initNewService() {
     if (!API_KEY) {
       console.warn('New service not configured');
       return;
     }
     // Initialize
   }
   ```

3. **Add to app initialization:**
   ```typescript
   // src/main.tsx or appropriate hook
   initNewService();
   ```

4. **Document in this blueprint.**

### Modifying Existing Components

**Guidelines:**

1. **Read existing tests first** - Understand expected behavior
2. **Maintain props interface compatibility** - Add optional props, don't remove
3. **Update tests** - Add tests for new behavior
4. **Update documentation** - Keep DESIGN-SYSTEM.md and this blueprint current

### Deprecation Pattern

When deprecating functionality:

```typescript
/**
 * @deprecated Use `newFunction` instead. Will be removed in v2.0.
 */
export function oldFunction() {
  console.warn('oldFunction is deprecated. Use newFunction instead.');
  return newFunction();
}
```

---

## Code Examples

### Example 1: Complete Component Implementation

```typescript
// src/components/ui/Card/Card.tsx
import { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'outlined';
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  onClick,
  className,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
      {...(onClick && { type: 'button' })}
    >
      {children}
    </Component>
  );
}
```

```css
/* src/components/ui/Card/Card.module.css */
.card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
}

.default {
  border: 1px solid var(--color-border);
}

.elevated {
  box-shadow: var(--shadow-md);
}

.outlined {
  border: 2px solid var(--color-primary);
}

button.card {
  cursor: pointer;
  width: 100%;
  text-align: left;
}

button.card:hover {
  transform: translateY(-2px);
}

button.card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Example 2: Custom Hook with Cleanup

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Example 3: Analytics Event Tracking

```typescript
// Tracking a CTA click with proper sanitization
import { trackEvent } from '@utils/analytics';

function CTAButton({ label, destination }: CTAButtonProps) {
  const handleClick = () => {
    trackEvent('cta_click', {
      label,
      destination,
      location: 'hero_section',
    });
    // Navigate...
  };

  return (
    <Button onClick={handleClick}>
      {label}
    </Button>
  );
}
```

### Example 4: Form with Validation

```typescript
// Email capture with validation and error handling
function EmailForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid email');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizeInput(email) }),
      });
      setStatus('success');
      trackEvent('waitlist_signup', { source: 'email_form' });
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return <p className={styles.success}>Thanks for signing up!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-describedby={error ? 'email-error' : undefined}
        aria-invalid={!!error}
      />
      {error && <p id="email-error" className={styles.error}>{error}</p>}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>
    </form>
  );
}
```

---

## Architectural Decision Records

### ADR-001: React 19 with Functional Components

**Status:** Accepted

**Context:** Need to choose a UI framework for the landing page.

**Decision:** Use React 19 with functional components and hooks.

**Consequences:**
- ✅ Modern React features (automatic batching, concurrent rendering)
- ✅ Familiar ecosystem for most frontend developers
- ✅ Excellent TypeScript support
- ✅ Large community and ecosystem
- ⚠️ Requires React 19 knowledge

### ADR-002: CSS Modules over CSS-in-JS

**Status:** Accepted

**Context:** Need a styling solution that is performant and maintainable.

**Decision:** Use CSS Modules with CSS custom properties (design tokens).

**Consequences:**
- ✅ Zero runtime overhead (styles compiled at build time)
- ✅ Scoped styles prevent naming conflicts
- ✅ Design tokens enable theming
- ✅ Standard CSS knowledge is sufficient
- ⚠️ No dynamic styles (use inline styles sparingly when needed)

### ADR-003: No Global State Library

**Status:** Accepted

**Context:** Need to decide on state management approach.

**Decision:** Use React hooks and local component state only. No Redux, Zustand, or Context API for global state.

**Consequences:**
- ✅ Smaller bundle size
- ✅ Simpler mental model
- ✅ Sufficient for landing page needs
- ⚠️ May need to revisit if app grows significantly

### ADR-004: Privacy-First Analytics

**Status:** Accepted

**Context:** Need to track user behavior while respecting privacy.

**Decision:** Implement cookie-less analytics with automatic PII filtering.

**Consequences:**
- ✅ GDPR/CCPA compliant by default
- ✅ No cookie consent banner needed
- ✅ User trust and transparency
- ⚠️ Less detailed user tracking (no cross-session identification)

### ADR-005: Dual Deployment (Netlify + Vercel)

**Status:** Accepted

**Context:** Need reliable hosting with good DX.

**Decision:** Use Netlify as primary host with Vercel as secondary.

**Consequences:**
- ✅ Redundancy if one platform has issues
- ✅ Free tier sufficient for traffic levels
- ✅ Built-in CI/CD, previews, and serverless functions
- ⚠️ Configuration maintained in two places

### ADR-006: Vitest + Playwright Testing Stack

**Status:** Accepted

**Context:** Need comprehensive testing solution.

**Decision:** Use Vitest for unit/integration tests, Playwright for E2E.

**Consequences:**
- ✅ Fast test execution (Vitest is Vite-native)
- ✅ Cross-browser E2E testing
- ✅ Good TypeScript support
- ✅ Compatible with Testing Library patterns

---

## Governance & Development Blueprint

### Code Quality Standards

#### TypeScript

- **Strict mode enabled** - All strict checks active
- **No `any` types** - Use `unknown` and type guards instead
- **Explicit return types** - For public functions
- **Interface over type** - For object shapes (when possible)

#### CSS

- **Use design tokens** - Never hardcode colors, spacing, fonts
- **Mobile-first** - Start with mobile styles, add breakpoints for larger screens
- **BEM-ish naming** - `.component`, `.component-element`, `.isState`

#### Testing

- **Test behavior, not implementation** - Focus on what users see/do
- **70% coverage minimum** - Enforced in CI
- **Accessibility tests** - Include in component tests

### Review Checklist

Before merging any PR:

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] Lighthouse scores maintained (>90 performance, >95 accessibility)
- [ ] Accessibility reviewed (keyboard nav, screen reader)
- [ ] Mobile responsiveness verified
- [ ] Documentation updated if needed

### Automated Checks

**Pre-commit:**
- ESLint
- Prettier
- TypeScript type check

**CI Pipeline:**
- Lint
- Type check
- Unit tests
- Build
- E2E tests
- Lighthouse CI
- Bundle size check

### Development Workflow

1. **Create feature branch** from `main`
2. **Implement changes** following patterns in this blueprint
3. **Write/update tests** for new functionality
4. **Run local checks** (`npm run lint && npm run test`)
5. **Create PR** with description of changes
6. **Address review feedback**
7. **Merge** after approval and CI pass

### New Feature Guidelines

When adding new features:

1. **Check alignment with principles** - Does it maintain simplicity? Performance? Accessibility?
2. **Design first** - Plan component structure before coding
3. **Start with tests** - Write test cases to define expected behavior
4. **Implement incrementally** - Small, focused commits
5. **Document** - Update relevant documentation

### Breaking Change Policy

- **Major version bump** - For breaking changes to component APIs
- **Migration guide** - Required for any breaking change
- **Deprecation period** - Minimum 1 minor version before removal

---

## Quick Reference

### Key File Locations

- **`src/components/`** - All React components organized by type (layout, sections, pages, ui)
- **`src/hooks/`** - Custom React hooks for reusable logic
- **`src/utils/`** - Utility functions (analytics, validation, monitoring, navigation)
- **`src/styles/`** - Global styles and CSS variables (reset.css, variables.css, typography.css)
- **`src/analytics/`** - Analytics configuration and providers
- **`src/constants/`** - Static data (features, pricing, testimonials, FAQ)
- **`netlify/functions/`** - Serverless functions for backend operations
- **`docs/`** - Comprehensive project documentation

### Common Tasks

- **Add a Component:**
  1. Create component file in appropriate subdirectory (e.g., `src/components/ui/MyComponent/MyComponent.tsx`)
  2. Create CSS module if needed (`MyComponent.module.css`)
  3. Define TypeScript props interface
  4. Export from index file for clean imports

- **Add a Custom Hook:**
  1. Create hook file in `src/hooks/` (e.g., `useMyHook.ts`)
  2. Follow naming convention: `use` prefix
  3. Add TypeScript types for parameters and return values
  4. Create corresponding test file (`useMyHook.test.ts`)

- **Track Analytics Event:**
  1. Import `trackEvent` from `src/utils/analytics.ts`
  2. Call with event name and optional properties: `trackEvent('Event_Name', { property: 'value' })`
  3. Use specific helpers when available: `trackCtaClick()`, `trackExternalLinkClick()`

- **Extend Design Tokens:**
  1. Add CSS custom property to `src/styles/variables.css`
  2. Follow naming convention: `--category-name` (e.g., `--color-primary`, `--spacing-lg`)
  3. Include both light and dark mode values if applicable
  4. Document in DESIGN-SYSTEM.md

- **Run Tests:**
  - Unit/Integration: `npm run test` (all tests) or `npm run test -- path/to/test.tsx` (specific test)
  - E2E: `npm run test:e2e` (headless) or `npm run test:e2e:ui` (with UI)
  - Coverage: `npm run test:coverage`
  - Watch mode: `npm run test -- --watch`

### NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

---

## Document Metadata

**Generated:** 2026-01-16
**Last Updated:** 2026-02-05
**Version:** 2.0

### Update Recommendations

This document should be reviewed and updated under the following circumstances:

- **New Major Features:** When significant new features are added (new sections, major integrations, architectural changes), update the relevant sections and component/hook counts.
- **Dependency Changes:** When major dependencies are added, upgraded, or removed (e.g., switching analytics providers, adding new frameworks), update the architectural characteristics and technical details.
- **Quarterly Reviews:** Schedule a quarterly review to ensure accuracy of metrics, file locations, and architectural descriptions. The codebase evolves, and the documentation should reflect current reality.
- **Component/Hook Count Variance:** When the number of components or hooks changes by more than 20% from documented counts, update the Executive Summary metrics to maintain accuracy.
- **Deployment Infrastructure Changes:** When deployment targets, CI/CD pipelines, or infrastructure patterns change, update the deployment sections immediately.

---

**Maintained by:** Paperlyte Engineering Team
**Questions?** See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
