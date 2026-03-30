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
// Helpers
// ---------------------------------------------------------------------------

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
// WAF handler
// ---------------------------------------------------------------------------

/**
 * Netlify Edge Function WAF handler.
 *
 * Inspects every inbound request before it reaches the origin and blocks:
 * - Known vulnerability-scanner user agents
 * - Oversized request bodies — fast-path via `Content-Length` header, then
 *   authoritative check by reading actual body bytes via a cloned request
 * - Path traversal, sensitive-file exposure, CMS probing, SQL injection,
 *   XSS, and SSRF attack signatures — tested against both the raw URL and
 *   the fully-decoded URL (up to 3 decode passes) to catch multi-encoded
 *   payloads such as %252e%252e%252f → %2e%2e%2f → ../
 * - Disallowed HTTP methods on serverless function endpoints
 *
 * Clean requests are forwarded to the origin via `context.next()` and the
 * response is augmented with an `X-Request-ID` header for audit correlation.
 *
 * @param request - The incoming HTTP request.
 * @param context - Netlify edge-function context providing `next()`.
 * @returns A `Response` — either a block response (4xx) or the origin response.
 */
export default async function waf(
  request: Request,
  context: Context,
): Promise<Response> {
  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") ?? "";
  const contentLength = Number(
    request.headers.get("content-length") ?? "0",
  );

  // 1. Block known vulnerability scanner / attack-tool user agents
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(ua)) {
      return forbidden();
    }
  }

  // 2. Fast-path rejection based on the declared Content-Length header.
  // The header can be spoofed or absent (chunked transfer encoding), so this
  // is a quick check only; the authoritative measurement follows below.
  if (contentLength > MAX_BODY_BYTES) {
    return payloadTooLarge();
  }

  // 2a. Authoritative body-size check: measure actual bytes received for
  // requests that carry a body. Clone the request so the original body
  // stream remains available for the origin handler.
  if (request.body !== null && request.method !== "GET" && request.method !== "HEAD") {
    const cloned = request.clone();
    const body = cloned.body;
    if (body === null) {
      // No body to inspect; continue processing.
    } else {
      const reader = body.getReader();
      let total = 0;
      try {
        // Read the cloned body stream incrementally and enforce the limit
        // while streaming, to avoid buffering arbitrarily large payloads.
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            total += value.byteLength;
            if (total > MAX_BODY_BYTES) {
              // Stop reading further data and reject the request.
              try {
                await reader.cancel();
              } catch {
  //
  // To avoid unnecessary latency and memory usage, only perform this
  // streaming check when the declared Content-Length is missing/invalid or
  // close to the maximum allowed size.
  const shouldAuthoritativelyCheckBodySize =
    request.body !== null &&
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    (!Number.isFinite(contentLength) ||
      contentLength >= MAX_BODY_BYTES * 0.9);

  if (shouldAuthoritativelyCheckBodySize) {
    try {
      const clone = request.clone();
      const body = clone.body;
      if (body !== null) {
        const reader = body.getReader();
        let actualSize = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            actualSize += value.byteLength;
            if (actualSize > MAX_BODY_BYTES) {
              return payloadTooLarge();
            }
          }
        }
      }
    } catch {
      return badRequest();
    }
  }

  // 3. Decode and inspect path + query string for attack signatures.
  // Iteratively decode percent-encoding (up to 3 passes) until the string
  // stabilises, catching multi-encoded payloads such as:
  //   %252e%252e%252f  →  %2e%2e%2f  →  ../
  const raw = url.pathname + url.search;
  let decoded = raw;
  try {
    for (let i = 0; i < 3; i++) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break; // stable — no further encoding layers
      decoded = next;
    }
  } catch {
    // Malformed percent-encoding is itself suspicious
    return badRequest();
  }

  // Check both the raw (encoded) form and the fully-decoded form so patterns
  // written against encoded sequences (e.g. /\.\.%2f/i) still fire alongside
  // patterns written against decoded sequences (e.g. /\.\.[/\\]/).
  const checkTargets = decoded !== raw ? [raw, decoded] : [raw];
  for (const t of checkTargets) {
    for (const pattern of ATTACK_SIGNATURES) {
      if (pattern.test(t)) {
        return forbidden();
      }
    }
  }

  // 4. Restrict HTTP methods on serverless function endpoints
  if (url.pathname.startsWith("/.netlify/functions/")) {
    if (!FUNCTION_ALLOWED_METHODS.has(request.method)) {
      return methodNotAllowed([...FUNCTION_ALLOWED_METHODS]);
    }
  }

  // 5. Pass clean request to origin; attach a request ID for audit correlation
  const requestId = crypto.randomUUID();
  const response = await context.next();

  const headers = new Headers(response.headers);
  headers.set("X-Request-ID", requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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
