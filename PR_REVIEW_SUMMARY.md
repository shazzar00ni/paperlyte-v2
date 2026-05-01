# PR Review Summary

## 2026-05-01

### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)

- **Status:** Critical — Action Required
- **Summary:** An automated repository-wide audit of 260 unmerged branches confirms the following systemic regressions.

| Regression Type                | Count | Severity    | Notes                                               |
| :----------------------------- | :---- | :---------- | :-------------------------------------------------- |
| Orphan Branches                | 0     | 🔴 Critical | No common ancestor with `main`.                     |
| Missing `.npmrc`               | 82    | 🔴 Critical | Breaks dependency resolution.                       |
| Missing `docs/ROADMAP.md`      | 76    | 🟠 High     | Core project documentation.                         |
| Missing `gitVersionControl.md` | 91    | 🟠 High     | Core Git workflow documentation.                    |
| Missing `review.md`            | 91    | 🟡 Medium   | AI PR reviewer instructions.                        |
| Reverted Security Helpers      | 90    | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers. |
| Unreadable navigation.ts       | 0     | 🔴 Critical | File missing or unreadable.                         |

- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.

This file contains a summary of pull requests I have reviewed.
