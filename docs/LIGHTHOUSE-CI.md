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

CI assertion thresholds are intentionally relaxed compared to the project's
production quality goals to account for variability on shared GitHub Actions
runners. The app itself consistently exceeds the strict production targets in
real environments (Netlify/Vercel deploy previews regularly score 96+ performance
and 100 accessibility).

#### Critical Metrics (Error Level)

These metrics will **fail the build** if not met. The "CI Threshold" column shows
what `.lighthouserc.json` actually enforces; the "Production Goal" column shows the
aspirational target documented in `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md`.

| Metric                         | CI Threshold | Production Goal | Rationale                |
| ------------------------------ | ------------ | --------------- | ------------------------ |
| Performance Score              | ≥70          | ≥90             | Core value proposition   |
| Accessibility Score            | ≥82          | ≥95             | WCAG 2.1 AA compliance   |
| First Contentful Paint (FCP)   | ≤4500ms      | ≤2000ms         | User perception of speed |
| Largest Contentful Paint (LCP) | ≤6000ms      | ≤2500ms         | Core Web Vital           |
| Cumulative Layout Shift (CLS)  | ≤0.25        | ≤0.1            | Core Web Vital           |
| Total Blocking Time (TBT)      | ≤1200ms      | ≤300ms          | Interactivity measure    |
| Speed Index                    | ≤5500ms      | ≤3000ms         | Visual completeness      |
| Time to Interactive (TTI)      | ≤8000ms      | ≤3500ms         | Full interactivity       |

#### Warning Metrics

These generate warnings but don't fail the build:

- **Best Practices Score**: ≥80 (production goal: ≥90)
- **SEO Score**: ≥80 (production goal: ≥90)
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
