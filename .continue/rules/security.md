# Security

## Content Security Policy (CSP)

- Two-tier CSP: **relaxed in dev** (allows `unsafe-eval` for Vite HMR), **strict in production**.
- Production CSP is enforced via HTTP headers, not `<meta>` tags (meta tags cannot cover `frame-ancestors`).
- CSP is defined in **two places that must always be in sync**: `netlify.toml` and `vercel.json`. Any CSP change must be applied to both files simultaneously.
- Current `worker-src 'none'` blocks Sentry Session Replay. Do not add `worker-src 'self' blob:` without testing on both platforms.

## URL Validation

- The polymorphic `Button` component renders as `<a>` when given an `href` prop. The `isSafeUrl()` utility **must** be called on any dynamic URL before rendering it as an `href`.
- Blocked protocols: `javascript:`, `data:`, `vbscript:`, and any other non-http(s) scheme.
- Never bypass `isSafeUrl()` for internal routes — always validate.

## API Keys & Secrets

- No secrets in the client bundle. Environment variables prefixed `VITE_` are exposed to the browser at build time.
- Truly secret API keys (email provider credentials) must live in server-side Netlify Functions or CI secrets only.
- Sentry DSN (`VITE_SENTRY_DSN`) is intentionally client-side — it is a public identifier, not a secret. Do not remove the `VITE_` prefix or move it server-side.
- `.env.example` lists required variables without values. Never commit `.env`, `.env.local`, or `.env.production` with real values.

## Dependency Security

- Dependabot is configured for automatic dependency updates. Do not disable it.
- Run `npm audit` as part of CI (`npm run lint` job includes this). Do not merge PRs with high/critical vulnerabilities.
- Snyk scans (SAST, SCA, IaC) run in `.github/workflows/snyk-security.yml`. Review findings before merging.

## Input Handling

- All user-supplied content rendered as HTML must be sanitized. Never use `dangerouslySetInnerHTML` with unsanitized input.
- Email addresses collected through the waitlist form are sent server-side via the Netlify Function; never log or expose them in the browser.

## Analytics & Privacy

- Analytics is gated by the `VITE_ANALYTICS_ENABLED` environment variable.
- Sentry must filter sensitive query parameters before sending events. The filter list is in `src/main.tsx` — add parameters there, not inline.
- The legacy GA4 integration exists in `@utils/analytics` and is still used by the `useAnalytics()` hook. The newer privacy-first analytics module lives in `src/analytics/` and uses Plausible as the recommended provider. Do not add new direct GA4 calls — route through `useAnalytics()` or the `src/analytics/` module.

## Headers

- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin` are set in both `netlify.toml` and `vercel.json`. Do not remove them.
