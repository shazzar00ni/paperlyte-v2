# Bolt's Journal ⚡

Critical performance learnings for paperlyte-v2. Not a log — only surprises and traps.

## 2026-06-13 - ESLint enforces React Compiler memoization rules, but the build does NOT run the compiler

**Learning:** `eslint-plugin-react-hooks` v7 (`reactHooks.configs.flat.recommended`) ships
the React Compiler lint rules (e.g. `react-hooks/preserve-manual-memoization`), so the linter
analyzes components as if the compiler were on. But `vite.config.ts` uses plain
`@vitejs/plugin-react` with **no** `babel-plugin-react-compiler` — so at runtime there is
**zero** automatic memoization. Several comments in the repo (e.g. the old `Icon.tsx` path-split
comment) wrongly claimed "the React Compiler handles memoization automatically." It does not at
runtime; derived values are recomputed on every render.

Trap: adding `useMemo` keyed on a *derived local* (e.g. `useMemo(..., [paths])` where `paths`
comes from a helper call) trips `react-hooks/preserve-manual-memoization`:
"Existing memoization could not be preserved... This dependency may be modified later."
Memoizing on a *prop* (like the existing `normalizedColor` keyed on `[color]`) is fine.

**Action:** When manually memoizing here, key the memo on **stable props/primitives**, and fold
all dependent derivations into that single `useMemo` body (module-level imports are treated as
stable and don't need to be deps). Don't memoize on intermediate derived locals — the compiler
lint will reject it. Always run `npx eslint <file>` after adding memoization, not just tests.
