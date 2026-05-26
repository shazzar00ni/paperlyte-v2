# Socket Alert Triage: `npm/@sentry/core`

## Alert

- **Tool**: Socket for GitHub
- **Severity**: Warn / High
- **Package**: `@sentry/core@10.53.1` (transitive via `@sentry/react`)
- **Rule**: Potential obfuscated code
- **Confidence**: 0.90

## Review Summary

After review, this alert is treated as an **acceptable risk** for this repository's current architecture:

1. `@sentry/core` is an official package published by Sentry and consumed through `@sentry/react` for production error monitoring.
2. The package is distributed as optimized build artifacts, which can trigger obfuscation heuristics in supply-chain scanners.
3. No direct indicators of malicious behavior were identified from our usage path (React error boundary and client monitoring instrumentation only).
4. Removing Sentry would reduce observability and incident response quality for this landing page.

## Risk Decision

- **Decision**: Accept risk for this alert.
- **Scope**: `@sentry/core` transitively required by `@sentry/react`.
- **Compensating controls**:
  - Keep dependency versions pinned via lockfile and reviewed in PRs.
  - Continue automated dependency scanning in CI.
  - Re-evaluate on every Sentry major upgrade or when a new security advisory is published.

## PR Triage Comment

To ignore this alert for the current pull request only, use:

```text
@SocketSecurity ignore npm/@sentry/core@10.53.1
```

## Follow-up

- If Socket flags additional suspicious behavior beyond obfuscation heuristics, escalate to security for deeper static/dynamic analysis before upgrade.
