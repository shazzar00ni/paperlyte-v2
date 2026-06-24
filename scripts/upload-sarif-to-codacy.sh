#!/bin/bash
#
# upload-sarif-to-codacy.sh
#
# Uploads a merged single-run SARIF file to the Codacy platform.
#
# Shared by the codacy-security-scan and codacy-pr-review jobs in
# .github/workflows/codacy.yml so the upload logic lives in one place and cannot
# drift between them. (The merge step is similarly shared via merge-sarif-runs.sh.)
#
# Usage: ./upload-sarif-to-codacy.sh <sarif-file>
#
# Required environment variables:
#   CODACY_PROJECT_TOKEN - Codacy project token. If empty, the upload is skipped
#                          (exit 0) so forks without the secret do not fail.
#   ORG                  - GitHub organization/owner (Codacy provider path).
#   REPO                 - Repository name.
#   COMMIT_UUID          - Commit SHA to attach results to. On pull_request
#                          events this must be the PR head SHA, not the synthetic
#                          merge commit, or Codacy attaches results to a non-head
#                          commit.
#
# Exit codes:
#   0 - Upload succeeded, or skipped because no token is configured
#   1 - Validation failed, curl failed, or Codacy returned a non-2xx status

set -e

SARIF_FILE="${1:-}"
if [ -z "$SARIF_FILE" ]; then
  echo "Usage: $0 <sarif-file>" >&2
  exit 1
fi

if [ -z "${CODACY_PROJECT_TOKEN:-}" ]; then
  echo "CODACY_PROJECT_TOKEN not set, skipping Codacy upload"
  exit 0
fi

RUN_COUNT=$(jq '.runs | length' "$SARIF_FILE")
echo "SARIF run count before upload: $RUN_COUNT"
if [ "$RUN_COUNT" -ne 1 ]; then
  echo "Error: expected exactly 1 run after merging, got $RUN_COUNT. Skipping Codacy upload to avoid rejection."
  exit 1
fi

echo "Uploading merged SARIF to Codacy..."
HTTP_STATUS=""
CURL_EXIT=0
HTTP_STATUS=$(curl -sS \
  --connect-timeout 10 \
  --max-time 90 \
  --retry 3 \
  --retry-delay 2 \
  --retry-connrefused \
  -o /tmp/codacy_upload_response.txt -w "%{http_code}" -X POST \
  "https://api.codacy.com/api/v3/analysis/organizations/gh/$ORG/repositories/$REPO/upload" \
  -H "project-token: $CODACY_PROJECT_TOKEN" \
  -F "commitUuid=$COMMIT_UUID" \
  -F "results=@$SARIF_FILE;type=application/json") || CURL_EXIT=$?
if [ "$CURL_EXIT" -ne 0 ]; then
  echo "Error: curl failed while uploading SARIF to Codacy (exit code $CURL_EXIT)."
  if [ -n "$HTTP_STATUS" ]; then
    echo "Codacy upload HTTP status (if any): $HTTP_STATUS"
  fi
  echo "Codacy upload response (if any):"
  cat /tmp/codacy_upload_response.txt 2>/dev/null || true
  exit 1
fi
echo "Codacy upload HTTP status: $HTTP_STATUS"
cat /tmp/codacy_upload_response.txt || true
if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
  echo "Codacy upload succeeded."
else
  echo "Warning: Codacy upload returned HTTP $HTTP_STATUS"
  exit 1
fi
