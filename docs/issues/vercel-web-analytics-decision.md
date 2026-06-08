# Decide whether to proceed with Vercel Web Analytics integration

## Summary

Resolve the current mismatch between `docs/PR_REVIEW_SUMMARY.md`, which marks PR #419 as approved,
and the current codebase, where Vercel Web Analytics does not appear to be installed or wired.

## Background

`docs/ACTION_PLAN.md` marks PR #419 as pending/not found in the current codebase. The repository
already has analytics utilities and providers, so this should be an explicit product/technical
decision instead of silently adding another analytics path.

## Decision Needed

Choose one path:

1. **Proceed** with Vercel Web Analytics.
2. **Defer** until analytics requirements are revisited.
3. **Reject** because the existing analytics stack is sufficient.

## Implementation Scope If Proceeding

- Add the required Vercel Analytics dependency.
- Wire the Vercel Analytics component/import in the app root or entry point per current official
  Vercel guidance.
- Update CSP/header configuration only if required.
- Ensure the privacy policy and analytics documentation remain accurate.
- Add or update tests if the integration affects rendered output.

## Acceptance Criteria

- [ ] A decision is recorded in `docs/ACTION_PLAN.md` and, if appropriate, `docs/PR_REVIEW_SUMMARY.md`.
- [ ] If proceeding, dependency and app wiring are implemented.
- [ ] If proceeding, CSP/privacy documentation is checked for accuracy.
- [ ] If deferring/rejecting, the action plan no longer lists the task as ambiguous.
- [ ] `npm run lint` passes after any code changes.
- [ ] `npm test` passes after any code changes, or failures are documented with clear environment
      limitations.

## Suggested Verification

```bash
node -e "const p=require('./package.json'); console.log(p.dependencies?.['@vercel/analytics'] ?? p.devDependencies?.['@vercel/analytics'] ?? '@vercel/analytics not installed')"
rg "@vercel/analytics|<Analytics" src package.json package-lock.json vercel.json vite.config.ts
npm run lint
npm test
```

## Suggested Labels

- `analytics`
- `product-decision`
- `frontend`
