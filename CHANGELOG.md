# Changelog

All notable changes to Paperlyte will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_All changes have been released in version 1.0.0. This section will track future unreleased changes._

### Added

- N/A

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- Overrode `axios` to version `1.13.5` to resolve a high-severity Denial of Service (DoS) vulnerability (GHSA-43fc-jf86-j433).

## [1.0.0] - 2025-12-22

### Added

#### Landing Page Sections

- Hero section with value proposition and CTA
- Features section showcasing 6 core features
- Comparison section with competitor feature table
- Testimonials section with customer reviews
- FAQ section with comprehensive Q&A
- Pricing section with transparent tier breakdown
- Statistics section with animated counters
- Mobile section highlighting mobile features
- CTA section with email capture and download buttons

#### UI Components

- Button component with multiple variants (primary, secondary, ghost) and icon support
- Icon component for Font Awesome integration with type-safe icon library
- AnimatedElement for scroll-based animations with intersection observer
- TextReveal for text animation with staggered reveal effects
- ParallaxLayer for hardware-accelerated parallax scrolling
- FloatingElement for animated floating UI elements
- SVGPathAnimation for smooth SVG path drawing animations
- CounterAnimation for number counters with easing
- EmailCapture for newsletter signup with validation
- FeedbackWidget for user feedback collection
- ThemeToggle for dark/light mode with system preference detection

#### Layout Components

- Header component with sticky navigation and mobile menu
- Footer component with links, social media, and legal info
- Section wrapper with consistent spacing
- ErrorBoundary for graceful error handling

#### Page Components

- NotFoundPage (404) with custom error page
- ServerErrorPage (500) for server errors
- OfflinePage for offline fallback experience
- Privacy policy page
- Terms of service page

#### Custom Hooks

- useIntersectionObserver for viewport detection
- useMediaQuery for responsive design breakpoint detection
- useReducedMotion for accessibility-aware animation control
- useParallax for smooth parallax scrolling effects
- useScrollPosition for scroll position tracking and throttling
- useTheme for theme management with persistence
- useAnalytics for analytics event tracking

#### Design System

- Comprehensive design system documentation (3195+ lines)
- Blue accent color (#3B82F6) with paper-inspired palette
- Dual typography system (Inter for UI, Playfair Display for headlines)
- CSS custom properties for theming
- Consistent spacing system using rem units (0.5rem/8px base increment)
- Responsive breakpoints (480px, 768px, 1024px, 1280px, 1440px)
- Dark mode support with system preference detection
- Pill-shaped button design (border-radius: 9999px)

#### Testing Infrastructure

- Vitest test runner with ESM support
- React Testing Library for component testing
- @testing-library/user-event for realistic user interaction simulation
- Code coverage with v8 (@vitest/coverage-v8)
- 40+ comprehensive test suites

#### Analytics & Monitoring

- Provider-agnostic analytics adapter pattern
- Plausible Analytics integration (ready to configure)
- Custom event tracking for user interactions
- Scroll depth measurement
- Web Vitals automatic performance monitoring
- Error tracking for client-side errors

#### Security Features

- Content Security Policy (CSP) headers
- HTTPS-only resource loading
- Automated vulnerability scanning via Dependabot
- Security.txt at /.well-known/security.txt
- Input validation for XSS and injection prevention
- Secure headers (X-Frame-Options, X-Content-Type-Options)

#### Documentation

- README.md with project overview and quick start
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md for community guidelines
- CODEOWNERS for code ownership
- CLAUDE.md for AI-assisted development
- README-ENV.md for environment variables
- DESIGN-SYSTEM.md (3195 lines)
- MARKETING-PLAN.md with complete strategy
- REQUIRED-IMAGE-ASSETS.md with asset specifications
- LEGAL-COMPLIANCE-CHECKLIST.md (1518 lines)
- LEGAL-SETUP.md with legal documentation guide
- PRIVACY-POLICY.md
- TERMS-OF-SERVICE.md
- ACCEPTABLE-USE.md
- COOKIE-POLICY.md
- DMCA.md
- AUDIT-REPORT.md
- GITHUB-WORKFLOWS-PLAN.md (1130 lines)
- CONVERTKIT-SETUP.md for email marketing
- ACCESSIBILITY.md for compliance documentation
- DEPLOYMENT.md with deployment guide
- INFRASTRUCTURE_SETUP.md
- SECURITY.md for vulnerability reporting
- SECURITY_REVIEW.md with audit findings

#### CI/CD & Infrastructure

- GitHub Actions CI workflow (.github/workflows/ci.yml)
- Weekly performance report workflow
- Lighthouse CI integration (.lighthouserc.json)
- Netlify configuration (netlify.toml)
- Vercel configuration (vercel.json)
- Dependabot configuration for automated dependency updates
- Netlify Functions for newsletter subscription

#### Utility Functions & Services

- Analytics tracking and conversion monitoring
- Environment variable management with type safety
- Icon library management for Font Awesome
- Meta tags utilities for SEO and social sharing
- Error monitoring and performance tracking
- Navigation utilities with smooth scroll
- Sitemap generation script
- Icon generation script
- Date injection script
- Legal placeholder validation script

#### Assets & Media

- Favicons (16x16, 32x32, ICO, SVG)
- Apple Touch Icons (180x180)
- Android Chrome icons (192x192, 512x512)
- Web app manifest (site.webmanifest)
- Open Graph image (og-image.svg)
- Twitter Card image (twitter-image.svg)
- Note detail mockup SVG
- Notes list mockup SVG
- Image optimization scripts

#### Configuration & Tooling

- ESLint flat config with TypeScript and React plugins
- Prettier code formatting
- PostCSS with Autoprefixer
- TypeScript strict mode configuration
- Bundle size limits (150KB JS, 30KB CSS gzipped)
- Size-limit for bundle size enforcement
- Environment variable templates (.env.example)
- Git ignore patterns
- Prettier ignore patterns

#### SEO & Meta

- Semantic HTML5 structure
- Structured data (JSON-LD)
- Dynamic meta tags with Open Graph and Twitter Cards
- Sitemap generation (sitemap.xml)
- Robots.txt configuration
- Canonical URLs

#### Performance Optimizations

- Vite build system for fast development and optimized builds
- Automatic code splitting
- Asset minification (JS/CSS)
- Hardware-accelerated CSS transforms
- Lazy loading for components and images
- Bundle size limits enforcement
- Lighthouse CI for automated audits

### Changed

- Upgraded to React 19.2.3
- Upgraded to TypeScript 5.9.3
- Upgraded to Vite 7.3.0
- Enhanced project structure with organized component hierarchy
- Improved build process with automated icon generation and sitemap creation

### Fixed

- CSS duplication in design system documented
- Security vulnerabilities addressed (PR #169)
- Issue #55 resolved (PR #179)

### Security

- Implemented Content Security Policy
- Added automated Dependabot vulnerability scanning
- Configured secure HTTP headers
- Added input validation and XSS prevention
- Established security.txt for responsible disclosure
- GDPR/CCPA compliance implementation

## [0.0.0] - 2025-01-XX

### Added

- Initial project setup with Vite, React 19, and TypeScript
- ESLint configuration with React and TypeScript rules
- Basic project structure and build configuration

---

## Version History Format

### [Version] - YYYY-MM-DD

### Added

- New features and capabilities

### Changed

- Changes to existing functionality

### Deprecated

- Features that will be removed in future versions

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security vulnerability fixes and improvements
