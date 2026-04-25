---
name: 'Follow-up: Tighten top-level permissions in scorecard.yml'
about: Replace `permissions: read-all` with `permissions: {}` at the workflow level in scorecard.yml.
title: 'ci(scorecard): set top-level `permissions: {}` instead of `read-all`'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Regression guard from PR #820 (OpenSSF Scorecard hardening).

`.github/workflows/scorecard.yml` currently sets `permissions: {}` at the
workflow level, matching the deny-all pattern used in the other workflows
(`deployment-status.yml`, `fuzzing.yml`, `paperlyte-weekly-report.yml`,
`release.yml`). File this issue if a future change reintroduces
`permissions: read-all` (or any broader workflow-level grant) without
justification.

## Proposed change

Restore workflow-level `permissions: {}` and rely on the job-level
permissions block (`contents: read`, `actions: read`, `security-events: write`,
`id-token: write`).

```yaml
permissions: {}
```

## Acceptance criteria

- [ ] `scorecard.yml` has `permissions: {}` at the workflow level.
- [ ] Scorecard analysis workflow still runs successfully and uploads SARIF.
