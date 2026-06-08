# Issue Drafts for Remaining Action Plan Tasks

These drafts turn the remaining `docs/ACTION_PLAN.md` work into focused GitHub issues. They are
ready to copy into GitHub Issues, or to create with the GitHub CLI/API once repository credentials
are available in the environment.

| Draft                                                                              | Purpose                                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`counteranimation-map-easing.md`](./counteranimation-map-easing.md)               | Implement PR #424's `CounterAnimation` `Map` hardening.                        |
| [`vercel-web-analytics-decision.md`](./vercel-web-analytics-decision.md)           | Decide whether to proceed with PR #419 and implement/defer accordingly.        |
| [`react-router-privacy-terms-routing.md`](./react-router-privacy-terms-routing.md) | Decide and, if approved, implement PR #279 React Router integration.           |
| [`verify-restored-critical-files.md`](./verify-restored-critical-files.md)         | Verify remote branches restored deleted critical files and navigation helpers. |
| [`triage-stale-prs.md`](./triage-stale-prs.md)                                     | Triage remaining changes-requested, close-recommended, and postponed PRs.      |

Recommended order:

1. File `counteranimation-map-easing.md` first because it is a straightforward approved code fix.
2. File `verify-restored-critical-files.md` before merging any affected branches.
3. File `react-router-privacy-terms-routing.md` and `vercel-web-analytics-decision.md` as explicit
   product/technical decisions before implementation.
4. File `triage-stale-prs.md` to clean up the PR queue and reduce merge-conflict risk.
