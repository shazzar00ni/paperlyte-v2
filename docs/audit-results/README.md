# Performance Audit Results

This directory contains performance audit reports and baseline metrics for Paperlyte v2.

## Contents

- **`baseline-performance-audit.md`** - Complete Phase 1 audit report with build metrics, bundle analysis, and optimization recommendations
- **`asset-inventory.md`** - Detailed inventory of all assets with optimization opportunities
- **`README.md`** - This file - instructions for conducting manual Lighthouse audits

## Manual Lighthouse Audit Instructions

Since automated Lighthouse audits require Chrome in a headless environment, manual audits must be conducted against the production site.

### Prerequisites

- Google Chrome (latest version recommended)
- Access to https://paperlyte.com or staging deployment
- Chrome DevTools knowledge

### How to Run Manual Lighthouse Audits

#### Step 1: Open Chrome DevTools

1. Navigate to **https://paperlyte.com** in Google Chrome
2. Open DevTools (F12 or Cmd+Option+I on Mac)
3. Click on the **"Lighthouse"** tab
   - If you don't see it, click the `>>` icon and select Lighthouse

#### Step 2: Configure Lighthouse

**Recommended Settings:**
- **Mode:** Navigation (Default)
- **Device:** Desktop (matches .lighthouserc.json config)
- **Categories:** Check all boxes:
  - ✅ Performance
  - ✅ Accessibility
  - ✅ Best Practices
  - ✅ SEO
  - ✅ Progressive Web App (optional)

**Throttling Settings (Match CI Config):**
- Click "⚙️ Settings" gear icon
- Set throttling to match `.lighthouserc.json`:
  - RTT: 40ms
  - Throughput: 10,240 Kbps (10 Mbps)
  - CPU Slowdown: 1x

#### Step 3: Run Audit

1. Click **"Analyze page load"**
2. Wait for audit to complete (~30-60 seconds)
3. Review results in DevTools

#### Step 4: Save Report

**Save HTML Report:**
1. After audit completes, click the **"⬇ Download report"** icon (top right)
2. Choose **"Save as HTML"**
3. Save to this directory (`docs/audit-results/`) with naming convention:
   - `lighthouse-manual-run1-YYYY-MM-DD.html`
   - `lighthouse-manual-run2-YYYY-MM-DD.html`
   - `lighthouse-manual-run3-YYYY-MM-DD.html`

**Example:**
- `lighthouse-manual-run1-2025-12-22.html`
- `lighthouse-manual-run2-2025-12-22.html`
- `lighthouse-manual-run3-2025-12-22.html`

#### Step 5: Repeat

**Run at least 3 audits** to account for variance:
- Performance scores can vary ±5 points between runs
- Take the median score for baseline metrics
- Note any consistent issues across all runs

### Metrics to Document

From each Lighthouse report, record the following:

#### Lighthouse Scores (0-100)
- [ ] Performance score
- [ ] Accessibility score
- [ ] Best Practices score
- [ ] SEO score

#### Core Web Vitals
- [ ] **LCP** (Largest Contentful Paint) - Target: ≤ 2.5s
- [ ] **CLS** (Cumulative Layout Shift) - Target: ≤ 0.1
- [ ] **FCP** (First Contentful Paint) - Target: ≤ 2.0s

#### Additional Metrics
- [ ] **TBT** (Total Blocking Time) - Target: ≤ 300ms
- [ ] **Speed Index** - Target: ≤ 3.0s
- [ ] **TTI** (Time to Interactive)
- [ ] **TTFB** (Time to First Byte)

### Recording Results

**Option 1: Update baseline-performance-audit.md**
Add a new section with manual audit results:

```markdown
## Manual Lighthouse Audit Results

### Run 1 (YYYY-MM-DD)
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100
- LCP: X.XXs
- CLS: 0.XXX
- FCP: X.XXs
- TBT: XXXms
- Speed Index: X.XXs

### Run 2 (YYYY-MM-DD)
[Same format]

### Run 3 (YYYY-MM-DD)
[Same format]

### Median Baseline
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100
- LCP: X.XXs
- CLS: 0.XXX
```

**Option 2: Create new markdown file**
Create `manual-lighthouse-results.md` with detailed findings.

## Target Scores (from .lighthouserc.json)

These are the targets configured in the project's Lighthouse CI config:

| Metric | Target | Type |
|--------|--------|------|
| Performance Score | ≥ 90 | warn |
| Accessibility Score | ≥ 95 | warn |
| Best Practices Score | ≥ 90 | warn |
| SEO Score | ≥ 90 | warn |
| First Contentful Paint | ≤ 2000ms | warn |
| Largest Contentful Paint | ≤ 2500ms | warn |
| Cumulative Layout Shift | ≤ 0.1 | warn |
| Total Blocking Time | ≤ 300ms | warn |
| Speed Index | ≤ 3000ms | warn |

**Note:** Assertions are set to "warn" (not "error") to allow development progress while tracking performance.

## Common Issues to Look For

Based on the baseline audit, watch for:

### Performance
- ❌ **Large JavaScript bundles** - React vendor bundle is 186 KB uncompressed
- ❌ **Unoptimized images** - Large PNGs without WebP/AVIF versions
- ❌ **Font loading** - No `font-display: swap` implemented
- ❌ **Missing lazy loading** - All images load eagerly

### Accessibility
- Check for proper ARIA labels
- Verify keyboard navigation
- Confirm color contrast ratios
- Review semantic HTML structure

### Best Practices
- Verify HTTPS usage
- Check for console errors
- Review deprecated APIs
- Confirm modern image formats usage

### SEO
- Verify meta descriptions
- Check structured data
- Review crawlability
- Confirm mobile-friendliness

## Real User Monitoring (RUM)

**Note:** Lighthouse runs in a lab environment and may not reflect real-world performance.

### Web Vitals from Real Users

To capture real user Core Web Vitals:

1. Use Chrome UX Report (CrUX) data if available
2. Implement web-vitals library for RUM
3. Monitor Field Data vs Lab Data differences

**FID/INP Measurement:**
- FID (First Input Delay) and INP (Interaction to Next Paint) can only be measured in the field
- Lighthouse estimates responsiveness but cannot measure actual user interactions
- Consider implementing RUM for complete CWV tracking

## Next Steps After Manual Audits

1. Save all 3 HTML reports to this directory
2. Document median scores in baseline report
3. Compare results to targets in .lighthouserc.json
4. Identify performance gaps
5. Prioritize optimization work
6. Create GitHub issues for critical findings
7. Re-audit after implementing optimizations

## Questions?

- Review Lighthouse documentation: https://developer.chrome.com/docs/lighthouse/
- Check Web Vitals guide: https://web.dev/vitals/
- See project targets: `/docs/DESIGN-SYSTEM.md` (Performance section)
- Reference config: `/.lighthouserc.json`

---

**Last Updated:** December 22, 2025
**Phase:** 1 - Performance Audit Execution
**Status:** Baseline established, manual audits pending
