---
name: 'Follow-up: Drop unused `security-events: write` from fuzzing.yml'
about: Remove the unused `security-events: write` permission from the Jazzer.js fuzzing job.
title: 'ci(fuzzing): remove unused `security-events: write` permission'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Regression guard from PR #820.

The `jazzer` job in `.github/workflows/fuzzing.yml` currently grants only
`contents: read`, which is the least-privilege configuration since the
workflow does not upload SARIF to GitHub Code Scanning. File this issue if
a future change adds `security-events: write` (or other write scopes) to
the fuzzing job without a corresponding `github/codeql-action/upload-sarif`
step that justifies it.

## Proposed change

Either:

1. Drop the unused write permission from the job permissions (preferred), or
2. Add a `github/codeql-action/upload-sarif` step if SARIF upload is intended.

```yaml
permissions:
  contents: read
```

## Acceptance criteria

- [ ] Unused write permissions are removed from `fuzzing.yml`, **or** a SARIF
      upload step is added that justifies them.
- [ ] Fuzzing workflow continues to run successfully.
