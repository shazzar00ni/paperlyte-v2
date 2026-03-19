branches=(
  "origin/claude/accessibility-audit-baseline-USu5N"
  "origin/claude/setup-sonarcloud-HM572"
  "origin/claude/fix-failing-tests-J1VZ6"
  "origin/claude/fix-icon-rendering-tests-ukecN"
  "origin/claude/add-doc-sections-1EhnP"
  "origin/copilot/sub-pr-593"
  "origin/copilot/sub-pr-585"
  "origin/claude/fix-open-redirect-TX551"
  "origin/claude/tree-shake-font-awesome-cK85j"
  "origin/copilot/improve-variable-function-naming"
  "origin/claude/fix-coverage-requirements-QtFtS"
  "origin/claude/analyze-test-coverage-9JQZb"
  "origin/claude/lighthouse-failure-b5S6v"
  "origin/claude/implement-todo-item-cDEVt"
  "origin/claude/fix-code-style-cWDI4"
  "origin/claude/fix-codacy-sarif-limits-Rmdck"
)

for branch in "${branches[@]}"; do
  echo "Checking $branch..."
  files=$(git ls-tree -r "$branch" --name-only)
  missing=""
  for f in ".npmrc" "docs/ROADMAP.md" "gitVersionControl.md" "review.md"; do
    if ! echo "$files" | grep -q "^$f$"; then
      missing="$missing $f"
    fi
  done

  nav_content=$(git show "$branch:src/utils/navigation.ts" 2>/dev/null)
  nav_status="OK"
  if [ -z "$nav_content" ]; then
    nav_status="MISSING_FILE"
  elif ! echo "$nav_content" | grep -q "hasDangerousProtocol"; then
    nav_status="REVERTED"
  fi

  if [ -z "$missing" ]; then
    echo "  Files: OK"
  else
    echo "  Missing:$missing"
  fi
  echo "  Navigation: $nav_status"
done
