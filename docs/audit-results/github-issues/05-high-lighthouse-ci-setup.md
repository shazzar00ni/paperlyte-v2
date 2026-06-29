# [HIGH] Set up Lighthouse CI for automated performance monitoring

**Labels**: `priority:high`, `area:ci-cd`, `area:performance`

## Description
Lighthouse CI cannot currently run due to Chrome installation requirements. This prevents automated performance monitoring and creates risk of undetected performance regressions.

## Impact
- **Severity**: 🟠 HIGH PRIORITY
- **Risk**: Performance regressions undetected, no automated quality gates
- **Owner**: DevOps Team
- **Timeline**: Sprint 1

## Current Status
- ✅ Configuration file exists: `.lighthouserc.json`
- ✅ Performance thresholds defined
- ❌ Cannot run in current environment (missing Chrome)
- ❌ No automated CI/CD integration

## Lighthouse Performance Thresholds

From `.lighthouserc.json`:
```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "performance": ["error", {"minScore": 0.90}],
        "accessibility": ["error", {"minScore": 0.95}],
        "best-practices": ["error", {"minScore": 0.90}],
        "seo": ["error", {"minScore": 0.90}]
      }
    }
  }
}
```

### Core Web Vitals Targets
- First Contentful Paint (FCP): ≤2000ms
- Largest Contentful Paint (LCP): ≤2500ms
- Cumulative Layout Shift (CLS): ≤0.1
- Total Blocking Time (TBT): ≤300ms
- Speed Index: ≤3000ms

## Implementation Plan

### Phase 1: CI/CD Integration (Week 1)
- [ ] Add Chrome installation to CI/CD pipeline
- [ ] Configure GitHub Actions workflow for Lighthouse CI
- [ ] Set up temporary URL deployment for PR previews
- [ ] Run Lighthouse against PR preview URLs
- [ ] Add Lighthouse CI to PR checks

### Phase 2: Baseline Establishment (Week 1-2)
- [ ] Run 3+ manual Lighthouse audits against paperlyte.com
- [ ] Document baseline scores in audit report
- [ ] Establish performance budgets based on baseline
- [ ] Set up Lighthouse CI server (optional)

### Phase 3: Monitoring & Alerts (Week 2-3)
- [ ] Configure performance budget enforcement
- [ ] Set up performance regression alerts
- [ ] Create performance dashboard
- [ ] Document Lighthouse CI workflow in README

## GitHub Actions Workflow Example

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli@0.13.x

      - name: Run Lighthouse CI
        run: |
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: .lighthouseci
```

## Manual Testing (Immediate Action)

Until CI is set up, perform manual audits:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit against production
lighthouse https://paperlyte.com \
  --output html \
  --output json \
  --output-path ./lighthouse-report \
  --chrome-flags="--headless" \
  --quiet

# Run multiple times for consistency (recommended: 3-5 runs)
for i in {1..3}; do
  lighthouse https://paperlyte.com \
    --output json \
    --output-path ./lighthouse-run-$i.json
done
```

## Acceptance Criteria
- [ ] Chrome successfully installs in CI/CD environment
- [ ] Lighthouse CI runs on every PR
- [ ] Performance scores displayed in PR checks
- [ ] Baseline scores documented in audit report
- [ ] Performance budgets enforced in CI
- [ ] Regression alerts configured
- [ ] Documentation updated with Lighthouse workflow

## Next Actions (Immediate)
1. Run 3+ manual Lighthouse audits against paperlyte.com
2. Document actual scores in baseline audit report
3. Create GitHub Actions workflow for automated Lighthouse CI
4. Test workflow on a feature branch

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 105-108, 328-333)
