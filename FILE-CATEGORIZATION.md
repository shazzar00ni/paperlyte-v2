# File Categorization: Scope Analysis

This document categorizes all files to identify which should belong to which PR.

## PR #1: Core Features (Issues #24, #20, #22)
**Accessibility Fixes, ConvertKit Integration, Performance Optimization**

### Accessibility Fixes (Issue #24)
- `src/components/ErrorBoundary/ErrorBoundary.tsx` - Error boundary implementation
- `src/components/ErrorBoundary/ErrorBoundary.module.css` - Error boundary styles
- `src/components/ErrorBoundary/index.ts` - Error boundary exports
- Component updates for accessibility (ARIA fixes, keyboard navigation):
  - `src/components/layout/Header/Header.tsx`
  - `src/components/ui/Button/Button.tsx`
  - `src/components/ui/Icon/Icon.tsx`
  - `src/components/ui/ThemeToggle/ThemeToggle.tsx`

### ConvertKit Integration (Issue #20)
- `src/components/ui/EmailCapture/EmailCapture.tsx` - Email capture component
- `src/components/ui/EmailCapture/EmailCapture.module.css` - Email capture styles
- `src/components/ui/EmailCapture/index.ts` - Email capture exports
- `netlify/functions/subscribe.ts` - ConvertKit serverless function
- `docs/CONVERTKIT-SETUP.md` - ConvertKit setup documentation
- Minimal `src/constants/legal.ts` updates for privacy link (if needed for GDPR compliance)

### Performance Optimization (Issue #22)
- `vite.config.ts` - Build optimizations with Terser, code splitting
- `.lighthouserc.json` - Lighthouse CI configuration
- Icon optimization changes in `src/components/ui/Icon/`
- React.memo usage in components
- Component performance improvements

---

## PR #2: Legal & Compliance Infrastructure (SCOPE CREEP)
**All files that should be in a SEPARATE PR**

### Legal Documentation
- `LEGAL-COMPLIANCE-CHECKLIST.md` - Comprehensive legal checklist
- `docs/LEGAL-SETUP.md` - Legal setup guide
- `docs/PRIVACY-POLICY.md` - Privacy policy documentation
- `docs/TERMS-OF-SERVICE.md` - Terms of service documentation
- `docs/SECURITY.md` - Security documentation
- `docs/ACCEPTABLE-USE.md` - Acceptable use policy
- `docs/COOKIE-POLICY.md` - Cookie policy
- `docs/DMCA.md` - DMCA policy
- `.well-known/security.txt` - Security.txt file

### Legal HTML Pages
- `public/privacy.html` - Privacy policy page
- `public/terms.html` - Terms of service page

### Email Templates & Auto-responders
- `templates/email/README.md` - Email templates documentation
- `templates/email/dpo-auto-responder.txt` - DPO auto-responder
- `templates/email/privacy-auto-responder.txt` - Privacy auto-responder
- `templates/email/security-auto-responder.txt` - Security auto-responder
- `templates/email/support-auto-responder.txt` - Support auto-responder

### Legal Scripts & Tools
- `scripts/check-legal-placeholders.ts` - Legal placeholder validation
- `scripts/inject-dates.js` - Legal document date injection

---

## PR #3: Analytics & Monitoring Infrastructure (SCOPE CREEP)
**Optional: Could be combined with PR #2 or separate**

### Analytics
- `src/utils/analytics.ts` - Analytics utility
- `src/global.d.ts` - Global type definitions for analytics
- Analytics integration in:
  - `src/App.tsx` (analytics.init())
  - `src/components/ui/EmailCapture/EmailCapture.tsx` (trackEvent calls)

### Monitoring & Error Tracking
- `src/utils/monitoring.ts` - Monitoring and error reporting
- Monitoring integration in:
  - `src/components/ErrorBoundary/ErrorBoundary.tsx` (logError calls)

---

## PR #4: SEO & Environment Infrastructure (SCOPE CREEP)
**Optional: Could be combined with PR #2 or separate**

### SEO Infrastructure
- `public/robots.txt` - Robots.txt file
- `public/sitemap.xml` - Sitemap
- `public/site.webmanifest` - Web app manifest
- `scripts/generate-sitemap.js` - Sitemap generation (ES modules)
- `scripts/generate-sitemap.cjs` - Sitemap generation (CommonJS)

### Environment Configuration
- `.env.development` - Development environment vars
- `.env.example` - Environment variables template
- `.env.production` - Production environment vars
- `README-ENV.md` - Environment configuration guide
- `src/utils/env.ts` - Environment utilities

### PostCSS Configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` updates for postcss/autoprefixer dependencies

---

## PR #5: Design System Documentation (SCOPE CREEP)
**Optional: Could be standalone or combined**

### Documentation
- `docs/DESIGN-SYSTEM.md` - Comprehensive design system documentation
- `docs/AUDIT-REPORT.md` - Technical audit report
- `docs/CHANGELOG.md` - Changelog documentation

---

## Recommended Approach

### Option A: Two PRs
1. **PR #107 (Original)**: Issues #24, #20, #22 only - Core features
2. **PR #XXX (New)**: All scope creep - Legal, analytics, SEO, docs

### Option B: Four PRs
1. **PR #107 (Original)**: Issues #24, #20, #22 only
2. **PR #XXX (Legal)**: Legal compliance infrastructure
3. **PR #XXX (Analytics)**: Analytics & monitoring
4. **PR #XXX (Infrastructure)**: SEO, environment, design docs

### Option C: Current State (NOT RECOMMENDED)
- Keep everything in one PR - violates single responsibility principle

---

## Files Modified Across Multiple Concerns

Some files have changes that span multiple PRs:

### `src/App.tsx`
- **PR #1**: Error boundary wrapper (accessibility)
- **PR #3**: Analytics initialization (scope creep)

### `src/components/ui/EmailCapture/EmailCapture.tsx`
- **PR #1**: Email capture component (ConvertKit integration)
- **PR #3**: Analytics tracking (scope creep)

### `src/constants/legal.ts`
- **PR #1**: Minimal config for EmailCapture GDPR link
- **PR #2**: Comprehensive legal configuration (scope creep)

### `package.json` & `package-lock.json`
- **PR #1**: Dependencies for core features
- **PR #2**: PostCSS dependencies (scope creep)

### `index.html`
- **PR #2**: site.webmanifest link (scope creep)

### Recommendation for Mixed Files
- **Split the changes**: Each PR should only include the relevant changes
- **For legal.ts**: PR #1 gets minimal placeholder config, PR #2 gets full implementation
- **For App.tsx**: PR #1 gets ErrorBoundary, PR #3 gets analytics
- **For EmailCapture**: PR #1 gets component without tracking, PR #3 adds tracking

---

## Summary

**Current State**: 43 files changed, mixing 5 different concerns
**Recommended**: Split into 2-4 focused PRs

**Immediate Action**: 
This PR should contain ONLY the scope creep files (PR #2-5 above), while the core features (PR #1) should remain in the original PR or be moved to a different branch.
