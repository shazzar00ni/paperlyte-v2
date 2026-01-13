# Security Practices

[![Tracked Issue](https://img.shields.io/github/issues/detail/state/shazzar00ni/paperlyte-v2/50?label=SECURITY.md%20Tracking%20Issue)](https://github.com/shazzar00ni/paperlyte-v2/issues/50)

**Status:** Published — see [issue #50](https://github.com/shazzar00ni/paperlyte-v2/issues/50) for ongoing improvements and updates.  
**Last updated:** December 3, 2025

---

## Security Best Practices for Contributors

- Follow the [OWASP Top Ten](https://owasp.org/www-project-top-ten/) for web application security.
- Never commit secrets, credentials, or sensitive data to the repository.
- Use dependency pinning and keep dependencies up to date.
- Review code for common vulnerabilities (XSS, CSRF, SSRF, etc.).
- Use strong, unique passwords and enable 2FA on all accounts.
- Report any suspicious activity or potential vulnerabilities immediately.

## Vulnerability Disclosure & Reporting

If you discover a security vulnerability, please report it responsibly:

- Email: [security@paperlyte.com](mailto:security@paperlyte.com)
- Do **not** create a public GitHub issue for security vulnerabilities.
- Provide as much detail as possible (steps to reproduce, impact, etc.).
- We aim to acknowledge all reports within 24 hours and resolve critical issues promptly.

## Security Policies & Resources

- [Privacy Policy](./PRIVACY-POLICY.md)
- [Terms of Service](./TERMS-OF-SERVICE.md)
- [Cookie Policy](./COOKIE-POLICY.md)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [CII Best Practices](https://bestpractices.coreinfrastructure.org/)

## Dependency & Supply Chain Security

- All dependencies are managed via [npm](https://www.npmjs.com/) and checked for vulnerabilities using `npm audit`.
- Automated Dependabot alerts are enabled for this repository.
- Only trusted, well-maintained packages are used.
- Review and update dependencies regularly; avoid deprecated or unmaintained libraries.
- Use lockfiles (`package-lock.json`) to ensure deterministic builds.

## Reporting & Status

Progress on this document and all security-related improvements is tracked in [issue #50](https://github.com/shazzar00ni/paperlyte-v2/issues/50).

---

_For questions or urgent security concerns, contact [security@paperlyte.com](mailto:security@paperlyte.com)._
