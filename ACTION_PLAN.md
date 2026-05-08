# PR Review Action Plan — paperlyte-v2

## Context

The `PR_REVIEW_SUMMARY.md` documents months of PR reviews across this repo. Three categories of
work are needed: (1) codebase fixes for approved PRs that haven't landed yet, (2) editorial
actions on open PRs (changes-requested, close, postpone), and (3) a branch-restoration mandate
for several branches that accidentally deleted critical files.

Branch: `claude/pr-review-action-plan-Rl6dF`

---

## All PRs & Recommendations

### CRITICAL — Accidental File Deletions (2026-03-05)

The following branches/PRs are **blocked from merging** until they restore the deleted files
listed below and, where applicable, revert content changes to `src/utils/navigation.ts`:

**4 deleted files** (restore from `main`):

| Branch / PR | `.npmrc` | `docs/ROADMAP.md` | `gitVersionControl.md` | `review.md` |
|---|:---:|:---:|:---:|:---:|
| `origin/claude/implement-todo-item-2H9LP` | ✗ | ✗ | ✗ | ✗ |
| `origin/claude/core-editor-phase-1-PI3Yp` | ✗ | ✗ | ✗ | ✗ |
| `origin/copilot/sub-pr-503` | ✗ | — | ✗ | ✗ |
| `origin/copilot/sub-pr-469-again` | ✗ | — | ✗ | ✗ |
| `origin/claude/fix-peer-dependency-conflicts-Wj2iC` | ✗ | — | — | — |
| PR #469, #488, #491, #502, #506 | ✗ | ✗ | ✗ | ✗ |

- `.npmrc` → content must be exactly: `legacy-peer-deps=true`
- `docs/ROADMAP.md`, `gitVersionControl.md`, `review.md` → restore verbatim from `main`

**Separate content restoration** (file exists but helpers were reverted):

| Branch / PR | `navigation.ts` helpers reverted |
|---|:---:|
| `origin/claude/implement-todo-item-2H9LP` | ✗ |
| `origin/claude/core-editor-phase-1-PI3Yp` | ✗ |
| `origin/copilot/sub-pr-503` | ✗ |
| `origin/copilot/sub-pr-469-again` | ✗ |
| `origin/claude/fix-peer-dependency-conflicts-Wj2iC` | ✗ |

- `src/utils/navigation.ts` — the file is present but `hasDangerousProtocol` and `isRelativeUrl`
  have been reverted; restore both helpers from `main` (lines 28–69)

---

### PRs — Approved but NOT yet in codebase (implement now)

| PR | Summary | Status |
|---|---|---|
| #428 | Add `safeNavigateExternal()` + restrict `safeNavigate` to same-origin | Approved — **missing from codebase** |
| #424 | Convert `CounterAnimation` easing functions from object to `Map` | Approved — **missing from codebase** |
| #425 | Add `.eslintrc.json` for Codacy compatibility | Approved — **missing from codebase** |
| #422 | Update `@types/node` and `@types/react` | Approved — **already in codebase** |
| #419 | Vercel Web Analytics integration | Approved — **already in codebase** |
| #406, #388, #387, #384, #381, #379, #355, #353, #332, #331, #329, #321, #309, #308, #284, #260, #263, #265, #262 | Various CI, test, security, accessibility, analytics improvements | Approved — assumed merged |

---

### PRs — Changes Requested (author action needed)

| PR | Issue | Action |
|---|---|---|
| #427 | Duplicate `permissions` keys and multiple `if` conditions in GitHub Actions workflow | Verify PR branch matches clean `claude.yml` on main; if not, fix duplicate key + combine `if` into single expression |
| #275 | Misleading title; previous security regressions mostly removed but PR is stale | Close; reopen with accurate title scoped only to Codacy warning fixes |
| #279 | React Router routing not wired into `App.tsx`; `react-router-dom` not installed | Either complete routing integration OR mark as WIP; see implementation path below |
| #319 | Mixed PR: `Privacy.tsx` fix + unrelated `package-lock.json` + `sitemap.xml` changes | Split into 2 PRs: one for `Privacy.tsx` only, one for dependency/sitemap changes |
| #311 | Proposes switching Icon fallback from `FontAwesomeIcon` component to raw `<i>` tags | Reject this change; current `Icon.tsx` (FontAwesomeIcon-based) is correct; accessibility improvements can be separate PR |

---

### PRs — Close Recommended

| PR | Reason |
|---|---|
| #259 | Empty diff; title claims Twitter link update but no changes |
| #107 | 118-file monolithic PR, mostly superseded; unique changes should be in focused PRs |
| #435, #434, #433, #432, #431, #385, #383 | Redundant PRs that only update `PR_REVIEW_SUMMARY.md` |

---

### PRs — Postpone

| PR | Reason |
|---|---|
| #389 | 186-file semicolons formatting change — will conflict with all active PRs; merge after all in-flight work lands |

---

## Codebase Changes to Implement

### 1. Add `safeNavigateExternal()` to `src/utils/navigation.ts`

**File:** `src/utils/navigation.ts` (currently ends at line 166)

Current state: `safeNavigate()` at lines 150–166 allows external HTTP/HTTPS. Its security note
even warns this is not same-origin-only. PR #428's approval means:

- `safeNavigate()` should be tightened to same-origin + relative URLs only
- New `safeNavigateExternal(url: string): boolean` handles intentional external navigation

Changes:

1. Update `safeNavigate()` JSDoc — remove the "allows external HTTP/HTTPS" language; add
   "same-origin and relative URLs only" to the description
2. Replace the body of `safeNavigate()` to reject non-same-origin URLs using a new helper:

   ```ts
   function isSameOriginUrl(url: string): boolean {
     try {
       const parsed = new URL(url, window.location.origin)
       return parsed.origin === window.location.origin
     } catch { return false }
   }
   ```

   Then in `safeNavigate`: after `isSafeUrl` check, also reject if `!isSameOriginUrl(url) && !isRelativeUrl(url)`

3. Add after `safeNavigate()`:

   ```ts
   export function safeNavigateExternal(url: string): boolean {
     if (typeof window === 'undefined') return false
     if (!isSafeUrl(url)) {
       if (import.meta.env.DEV) console.warn(`External navigation blocked: "${url}"`)
       return false
     }
     try {
       const parsed = new URL(url)
       if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
     } catch { return false }
     window.open(url, '_blank', 'noopener,noreferrer')
     return true
   }
   ```

Also update `src/utils/navigation.test.ts`:

- Import `safeNavigateExternal`
- Add `describe('safeNavigateExternal')` block testing: allows https://, allows http://, blocks
  javascript:, blocks data:, blocks relative paths, returns false in SSR, uses `window.open`

---

### 2. Convert `CounterAnimation` easing to `Map`

**File:** `src/components/ui/CounterAnimation/CounterAnimation.tsx`

Current state: plain object at lines 42–46; bracket-notation lookup at line 128.

Changes:

- Lines 42–46: replace plain object with `Map<string, (t: number) => number>`:

  ```ts
  const easingFunctions = new Map<string, (t: number) => number>([
    ['linear', (t: number) => t],
    ['easeOutQuart', (t: number) => 1 - Math.pow(1 - t, 4)],
    ['easeOutExpo', (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))],
  ])
  ```

- Line 128: replace `easingFunctions[animEasing](progress)` with:

  ```ts
  const easingFn = easingFunctions.get(animEasing) ?? ((t: number) => t)
  const easedProgress = easingFn(progress)
  ```

  (update line 129 accordingly — `currentValue` uses `easedProgress`)

---

### 3. Clarify legacy ESLint config usage

Do **not** add `.eslintrc.json` for the repo's current Codacy/local setup.
This repository already uses `eslint.config.js` (flat config), and that should remain the source
of truth for current ESLint runs.

Only add a legacy `.eslintrc.json` if a **separate external tool** is confirmed to require the
legacy ESLint config format and cannot consume `eslint.config.js`. If that happens, document the
exact tool/integration and keep any legacy config aligned with the flat config to avoid drift.

Avoid version-specific wording such as "ESLint 9 ignores this file"; the important point is that
the current repo setup is based on `eslint.config.js`, while `.eslintrc.*` is only for legacy
compatibility when explicitly needed.

---

### 4. PR #279 — React Router Integration (if proceeding with Option A)

If the decision is to complete routing:

- `package.json`: add `react-router-dom`
- `src/main.tsx`: wrap `<App />` in `<BrowserRouter>`
- `src/App.tsx`: add `<Routes>` with `"/"` → landing page, `"/privacy"` → `<Privacy />`,
  `"/terms"` → `<Terms />`
- `src/constants/legal.ts`: update `LEGAL_CONFIG.documents.privacy` and `.terms` from
  `.html` paths to `/privacy` and `/terms`
- `vercel.json` already has catch-all rewrite for client-side routing — no change needed

---

## Verification

```bash
npm ci                        # validates .npmrc present
npx tsc --noEmit              # zero type errors
npm run lint                  # zero lint errors
npm test                      # all tests pass (including new safeNavigateExternal tests)
grep safeNavigateExternal src/utils/navigation.ts   # must return lines
grep 'new Map' src/components/ui/CounterAnimation/CounterAnimation.tsx  # must return 1
test -f .eslintrc.json        # must pass
```

---

## Critical Files

- `src/utils/navigation.ts` — add `safeNavigateExternal`, tighten `safeNavigate`
- `src/utils/navigation.test.ts` — add tests for `safeNavigateExternal`
- `src/components/ui/CounterAnimation/CounterAnimation.tsx` — Map-based easing (lines 42–46, 128)
- `.eslintrc.json` — create new file at root
- `.npmrc`, `docs/ROADMAP.md`, `gitVersionControl.md`, `review.md` — must exist on all branches before merge
