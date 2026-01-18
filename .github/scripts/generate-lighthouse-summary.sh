#!/bin/bash
set -e

echo "## 🔦 Lighthouse CI Results" >> "$GITHUB_STEP_SUMMARY"
echo "" >> "$GITHUB_STEP_SUMMARY"

if [ -f .lighthouseci/manifest.json ]; then
  # Find the representative run from manifest (the one used for assertions)
  REPORT_FILE=$(jq -r '.[] | select(.isRepresentativeRun == true) | .jsonPath' .lighthouseci/manifest.json | head -1)

  if [ -f "$REPORT_FILE" ]; then
    echo "### 📊 Lighthouse Scores" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"

    # Extract scores using jq (available in GitHub Actions by default)
    # Use // 0 to provide fallback for null/missing scores
    PERF_SCORE=$(jq -r '(.categories.performance.score // 0) * 100 | floor' "$REPORT_FILE")
    A11Y_SCORE=$(jq -r '(.categories.accessibility.score // 0) * 100 | floor' "$REPORT_FILE")
    BP_SCORE=$(jq -r '(.categories["best-practices"].score // 0) * 100 | floor' "$REPORT_FILE")
    SEO_SCORE=$(jq -r '(.categories.seo.score // 0) * 100 | floor' "$REPORT_FILE")

    # Determine pass/fail with emoji
    PERF_STATUS=$([ "$PERF_SCORE" -ge 90 ] && echo "✅" || echo "❌")
    A11Y_STATUS=$([ "$A11Y_SCORE" -ge 95 ] && echo "✅" || echo "❌")
    BP_STATUS=$([ "$BP_SCORE" -ge 90 ] && echo "✅" || echo "⚠️")
    SEO_STATUS=$([ "$SEO_SCORE" -ge 90 ] && echo "✅" || echo "⚠️")

    {
      echo "| Category | Score | Status | Target |"
      echo "|----------|-------|--------|--------|"
      echo "| 🚀 Performance | **${PERF_SCORE}** | ${PERF_STATUS} | ≥90 |"
      echo "| ♿ Accessibility | **${A11Y_SCORE}** | ${A11Y_STATUS} | ≥95 |"
      echo "| ✨ Best Practices | **${BP_SCORE}** | ${BP_STATUS} | ≥90 |"
      echo "| 🔍 SEO | **${SEO_SCORE}** | ${SEO_STATUS} | ≥90 |"
      echo ""
    } >> "$GITHUB_STEP_SUMMARY"

    echo "### ⚡ Core Web Vitals" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"

    # Extract Core Web Vitals metrics
    FCP=$(jq -r '(.audits["first-contentful-paint"].numericValue // 0) | floor' "$REPORT_FILE")
    LCP=$(jq -r '(.audits["largest-contentful-paint"].numericValue // 0) | floor' "$REPORT_FILE")
    CLS=$(jq -r '(.audits["cumulative-layout-shift"].numericValue // 0)' "$REPORT_FILE")
    TBT=$(jq -r '(.audits["total-blocking-time"].numericValue // 0) | floor' "$REPORT_FILE")
    SI=$(jq -r '(.audits["speed-index"].numericValue // 0) | floor' "$REPORT_FILE")
    TTI=$(jq -r '(.audits.interactive.numericValue // 0) | floor' "$REPORT_FILE")

    # Determine pass/fail for metrics
    FCP_STATUS=$([ "$FCP" -le 2000 ] && echo "✅" || echo "❌")
    LCP_STATUS=$([ "$LCP" -le 2500 ] && echo "✅" || echo "❌")
    CLS_STATUS=$(awk -v cls="$CLS" 'BEGIN {print (cls <= 0.1) ? "✅" : "❌"}')
    TBT_STATUS=$([ "$TBT" -le 300 ] && echo "✅" || echo "❌")
    SI_STATUS=$([ "$SI" -le 3000 ] && echo "✅" || echo "❌")
    TTI_STATUS=$([ "$TTI" -le 3500 ] && echo "✅" || echo "❌")

    echo "| Metric | Value | Status | Budget |" >> "$GITHUB_STEP_SUMMARY"
    echo "|--------|-------|--------|--------|" >> "$GITHUB_STEP_SUMMARY"
    echo "| First Contentful Paint | ${FCP}ms | ${FCP_STATUS} | ≤2000ms |" >> "$GITHUB_STEP_SUMMARY"
    echo "| Largest Contentful Paint | ${LCP}ms | ${LCP_STATUS} | ≤2500ms |" >> "$GITHUB_STEP_SUMMARY"
    echo "| Cumulative Layout Shift | ${CLS} | ${CLS_STATUS} | ≤0.1 |" >> "$GITHUB_STEP_SUMMARY"
    echo "| Total Blocking Time | ${TBT}ms | ${TBT_STATUS} | ≤300ms |" >> "$GITHUB_STEP_SUMMARY"
    echo "| Speed Index | ${SI}ms | ${SI_STATUS} | ≤3000ms |" >> "$GITHUB_STEP_SUMMARY"
    echo "| Time to Interactive | ${TTI}ms | ${TTI_STATUS} | ≤3500ms |" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"

    # Overall status - check all critical metrics including CLS and TTI
    CLS_PASS=$(awk -v cls="$CLS" 'BEGIN {print (cls <= 0.1) ? 1 : 0}')
    if [ "$PERF_SCORE" -ge 90 ] && [ "$A11Y_SCORE" -ge 95 ] && \
       [ "$FCP" -le 2000 ] && [ "$LCP" -le 2500 ] && \
       [ "$CLS_PASS" -eq 1 ] && [ "$TBT" -le 300 ] && [ "$SI" -le 3000 ] && \
       [ "$TTI" -le 3500 ]; then
      echo "### ✅ All critical performance budgets met!" >> "$GITHUB_STEP_SUMMARY"
    else
      echo "### ❌ Some performance budgets were not met" >> "$GITHUB_STEP_SUMMARY"
    fi

    echo "" >> "$GITHUB_STEP_SUMMARY"
    echo "📊 Full Lighthouse report available in artifacts" >> "$GITHUB_STEP_SUMMARY"
  else
    echo "⚠️ Lighthouse report file not found" >> "$GITHUB_STEP_SUMMARY"
  fi
else
  echo "❌ Lighthouse CI failed to generate results" >> "$GITHUB_STEP_SUMMARY"
fi
