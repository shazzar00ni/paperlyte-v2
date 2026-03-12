#!/bin/bash
branches=(
  "claude/update-codecov-action-1HLHH"
  "claude/fix-failing-tests-J1VZ6"
  "claude/fix-codacy-fingerprints-P9FYE"
  "claude/fix-lighthouse-ci-P9FYE"
  "claude/remove-hardcoded-password-ubUUE"
  "claude/accessibility-audit-baseline-USu5N"
  "claude/fix-eslint-workflow-xWVbe"
  "copilot/fix-security-error-url"
  "copilot/improve-slow-code-performance"
  "copilot/fix-issue-525"
)

files_to_check=(
  ".npmrc"
  "docs/ROADMAP.md"
  "gitVersionControl.md"
  "review.md"
)

echo "Branch | .npmrc | ROADMAP.md | gitVersionControl.md | review.md | navigation.ts helpers"
echo "--- | --- | --- | --- | --- | ---"

for branch in "${branches[@]}"; do
  # Check if branch exists locally, if not fetch it
  if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
    git fetch origin "$branch":"$branch" >/dev/null 2>&1
  fi

  results=()
  for file in "${files_to_check[@]}"; do
    if git ls-tree -r "$branch" --name-only | grep -q "^$file$"; then
      results+=("✓")
    else
      results+=("✗")
    fi
  done

  # Check navigation.ts helpers
  nav_content=$(git show "$branch:src/utils/navigation.ts" 2>/dev/null)
  if echo "$nav_content" | grep -q "hasDangerousProtocol" && echo "$nav_content" | grep -q "isRelativeUrl"; then
    results+=("✓")
  else
    results+=("✗")
  fi

  echo "$branch | ${results[0]} | ${results[1]} | ${results[2]} | ${results[3]} | ${results[4]}"
done
