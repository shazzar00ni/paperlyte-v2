#!/bin/bash
set -e

{
  echo "## 🔦 Lighthouse CI Results"
  echo ""
} >> "$GITHUB_STEP_SUMMARY"

if [ -f .lighthouseci/manifest.json ]; then
  # Find the representative run from manifest (the one used for assertions)
  REPORT_FILE=$(jq -r '.[] | select(.isRepresentativeRun == true) | .jsonPath' .lighthouseci/manifest.json | head -1)

  # Validate that REPORT_FILE is non-empty and not "null"
  if [ -z "$REPORT_FILE" ] || [ "$REPORT_FILE" = "null" ]; then
    echo "❌ No representative run found in Lighthouse manifest" >> "$GITHUB_STEP_SUMMARY"
    exit 1
  fi

  if [ -f "$REPORT_FILE" ]; then
    # Extract thresholds dynamically from .lighthouserc.json with fallback defaults
    PERF_THRESHOLD=$(jq -r '(.ci.assert.assertions["categories:performance"][1].minScore // 0.9) * 100 | floor' .lighthouserc.json)
    A11Y_THRESHOLD=$(jq -r '(.ci.assert.assertions["categories:accessibility"][1].minScore // 0.95) * 100 | floor' .lighthouserc.json)
    BP_THRESHOLD=$(jq -r '(.ci.assert.assertions["categories:best-practices"][1].minScore // 0.9) * 100 | floor' .lighthouserc.json)
    SEO_THRESHOLD=$(jq -r '(.ci.assert.assertions["categories:seo"][1].minScore // 0.9) * 100 | floor' .lighthouserc.json)
    FCP_THRESHOLD=$(jq -r '(.ci.assert.assertions["first-contentful-paint"][1].maxNumericValue // 2000) | floor' .lighthouserc.json)
    LCP_THRESHOLD=$(jq -r '(.ci.assert.assertions["largest-contentful-paint"][1].maxNumericValue // 2500) | floor' .lighthouserc.json)
    CLS_THRESHOLD=$(jq -r '.ci.assert.assertions["cumulative-layout-shift"][1].maxNumericValue // 0.1' .lighthouserc.json)
    TBT_THRESHOLD=$(jq -r '(.ci.assert.assertions["total-blocking-time"][1].maxNumericValue // 300) | floor' .lighthouserc.json)
    SI_THRESHOLD=$(jq -r '(.ci.assert.assertions["speed-index"][1].maxNumericValue // 3000) | floor' .lighthouserc.json)
    TTI_THRESHOLD=$(jq -r '(.ci.assert.assertions.interactive[1].maxNumericValue // 3500) | floor' .lighthouserc.json)

    {
      echo "### 📊 Lighthouse Scores"
      echo ""
    } >> "$GITHUB_STEP_SUMMARY"

    # Extract scores using jq (available in GitHub Actions by default)
    # Use // 0 to provide fallback for null/missing scores
    PERF_SCORE=$(jq -r '(.categories.performance.score // 0) * 100 | floor' "$REPORT_FILE")
    A11Y_SCORE=$(jq -r '(.categories.accessibility.score // 0) * 100 | floor' "$REPORT_FILE")
    BP_SCORE=$(jq -r '(.categories["best-practices"].score // 0) * 100 | floor' "$REPORT_FILE")
    SEO_SCORE=$(jq -r '(.categories.seo.score // 0) * 100 | floor' "$REPORT_FILE")

    # Determine pass/fail with emoji using dynamic thresholds
    PERF_STATUS=$([ "$PERF_SCORE" -ge "$PERF_THRESHOLD" ] && echo "✅" || echo "❌")
    A11Y_STATUS=$([ "$A11Y_SCORE" -ge "$A11Y_THRESHOLD" ] && echo "✅" || echo "❌")
    BP_STATUS=$([ "$BP_SCORE" -ge "$BP_THRESHOLD" ] && echo "✅" || echo "⚠️")
    SEO_STATUS=$([ "$SEO_SCORE" -ge "$SEO_THRESHOLD" ] && echo "✅" || echo "⚠️")

    {
      echo "| Category | Score | Status | Target |"
      echo "|----------|-------|--------|--------|"
      echo "| 🚀 Performance | **${PERF_SCORE}** | ${PERF_STATUS} | ≥${PERF_THRESHOLD} |"
      echo "| ♿ Accessibility | **${A11Y_SCORE}** | ${A11Y_STATUS} | ≥${A11Y_THRESHOLD} |"
      echo "| ✨ Best Practices | **${BP_SCORE}** | ${BP_STATUS} | ≥${BP_THRESHOLD} |"
      echo "| 🔍 SEO | **${SEO_SCORE}** | ${SEO_STATUS} | ≥${SEO_THRESHOLD} |"
      echo ""
    } >> "$GITHUB_STEP_SUMMARY"

    {
      echo "### ⚡ Core Web Vitals"
      echo ""
    } >> "$GITHUB_STEP_SUMMARY"

    # Extract Core Web Vitals metrics
    FCP=$(jq -r '(.audits["first-contentful-paint"].numericValue // 0) | floor' "$REPORT_FILE")
    LCP=$(jq -r '(.audits["largest-contentful-paint"].numericValue // 0) | floor' "$REPORT_FILE")
    CLS=$(jq -r '(.audits["cumulative-layout-shift"].numericValue // 0)' "$REPORT_FILE")
    TBT=$(jq -r '(.audits["total-blocking-time"].numericValue // 0) | floor' "$REPORT_FILE")
    SI=$(jq -r '(.audits["speed-index"].numericValue // 0) | floor' "$REPORT_FILE")
    TTI=$(jq -r '(.audits.interactive.numericValue // 0) | floor' "$REPORT_FILE")

    # Determine pass/fail for metrics using dynamic thresholds
    FCP_STATUS=$([ "$FCP" -le "$FCP_THRESHOLD" ] && echo "✅" || echo "❌")
    LCP_STATUS=$([ "$LCP" -le "$LCP_THRESHOLD" ] && echo "✅" || echo "❌")
    CLS_STATUS=$(awk -v cls="$CLS" -v threshold="$CLS_THRESHOLD" 'BEGIN {print (cls <= threshold) ? "✅" : "❌"}')
    TBT_STATUS=$([ "$TBT" -le "$TBT_THRESHOLD" ] && echo "✅" || echo "❌")
    SI_STATUS=$([ "$SI" -le "$SI_THRESHOLD" ] && echo "✅" || echo "❌")
    TTI_STATUS=$([ "$TTI" -le "$TTI_THRESHOLD" ] && echo "✅" || echo "❌")

    {
      echo "| Metric | Value | Status | Budget |"
      echo "|--------|-------|--------|--------|"
      echo "| First Contentful Paint | ${FCP}ms | ${FCP_STATUS} | ≤${FCP_THRESHOLD}ms |"
      echo "| Largest Contentful Paint | ${LCP}ms | ${LCP_STATUS} | ≤${LCP_THRESHOLD}ms |"
      echo "| Cumulative Layout Shift | ${CLS} | ${CLS_STATUS} | ≤${CLS_THRESHOLD} |"
      echo "| Total Blocking Time | ${TBT}ms | ${TBT_STATUS} | ≤${TBT_THRESHOLD}ms |"
      echo "| Speed Index | ${SI}ms | ${SI_STATUS} | ≤${SI_THRESHOLD}ms |"
      echo "| Time to Interactive | ${TTI}ms | ${TTI_STATUS} | ≤${TTI_THRESHOLD}ms |"
      echo ""
    } >> "$GITHUB_STEP_SUMMARY"

    # Overall status - check all critical metrics including CLS and TTI using dynamic thresholds
    CLS_PASS=$(awk -v cls="$CLS" -v threshold="$CLS_THRESHOLD" 'BEGIN {print (cls <= threshold) ? 1 : 0}')
    if [ "$PERF_SCORE" -ge "$PERF_THRESHOLD" ] && [ "$A11Y_SCORE" -ge "$A11Y_THRESHOLD" ] && \
       [ "$FCP" -le "$FCP_THRESHOLD" ] && [ "$LCP" -le "$LCP_THRESHOLD" ] && \
       [ "$CLS_PASS" -eq 1 ] && [ "$TBT" -le "$TBT_THRESHOLD" ] && [ "$SI" -le "$SI_THRESHOLD" ] && \
       [ "$TTI" -le "$TTI_THRESHOLD" ]; then
      echo "### ✅ All critical performance budgets met!" >> "$GITHUB_STEP_SUMMARY"
    else
      echo "### ❌ Some performance budgets were not met" >> "$GITHUB_STEP_SUMMARY"
    fi

    {
      echo ""
      echo "📊 Full Lighthouse report available in artifacts"
    } >> "$GITHUB_STEP_SUMMARY"
  else
    echo "⚠️ Lighthouse report file not found" >> "$GITHUB_STEP_SUMMARY"
  fi
else
  echo "❌ Lighthouse CI failed to generate results" >> "$GITHUB_STEP_SUMMARY"
fi
