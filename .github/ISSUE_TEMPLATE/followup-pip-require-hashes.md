---
name: 'Follow-up: Hash-pin Python dependencies in weekly-report workflow'
about: Switch from version pins to full hash pinning via `pip install --require-hashes`.
title: 'ci(weekly-report): hash-pin pip dependencies with `--require-hashes`'
labels: ['ci', 'security', 'dependencies']
assignees: []
---

## Context

Follow-up from PR #820.

`.github/workflows/paperlyte-weekly-report.yml` was updated to pin
`requests==2.32.4` and `pandas==2.2.3`. This is an improvement, but the OpenSSF
Scorecard **Pinned-Dependencies** check expects pip installs to use full hash
pinning (`--require-hashes` against a `requirements.txt` containing per-package
SHA256 hashes), not bare version pins.

## Proposed change

1. Generate a hash-pinned `requirements.txt` (e.g. with `pip-compile
   --generate-hashes`) for the weekly-report workflow.
2. Update the workflow step to:

   ```yaml
   - run: pip install --require-hashes -r .github/workflows/weekly-report-requirements.txt
   ```

3. Add a Dependabot/Renovate config (or scheduled task) so the pinned hashes
   are kept current.

## Acceptance criteria

- [ ] Workflow installs Python deps via `pip install --require-hashes -r ...`.
- [ ] OpenSSF Scorecard Pinned-Dependencies check no longer warns on this
      workflow.
- [ ] An automated update mechanism is documented or configured.
