# Review Notes & Memory

This file captures repo-specific review context for Devin Review and contributors.

## Known Pre-Existing CI Issues (not caused by individual PRs)

### `Analysis` job — SonarQube/SonarCloud scanner misconfiguration

The `Analysis` GitHub Actions job fails on every PR with:

```
ERROR Validation of project reactor failed:
  o "" is not a valid project or module key. It cannot be empty nor contain whitespaces.
```

It also surfaces a misleading `mvn clean install` failure (`there is no POM in this directory`) — this repo is a Node/Vite project, not a Maven project. Both symptoms stem from the SonarSource scanner being invoked without a valid `sonar.projectKey`.

**Fix (deferred, repo-level):** add a `sonar-project.properties` at repo root with:

```properties
sonar.projectKey=shazzar00ni_paperlyte-v2
sonar.organization=shazzar00ni
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
```

…or pass `projectKey` via `args:` in the SonarSource action step. Until then, ignore `Analysis` failures on PRs.

### Other unrelated red checks commonly seen on PRs

- `netlify/paperlyte-v2/deploy-preview`, `Pages changed`, `Header rules`, `Redirect rules` — Netlify deploy preview infra, independent of code changes.
- `code/snyk (shazzar00ni)` — fails with "Code test limit reached" (org plan limit), not a code issue.
- `CircleCI Pipeline` — no `.circleci/config.yml` in repo; safe to ignore or remove the check.
- `CodeRabbit` — rate-limit failures are transient.

## Supply-Chain Security Conventions (established in PR #820)

- **Workflow permissions:** top-level `permissions: {}` (deny-all), with minimum permissions granted at the **job level**. All workflows follow this pattern, including `scorecard.yml`.
- **Pinned action SHAs:** all third-party actions are pinned by full commit SHA with a trailing `# vX.Y.Z` comment.
- **Release signing:** release tarballs are signed with cosign keyless (Sigstore). The bundle file is named `paperlyte-<version>.tar.gz.sigstore.json` (Sigstore convention) and uploaded as a release asset. Verification instructions live in `SECURITY.md` → "Verifying Release Artifacts".
- **Code scanning SARIF uploads:** every workflow that uploads SARIF must set a distinct `category:` on `github/codeql-action/upload-sarif` (e.g. `ossf-scorecard`, `snyk-security`) so findings from different scanners don't collide.
- **Python deps in workflows:** pinned to exact `==` versions (e.g. `requests==2.32.4`). Hash-pinning via `--require-hashes` is a possible future hardening step.
- **Fuzz target file extension:** the project is ESM (`"type": "module"` in `package.json`), so CommonJS fuzz targets must use the `.cjs` extension (see `fuzz/sanitize-input.fuzz.cjs`).
