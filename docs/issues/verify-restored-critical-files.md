# Verify restored critical files on affected PR branches

## Summary

Before merging affected branches, verify they restore the critical files and navigation helpers
identified in `docs/ACTION_PLAN.md`.

## Background

Several historical branches/PRs accidentally deleted `.npmrc`, roadmap/review docs, and/or reverted
navigation helpers. The current branch has those files restored, but each affected remote branch or
PR must be verified before merge.

## Branches / PRs To Verify

- `origin/claude/implement-todo-item-2H9LP`
- `origin/claude/core-editor-phase-1-PI3Yp`
- `origin/copilot/sub-pr-503`
- `origin/copilot/sub-pr-469-again`
- `origin/claude/fix-peer-dependency-conflicts-Wj2iC`
- PR #469, #488, #491, #502, #506

## Required Checks

- `.npmrc` exists where required and contains exactly `legacy-peer-deps=true`.
- `docs/ROADMAP.md` is restored where required.
- `docs/gitVersionControl.md` is restored where required.
- `docs/review.md` is restored where required.
- `src/utils/navigation.ts` still contains the expected `hasDangerousProtocol` and `isRelativeUrl`
  helpers where the branch touches navigation.

## Acceptance Criteria

- [ ] Each affected branch/PR has been checked against `main` or the intended base branch.
- [ ] Missing files are restored before merge.
- [ ] Reverted navigation helpers are restored before merge.
- [ ] The verification result is recorded in the PR comment or project tracker.
- [ ] Any branch that still deletes critical files remains blocked.

## Suggested Verification

```bash
git fetch --all --prune
# Repeat per branch (replace BRANCH_NAME):
git diff --name-status main...origin/BRANCH_NAME -- .npmrc docs/ROADMAP.md docs/gitVersionControl.md docs/review.md src/utils/navigation.ts
```

## Suggested Labels

- `release-blocker`
- `repo-maintenance`
- `triage`
