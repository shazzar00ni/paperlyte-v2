# Triage stale and conflicting PRs from the action plan

## Summary

Clean up the remaining non-code PR queue by applying the action-plan decisions for changes-requested,
close-recommended, and postponed PRs.

## Background

`docs/ACTION_PLAN.md` lists multiple PRs that require editorial action rather than immediate code
implementation. Leaving these open increases review noise and merge-conflict risk.

## Scope

### Changes requested

- PR #427 — verify/fix Claude workflow duplicate `permissions` and multiple `if` conditions.
- PR #275 — close stale/misleading PR; reopen with accurate Codacy-warning scope if still needed.
- PR #319 — split mixed Privacy/dependency/sitemap work into focused PRs.
- PR #311 — reject raw `<i>` fallback change; handle accessibility improvements separately.

### Close recommended

- PR #259 — empty diff.
- PR #107 — large monolithic superseded PR.
- PR #435, #434, #433, #432, #431, #385, #383 — redundant review-summary-only PRs.

### Postpone

- PR #389 — repository-wide semicolon formatting; revisit after active work lands.

## Acceptance Criteria

- [ ] Each listed PR has an explicit GitHub comment explaining the decision.
- [ ] Close-recommended PRs are closed if no longer needed.
- [ ] Changes-requested PRs are either updated by authors or closed/superseded.
- [ ] PR #389 is labeled/postponed so it does not conflict with active work.
- [ ] `docs/ACTION_PLAN.md` is updated if any decision changes.

## Suggested Labels

- `triage`
- `repo-maintenance`
- `project-management`
