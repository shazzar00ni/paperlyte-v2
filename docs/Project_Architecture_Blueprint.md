# Project Architecture Blueprint

## Introduction

This document serves as a comprehensive architectural reference for the Paperlyte landing page application. It covers the complete technical architecture including component structure, styling system, state management patterns, analytics implementation, testing strategy, and deployment infrastructure.

**Target Audience:** This document is designed for developers who need to understand, maintain, or extend the Paperlyte landing page codebase. Whether you're implementing new features, debugging issues, or onboarding to the project, this blueprint provides the strategic architectural vision and technical patterns used throughout the application.

**Relationship to DESIGN-SYSTEM.md:** While this document focuses on architectural patterns and strategic technical decisions, the [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) provides tactical implementation details for the visual design system including colors, typography, spacing, and component styling guidelines. These documents are complementary—reference this blueprint for "how the system is architected" and the design system for "how components should look and behave visually."

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
   - User privacy is a fundamental design constraint, not a feature. The application uses cookie-less analytics (Plausible), respects Do Not Track headers, never stores PII, and implements comprehensive data sanitization throughout the codebase.

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
   - **28+ components** organized by feature (layout, sections, pages, ui)
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
   - **Plausible Analytics** integration (cookie-less, GDPR-compliant)
   - **DNT (Do Not Track) header respect** built into tracking logic
   - **Automatic PII stripping** from all analytics events
   - **No user identification** or session tracking
   - **Sentry error monitoring** with privacy safeguards in production

5. **Comprehensive Testing**
   - **Vitest** for unit and integration tests of components and hooks
   - **Playwright** for end-to-end testing across browsers and configurations
   - **Test coverage reporting** with coverage thresholds
   - **Accessibility testing** integrated into test suites
   - **Visual regression testing** for UI components

6. **Dual-Platform Deployment**
   - **Netlify** primary deployment with serverless functions
   - **Vercel** secondary deployment for redundancy
   - **Automated CI/CD** via GitHub Actions
   - **Environment-specific configuration** (.env files)
   - **Performance monitoring** via Lighthouse CI

---

## Quick Reference

### Key File Locations

- **`src/components/`** - All React components organized by type (layout, sections, pages, ui)
- **`src/hooks/`** - Custom React hooks for reusable logic
- **`src/utils/`** - Utility functions (analytics, validation, monitoring, navigation)
- **`src/styles/`** - Global styles and CSS variables (reset.css, variables.css, typography.css)
- **`src/analytics/`** - Analytics configuration and providers
- **`netlify/functions/`** - Serverless functions for backend operations (email subscription)
- **`docs/`** - Comprehensive project documentation including this blueprint

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

---

## Document Metadata

**Generated:** 2026-01-16  
**Last Updated:** 2026-01-16  
**Version:** 1.0

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
