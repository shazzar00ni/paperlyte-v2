#!/bin/bash

# Get all remote branches excluding main and HEAD
branches=$(git branch -r | grep -v "HEAD" | grep -v "origin/main" | sed 's/origin\///')

for branch_name in $branches; do
  branch="origin/$branch_name"
  echo "--- Branch: $branch ---"

  # Check files
  files=$(git ls-tree -r "$branch" --name-only 2>/dev/null)
  if [ $? -ne 0 ]; then
    echo "  ERROR: Could not list files for $branch"
    continue
  fi

  missing_files=""
  for f in ".npmrc" "docs/ROADMAP.md" "gitVersionControl.md" "review.md"; do
    if ! echo "$files" | grep -q "^$f$"; then
      missing_files="$missing_files $f"
    fi
  done

  if [ -z "$missing_files" ]; then
    echo "  Critical Files: OK"
  else
    echo "  Missing Files:$missing_files"
  fi

  # Check navigation.ts
  nav_content=$(git show "$branch:src/utils/navigation.ts" 2>/dev/null)
  if [ -n "$nav_content" ]; then
    if echo "$nav_content" | grep -q "hasDangerousProtocol"; then
      echo "  Navigation Helpers: OK"
    else
      echo "  Navigation Helpers: REVERTED"
    fi
  else
    echo "  Navigation File: MISSING"
  fi

  # Check App.tsx for Pricing and Analytics
  app_content=$(git show "$branch:src/App.tsx" 2>/dev/null)
  if [ -n "$app_content" ]; then
    if echo "$app_content" | grep -q "Pricing"; then
      echo "  Pricing Component: PRESENT"
    else
      echo "  Pricing Component: MISSING"
    fi

    if echo "$app_content" | grep -q "Analytics />" && ! echo "$app_content" | grep -q "process.env.NODE_ENV === 'production' && <Analytics />"; then
       if echo "$app_content" | grep -q "window.location.hostname" || echo "$app_content" | grep -q "isProduction"; then
          echo "  Analytics: CONDITIONALLY RENDERED (OK)"
       else
          echo "  Analytics: UNCONDITIONALLY RENDERED (WARNING)"
       fi
    else
      echo "  Analytics: OK"
    fi
  else
    echo "  App.tsx: MISSING"
  fi
done
