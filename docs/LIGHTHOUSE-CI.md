# Lighthouse CI Configuration

This document explains the Lighthouse CI setup for automated performance monitoring in the Paperlyte project.

## Overview

Lighthouse CI runs automated performance, accessibility, SEO, and best practices audits on every pull request and push to main/develop branches. This ensures the application maintains its "lightning-fast" promise.

## Configuration Files

### `.lighthouserc.json`

The main configuration file that defines:

- **Collection Settings**: Runs 3 audits for statistical reliability
- **Chrome Flags**: Optimized for CI environments with headless Chrome
- **Performance Budgets**: Strict thresholds aligned with project goals
- **Upload Target**: Results stored in temporary public storage

### Performance Budgets

#### Critical Metrics (Error Level)

These metrics will **fail the build** if not met:

| Metric | Target | Rationale |
|--------|--------|-----------|
| Performance Score | ≥90 | Core value proposition |
| Accessibility Score | ≥95 | WCAG 2.1 AA compliance |
| First Contentful Paint (FCP) | ≤2000ms | User perception of speed |
| Largest Contentful Paint (LCP) | ≤2500ms | Core Web Vital |
| Cumulative Layout Shift (CLS) | ≤0.1 | Core Web Vital |
| Total Blocking Time (TBT) | ≤300ms | Interactivity measure |
| Speed Index | ≤3000ms | Visual completeness |
| Time to Interactive (TTI) | ≤3500ms | Full interactivity |

#### Warning Metrics

These generate warnings but don't fail the build:

- **Best Practices Score**: ≥90
- **SEO Score**: ≥90
- **Max Potential FID**: ≤130ms
- **Bundle Sizes**:
  - Scripts: ≤150KB (gzipped)
  - Stylesheets: ≤30KB (gzipped)
  - Document: ≤17.58KB
  - Total: ≤300KB

#### Resource Optimization Warnings

- Responsive images
- Offscreen images
- Optimized images
- Modern image formats (WebP/AVIF)
- Text compression
- Unused CSS/JavaScript
- Font display optimization

## GitHub Actions Integration

### Workflow: `.github/workflows/ci.yml`

The Lighthouse CI job runs as part of the main CI/CD pipeline:

1. **Triggers**: Pull requests and pushes to main/develop
2. **Dependencies**: Runs after successful build
3. **Chrome Setup**: Installs stable Chrome via `browser-actions/setup-chrome`
4. **Execution**: Uses `@lhci/cli` from package.json (v0.15.1)
5. **Artifacts**: Uploads detailed results for 30 days
6. **Summary**: Adds results to PR summary

### Chrome Flags

Optimized for CI environments:
