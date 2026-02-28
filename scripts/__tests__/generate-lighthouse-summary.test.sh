#!/bin/bash
# Tests for .github/scripts/generate-lighthouse-summary.sh
# Run with: bash scripts/__tests__/generate-lighthouse-summary.test.sh

set -euo pipefail

SCRIPT="$(cd "$(dirname "$0")/../.." && pwd)/.github/scripts/generate-lighthouse-summary.sh"
PASS=0
FAIL=0

# ─── Minimal test harness ────────────────────────────────────────────────────

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc"
    echo "     expected: $expected"
    echo "     actual:   $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local desc="$1" needle="$2" haystack="$3"
  if echo "$haystack" | grep -qF "$needle"; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc"
    echo "     expected to contain: $needle"
    echo "     actual output:       $haystack"
    FAIL=$((FAIL + 1))
  fi
}

# Run the script in a tmp working directory; echo the GITHUB_STEP_SUMMARY text.
run_script() {
  local tmpdir="$1"
  local summary_file="$tmpdir/summary.txt"
  GITHUB_STEP_SUMMARY="$summary_file" bash "$SCRIPT" 2>/dev/null || true
  cat "$summary_file" 2>/dev/null || true
}

# Returns the exit code of the script (0 or non-zero), suppressing set -e.
run_script_exit_code() {
  local tmpdir="$1"
  local summary_file="$tmpdir/summary.txt"
  GITHUB_STEP_SUMMARY="$summary_file" bash "$SCRIPT" 2>/dev/null
  echo $?
}

# ─── Fixture helpers ──────────────────────────────────────────────────────────

# Minimal .lighthouserc.json - thresholds the script reads
make_lighthouserc() {
  local dir="$1"
  cat > "$dir/.lighthouserc.json" <<'JSON'
{
  "ci": {
    "collect": { "url": ["http://localhost/"] },
    "assert": {
      "assertions": {
        "categories:performance":        ["error", { "minScore": 0.9 }],
        "categories:accessibility":      ["error", { "minScore": 0.95 }],
        "categories:best-practices":     ["warn",  { "minScore": 0.9 }],
        "categories:seo":                ["warn",  { "minScore": 0.9 }],
        "first-contentful-paint":        ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint":      ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift":       ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time":           ["error", { "maxNumericValue": 300 }],
        "speed-index":                   ["error", { "maxNumericValue": 3000 }],
        "interactive":                   ["error", { "maxNumericValue": 3500 }],
        "uses-responsive-images":        "warn"
      }
    }
  }
}
JSON
}

# Minimal Lighthouse JSON report
make_lhr() {
  local path="$1" cls_value="$2"
  mkdir -p "$(dirname "$path")"
  cat > "$path" <<JSON
{
  "categories": {
    "performance":    { "score": 0.95 },
    "accessibility":  { "score": 0.97 },
    "best-practices": { "score": 0.92 },
    "seo":            { "score": 0.91 }
  },
  "audits": {
    "first-contentful-paint":    { "numericValue": 900 },
    "largest-contentful-paint":  { "numericValue": 1800 },
    "cumulative-layout-shift":   { "numericValue": ${cls_value} },
    "total-blocking-time":       { "numericValue": 50 },
    "speed-index":               { "numericValue": 1200 },
    "interactive":               { "numericValue": 2100 }
  }
}
JSON
}

# manifest.json pointing to the LHR file
make_manifest() {
  local dir="$1" lhr_path="$2"
  mkdir -p "$dir/.lighthouseci"
  cat > "$dir/.lighthouseci/manifest.json" <<JSON
[
  { "url": "http://localhost/", "isRepresentativeRun": true, "jsonPath": "${lhr_path}" }
]
JSON
}

# ─── Test 1: Missing manifest exits 0 and writes a graceful error ────────────

echo ""
echo "Test 1: missing Lighthouse manifest"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

# Only create the config; no .lighthouseci directory at all
make_lighthouserc "$T"

output=$(cd "$T" && run_script "$T")
exit_code=$(cd "$T" && run_script_exit_code "$T" || echo $?)

assert_contains \
  "summary contains graceful error message" \
  "Lighthouse CI failed to generate results" \
  "$output"

assert_eq \
  "script exits 0 (graceful, not a hard failure)" \
  "0" \
  "$exit_code"

rm -rf "$T"; trap - EXIT

# ─── Test 2a: CLS below threshold → ✅ ───────────────────────────────────────

echo ""
echo "Test 2a: CLS 0.08 (below 0.1 budget) should show ✅"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

LHR="$T/.lighthouseci/lhr-1.json"
make_lighthouserc "$T"
make_lhr "$LHR" "0.08"
make_manifest "$T" "$LHR"

output=$(cd "$T" && run_script "$T")

assert_contains \
  "CLS row contains ✅ when cls (0.08) ≤ threshold (0.1)" \
  "Cumulative Layout Shift | 0.08 | ✅" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 2b: CLS above threshold → ❌ ───────────────────────────────────────

echo ""
echo "Test 2b: CLS 0.15 (above 0.1 budget) should show ❌"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

LHR="$T/.lighthouseci/lhr-1.json"
make_lighthouserc "$T"
make_lhr "$LHR" "0.15"
make_manifest "$T" "$LHR"

output=$(cd "$T" && run_script "$T")

assert_contains \
  "CLS row contains ❌ when cls (0.15) > threshold (0.1)" \
  "Cumulative Layout Shift | 0.15 | ❌" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 2c: string-format assertion ("warn") is ignored and falls back ─────

echo ""
echo "Test 2c: string-format assertion does not crash threshold extraction"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

LHR="$T/.lighthouseci/lhr-1.json"
make_lighthouserc "$T"   # already has "uses-responsive-images": "warn"
make_lhr "$LHR" "0.05"
make_manifest "$T" "$LHR"

output=$(cd "$T" && run_script "$T")

assert_contains \
  "script produces a Scores table despite string-format assertions" \
  "Lighthouse Scores" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"
echo ""

[ "$FAIL" -eq 0 ]   # non-zero exit when any assertion fails
