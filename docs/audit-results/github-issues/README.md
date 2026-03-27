# GitHub Issues from Baseline Audit 2025-12-22

This directory contains GitHub issue templates generated from the [Baseline Audit 2025-12-22](../baseline-audit-2025-12-22.md). Each file represents a distinct issue that should be created in the GitHub repository.

## 📋 Issue Summary

### 🔴 Critical Issues (Production Blockers)
1. **01-critical-legal-placeholders.md** - Resolve 15 legal placeholders in legal.ts
2. **02-critical-gitignore-env.md** - Add .env patterns to .gitignore (security risk)

### 🟠 High Priority Issues
3. **03-high-analytics-test-coverage.md** - Add test coverage for analytics module (0% coverage)
4. **04-high-download-urls.md** - Complete download URLs for all platforms
5. **05-high-lighthouse-ci-setup.md** - Set up Lighthouse CI for automated performance monitoring
6. **06-high-accessibility-testing.md** - Complete accessibility testing and add keyboard handlers

### 🟡 Medium Priority Issues
7. **07-medium-constants-test-coverage.md** - Add test coverage for constants module (0% coverage)
8. **08-medium-component-refactoring.md** - Refactor large components for maintainability
9. **09-medium-image-optimization.md** - Implement image optimization pipeline
10. **10-medium-react-performance.md** - Optimize React performance with memo and lazy loading

## 🚀 How to Create Issues

### Option 1: Using GitHub CLI (Recommended)

If you have `gh` CLI installed:

```bash
# Navigate to the repository root
cd /home/user/paperlyte-v2

# Create all issues at once
for file in docs/audit-results/github-issues/*.md; do
  if [[ "$file" != *"README.md" ]]; then
    # Extract title from first line (remove '# ' prefix)
    title=$(head -n 1 "$file" | sed 's/^# //')

    # Extract labels from second line (remove '**Labels**: ' prefix and backticks)
    labels=$(sed -n '3p' "$file" | sed 's/\*\*Labels\*\*: //' | sed 's/`//g')

    # Extract body (skip first 4 lines)
    body=$(tail -n +5 "$file")

    # Create issue
    gh issue create --title "$title" --label "$labels" --body "$body"

    echo "✅ Created issue: $title"
  fi
done
```

### Option 2: Manual Creation via GitHub Web UI

1. Go to https://github.com/shazzar00ni/paperlyte-v2/issues/new
2. For each file in this directory:
   - Open the file
   - Copy the title (first line, without `#`)
   - Copy the entire body (everything after line 4)
   - Paste into GitHub issue form
   - Add labels as specified in line 3
   - Click "Submit new issue"

### Option 3: Create Specific Issues

To create just the critical issues first:

```bash
# Critical Issue 1: Legal placeholders
gh issue create \
  --title "[CRITICAL] Resolve 15 legal placeholders in legal.ts - Production Blocker" \
  --label "priority:critical,status:blocked,area:legal" \
  --body-file docs/audit-results/github-issues/01-critical-legal-placeholders.md

# Critical Issue 2: .env in .gitignore
gh issue create \
  --title "[CRITICAL] Add .env patterns to .gitignore - Security Risk" \
  --label "priority:critical,area:security,type:bug" \
  --body-file docs/audit-results/github-issues/02-critical-gitignore-env.md
```

## 📊 Issue Prioritization

### Immediate (Week 1)
- Issue #1: Legal placeholders (production blocker)
- Issue #2: .env in .gitignore (security risk)

### Short-term (Sprint 1 - Weeks 2-4)
- Issue #3: Analytics test coverage
- Issue #4: Download URLs
- Issue #5: Lighthouse CI setup
- Issue #6: Accessibility testing

### Medium-term (Sprint 2-3 - Months 2-3)
- Issue #7: Constants test coverage
- Issue #8: Component refactoring
- Issue #9: Image optimization
- Issue #10: React performance

## 🔗 Issue Dependencies

```
Issue #1 (Legal) → Blocks Issue #4 (Downloads) - GitHub URL needed
Issue #1 (Legal) → Blocks Issue #6 (Accessibility) - Accessibility statement needed
Issue #5 (Lighthouse CI) → Monitors Issue #9 (Images) & #10 (Performance)
Issue #8 (Refactoring) → Enables Issue #10 (Performance) - Better memoization
```

## 📝 Label Guide

Create these labels in GitHub if they don't exist:

### Priority Labels
- `priority:critical` - Production blockers (red)
- `priority:high` - Must fix before launch (orange)
- `priority:medium` - Should fix soon (yellow)
- `priority:low` - Nice to have (green)

### Area Labels
- `area:legal` - Legal/compliance issues
- `area:security` - Security vulnerabilities
- `area:testing` - Test coverage
- `area:performance` - Performance optimization
- `area:accessibility` - Accessibility/a11y
- `area:ci-cd` - CI/CD pipeline
- `area:analytics` - Analytics tracking
- `area:deployment` - Deployment/release
- `area:refactoring` - Code refactoring
- `area:images` - Image optimization
- `area:react` - React-specific issues

### Status Labels
- `status:blocked` - Blocked by dependencies
- `type:bug` - Bug fix required

### Creating Labels via GitHub CLI

```bash
# Priority labels
gh label create "priority:critical" --color "B60205" --description "Production blocker"
gh label create "priority:high" --color "D93F0B" --description "Must fix before launch"
gh label create "priority:medium" --color "FBCA04" --description "Should fix soon"
gh label create "priority:low" --color "0E8A16" --description "Nice to have"

# Area labels
gh label create "area:legal" --color "5319E7" --description "Legal/compliance"
gh label create "area:security" --color "D73A4A" --description "Security"
gh label create "area:testing" --color "1D76DB" --description "Test coverage"
gh label create "area:performance" --color "006B75" --description "Performance"
gh label create "area:accessibility" --color "7057FF" --description "Accessibility"
gh label create "area:ci-cd" --color "0075CA" --description "CI/CD pipeline"
gh label create "area:analytics" --color "008672" --description "Analytics"
gh label create "area:deployment" --color "BFD4F2" --description "Deployment"
gh label create "area:refactoring" --color "C5DEF5" --description "Refactoring"
gh label create "area:images" --color "FEF2C0" --description "Images"
gh label create "area:react" --color "61DAFB" --description "React"

# Status/type labels
gh label create "status:blocked" --color "D93F0B" --description "Blocked by dependencies"
gh label create "type:bug" --color "D73A4A" --description "Bug fix"
```

## 📈 Tracking Progress

After creating issues, you can track progress with:

```bash
# View all issues by priority
gh issue list --label "priority:critical"
gh issue list --label "priority:high"
gh issue list --label "priority:medium"

# View issues by area
gh issue list --label "area:security"
gh issue list --label "area:performance"

# View blocked issues
gh issue list --label "status:blocked"
```

## 🎯 Success Metrics

Track completion of these issues against the baseline audit targets:

### Performance Targets
- Lighthouse Performance: ≥90/100
- Lighthouse Accessibility: ≥95/100
- Bundle size: ≤150 KB JS (currently 97 KB ✅)
- Test coverage: ≥85% overall

### Production Readiness Checklist
- [ ] All critical issues resolved
- [ ] All high-priority issues resolved
- [ ] Accessibility audit complete (≥95/100)
- [ ] Lighthouse CI running in CI/CD
- [ ] Security vulnerabilities resolved
- [ ] Legal documentation complete

## 📚 Related Documentation

- **Source Audit**: `docs/audit-results/baseline-audit-2025-12-22.md`
- **Security Review**: `docs/SECURITY_REVIEW.md`
- **Accessibility Docs**: `docs/ACCESSIBILITY.md`
- **Legal Setup**: `docs/LEGAL-SETUP.md`

## ℹ️ Notes

- These issues were automatically generated from the baseline audit
- Each issue includes detailed implementation plans and acceptance criteria
- Issues are cross-referenced with line numbers from the audit report
- All issues include source references back to the baseline audit
- Timeline estimates are based on audit recommendations

---

**Generated**: 2026-01-02
**Source**: Baseline Audit 2025-12-22
**Total Issues**: 10 (2 Critical, 4 High, 4 Medium)
