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

#### Production Targets (Aspirational)

These are the quality goals for production on real hardware and networks:

| Metric                         | Target  | Rationale                |
| ------------------------------ | ------- | ------------------------ |
| Performance Score              | ≥90     | Core value proposition   |
| Accessibility Score            | ≥95     | WCAG 2.1 AA compliance   |
| First Contentful Paint (FCP)   | ≤2000ms | User perception of speed |
| Largest Contentful Paint (LCP) | ≤2500ms | Core Web Vital           |
| Cumulative Layout Shift (CLS)  | ≤0.1    | Core Web Vital           |
| Total Blocking Time (TBT)      | ≤300ms  | Interactivity measure    |
| Speed Index                    | ≤3000ms | Visual completeness      |
| Time to Interactive (TTI)      | ≤3500ms | Full interactivity       |

#### CI Enforcement Thresholds

GitHub Actions shared runners have constrained CPU and no GPU, producing lower scores than real devices. The thresholds in `.lighthouserc.json` are relaxed to avoid false failures while still catching significant regressions:

| Metric                         | CI Threshold | Level | Rationale                          |
| ------------------------------ | ------------ | ----- | ---------------------------------- |
| Performance Score              | ≥70          | error | Catches major regressions on CI    |
| Accessibility Score            | ≥82          | error | Structural a11y gate              |
| Best Practices Score           | ≥80          | warn  | Advisory only                      |
| SEO Score                      | ≥80          | warn  | Advisory only                      |
| First Contentful Paint (FCP)   | ≤4500ms      | error | CI-adjusted (2× headroom)         |
| Largest Contentful Paint (LCP) | ≤6000ms      | error | CI-adjusted (2.4× headroom)       |
| Cumulative Layout Shift (CLS)  | ≤0.25        | error | CI-adjusted                        |
| Total Blocking Time (TBT)      | ≤1200ms      | error | CI-adjusted (4× headroom)         |
| Speed Index                    | ≤5500ms      | error | CI-adjusted                        |
| Time to Interactive (TTI)      | ≤8000ms      | error | CI-adjusted                        |

> **Note:** Production targets should be validated manually using Chrome DevTools Lighthouse or [PageSpeed Insights](https://pagespeed.web.dev/) against the deployed site. CI thresholds are a safety net, not a quality bar.

#### Warning Metrics

These generate warnings but don't fail the build:

- **Best Practices Score**: ≥80 (CI) / ≥90 (production target)
- **SEO Score**: ≥80 (CI) / ≥90 (production target)
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
