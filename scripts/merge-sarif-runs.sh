#!/bin/bash
#
# merge-sarif-runs.sh
#
# Merges multiple SARIF runs into a single run to comply with GitHub's July 2025
# requirement that each SARIF upload must have a single run per category.
#
# See: https://github.blog/changelog/2025-07-21-code-scanning-will-stop-combining-multiple-sarif-runs-uploaded-in-the-same-sarif-file/
#
# Usage: ./merge-sarif-runs.sh <input.sarif> [output.sarif]
#   - If output is not specified, input file is modified in place
#
# Exit codes:
#   0 - Success (merged or no merge needed)
#   1 - Error (invalid input, jq failure, or invalid output)

set -e

# --- Argument parsing ---
INPUT_FILE="${1:-}"
OUTPUT_FILE="${2:-$INPUT_FILE}"

if [ -z "$INPUT_FILE" ]; then
  echo "Error: Input SARIF file path required"
  echo "Usage: $0 <input.sarif> [output.sarif]"
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file not found: $INPUT_FILE"
  exit 1
fi

# --- Check run count ---
RUN_COUNT=$(jq '.runs | length' "$INPUT_FILE")
echo "Found $RUN_COUNT runs in SARIF file"

if [ "$RUN_COUNT" -le 1 ]; then
  echo "Single run detected, no merging needed"
  # Copy to output if different from input
  if [ "$INPUT_FILE" != "$OUTPUT_FILE" ]; then
    cp "$INPUT_FILE" "$OUTPUT_FILE"
  fi
  exit 0
fi

echo "Merging $RUN_COUNT runs into a single run..."

# --- Create temporary file for merge output ---
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

# --- Merge all runs into a single run ---
# Merge strategy:
# - Combine tool with merged rules from all runs (deduplicated by rule ID)
# - Combine all results from all runs (deduplicated by location)
# - Preserve additional SARIF properties (artifacts, invocations, etc.)
#
# Results deduplication key: ruleId + file URI + startLine + startColumn + endLine
# This uniquely identifies a finding by what rule triggered it and its exact location.
# Defensive null handling ensures results without locations still produce stable keys.

if ! jq '{
  "$schema": ."$schema",
  version: .version,
  runs: [{
    tool: {
      driver: {
        name: "Codacy",
        informationUri: "https://www.codacy.com",
        version: "1.0.0",
        rules: [.runs[].tool.driver.rules // [] | .[]] | unique_by(.id)
      }
    },
    results: [.runs[].results // [] | .[]] | unique_by(
      (.ruleId // "") +
      (((.locations // [])[0] // {}).physicalLocation // {}).artifactLocation.uri // "") +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.startLine // 0 | tostring) +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.startColumn // 0 | tostring) +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.endLine // 0 | tostring)
    ),
    originalUriBaseIds: (reduce (.runs[].originalUriBaseIds // {}) as $m ({}; . * $m)),
    artifacts: [.runs[].artifacts // [] | .[]],
    invocations: [.runs[].invocations // [] | .[]],
    columnKind: (first(.runs[].columnKind // empty)),
    conversion: (first(.runs[].conversion // empty))
  }]
}' "$INPUT_FILE" > "$TEMP_FILE"; then
  echo "Error: jq merge operation failed"
  exit 1
fi

# --- Validate merged file is valid JSON ---
if ! jq empty "$TEMP_FILE" 2>/dev/null; then
  echo "Error: Merged SARIF file is invalid JSON"
  exit 1
fi

# --- Move merged file to output ---
mv "$TEMP_FILE" "$OUTPUT_FILE"
trap - EXIT  # Clear trap since we moved the file

echo "Merged SARIF file created successfully: $OUTPUT_FILE"

# --- Report final structure ---
echo "Final SARIF structure:"
echo "  Runs: $(jq '.runs | length' "$OUTPUT_FILE")"
echo "  Results: $(jq '.runs[0].results // [] | length' "$OUTPUT_FILE")"
