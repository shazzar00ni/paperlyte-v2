#!/bin/bash
set -e

# GitHub Branch Protection Setup Script
# This script configures branch protection rules for the main branch
# Usage: GITHUB_TOKEN=your_token ./setup-branch-protection.sh

# Configuration
REPO_OWNER="shazzar00ni"
REPO_NAME="paperlyte-v2"
BRANCH="${BRANCH:-main}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
    echo "Please set it with: export GITHUB_TOKEN=your_personal_access_token"
    echo ""
    echo "To create a personal access token:"
    echo "1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select scopes: 'repo' (all repo permissions)"
    echo "4. Generate and copy the token"
    exit 1
fi

echo -e "${GREEN}Configuring branch protection for ${REPO_OWNER}/${REPO_NAME}:${BRANCH}${NC}"
echo ""

# Validate branch name format to prevent command injection
# Check for dangerous shell metacharacters as defense-in-depth
if printf '%s\n' "$BRANCH" | grep -qE '[\$`\\;|&<>(){}[:space:]]'; then
    echo -e "${RED}✗ Invalid branch name: contains shell metacharacters${NC}"
    printf "Branch name: '%s'\n" "$BRANCH"
    exit 1
fi

# Validate using Git's reference format rules
if ! git check-ref-format --branch "$BRANCH" >/dev/null 2>&1; then
    echo -e "${RED}✗ Invalid branch name format${NC}"
    printf "Branch name: '%s'\n" "$BRANCH"
    echo "Branch names must follow Git reference naming rules"
    exit 1
fi
echo -e "${GREEN}✓ Branch name validated${NC}"
echo ""

# Branch protection configuration
# See: https://docs.github.com/en/rest/branches/branch-protection
PROTECTION_CONFIG='{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {
        "context": "Lint and Type Check",
        "app_id": -1
      },
      {
        "context": "Build",
        "app_id": -1
      },
      {
        "context": "Lighthouse CI",
        "app_id": -1
      },
      {
        "context": "CI Success",
        "app_id": -1
      }
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}'

echo -e "${YELLOW}Applying branch protection rules...${NC}"
echo ""
echo "Required status checks:"
echo "  - Lint and Type Check"
echo "  - Build"
echo "  - Lighthouse CI"
echo "  - CI Success"
echo ""
echo "Pull request requirements:"
echo "  - At least 1 approval required"
echo "  - Dismiss stale reviews on new commits"
echo "  - Require conversation resolution"
echo ""

# URL-encode the branch name to handle special characters (/, ?, #, spaces, etc.)
ENCODED_BRANCH=$(printf %s "$BRANCH" | jq -sRr @uri)

# Apply branch protection
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/${ENCODED_BRANCH}/protection" \
  -d "$PROTECTION_CONFIG")

# Extract status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Branch protection configured successfully!${NC}"
    echo ""
    echo "You can view the settings at:"
    echo "https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
    exit 0
else
    echo -e "${RED}✗ Failed to configure branch protection${NC}"
    echo "HTTP Status Code: $HTTP_CODE"
    echo ""
    echo "Response:"
    # Pretty-print JSON: prefer jq, fall back to python3, then raw output
    if command -v jq >/dev/null 2>&1; then
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    elif command -v python3 >/dev/null 2>&1; then
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    else
        echo "$BODY"
    fi
    echo ""

    if [ "$HTTP_CODE" -eq 404 ]; then
        echo -e "${YELLOW}Note: The branch '${BRANCH}' might not exist yet.${NC}"
        echo "Please ensure the branch exists before setting up protection."
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        echo -e "${YELLOW}Note: Your token might not have sufficient permissions.${NC}"
        echo "Required scopes: repo (full control)"
    fi

    exit 1
fi
