---
name: 'Follow-up: Add explicit SARIF `category` to Scorecard upload'
about: Set a unique Code Scanning category for Scorecard SARIF uploads.
title: 'ci(scorecard): add `category: scorecard` to upload-sarif step'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Follow-up from PR #820.

The `github/codeql-action/upload-sarif` step in
`.github/workflows/scorecard.yml` does not specify a `category`. Without one,
all SARIF uploads from this repository share the same default Code Scanning
analysis group, which can cause Scorecard findings to override or conflict with
other scanners (`snyk-security.yml` already sets `category: snyk-security`).

## Proposed change

```yaml
- name: Upload to code-scanning
  uses: github/codeql-action/upload-sarif@<pinned-sha>
  with:
    sarif_file: results.sarif
    category: scorecard
```

## Acceptance criteria

- [ ] Scorecard upload-sarif step sets `category: scorecard`.
- [ ] Scorecard findings appear as a distinct analysis group in the Code
      Scanning UI and can be dismissed independently from other scanners.
