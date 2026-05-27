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

1. Install `pip-tools` and generate a hash-pinned requirements file:

   ```bash
   pip install pip-tools
   pip-compile --generate-hashes --output-file requirements/weekly-report.txt \
     <(echo $'requests==2.32.4\npandas==2.2.3')
   ```

2. Commit `requirements/weekly-report.txt` to the repository.

3. Update the workflow step to reference the new file:

   ```yaml
   - run: pip install --require-hashes -r requirements/weekly-report.txt
   ```

4. Add a Dependabot/Renovate config (or scheduled task) so the pinned hashes
   are kept current when new patch releases are available.

## Acceptance criteria

- [ ] `requirements/weekly-report.txt` exists at the repo root and contains
      `--hash=sha256:...` entries for every package and its transitive deps.
- [ ] Workflow installs Python deps via
      `pip install --require-hashes -r requirements/weekly-report.txt`.
- [ ] OpenSSF Scorecard Pinned-Dependencies check no longer warns on this
      workflow.
- [ ] An automated update mechanism is documented or configured.
