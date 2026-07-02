/**
 * WAF Edge Function
 *
 * Runs at the edge (Netlify's global CDN) before requests reach origin.
 * Blocks malicious requests: scanner user agents, path traversal, injection
 * probes, oversized payloads, and known attack signatures.
 */
import type { Context } from 'https://edge.netlify.com'

// ---------------------------------------------------------------------------
// Blocked user-agent patterns (vulnerability scanners & automated attack tools)
// ---------------------------------------------------------------------------
const BLOCKED_USER_AGENTS: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /\bnmap\b/i,
  /masscan/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /\bw3af\b/i,
  /havij/i,
  /dirbuster/i,
  /gobuster/i,
  /\bwfuzz\b/i,
  /zgrab/i,
  /nuclei/i,
  /interactsh/i,
  /metasploit/i,
  /burpsuite/i,
  /\bhydra\b/i,
  /appscan/i,
  /webinspect/i,
]

// ---------------------------------------------------------------------------
// Attack signature patterns (checked against decoded path + query string)
// ---------------------------------------------------------------------------
const ATTACK_SIGNATURES: RegExp[] = [
  // Path traversal
  /\.\.[/\\]/,
  /\.\.%2f/i,
  /\.\.%5c/i,
  /\.\.%c0%af/i,
  /\.\.%c1%9c/i,
  // Sensitive file exposure
  /\/etc\/(?:passwd|shadow|hosts|crontab)/i,
  /\/proc\/self\//i,
  /\/proc\/\d+\//,
  /\/\.env(?:$|[./])/,
  /\/\.aws\//,
  /\/\.ssh\//,
  /\/\.git\/(?:config|HEAD|objects)/,
  // CMS & admin probing (not applicable to this site)
  /\/wp-(?:admin|login|config|cron)/i,
  /\/phpmyadmin/i,
  /\/adminer/i,
  /\/xmlrpc\.php/i,
  /\/administrator\//i,
  // File type probing (this site has no server-side scripts)
  /\.(php|asp|aspx|jsp|cgi|cfm|pl|py|rb|sh)(?:\?|$)/i,
  // SQL injection probes (split into individual patterns to keep complexity low)
  // NOSONAR - these patterns use \s+/\s* between fixed literals; backtracking is O(n) linear
  // (not catastrophic) because each alternative is anchored by a distinct literal keyword.
  // Bounding \s would allow >limit encoded spaces to bypass detection — unbounded is correct.
  /union\s+all\s+select/i, // NOSONAR
  /union\s+select/i, // NOSONAR
  /select\s+\S{1,128}\s+from/i, // NOSONAR
  /insert\s+into/i, // NOSONAR
  /drop\s+(?:table|database)/i, // NOSONAR
  /alter\s+table/i, // NOSONAR
  /exec(?:ute)?\s*\(/i, // NOSONAR
  /xp_cmdshell/i,
  // XSS probes in URL
  /<script[\s>]/i,
  /javascript\s*:/i, // NOSONAR
  /vbscript\s*:/i, // NOSONAR
  /on(?:load|error|click|mouse|focus|blur|change)\s*=/i, // NOSONAR
  // SSRF / open-redirect probes
  /(?:file|dict|gopher|ldap|ftp):\/\//i,
]

// Maximum accepted Content-Length (512 KB) — generous for a form submit,
// protective against payload-stuffing attacks on serverless functions.
const MAX_BODY_BYTES = 512 * 1024

// Allowed HTTP methods for serverless function endpoints.
const FUNCTION_ALLOWED_METHODS = new Set(['GET', 'POST', 'OPTIONS', 'HEAD'])

// ---------------------------------------------------------------------------
// CSP nonce helpers
// ---------------------------------------------------------------------------

/** Byte length for the CSP nonce — 128 bits of entropy. */
const NONCE_BYTE_LENGTH = 16

/**
 * Generates a cryptographically random base64url-encoded nonce (no padding).
 * 128 bits of entropy is sufficient to prevent brute-force prediction.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTE_LENGTH)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Builds the full Content-Security-Policy value for an HTML response.
 *
 * script-src strategy:
 *   'nonce-{n}'      — trusts every <script nonce="n"> tag in the HTML
 *   'strict-dynamic' — transitively trusts any scripts those tags load at
 *                      runtime (covers Plausible, Sentry Session Replay, etc.)
 *   'self' https://plausible.io — CSP Level 2 fallback for browsers that do
 *                      not support strict-dynamic; ignored by browsers that do
 *
 * Intentionally blocked: any root-path <script> injected into the page from
 * outside our trusted nonce chain — e.g. the /auto-events.js and /proxy.js
 * requests added by a visitor's browser extension. These are dynamically
 * created via the DOM (document.createElement + appendChild), not nonce-tagged
 * markup; under 'strict-dynamic' a dynamically created script is trusted only
 * when its creator is itself a nonce/hash-trusted script. An extension content
 * script carries no nonce, so trust never propagates to what it inserts and the
 * load is rejected. Neither file exists in or is referenced by this project.
 * The resulting "Content security policy"
 * entries in the DevTools Issues panel are the policy working as designed, not
 * a regression; they appear only for visitors who have the injecting extension
 * installed and have no effect on site functionality. Do NOT loosen the policy
 * to admit these scripts: that would forfeit the "block all post-build injected
 * scripts" XSS guarantee this nonce architecture exists to provide. See the
 * "auto-events.js / proxy.js console errors are extension noise" entry in
 * memory/decisions.md for the full diagnosis and how to confirm.
 */
function buildCsp(nonce: string): string {
  return (
    `default-src 'self'; ` +
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'self' https://plausible.io; ` +
    `style-src 'self'; ` +
    `font-src 'self'; ` +
    `img-src 'self' data:; ` +
    `connect-src 'self' https://plausible.io https://*.ingest.sentry.io; ` +
    `worker-src 'self' blob:; ` +
    `frame-src 'none'; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'; ` +
    `frame-ancestors 'none'; ` +
    `upgrade-insecure-requests;`
  )
}

/** Returns true when the response carries an HTML body. */
function isHtmlResponse(response: Response): boolean {
  const ct = response.headers.get('content-type')?.toLowerCase() ?? ''
  return ct.includes('text/html')
}

/**
 * Replaces the build-time `nonce="CSP_NONCE"` placeholder stamped by the
 * Vite `cspPlugin` with the per-request cryptographic nonce.
 *
 * Only `<script>` tags that were present in the trusted build artifact carry
 * the placeholder; tags injected into the response after the build do not and
 * are therefore blocked by the nonce-based CSP, preserving XSS protection.
 */
function injectNonceIntoHtml(html: string, nonce: string): string {
  return html.replaceAll('nonce="CSP_NONCE"', `nonce="${nonce}"`)
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/**
 * Clones `response` with an additional `X-Request-ID` header set to `requestId`.
 * Applied to every response — blocked and forwarded — so all traffic can be
 * correlated in edge logs regardless of whether the request was blocked.
 *
 * @param response  - The response to annotate.
 * @param requestId - UUID generated at the start of the WAF handler.
 */
function withRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers)
  headers.set('X-Request-ID', requestId)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** Returns a 403 Forbidden response with no body. */
function forbidden(): Response {
  return new Response(null, { status: 403 })
}

/** Returns a 400 Bad Request response with no body. */
function badRequest(): Response {
  return new Response(null, { status: 400 })
}

/** Returns a 413 Content Too Large response with no body. */
function payloadTooLarge(): Response {
  return new Response(null, { status: 413 })
}

/**
 * Returns a 405 Method Not Allowed response with an `Allow` header listing
 * the permitted HTTP methods.
 *
 * @param allowed - Array of allowed HTTP method strings (e.g. `["GET", "POST"]`).
 */
function methodNotAllowed(allowed: string[]): Response {
  return new Response(null, {
    status: 405,
    headers: { Allow: allowed.join(', ') },
  })
}

// ---------------------------------------------------------------------------
// WAF checks — each returns a blocking Response or null to continue
// ---------------------------------------------------------------------------

/**
 * Returns `forbidden()` if the user-agent string matches a known scanner or
 * automated attack tool, otherwise returns `null`.
 *
 * @param ua - Value of the `User-Agent` request header.
 */
function checkUserAgent(ua: string): Response | null {
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(ua)) return forbidden()
  }
  return null
}

/**
 * Checks the request body size against `MAX_BODY_BYTES`.
 *
 * Uses the `Content-Length` header as a fast-path early rejection. For
 * requests that carry a body the stream is read incrementally so that the
 * edge function never allocates memory for a payload that exceeds the limit —
 * preventing an attacker from forcing full buffering before the 413 is sent.
 *
 * @param request - The incoming HTTP request.
 * @returns `payloadTooLarge()` if either size check fails, `badRequest()` if
 *   the body cannot be read, or `null` if the size is within the limit.
 */
async function checkBodySize(request: Request): Promise<Response | null> {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) return payloadTooLarge()

  const hasBody = request.body !== null && request.method !== 'GET' && request.method !== 'HEAD'

  if (!hasBody) return null

  try {
    const stream = request.clone().body
    if (stream === null) return null

    const reader = stream.getReader()
    let total = 0
    let chunk = await reader.read()

    while (!chunk.done) {
      total += chunk.value.byteLength
      if (total > MAX_BODY_BYTES) {
        // Cancel both the clone's branch and the original to release queued data.
        await Promise.all([reader.cancel(), request.body.cancel()])
        return payloadTooLarge()
      }
      chunk = await reader.read()
    }
  } catch {
    return badRequest()
  }

  return null
}

/**
 * Iteratively percent-decodes `raw` up to three passes until the string
 * stabilises, catching multi-encoded payloads such as:
 * `%252e%252e%252f` → `%2e%2e%2f` → `../`
 *
 * @param raw - Raw URL path and query string.
 * @returns The fully-decoded string.
 * @throws {URIError} If `raw` contains malformed percent-encoding.
 */
function decodeIteratively(raw: string): string {
  let decoded = raw
  for (let i = 0; i < 3; i++) {
    const next = decodeURIComponent(decoded)
    if (next === decoded) break // stable — no further encoding layers
    decoded = next
  }
  return decoded
}

/**
 * Checks the request URL against all attack signatures.
 *
 * Both the raw (encoded) form and the fully-decoded form are tested so
 * patterns for encoded sequences (e.g. `/\.\.%2f/i`) fire alongside
 * patterns for decoded sequences (e.g. `/\.\.[/\\]/`).
 *
 * The query string's `+` characters are normalised to spaces before matching
 * because `application/x-www-form-urlencoded` uses `+` to encode spaces, but
 * `decodeURIComponent` does not convert them. Without this step, payloads like
 * `union+select` would bypass whitespace-sensitive signatures.
 *
 * A third canonicalized form (all `\s+` runs collapsed to a single space) is
 * also checked so that multi-space padding — e.g. `union+++select` or
 * `union%20%20%20select` — cannot bypass `\s+`-based signatures.
 *
 * @param url - Parsed URL of the request.
 * @returns `forbidden()` on a signature match, `badRequest()` on malformed
 *   encoding, or `null` to continue.
 */
function checkUrlSignatures(url: URL): Response | null {
  // Translate + to space in the query portion only (path + is literal, not a space).
  const raw = url.pathname + url.search.replaceAll('+', ' ')
  let decoded: string
  try {
    decoded = decodeIteratively(raw)
  } catch {
    return badRequest()
  }

  // Collapse all whitespace runs to a single space so that multi-space padding
  // (e.g. "union   select" via repeated + or %20) cannot bypass \s+ signatures.
  const canonicalized = decoded.replace(/\s+/g, ' ')

  // Build a deduplicated list: raw → decoded → canonicalized.
  const seen = new Set<string>([raw])
  const targets: string[] = [raw]
  if (!seen.has(decoded)) {
    seen.add(decoded)
    targets.push(decoded)
  }
  if (!seen.has(canonicalized)) {
    targets.push(canonicalized)
  }

  for (const t of targets) {
    for (const pattern of ATTACK_SIGNATURES) {
      if (pattern.test(t)) return forbidden()
    }
  }
  return null
}

/**
 * Checks that requests targeting Netlify serverless function endpoints use an
 * allowed HTTP method.
 *
 * @param pathname - URL pathname of the request.
 * @param method   - HTTP method of the request.
 * @returns `methodNotAllowed()` if the method is disallowed on a function
 *   endpoint, or `null` to continue.
 */
function checkFunctionMethod(pathname: string, method: string): Response | null {
  const isFunctionEndpoint = pathname.startsWith('/.netlify/functions/')
  const isMethodAllowed = FUNCTION_ALLOWED_METHODS.has(method)
  if (isFunctionEndpoint && !isMethodAllowed) {
    return methodNotAllowed([...FUNCTION_ALLOWED_METHODS])
  }
  return null
}

// ---------------------------------------------------------------------------
// WAF handler
// ---------------------------------------------------------------------------

/**
 * Netlify Edge Function WAF handler.
 *
 * Generates a unique `X-Request-ID` at the start and attaches it to every
 * response — blocked (4xx) and forwarded alike — so all traffic can be
 * correlated in edge logs regardless of outcome.
 *
 * Runs each check in sequence; the first non-null result short-circuits
 * and returns the blocking response to the client. Clean requests are
 * forwarded to the origin via `context.next()`.
 *
 * @param request - The incoming HTTP request.
 * @param context - Netlify edge-function context providing `next()`.
 * @returns A `Response` — either a block response (4xx) or the origin response,
 *   always carrying an `X-Request-ID` header.
 */
export default async function waf(request: Request, context: Context): Promise<Response> {
  const url = new URL(request.url)
  const requestId = crypto.randomUUID()

  const uaBlock = checkUserAgent(request.headers.get('user-agent') ?? '')
  if (uaBlock) return withRequestId(uaBlock, requestId)

  const bodySizeBlock = await checkBodySize(request)
  if (bodySizeBlock) return withRequestId(bodySizeBlock, requestId)

  const signatureBlock = checkUrlSignatures(url)
  if (signatureBlock) return withRequestId(signatureBlock, requestId)

  const methodBlock = checkFunctionMethod(url.pathname, request.method)
  if (methodBlock) return withRequestId(methodBlock, requestId)

  try {
    const response = await context.next()

    // For HTML responses: inject a per-request CSP nonce into every <script>
    // tag and set a nonce-based Content-Security-Policy header.
    // 'strict-dynamic' causes modern browsers to ignore the host allowlist and
    // instead trust any script transitively loaded by a nonce-carrying script
    // (Plausible, Sentry, etc.), eliminating host-allowlist bypass vectors.
    if (isHtmlResponse(response)) {
      // HEAD and certain status codes require special handling — skip or
      // adjust before any body transformation.
      //
      // HEAD: no body to inject nonces into. Strip CSP so a HEAD revalidation
      //   response cannot downgrade a cached nonce-based policy to the weaker
      //   static host-allowlist fallback from netlify.toml (same rationale as 304).
      if (request.method === 'HEAD') {
        const headers = new Headers(response.headers)
        headers.delete('Content-Security-Policy')
        // Strip the same stale representation metadata removed from GET 200s:
        // a cache can use HEAD headers to update a stored GET response, which
        // would reintroduce validators/range support for the pre-nonce body.
        headers.delete('ETag')
        headers.delete('Last-Modified')
        headers.delete('Accept-Ranges')
        headers.delete('Content-Length')
        headers.set('X-Request-ID', requestId)
        return new Response(null, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }

      // 204 No Content / 206 Partial Content: no complete body; injecting
      //   nonces into a partial range body would corrupt Content-Range offsets.
      if (response.status === 204 || response.status === 206) {
        return withRequestId(response, requestId)
      }

      // 304 Not Modified: the browser reuses its cached body, which already
      // carries the original per-request nonce from the initial 200 response.
      // The Fetch API also rejects a non-null body on a 304, so transforming
      // would produce a 502. Crucially, 304 headers update the browser's cached
      // response metadata — passing the static netlify.toml fallback CSP would
      // downgrade the cached entry from the nonce-based policy to the weaker
      // host-allowlist policy. Strip CSP from 304s so the cached 200 response
      // keeps its original nonce-based policy intact.
      if (response.status === 304) {
        const headers = new Headers(response.headers)
        headers.delete('Content-Security-Policy')
        headers.set('X-Request-ID', requestId)
        return new Response(null, {
          status: 304,
          statusText: response.statusText,
          headers,
        })
      }

      const nonce = generateNonce()
      // Deno's Fetch implementation transparently decompresses Content-Encoding
      // (gzip / br / zstd) before .text() returns, matching browser behaviour.
      // `html` is therefore always valid UTF-8 text regardless of the encoding
      // the origin set on the response.
      const html = await response.text()
      const modifiedHtml = injectNonceIntoHtml(html, nonce)

      const headers = new Headers(response.headers)
      headers.set('Content-Security-Policy', buildCsp(nonce))
      headers.set('X-Request-ID', requestId)
      // The reconstructed body is a plain UTF-8 string, not a compressed byte
      // stream. Delete Content-Encoding so the browser does not try to
      // decompress already-decoded content.
      headers.delete('Content-Encoding')
      // Injecting nonce attributes changes the body byte length; delete the
      // stale Content-Length so the browser does not truncate the modified HTML.
      headers.delete('Content-Length')
      // The nonce makes every rewritten body unique, so the origin's ETag and
      // Last-Modified no longer describe this representation. Remove them to
      // prevent a client from sending Range + If-Range with the old validator:
      // the origin would accept it and return a 206 slice of the pre-nonce HTML,
      // whose byte offsets no longer align with the cached nonce-expanded body.
      headers.delete('ETag')
      headers.delete('Last-Modified')
      headers.delete('Accept-Ranges')

      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return withRequestId(response, requestId)
  } catch (error) {
    console.error('WAF origin/network error', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    // Origin or network error — return a 502 with the request ID so the
    // failed request remains traceable in edge logs alongside blocked traffic.
    return withRequestId(new Response(null, { status: 502 }), requestId)
  }
}
