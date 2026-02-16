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
#
# SARIF Structure Overview:
#   A SARIF file contains: { "$schema", "version", "runs": [...] }
#   Each run contains: { "tool", "results", "artifacts", "invocations", ... }
#   GitHub requires exactly ONE run per category for code scanning.
#
# Merge Strategy:
#   1. RULES: Collect all rules from all runs, deduplicate by rule ID
#   2. RESULTS: Collect all findings from all runs, deduplicate by location
#   3. ARTIFACTS: Combine all file references from all runs
#   4. INVOCATIONS: Combine all tool execution records
#   5. METADATA: Take first non-null value for scalar properties
#

if ! jq '
# =============================================================================
# SARIF MERGE TRANSFORMATION
# =============================================================================
{
  # Preserve top-level SARIF metadata
  "$schema": ."$schema",
  version: .version,

  # Create single merged run from all input runs
  runs: [{

    # -------------------------------------------------------------------------
    # TOOL SECTION
    # Defines the analysis tool and its rules
    # -------------------------------------------------------------------------
    tool: {
      # Use tool driver from first run as baseline, then merge rules
      driver: (((.runs | map(select(.tool.driver != null).tool.driver) | .[0]) // {name: "Unified Tool"}) + {
        # RULES: Flatten all rules from all runs into single array
        # - .runs[].tool.driver.rules: Get rules array from each run
        # - // []: Default to empty array if rules is null
        # - | .[]: Flatten nested arrays into single stream
        # - unique_by(.id): Remove duplicates, keeping first occurrence of each rule ID
        rules: [.runs[].tool.driver.rules // [] | .[]] | unique_by(.id)
      }),

      # EXTENSIONS: Combine all tool extensions and deduplicate by name/id
      extensions: ([.runs[].tool.extensions // [] | .[]] | unique_by(.name // .id))
    },

    # -------------------------------------------------------------------------
    # RESULTS SECTION
    # Contains all findings/alerts from the analysis
    # -------------------------------------------------------------------------
    # RESULTS: Flatten all results and deduplicate by unique location key
    # Deduplication key = ruleId + fileURI + startLine + startColumn + endLine
    #
    # Defensive null handling at each level:
    # - .locations // []: Default to empty array if no locations
    # - [0] // {}: Default to empty object if array is empty
    # - .physicalLocation // {}: Default if no physical location
    # - .region.* // 0: Default line/column numbers to 0
    results: [.runs[].results // [] | .[]] | unique_by(
      (.ruleId // "") +
      (((((.locations // [])[0] // {}).physicalLocation // {}).artifactLocation // {}).uri // "") +
      (((((.locations // [])[0] // {}).physicalLocation // {}).region // {}).startLine // 0 | tostring) +
      (((((.locations // [])[0] // {}).physicalLocation // {}).region // {}).startColumn // 0 | tostring) +
      (((((.locations // [])[0] // {}).physicalLocation // {}).region // {}).endLine // 0 | tostring)
    ),

    # -------------------------------------------------------------------------
    # ADDITIONAL SARIF PROPERTIES
    # Preserved to maintain full SARIF compliance
    # -------------------------------------------------------------------------

    # originalUriBaseIds: Maps logical names to physical paths (e.g., %SRCROOT%)
    # Merge strategy: Combine all mappings, later values override earlier ones
    originalUriBaseIds: (reduce (.runs[].originalUriBaseIds // {}) as $m ({}; . * $m)),

    # artifacts: List of files analyzed
    # Merge strategy: Combine all artifact lists and deduplicate by URI
    # Note: Artifacts without URIs are grouped together; this is acceptable as
    # SARIF artifacts without location.uri are typically redundant metadata
    artifacts: [.runs[].artifacts // [] | .[]] | unique_by(.location.uri // ""),

    # invocations: Records of tool executions (timing, exit codes, etc.)
    # Merge strategy: Keep all invocation records from all runs
    invocations: [.runs[].invocations // [] | .[]]
  }
  # Add columnKind only if a valid value exists (SARIF requires valid enum string, not null)
  + (([.runs[].columnKind | select(. != null and . != "")][0]) as $ck |
     if $ck then { columnKind: $ck } else {} end)
  # Add conversion only if a valid object exists (SARIF requires object type, not null)
  + (([.runs[].conversion | select(. != null and type == "object")][0]) as $cv |
     if $cv then { conversion: $cv } else {} end)
  ]
}
' "$INPUT_FILE" > "$TEMP_FILE"; then
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
echo "  Tool: $(jq -r '.runs[0].tool.driver.name // "Unified Tool"' "$OUTPUT_FILE")"
echo "  Runs: $(jq '.runs | length' "$OUTPUT_FILE")"
echo "  Results: $(jq '.runs[0].results // [] | length' "$OUTPUT_FILE")"
echo "  Rules: $(jq '.runs[0].tool.driver.rules // [] | length' "$OUTPUT_FILE")"
