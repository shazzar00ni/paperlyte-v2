---
name: 'Regression guard: Scorecard SARIF upload category'
about: Ensure scorecard.yml always sets category: ossf-scorecard on its upload-sarif step.
title: 'ci(scorecard): regression — restore `category: ossf-scorecard` on upload-sarif step'
labels: ['ci', 'security', 'good first issue']
assignees: []
---

## Context

Regression guard from PR #820 (OpenSSF Scorecard hardening).

`.github/workflows/scorecard.yml` uploads Scorecard findings to GitHub Code
Scanning with `category: ossf-scorecard`. This category was added to prevent
Scorecard findings from overriding results from other scanners
(`snyk-security.yml` sets `category: snyk-security`; `eslint.yml`, `codacy.yml`,
and `codescan.yml` each upload under their own categories).

File this issue if a future change to `scorecard.yml` removes or renames the
`category` field on the `upload-sarif` step.

## How to verify

```bash
grep 'category:' .github/workflows/scorecard.yml
# Expected: category: ossf-scorecard
```

## Acceptance criteria

- [ ] The `upload-sarif` step in `scorecard.yml` sets `category: ossf-scorecard`.
- [ ] Scorecard findings appear as a distinct analysis group in the Code
      Scanning UI and can be dismissed independently from other scanners.
