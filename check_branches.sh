#!/bin/bash
FILES=".npmrc docs/ROADMAP.md gitVersionControl.md review.md"
HELPERS="hasDangerousProtocol isRelativeUrl"

echo "| Branch | Files Missing | Helpers Missing | ESLint Version | Status |"
echo "|--------|---------------|-----------------|----------------|--------|"

for branch in $(cat open_branches.txt); do
  # Check files
  missing_files=""
  for f in $FILES; do
    if ! git ls-tree -r "origin/$branch" --name-only | grep -q "^$f$"; then
      missing_files="$missing_files $f"
    fi
  done

  # Check helpers
  missing_helpers=""
  if git ls-tree -r "origin/$branch" --name-only | grep -q "src/utils/navigation.ts"; then
    content=$(git show "origin/$branch:src/utils/navigation.ts" 2>/dev/null)
    for h in $HELPERS; do
      if ! echo "$content" | grep -q "$h"; then
        missing_helpers="$missing_helpers $h"
      fi
    done
  else
    missing_helpers="navigation.ts missing"
  fi

  # Check ESLint version
  eslint_version="N/A"
  if git ls-tree -r "origin/$branch" --name-only | grep -q "package.json"; then
    eslint_version=$(git show "origin/$branch:package.json" | grep -E '"eslint":' | head -1 | sed -E 's/.*: "(.*)".*/\1/')
  fi

  status="OK"
  if [ -n "$missing_files" ] || [ -n "$missing_helpers" ]; then
    status="**Regression**"
  fi
  if [[ "$eslint_version" == *"10."* ]]; then
    status="$status, ESLint 10"
  fi

  echo "| $branch | $missing_files | $missing_helpers | $eslint_version | $status |"
done
