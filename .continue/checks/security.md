# Security Review

Paperlyte is "private by design" with local-first architecture. The codebase and its CI pipeline must not introduce security vulnerabilities or leak sensitive data.

## Check

Review changed files for the following security issues:

1. **Hardcoded secrets**: API keys, tokens, passwords, private URLs, or credentials embedded directly in source files. This includes test files, config files, and environment variable declarations that contain real values. Any string resembling a secret (long random strings, `sk-`, `pk-`, `Bearer `, etc.) must be flagged immediately.

2. **Unsafe `dangerouslySetInnerHTML`**: Use of `dangerouslySetInnerHTML` without sanitization. If user-controlled or externally sourced content is rendered this way, it is an XSS vulnerability. Flag any new usage and verify the content source.

3. **Unvalidated user input reaching the DOM**: Form inputs, URL parameters, or query strings that flow into rendered content without going through the validation and sanitization utilities in `src/utils/` (specifically `validation-sanitization`). All external input is untrusted.

4. **Content Security Policy violations**: New inline scripts, inline event handlers (`onclick="..."`), or dynamically constructed `<script>` tags that would be blocked by the production CSP defined in `vercel.json`. Also flag `eval()`, `new Function()`, or `setTimeout(string)` usage outside of Vite's dev tooling.

5. **Dependency additions with known vulnerabilities**: Any newly added `npm` package should be checked for active CVEs. Flag packages that have had recent security advisories or whose version range does not include the latest security patch.

6. **Sensitive data in analytics or logging**: Any analytics event, `console.log`, or error tracking call that includes personally identifiable information (email, IP, device fingerprint), passwords, payment data, or private note content. The `analytics` module must only track behavioral events with anonymous data.

7. **Insecure external resource loading**: New `<script src>`, `<link href>`, or `fetch()` calls targeting third-party URLs without Subresource Integrity (SRI) hashes, or without verifying the domain is in the existing CSP allowlist.

8. **`localStorage`/`sessionStorage` with sensitive data**: Storing authentication tokens, passwords, or private user data in browser storage without encryption. Session data must only contain non-sensitive app state.

For each finding, state the exact risk, the file and line, and a specific remediation.
