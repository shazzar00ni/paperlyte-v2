# PR Review Summary

This file contains a summary of pull requests I have reviewed.

## 2026-05-09

### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)

- **Status:** Critical — Action Required
- **Summary:** An automated repository-wide audit of 277 unmerged branches confirms the following systemic regressions.

| Regression Type                | Count | Severity    | Notes                                               |
| :----------------------------- | :---- | :---------- | :-------------------------------------------------- |
| Orphan Branches                | 0     | 🔴 Critical | No common ancestor with `main`.                     |
| Missing `.npmrc`               | 79    | 🔴 Critical | Breaks dependency resolution.                       |
| Missing `docs/ROADMAP.md`      | 75    | 🟠 High     | Core project documentation.                         |
| Missing `gitVersionControl.md` | 88    | 🟠 High     | Core Git workflow documentation.                    |
| Missing `review.md`            | 88    | 🟡 Medium   | AI PR reviewer instructions.                        |
| Reverted Security Helpers      | 87    | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers. |
| Unreadable navigation.ts       | 8     | 🔴 Critical | File missing or unreadable.                         |

- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.

### Manual PR Reviews - 2026-05-09

- **Branch:** `claude/implement-service-worker-YLeLZ`
  - **Status:** Ready / Recommended for Merge
  - **Summary:** Implements a robust PWA service worker with offline support.
  - **Feedback:** The implementation is clean and follows best practices for service worker registration and caching strategies. The addition of `offline.html` significantly improves the user experience during connectivity issues.

- **Branch:** `claude/netlify-markdown-edge-function-cdyQy`
  - **Status:** Ready / Recommended for Merge
  - **Summary:** Adds a Netlify Edge Function for dynamic Markdown processing.
  - **Feedback:** Excellent work on the Edge Function implementation. The use of stubs for local testing and the comprehensive test suite in `tests/edge-functions/` ensures high reliability. This provides a flexible way to serve documentation or blog content.

- **Branch:** `copilot/fix-hardcoded-passwords`
  - **Status:** Ready (with minor note)
  - **Summary:** Refactors theme storage keys in `useTheme.ts`.
  - **Feedback:** The changes correctly refactor `THEME_STORAGE_KEY` and `USER_PREFERENCE_KEY` to more descriptive `THEME_STORAGE_NAME` and `USER_PREFERENCE_STORAGE_NAME`. Note: The branch name `fix-hardcoded-passwords` is misleading as the PR addresses code maintainability/naming rather than security credentials.

---

## 2026-03-05

### Analysis: Accidental File Deletions in Open Branches (Jules Daily PR Reviews)

- **Status:** Critical — Action Required
- **Summary:** Analysis of Jules' daily PR reviews (2026-03-01, 2026-03-04, and 2026-03-05) confirms that a large number of open branches have **accidentally deleted** the following critical files from the repository:

  | File                   | Severity    | Notes                                                                                                |
  | ---------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
  | `.npmrc`               | 🔴 Critical | Controls `legacy-peer-deps=true`; its removal breaks dependency resolution for all peer dependencies |
  | `docs/ROADMAP.md`      | 🟠 High     | Core project roadmap documentation                                                                   |
  | `gitVersionControl.md` | 🟠 High     | Core Git workflow documentation                                                                      |
  | `review.md`            | 🟡 Medium   | AI PR reviewer instruction file                                                                      |

- **Affected Branches (confirmed across multiple reviews):**

  | Branch / PR                                         | `.npmrc` | `docs/ROADMAP.md` | `gitVersionControl.md` | `review.md` | `src/utils/navigation.ts` reverted |
  | --------------------------------------------------- | :------: | :---------------: | :--------------------: | :---------: | :--------------------------------: |
  | `origin/claude/implement-todo-item-2H9LP`           |    ✗     |         ✗         |           ✗            |      ✗      |                 ✗                  |
  | `origin/claude/core-editor-phase-1-PI3Yp`           |    ✗     |         ✗         |           ✗            |      ✗      |                 ✗                  |
  | `origin/copilot/sub-pr-503`                         |    ✗     |         —         |           ✗            |      ✗      |                 ✗                  |
  | `origin/copilot/sub-pr-469-again`                   |    ✗     |         —         |           ✗            |      ✗      |                 ✗                  |
  | `origin/claude/fix-peer-dependency-conflicts-Wj2iC` |    ✗     |         —         |           —            |      —      |                 ✗                  |
  | PR #469, #488, #491, #502, #506                     |    ✗     |         ✗         |           ✗            |      ✗      |                 —                  |

  _✗ = accidentally deleted/reverted; — = not affected_

- **Root Cause:** Likely caused by a destructive rebase or a base branch that had these files removed; propagated across many branches that branched off from it.
- **Action Required:** All affected branches must restore the four files listed above (and the `hasDangerousProtocol`/`isRelativeUrl` helpers in `src/utils/navigation.ts`) before they can be merged. The files all exist and are intact on `main`.

---
