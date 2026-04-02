/**
 * WAF Edge Function
 *
 * Runs at the edge (Netlify's global CDN) before requests reach origin.
 * Blocks malicious requests: scanner user agents, path traversal, injection
 * probes, oversized payloads, and known attack signatures.
 */
import type { Config, Context } from "https://edge.netlify.com";

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
];

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
  /union\s+all\s+select/i,
  /union\s+select/i,
  /select\s+\S{1,128}\s+from/i,
  /insert\s+into/i,
  /drop\s+(?:table|database)/i,
  /alter\s+table/i,
  /exec(?:ute)?\s*\(/i,
  /xp_cmdshell/i,
  // XSS probes in URL
  /<script[\s>]/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /on(?:load|error|click|mouse|focus|blur|change)\s*=/i,
  // SSRF / open-redirect probes
  /(?:file|dict|gopher|ldap|ftp):\/\//i,
];

// Maximum accepted Content-Length (512 KB) — generous for a form submit,
// protective against payload-stuffing attacks on serverless functions.
const MAX_BODY_BYTES = 512 * 1024;

// Allowed HTTP methods for serverless function endpoints.
const FUNCTION_ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS", "HEAD"]);

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
  const headers = new Headers(response.headers);
  headers.set("X-Request-ID", requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Returns a 403 Forbidden response with no body. */
function forbidden(): Response {
  return new Response(null, { status: 403 });
}

/** Returns a 400 Bad Request response with no body. */
function badRequest(): Response {
  return new Response(null, { status: 400 });
}

/** Returns a 413 Content Too Large response with no body. */
function payloadTooLarge(): Response {
  return new Response(null, { status: 413 });
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
    headers: { Allow: allowed.join(", ") },
  });
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
    if (pattern.test(ua)) return forbidden();
  }
  return null;
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
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return payloadTooLarge();

  const hasBody = request.body !== null
    && request.method !== "GET"
    && request.method !== "HEAD";

  if (!hasBody) return null;

  try {
    const stream = request.clone().body;
    if (stream === null) return null;

    const reader = stream.getReader();
    let total = 0;
    let chunk = await reader.read();

    while (!chunk.done) {
      total += chunk.value.byteLength;
      if (total > MAX_BODY_BYTES) {
        // Cancel both the clone's branch and the original to release queued data.
        await Promise.all([reader.cancel(), request.body.cancel()]);
        return payloadTooLarge();
      }
      chunk = await reader.read();
    }
  } catch {
    return badRequest();
  }

  return null;
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
  let decoded = raw;
  for (let i = 0; i < 3; i++) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) break; // stable — no further encoding layers
    decoded = next;
  }
  return decoded;
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
 * @param url - Parsed URL of the request.
 * @returns `forbidden()` on a signature match, `badRequest()` on malformed
 *   encoding, or `null` to continue.
 */
function checkUrlSignatures(url: URL): Response | null {
  // Translate + to space in the query portion only (path + is literal, not a space).
  const raw = url.pathname + url.search.replaceAll("+", " ");
  let decoded: string;
  try {
    decoded = decodeIteratively(raw);
  } catch {
    return badRequest();
  }

  const targets = decoded === raw ? [raw] : [raw, decoded];
  for (const t of targets) {
    for (const pattern of ATTACK_SIGNATURES) {
      if (pattern.test(t)) return forbidden();
    }
  }
  return null;
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
  const isFunctionEndpoint = pathname.startsWith("/.netlify/functions/");
  const isMethodAllowed = FUNCTION_ALLOWED_METHODS.has(method);
  if (isFunctionEndpoint && !isMethodAllowed) {
    return methodNotAllowed([...FUNCTION_ALLOWED_METHODS]);
  }
  return null;
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
export default async function waf(
  request: Request,
  context: Context,
): Promise<Response> {
  const url = new URL(request.url);
  const requestId = crypto.randomUUID();

  const uaBlock = checkUserAgent(request.headers.get("user-agent") ?? "");
  if (uaBlock) return withRequestId(uaBlock, requestId);

  const bodySizeBlock = await checkBodySize(request);
  if (bodySizeBlock) return withRequestId(bodySizeBlock, requestId);

  const signatureBlock = checkUrlSignatures(url);
  if (signatureBlock) return withRequestId(signatureBlock, requestId);

  const methodBlock = checkFunctionMethod(url.pathname, request.method);
  if (methodBlock) return withRequestId(methodBlock, requestId);

  try {
    const response = await context.next();
    return withRequestId(response, requestId);
  } catch {
    // Origin or network error — return a 502 with the request ID so the
    // failed request remains traceable in edge logs alongside blocked traffic.
    return withRequestId(new Response(null, { status: 502 }), requestId);
  }
}

export const config: Config = {
  path: "/*",
  // Skip WAF on static assets served directly from the CDN cache.
  // Fonts live under /fonts/ (e.g. /fonts/Inter-Variable.woff2); root-level
  // font globs would never match those URLs, so /fonts/* is used instead.
  excludedPath: [
    "/assets/*",
    "/fonts/*",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.webp",
    "/*.avif",
    "/*.svg",
    "/*.gif",
  ],
};
