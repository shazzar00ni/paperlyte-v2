---
name: 'Follow-up: Preserve crash-reproducing inputs from fuzz runs'
about: Upload the crash-triggering input as a CI artifact when the fuzz target fails.
title: 'ci(fuzzing): upload crash-reproducing input as artifact on fuzz failure'
labels: ['ci', 'security', 'enhancement']
assignees: []
---

## Context

Follow-up from PR #820.

The hand-rolled Node.js fuzz target (`fuzz/sanitize-input.fuzz.cjs`) already
surfaces crashes correctly: it calls `process.stderr.write(…)` then
`process.exit(1)`, which naturally fails the `fuzz` CI job. No
`continue-on-error` is set, so any invariant violation is immediately visible
in the PR check.

What is currently missing is **preservation of the crash-triggering input**.
When the job fails, the input that caused the crash is only printed to stderr —
it is not saved as a downloadable artifact, making manual reproduction harder.

## Proposed change

Add an `if: failure()` step after the fuzz step that writes the last crash
input logged to stderr into a file and uploads it via
`actions/upload-artifact`:

```yaml
- name: Upload crash input on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: fuzz-crash-input
    path: fuzz/crash-input.txt
    retention-days: 30
```

The fuzz harness would need a small change to write the offending input to
`fuzz/crash-input.txt` before calling `process.exit(1)`.

## Acceptance criteria

- [ ] A fuzz crash produces a visible CI failure (already working).
- [ ] The crash-triggering input is downloadable as a CI artifact so it can be
      reproduced locally without re-running the full fuzz suite.
