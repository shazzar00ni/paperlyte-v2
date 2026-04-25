---
name: 'Follow-up: Drop unused `security-events: write` from fuzzing.yml'
about: Remove the unused `security-events: write` permission from the Jazzer.js fuzzing job.
title: 'ci(fuzzing): remove unused `security-events: write` permission'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Follow-up from PR #820.

The `jazzer` job in `.github/workflows/fuzzing.yml` requests
`security-events: write`, but the workflow does not upload SARIF or any other
results to GitHub Code Scanning. This violates least-privilege.

## Proposed change

Either:

1. Drop `security-events: write` from the job permissions (preferred), or
2. Add a `github/codeql-action/upload-sarif` step if SARIF upload is intended.

```yaml
permissions:
  contents: read
```

## Acceptance criteria

- [ ] `security-events: write` is removed from `fuzzing.yml`, **or** a SARIF
      upload step is added that justifies the permission.
- [ ] Fuzzing workflow continues to run successfully.
