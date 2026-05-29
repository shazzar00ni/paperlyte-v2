# Decide and implement Privacy/Terms React Router integration

## Summary

Resolve PR #279 by deciding whether Privacy and Terms should be routed through React Router or
remain static HTML pages.

## Background

`docs/ACTION_PLAN.md` marks PR #279 as pending or intentionally deferred. The current app renders
the landing page directly, `react-router-dom` is not installed, and `LEGAL_CONFIG` still points to
static `.html` documents.

## Decision Needed

Choose one path:

1. **Option A — Implement React Router:** use `/privacy` and `/terms` React routes.
2. **Option B — Keep static HTML:** retain `/privacy.html` and `/terms.html`, and document PR #279
   as deferred/rejected.

## Implementation Scope If Option A Is Approved

- Add `react-router-dom` to `package.json`.
- Wrap `<App />` in `<BrowserRouter>` in `src/main.tsx`.
- Add `<Routes>` in `src/App.tsx`:
  - `/` renders the landing page.
  - `/privacy` renders `<Privacy />`.
  - `/terms` renders `<Terms />`.
- Update `src/constants/legal.ts` from `.html` paths to `/privacy` and `/terms`.
- Update related tests and snapshots.
- Verify deployment rewrites still support client-side routing.

## Acceptance Criteria

- [ ] The routing/static-page decision is documented.
- [ ] If Option A is approved, `/`, `/privacy`, and `/terms` render correctly in app tests or E2E
      tests.
- [ ] If Option A is approved, legal constants and snapshots are updated.
- [ ] If Option B is selected, `docs/ACTION_PLAN.md` marks PR #279 as deferred/rejected rather than
      pending.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.

## Suggested Verification

```bash
node -e "const p=require('./package.json'); console.log(p.dependencies?.['react-router-dom'] ?? p.devDependencies?.['react-router-dom'] ?? 'react-router-dom not installed')"
rg "BrowserRouter|Routes|react-router-dom" src package.json package-lock.json
npm run lint
npm test
npm run build
```

## Suggested Labels

- `routing`
- `product-decision`
- `frontend`
