# Architecture Decision Records

Lightweight log of decisions made during development that are worth
remembering but don't warrant a full ADR document.

---

## 2026-04-20 — Keep `initScrollDepthTracking` as dead code (for now)

**Context:**
PR #764 replaced the GA4-specific `initScrollDepthTracking`
(`src/utils/analytics.ts:463`) with the provider-agnostic
`createScrollTracker` from `src/analytics/scrollDepth.ts` inside
`useAnalytics`. After the switch, `initScrollDepthTracking` is no longer
imported by any production code. It is still exported, documented, and
covered by ~220 lines of tests in `src/utils/analytics.test.ts`.

**Decision:**
Leave the function in place rather than removing it in this PR.

**Rationale:**
- The function is tree-shaken out of the production bundle (Vite/Rollup
  dead-code elimination), so it has zero runtime cost.
- Its test suite validates shared helpers (`calculateScrollPercent`,
  `trackScrollMilestones`, `createThrottledScrollHandler`) that could be
  reused if a GA4-only scroll tracker is ever needed again.
- Removing it would expand the scope of an already-large PR and require
  deleting or rewriting the associated tests.

**Follow-up:**
Remove `initScrollDepthTracking` and its dedicated tests in a future
cleanup PR once the `createScrollTracker` path has been validated in
production. Alternatively, mark the export as `@deprecated` so editors
surface a warning if anyone imports it.
