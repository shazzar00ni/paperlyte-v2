#!/bin/bash
#
# split-sarif-runs.sh
#
# Splits a SARIF file with multiple runs into one SARIF file per run.
# GitHub code scanning no longer combines multiple runs with the same category
# from a single upload, so each split file gets a unique runAutomationDetails.id
# that upload-sarif uses as the analysis category when uploading a directory.
#
# Usage: ./split-sarif-runs.sh <input.sarif> [output-dir]
#   - output-dir defaults to sarif-runs
#
# Exit codes:
#   0 - Success
#   1 - Error (invalid input, jq failure, or invalid output)

set -euo pipefail

INPUT_FILE="${1:-}"
OUTPUT_DIR="${2:-sarif-runs}"

if [ -z "$INPUT_FILE" ]; then
  echo "Error: Input SARIF file path required"
  echo "Usage: $0 <input.sarif> [output-dir]"
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file not found: $INPUT_FILE"
  exit 1
fi

if ! jq empty "$INPUT_FILE" 2>/dev/null; then
  echo "Error: Input SARIF file is not valid JSON: $INPUT_FILE"
  exit 1
fi

RUN_COUNT=$(jq '.runs | length' "$INPUT_FILE")
echo "Found $RUN_COUNT runs in SARIF file"

if [ "$RUN_COUNT" -lt 1 ]; then
  echo "Error: SARIF file does not contain any runs"
  exit 1
fi

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

MANIFEST_FILE=$(mktemp)
trap 'rm -f "$MANIFEST_FILE"' EXIT

slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

for ((i = 0; i < RUN_COUNT; i += 1)); do
  TOOL_NAME=$(jq -r --argjson index "$i" '.runs[$index].tool.driver.name // "tool"' "$INPUT_FILE")
  TOOL_SLUG=$(slugify "$TOOL_NAME")
  if [ -z "$TOOL_SLUG" ]; then
    TOOL_SLUG="tool"
  fi

  FILE_INDEX=$(printf '%02d' "$i")
  AUTOMATION_ID="codacy-${FILE_INDEX}-${TOOL_SLUG}"
  OUTPUT_FILE="$OUTPUT_DIR/${AUTOMATION_ID}.sarif"

  if ! jq \
    --argjson index "$i" \
    --arg automation_id "$AUTOMATION_ID" \
    '{
      "$schema": ."$schema",
      version: .version,
      runs: [
        (.runs[$index]
          | del(.results[]?.partialFingerprints)
          | .runAutomationDetails = ((.runAutomationDetails // {}) + { id: $automation_id })
        )
      ]
    }' "$INPUT_FILE" > "$OUTPUT_FILE"; then
    echo "Error: jq split operation failed for SARIF run $i ($TOOL_NAME)"
    exit 1
  fi

  if ! jq empty "$OUTPUT_FILE" 2>/dev/null; then
    echo "Error: Split SARIF file is invalid JSON: $OUTPUT_FILE"
    exit 1
  fi

  SPLIT_RUN_COUNT=$(jq '.runs | length' "$OUTPUT_FILE")
  if [ "$SPLIT_RUN_COUNT" -ne 1 ]; then
    echo "Error: Expected one run in $OUTPUT_FILE, found $SPLIT_RUN_COUNT"
    exit 1
  fi

  printf '%s\t%s\t%s\n' "$OUTPUT_FILE" "$AUTOMATION_ID" "$TOOL_NAME" >> "$MANIFEST_FILE"
done

echo "Split SARIF files created successfully in: $OUTPUT_DIR"
echo "Generated $RUN_COUNT SARIF file(s):"
sed 's/^/  /' "$MANIFEST_FILE"
