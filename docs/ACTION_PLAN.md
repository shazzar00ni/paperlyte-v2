# PR Review Action Plan — paperlyte-v2

## Context

The `PR_REVIEW_SUMMARY.md` documents months of PR reviews across this repo. This action plan is a
current-state tracker for: (1) codebase fixes from approved PRs, (2) editorial actions on open PRs,
and (3) branch-restoration work for branches that accidentally deleted critical files.

Branch: `claude/pr-review-action-plan-Rl6dF`

Last updated: 2026-05-29

---

## Current Completion Snapshot

### Completed on this branch

- `.npmrc` exists and contains the required `legacy-peer-deps=true` setting.
- `docs/ROADMAP.md`, `docs/gitVersionControl.md`, and `docs/review.md` exist on this branch.
- PR #428 is implemented in the codebase:
  - `safeNavigate()` is now documented as same-origin/relative navigation only.
  - `safeNavigate()` rejects non-same-origin absolute URLs.
  - `safeNavigateExternal()` exists for intentional external `http:`/`https:` navigation.
  - `src/utils/navigation.test.ts` imports and tests `safeNavigateExternal()`.
- PR #422 is implemented in the codebase (`@types/node` and `@types/react` are updated).
- PR #425 is handled via the existing legacy `.eslintrc.cjs`, not `.eslintrc.json`:
  - `eslint.config.js` remains the authoritative config for local/flat-config-aware ESLint runs.
  - `.eslintrc.cjs` is explicitly documented for Codacy's legacy ESLint runner (the `eslint` engine in `.codacy.yml`) and other
    legacy tools that cannot consume flat config.

### Still open / not completed on this branch

- PR #424 is still pending: `CounterAnimation` still uses a plain object for easing functions and
  bracket notation lookup.
- PR #419 does **not** appear implemented in the current codebase: `@vercel/analytics` is not
  present in `package.json` or `package-lock.json`, and no Vercel Analytics component/import is
  present in `src/`.
- PR #279 is still pending or intentionally deferred: `react-router-dom` is not installed,
  `main.tsx` does not wrap `<App />` in `<BrowserRouter>`, and `App.tsx` does not define routes for
  `/privacy` or `/terms`.
- External PR/branch editorial actions still need owner follow-up unless those PRs have already
  been closed, updated, or superseded in GitHub.

---

## All PRs & Recommendations

### CRITICAL — Accidental File Deletions (2026-03-05)

The files below are restored/present on the current branch. The listed remote branches/PRs remain
**blocked from merging** until their branch diffs are confirmed to restore the deleted files and,
where applicable, restore the expected `src/utils/navigation.ts` helpers.

**4 deleted files** (restore from `main`):

| Branch / PR                                         | `.npmrc` | `docs/ROADMAP.md` | `docs/gitVersionControl.md` | `docs/review.md` |
| --------------------------------------------------- | :------: | :---------------: | :-------------------------: | :---------------: |
| Current branch                                      |    ✓     |         ✓         |              ✓              |         ✓         |
| `origin/claude/implement-todo-item-2H9LP`           | Verify   |      Verify       |           Verify            |      Verify       |
| `origin/claude/core-editor-phase-1-PI3Yp`           | Verify   |      Verify       |           Verify            |      Verify       |
| `origin/copilot/sub-pr-503`                         | Verify   |         —         |           Verify            |      Verify       |
| `origin/copilot/sub-pr-469-again`                   | Verify   |         —         |           Verify            |      Verify       |
| `origin/claude/fix-peer-dependency-conflicts-Wj2iC` | Verify   |         —         |              —              |         —         |
| PR #469, #488, #491, #502, #506                     | Verify   |      Verify       |           Verify            |      Verify       |

- `.npmrc` → content must be exactly: `legacy-peer-deps=true`
- `docs/ROADMAP.md`, `docs/gitVersionControl.md`, `docs/review.md` → restore verbatim from `main`

**Separate content restoration** (`src/utils/navigation.ts` helpers):

| Branch / PR                                         | `hasDangerousProtocol` / `isRelativeUrl` restored |
| --------------------------------------------------- | :-----------------------------------------------: |
| Current branch                                      |                         ✓                         |
| `origin/claude/implement-todo-item-2H9LP`           |                      Verify                       |
| `origin/claude/core-editor-phase-1-PI3Yp`           |                      Verify                       |
| `origin/copilot/sub-pr-503`                         |                      Verify                       |
| `origin/copilot/sub-pr-469-again`                   |                      Verify                       |
| `origin/claude/fix-peer-dependency-conflicts-Wj2iC` |                      Verify                       |

---

### PRs — Approved codebase work

| PR                                                                                                               | Summary                                                               | Current status on this branch                         |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| #428                                                                                                             | Add `safeNavigateExternal()` + restrict `safeNavigate` to same-origin | **Completed**                                         |
| #424                                                                                                             | Convert `CounterAnimation` easing functions from object to `Map`      | **Pending — implement now**                           |
| #425                                                                                                             | Add legacy ESLint config for Codacy compatibility                     | **Completed via `.eslintrc.cjs`; do not add JSON now** |
| #422                                                                                                             | Update `@types/node` and `@types/react`                               | **Completed**                                         |
| #419                                                                                                             | Vercel Web Analytics integration                                      | **Pending / not found in current codebase**           |
| #406, #388, #387, #384, #381, #379, #355, #353, #332, #331, #329, #321, #309, #308, #284, #260, #263, #265, #262 | Various CI, test, security, accessibility, analytics improvements     | Approved — assumed merged unless branch diff says not |

---

### PRs — Changes Requested (author action needed)

| PR   | Issue                                                                                | Action                                                                                                               |
| ---- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| #427 | Duplicate `permissions` keys and multiple `if` conditions in GitHub Actions workflow | Verify PR branch matches clean `claude.yml` on main; if not, fix duplicate key + combine `if` into single expression |
| #275 | Misleading title; previous security regressions mostly removed but PR is stale       | Close; reopen with accurate title scoped only to Codacy warning fixes                                                |
| #279 | React Router routing not wired into `App.tsx`; `react-router-dom` not installed      | Either complete routing integration OR mark as WIP/deferred; see implementation path below                           |
| #319 | Mixed PR: `Privacy.tsx` fix + unrelated `package-lock.json` + `sitemap.xml` changes  | Split into 2 PRs: one for `Privacy.tsx` only, one for dependency/sitemap changes                                     |
| #311 | Proposes switching Icon fallback from `FontAwesomeIcon` component to raw `<i>` tags  | Reject this change; current `Icon.tsx` implementation is correct; accessibility improvements can be separate PR      |

---

### PRs — Close Recommended

| PR                                       | Reason                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| #259                                     | Empty diff; title claims Twitter link update but no changes                        |
| #107                                     | 118-file monolithic PR, mostly superseded; unique changes should be in focused PRs |
| #435, #434, #433, #432, #431, #385, #383 | Redundant PRs that only update `PR_REVIEW_SUMMARY.md`                              |

---

### PRs — Postpone

| PR   | Reason                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| #389 | 186-file semicolons formatting change — will conflict with all active PRs; merge after all in-flight work lands |

---

## Remaining Codebase Changes to Implement

### 1. PR #424 — Convert `CounterAnimation` easing to `Map`

**File:** `src/components/ui/CounterAnimation/CounterAnimation.tsx`

Current state: still pending. The file currently defines `easingFunctions` as a plain object and
uses `easingFunctions[animEasing](progress)` during animation.

Required changes:

- Replace the plain object with `Map<string, (t: number) => number>`:

  ```ts
  const easingFunctions = new Map<string, (t: number) => number>([
    ['linear', (t: number) => t],
    ['easeOutQuart', (t: number) => 1 - Math.pow(1 - t, 4)],
    ['easeOutExpo', (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))],
  ])
  ```

- Replace bracket lookup with a safe `Map#get` fallback:

  ```ts
  const easingFn = easingFunctions.get(animEasing) ?? ((t: number) => t)
  const easedProgress = easingFn(progress)
  ```

---

### 2. PR #419 — Re-check Vercel Web Analytics decision

Current state: not found in this branch. Before implementing, confirm whether the project still
wants Vercel Analytics in addition to the existing analytics stack.

If proceeding:

- Add the required Vercel Analytics package.
- Add the analytics component/import in the React entry point or app root according to the current
  Vercel documentation.
- Update CSP/header configuration only as needed.
- Add or update tests if the integration affects rendered output.

If not proceeding, explicitly mark PR #419 as deferred/rejected in the PR review summary and keep
this action plan aligned.

---

### 3. PR #279 — React Router Integration (only if proceeding with Option A)

Current state: not implemented. The app still renders the landing page directly without
`react-router-dom`.

If the decision is to complete routing:

- `package.json`: add `react-router-dom`
- `src/main.tsx`: wrap `<App />` in `<BrowserRouter>`
- `src/App.tsx`: add `<Routes>` with `"/"` → landing page, `"/privacy"` → `<Privacy />`,
  `"/terms"` → `<Terms />`
- `src/constants/legal.ts`: update `LEGAL_CONFIG.documents.privacy` and `.terms` from `.html`
  paths to `/privacy` and `/terms`, then update related tests/snapshots
- `vercel.json` already has catch-all rewrite for client-side routing — no change needed

If the decision is not to route these pages in React, mark PR #279 as WIP/deferred and keep the
existing static `/privacy.html` and `/terms.html` strategy documented.

---

## Completed Codebase Changes — No Further Action Needed Here

### PR #428 — `safeNavigateExternal()` and same-origin `safeNavigate()`

No further implementation is needed on this branch. The navigation utility now includes:

- `isSameOriginUrl()`
- same-origin enforcement in `safeNavigate()`
- `safeNavigateExternal()` for intentional external `http:`/`https:` URLs
- unit coverage for the external-navigation behavior

### PR #425 — Legacy ESLint config clarification

No `.eslintrc.json` should be added for the current setup. The current branch already has:

- `eslint.config.js` as the source of truth for local and flat-config-aware ESLint runs
- `.eslintrc.cjs` for Codacy's legacy ESLint runner (the `eslint` engine in `.codacy.yml`) and other legacy tools

Only add another legacy config file if a specific external tool is confirmed to require that exact
filename/format and cannot consume either `eslint.config.js` or `.eslintrc.cjs`.

---

## Issue Drafts Created

The remaining work has been split into focused issue drafts under `docs/issues/`:

- [`counteranimation-map-easing.md`](./issues/counteranimation-map-easing.md) — implement PR #424's
  `CounterAnimation` `Map` hardening.
- [`vercel-web-analytics-decision.md`](./issues/vercel-web-analytics-decision.md) — decide whether
  to implement, defer, or reject PR #419.
- [`react-router-privacy-terms-routing.md`](./issues/react-router-privacy-terms-routing.md) — decide
  and, if approved, implement PR #279 routing.
- [`verify-restored-critical-files.md`](./issues/verify-restored-critical-files.md) — verify affected
  remote branches restored required files and navigation helpers.
- [`triage-stale-prs.md`](./issues/triage-stale-prs.md) — triage the remaining changes-requested,
  close-recommended, and postponed PRs.

---

## Verification

Run these checks before considering the remaining codebase tasks closed:

```bash
npm ci
npx tsc -b --noEmit
npm run lint
npm test
rg "safeNavigateExternal" src/utils/navigation.ts src/utils/navigation.test.ts
rg "new Map" src/components/ui/CounterAnimation/CounterAnimation.tsx
node -e "const p=require('./package.json'); console.log(p.dependencies?.['react-router-dom'] ?? p.devDependencies?.['react-router-dom'] ?? 'react-router-dom not installed')"
test -f .eslintrc.cjs
test -f .npmrc && test -f docs/ROADMAP.md && test -f docs/gitVersionControl.md && test -f docs/review.md
```

Expected current-state notes:

- `rg "safeNavigateExternal" ...` should pass now.
- `rg "new Map" src/components/ui/CounterAnimation/CounterAnimation.tsx` will fail until PR #424
  is implemented.
- The `react-router-dom` check currently prints `react-router-dom not installed` unless PR #279 is
  implemented.
- `test -f .eslintrc.cjs` should pass; `test -f .eslintrc.json` is no longer a required check.

---

## Critical Files

- `src/utils/navigation.ts` — completed safe internal/external navigation split
- `src/utils/navigation.test.ts` — completed tests for `safeNavigateExternal()`
- `src/components/ui/CounterAnimation/CounterAnimation.tsx` — still needs Map-based easing
- `eslint.config.js` — authoritative ESLint flat config
- `.eslintrc.cjs` — legacy ESLint compatibility config for Codacy/legacy tooling
- `.npmrc`, `docs/ROADMAP.md`, `docs/gitVersionControl.md`, `docs/review.md` — must exist before merge
- `package.json`, `src/main.tsx`, `src/App.tsx`, `src/constants/legal.ts` — required touch points if
  React Router integration proceeds
