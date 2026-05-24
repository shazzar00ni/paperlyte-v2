---
name: 'Follow-up: Guard fuzzing.yml against unnecessary write permissions'
about: Keep the fuzz job least-privileged unless a write permission is justified by a SARIF upload step.
title: 'ci(fuzzing): guard against unnecessary write permissions in fuzzing.yml'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Regression guard from PR #820.

The `fuzz` job in `.github/workflows/fuzzing.yml` currently grants only
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
