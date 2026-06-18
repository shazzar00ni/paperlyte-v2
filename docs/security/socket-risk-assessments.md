# Socket Risk Assessments

This file records dependency alerts that were reviewed and intentionally accepted for this repository.

## `@typescript-eslint/eslint-plugin` obfuscated-code heuristic

- **Package:** `@typescript-eslint/eslint-plugin`
- **Version reviewed:** `8.61.0`
- **Parent dependency:** `typescript-eslint@8.61.0`
- **Scope:** development dependency used only by ESLint configuration
- **Alert source:** Socket obfuscated-code heuristic
- **Decision:** acceptable risk for this pull request

### Review notes

Socket flags the package as likely obfuscated, but this repository consumes the package through the official `typescript-eslint` meta package. The npm metadata for `@typescript-eslint/eslint-plugin@8.61.0` points to the official `typescript-eslint/typescript-eslint` GitHub repository, declares the MIT license, and is maintained by the established package maintainers.

A version downgrade to `typescript-eslint@8.60.1` was tested and did not resolve the alert; Socket reported the same obfuscated-code heuristic for `@typescript-eslint/eslint-plugin@8.60.1`. Because the heuristic applies across adjacent legitimate releases, pinning older tooling would not reduce the practical risk and would only leave the lint toolchain stale.

The package is not bundled into the production landing page. It is used by ESLint during development and CI, as configured by `eslint.config.js`.

### Risk treatment

Accept the Socket alert for the affected pull request rather than suppressing all alerts or downgrading to another flagged release.

Socket PR comment to apply the pull-request-scoped exception:

```text
@SocketSecurity ignore npm/@typescript-eslint/eslint-plugin@8.61.0
```
