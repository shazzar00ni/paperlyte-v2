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

RUN_COUNT=$(jq '.runs | length' "$INPUT_FILE")
echo "Found $RUN_COUNT runs in SARIF file"

if [ "$RUN_COUNT" -le 1 ]; then
  echo "Single run detected, no merging needed"
  if [ "$INPUT_FILE" != "$OUTPUT_FILE" ]; then
    cp "$INPUT_FILE" "$OUTPUT_FILE"
  fi
  exit 0
fi

echo "Merging $RUN_COUNT runs into a single run..."

TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

# Write jq filter to a temporary file to avoid shell quoting issues
JQ_FILTER=$(mktemp)
trap 'rm -f "$TEMP_FILE" "$JQ_FILTER"' EXIT

cat > "$JQ_FILTER" << 'JQEOF'
{
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
      ((((.locations // [])[0] // {}).physicalLocation // {}).artifactLocation.uri // "") +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.startLine // 0 | tostring) +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.startColumn // 0 | tostring) +
      ((((.locations // [])[0] // {}).physicalLocation // {}).region.endLine // 0 | tostring)
    ),
    originalUriBaseIds: (reduce (.runs[].originalUriBaseIds // {}) as $m ({}; . * $m)),
    artifacts: [.runs[].artifacts // [] | .[]],
    invocations: [.runs[].invocations // [] | .[]],
    columnKind: ([.runs[].columnKind | select(. != null)][0] // null),
    conversion: ([.runs[].conversion | select(. != null)][0] // null)
  }]
}
JQEOF

if ! jq -f "$JQ_FILTER" "$INPUT_FILE" > "$TEMP_FILE"; then
  echo "Error: jq merge operation failed"
  exit 1
fi

if ! jq empty "$TEMP_FILE" 2>/dev/null; then
  echo "Error: Merged SARIF file is invalid JSON"
  exit 1
fi

mv "$TEMP_FILE" "$OUTPUT_FILE"
trap 'rm -f "$JQ_FILTER"' EXIT

echo "Merged SARIF file created successfully: $OUTPUT_FILE"
echo "Final SARIF structure:"
echo "  Runs: $(jq '.runs | length' "$OUTPUT_FILE")"
echo "  Results: $(jq '.runs[0].results // [] | length' "$OUTPUT_FILE")"
