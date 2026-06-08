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

# Run the script in a tmp working directory once, capturing both the
# GITHUB_STEP_SUMMARY contents and the exit code into caller-visible globals
# (LAST_OUTPUT, LAST_EXIT_CODE). Avoids invoking the script twice per test
# (which would also append duplicate content to the summary file via `>>`).
run_script_capture() {
  local tmpdir="$1"
  local summary_file="$tmpdir/summary.txt"
  LAST_EXIT_CODE=0
  GITHUB_STEP_SUMMARY="$summary_file" bash "$SCRIPT" 2>/dev/null || LAST_EXIT_CODE=$?
  LAST_OUTPUT="$(cat "$summary_file" 2>/dev/null || true)"
}

# Run capture from a specific directory in the current shell so the globals
# assigned by run_script_capture are visible to callers (set -u safe).
run_script_capture_in_dir() {
  local dir="$1"
  local old_pwd
  old_pwd="$(pwd)"
  cd "$dir"
  run_script_capture "$dir"
  cd "$old_pwd"
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

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

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

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"

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

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"

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

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"

assert_contains \
  "script produces a Scores table despite string-format assertions" \
  "Lighthouse Scores" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 3: Manifest exists but no representative run → exit 1 + ❌ message ──
#
# PR change: previously exit 0 (graceful), now exit 1 (hard failure) so that
# the CI job fails when Lighthouse produces a manifest with no representative run.
# The error emoji was also changed from ⚠️ to ❌ to reflect the severity.

echo ""
echo "Test 3: manifest exists but no run has isRepresentativeRun=true → exit 1"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

make_lighthouserc "$T"
mkdir -p "$T/.lighthouseci"
# Manifest with every entry marked as NOT the representative run
cat > "$T/.lighthouseci/manifest.json" <<'JSON'
[
  { "url": "http://localhost/", "isRepresentativeRun": false, "jsonPath": "/tmp/lhr.json" }
]
JSON

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

assert_eq \
  "script exits 1 when no representative run found (regression guard: was exit 0)" \
  "1" \
  "$exit_code"

assert_contains \
  "summary contains ❌ error message (not ⚠️) when no representative run found" \
  "❌ No representative run found in Lighthouse manifest" \
  "$output"

# Regression guard: the old ⚠️ message must not appear (pre-PR behaviour).
if echo "$output" | grep -qF "⚠️ No representative run found"; then
  echo "  ❌ regression: old ⚠️ warning message found (should be ❌ error)"
  FAIL=$((FAIL + 1))
else
  echo "  ✅ old ⚠️ warning message is absent (correct post-PR behaviour)"
  PASS=$((PASS + 1))
fi

rm -rf "$T"; trap - EXIT

# ─── Test 4: Manifest entry has jsonPath: null → exit 1 ──────────────────────
#
# When the representative entry exists but its jsonPath is JSON null, jq emits
# the literal string "null". The script guards against this with:
#   [ "$REPORT_FILE" = "null" ]

echo ""
echo "Test 4: manifest representative entry has jsonPath: null → exit 1"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

make_lighthouserc "$T"
mkdir -p "$T/.lighthouseci"
# Representative run is present, but jsonPath is JSON null → jq -r prints "null".
cat > "$T/.lighthouseci/manifest.json" <<'JSON'
[
  { "url": "http://localhost/", "isRepresentativeRun": true, "jsonPath": null }
]
JSON

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

assert_eq \
  "script exits 1 when jsonPath is the literal string \"null\"" \
  "1" \
  "$exit_code"

assert_contains \
  "summary contains ❌ error message when jsonPath is null" \
  "❌ No representative run found in Lighthouse manifest" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 5: Manifest is an empty array [] → exit 1 ──────────────────────────
#
# For an empty manifest, jq produces no output and REPORT_FILE becomes an empty
# string. The [ -z "$REPORT_FILE" ] guard should therefore trigger the same
# hard-failure path as other "no representative run" scenarios.

echo ""
echo "Test 5: manifest is [] so REPORT_FILE is empty → exit 1"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

make_lighthouserc "$T"
mkdir -p "$T/.lighthouseci"
cat > "$T/.lighthouseci/manifest.json" <<'JSON'
[]
JSON

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

assert_eq \
  "script exits 1 when manifest is [] (REPORT_FILE is empty)" \
  "1" \
  "$exit_code"

assert_contains \
  "summary contains ❌ error message when manifest is []" \
  "❌ No representative run found in Lighthouse manifest" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 6: Representative entry with empty-string jsonPath → exit 1 ─────────
#
# If jq somehow emits an empty string (e.g. a blank jsonPath field) the
# [ -z "$REPORT_FILE" ] guard must catch it and hard-fail, just like the
# "null" string case tested in Test 4.  This tests the -z branch specifically
# rather than the = "null" branch.

echo ""
echo "Test 6: representative entry with empty-string jsonPath → exit 1 (-z guard)"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

make_lighthouserc "$T"
mkdir -p "$T/.lighthouseci"
# jsonPath is "" → jq -r prints an empty line → REPORT_FILE=""
cat > "$T/.lighthouseci/manifest.json" <<'JSON'
[
  { "url": "http://localhost/", "isRepresentativeRun": true, "jsonPath": "" }
]
JSON

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

assert_eq \
  "script exits 1 when jsonPath is an empty string (tests -z guard)" \
  "1" \
  "$exit_code"

assert_contains \
  "summary contains ❌ error message when jsonPath is empty string" \
  "❌ No representative run found in Lighthouse manifest" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Test 7: Multi-entry manifest, only one representative → success ──────────
#
# A realistic Lighthouse CI run produces several entries (one per URL or retry).
# Only the entry with isRepresentativeRun=true should be used. This test verifies
# that the script correctly picks the representative entry even when other entries
# with isRepresentativeRun=false precede it, and completes without error.

echo ""
echo "Test 7: multi-entry manifest with mixed isRepresentativeRun flags → exit 0"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

LHR="$T/.lighthouseci/lhr-rep.json"
make_lighthouserc "$T"
make_lhr "$LHR" "0.05"
mkdir -p "$T/.lighthouseci"
cat > "$T/.lighthouseci/manifest.json" <<JSON
[
  { "url": "http://localhost/", "isRepresentativeRun": false, "jsonPath": "/nonexistent/lhr-1.json" },
  { "url": "http://localhost/", "isRepresentativeRun": true,  "jsonPath": "${LHR}" },
  { "url": "http://localhost/", "isRepresentativeRun": false, "jsonPath": "/nonexistent/lhr-3.json" }
]
JSON

run_script_capture_in_dir "$T"
output="$LAST_OUTPUT"
exit_code="$LAST_EXIT_CODE"

assert_eq \
  "script exits 0 when exactly one representative run exists among multiple entries" \
  "0" \
  "$exit_code"

assert_contains \
  "summary contains Scores table when representative run is found in multi-entry manifest" \
  "Lighthouse Scores" \
  "$output"

assert_contains \
  "summary does not contain 'No representative run' error for valid multi-entry manifest" \
  "Cumulative Layout Shift" \
  "$output"

rm -rf "$T"; trap - EXIT

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""


[ "$FAIL" -eq 0 ]   # non-zero exit when any assertion fails
