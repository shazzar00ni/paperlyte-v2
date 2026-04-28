---
name: 'Follow-up: Detect Jazzer.js fuzz crashes instead of silently swallowing them'
about: Make the fuzzing workflow surface real crashes/timeouts found by Jazzer.js.
title: 'ci(fuzzing): surface Jazzer.js crashes instead of `continue-on-error: true`'
labels: ['ci', 'security', 'enhancement']
assignees: []
---

## Context

Follow-up from PR #820.

The Jazzer.js step in `.github/workflows/fuzzing.yml` runs with
`continue-on-error: true`. Any real crash, uncaught throw, or timeout produced
by the fuzzer will not fail the job, will not annotate the PR, and will not
page anyone on the weekly schedule. This makes the fuzzing CI effectively
non-actionable.

## Proposed change

Pick one of the following once the fuzz target is stable:

1. Flip `continue-on-error` to `false` so CI fails on crashes.
2. Keep `continue-on-error: true` but add a follow-up step that scans the
   workspace for Jazzer crash artifacts (`crash-*` files) and either fails the
   job or opens an issue when any are found.

## Acceptance criteria

- [ ] A real crash discovered by Jazzer.js produces a visible CI failure or an
      automatically opened issue.
- [ ] Fuzzing corpus continues to be uploaded as an artifact.
