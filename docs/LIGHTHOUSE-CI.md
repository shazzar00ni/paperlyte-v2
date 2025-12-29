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
  - Document: ≤18KB
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

```json
"chromeFlags": [
  "--no-sandbox",           // Required for containerized environments
  "--disable-gpu",          // Headless mode optimization
  "--disable-dev-shm-usage", // Prevent shared memory issues
  "--disable-software-rasterizer", // Performance optimization
  "--disable-extensions"     // Clean slate testing
]
```

## Running Locally

### Prerequisites

- Build the application first
- Ensure Chrome/Chromium is installed

### Commands

```bash
# Run Lighthouse CI (includes build)
npm run lighthouse

# Or manually
npm run build
npx @lhci/cli autorun --config=./.lighthouserc.json

# Validate configuration
npx @lhci/cli healthcheck --config=./.lighthouserc.json
```

## Interpreting Results

### On Pull Requests

1. Check the "Lighthouse CI" job in GitHub Actions
2. View the summary in the PR checks
3. Download artifacts for detailed HTML reports
4. Failed assertions will block the merge

### Viewing Detailed Reports

1. Go to Actions → CI/CD Pipeline → Latest run
2. Scroll to "Artifacts" section
3. Download `lighthouse-results`
4. Open `.lighthouseci/*.html` files in a browser

## Troubleshooting

### Build Fails on Performance

1. Check which metric failed in the CI logs
2. Run Lighthouse locally: `npm run lighthouse`
3. Review suggestions in the HTML report
4. Optimize the failing area (images, JS, CSS, etc.)
5. Test again locally before pushing

### Common Issues

**Chrome not found**
- In CI: Ensure `browser-actions/setup-chrome` step runs
- Locally: Install Chrome/Chromium

**Server won't start**
- Check build succeeded: `npm run build`
- Verify preview works: `npm run preview`
- Check port 4173 is available

**Inconsistent results**
- Lighthouse runs 3 times and averages scores
- Local results may differ from CI (different hardware)
- Focus on trends, not individual run variations

## Updating Budgets

When updating performance budgets:

1. Edit `.lighthouserc.json`
2. Test locally: `npm run lighthouse`
3. Commit changes with clear rationale
4. Monitor next few PRs for impact

### Budget Philosophy

- **Error level**: Critical metrics that define product value
- **Warn level**: Important but not deal-breakers
- **Off**: Metrics that don't apply or are too noisy

## Integration with Other Tools

Lighthouse CI complements other quality tools:

- **Bundle Size Check**: Validates JS/CSS size before Lighthouse runs
- **E2E Tests**: Ensures functionality before performance testing
- **Codecov**: Tracks test coverage
- **ESLint**: Catches code quality issues

## Best Practices

1. **Run locally** before pushing performance-sensitive changes
2. **Monitor trends** over time, not just individual scores
3. **Focus on user impact** - metrics should reflect real experience
4. **Iterate incrementally** - fix one issue at a time
5. **Document trade-offs** when relaxing budgets

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Performance Budgets Guide](https://web.dev/performance-budgets-101/)
