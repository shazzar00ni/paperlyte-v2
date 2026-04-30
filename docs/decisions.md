# Architecture Decision Records

Lightweight log of decisions made during development that are worth
remembering but don't warrant a full ADR document.

---

## 2026-04-20 — Remove `initScrollDepthTracking` in favour of `createScrollTracker`

**Context:**
PR #764 replaced the GA4-specific `initScrollDepthTracking`
(`src/utils/analytics.ts`) with the provider-agnostic `createScrollTracker`
from `src/analytics/scrollDepth.ts`, wired up inside `useAnalytics`.

**Decision:**
Delete `initScrollDepthTracking` and its ~220 lines of dedicated tests from
`src/utils/analytics.test.ts` in the same PR.

**Rationale:**

- The old function was no longer imported by any production code; keeping it
  would be misleading dead code.
- Deleting it alongside the feature switch keeps the codebase consistent and
  avoids deferring cleanup.
- `createScrollTracker` is the canonical scroll-depth primitive going forward;
  `useAnalytics` is the integration point for React consumers.
