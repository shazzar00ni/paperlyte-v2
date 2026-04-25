---
name: 'Follow-up: Tighten top-level permissions in scorecard.yml'
about: Replace `permissions: read-all` with `permissions: {}` at the workflow level in scorecard.yml.
title: 'ci(scorecard): set top-level `permissions: {}` instead of `read-all`'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Follow-up from PR #820 (OpenSSF Scorecard hardening).

`.github/workflows/scorecard.yml` currently sets `permissions: read-all` at the
workflow level, which grants broader read access than necessary and undermines
the top-level `permissions: {}` pattern used elsewhere in this PR
(`deployment-status.yml`, `fuzzing.yml`, `paperlyte-weekly-report.yml`,
`release.yml`).

## Proposed change

Set workflow-level `permissions: {}` and rely on the existing job-level
permissions block (`contents: read`, `actions: read`, `security-events: write`,
`id-token: write`).

```yaml
permissions: {}
```

## Acceptance criteria

- [ ] `scorecard.yml` has `permissions: {}` at the workflow level.
- [ ] Scorecard analysis workflow still runs successfully and uploads SARIF.
