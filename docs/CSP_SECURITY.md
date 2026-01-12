# Content Security Policy (CSP) Configuration

## Current Status

The application currently uses `'unsafe-inline'` for `script-src` and `style-src` in the Content Security Policy (CSP). While this reduces protection against XSS attacks, it is a **necessary trade-off** for React + Vite SPAs.

### Why `'unsafe-inline'` is Required

1. **Vite Development Mode**: Vite injects inline scripts for Hot Module Replacement (HMR)
2. **React Runtime**: React may inject inline styles for certain components
3. **Third-party Libraries**: Some dependencies may require inline scripts/styles

## Security Measures in Place

Despite using `'unsafe-inline'`, we maintain strong security through:

### ✅ Other CSP Directives
- `default-src 'self'` - Only load resources from same origin
- `frame-ancestors 'none'` - Prevent clickjacking
- `base-uri 'self'` - Restrict base URL changes
- `form-action 'self'` - Restrict form submissions

### ✅ Additional Security Headers
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `Strict-Transport-Security` - Force HTTPS with HSTS
- `Referrer-Policy` - Control referrer information
- `Permissions-Policy` - Restrict browser features

### ✅ Application-Level Protection
- Input sanitization on all user inputs
- React's built-in XSS protection (automatic escaping)
- No use of `dangerouslySetInnerHTML` without sanitization
- All external links use `rel="noopener noreferrer"`

## Future Improvements

### Option 1: CSP Nonces (Recommended for Future)

Generate unique nonces for each request and inject them into scripts/styles:

```javascript
// Example implementation
const nonce = generateNonce()
// Inject nonce into HTML: <script nonce="xyz">
// Update CSP: script-src 'self' 'nonce-xyz'
```

**Requirements:**
- Server-side rendering or build-time generation
- Vercel Middleware to inject nonces
- Update Vite config to support nonces

### Option 2: CSP Hashes

Generate SHA-256 hashes of all inline scripts and styles:

```bash
# Generate hash
echo -n 'script content' | openssl dgst -sha256 -binary | openssl base64
```

**Requirements:**
- Post-build script to extract and hash inline content
- Automated CSP header generation
- May break with Vite updates that change inline scripts

### Option 3: Eliminate Inline Content

Refactor to remove all inline scripts and styles:

**Requirements:**
- Extract all inline styles to CSS modules
- Configure Vite to avoid inline scripts (may impact performance)
- Ensure all third-party libraries support strict CSP

## Implementation Roadmap

1. **Short-term** (Current): Use `'unsafe-inline'` with strict other directives
2. **Medium-term**: Implement CSP reporting to monitor violations
3. **Long-term**: Migrate to nonce-based CSP when SSR is available

## CSP Reporting

Add CSP reporting to monitor potential violations:

```json
{
  "report-uri": "https://your-reporting-endpoint.com/csp-report",
  "report-to": "csp-endpoint"
}
```

## References

- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vite CSP Configuration](https://vitejs.dev/guide/build.html#content-security-policy-csp)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#jsx-prevents-injection-attacks)

## Monitoring

Current CSP violations can be monitored via:
- Browser DevTools Console
- Sentry error tracking (already configured)
- Future: Dedicated CSP reporting endpoint

---

**Last Updated**: January 2026
**Owner**: Engineering Team
**Security Review**: Required before removing `'unsafe-inline'`
