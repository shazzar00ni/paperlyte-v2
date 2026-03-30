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
  /union\s+(?:all\s+)?select/i,
  /select\s+\S+\s+from/i,
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

function forbidden(): Response {
  return new Response(null, { status: 403 });
}

function badRequest(): Response {
  return new Response(null, { status: 400 });
}

function payloadTooLarge(): Response {
  return new Response(null, { status: 413 });
}

function methodNotAllowed(allowed: string[]): Response {
  return new Response(null, {
    status: 405,
    headers: { Allow: allowed.join(", ") },
  });
}

// ---------------------------------------------------------------------------
// WAF handler
// ---------------------------------------------------------------------------

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

  // 2. Reject oversized request bodies (DoS / payload-stuffing mitigation)
  if (contentLength > MAX_BODY_BYTES) {
    return payloadTooLarge();
  }

  // 3. Decode and inspect path + query string for attack signatures
  let target: string;
  try {
    // Decode percent-encoding to catch double-encoded traversal attempts
    target = decodeURIComponent(url.pathname + url.search);
  } catch {
    // Malformed percent-encoding is itself suspicious
    return badRequest();
  }

  for (const pattern of ATTACK_SIGNATURES) {
    if (pattern.test(target)) {
      return forbidden();
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
  // Skip WAF on hashed static assets — they're content-addressed and
  // served directly from the CDN cache, not the origin.
  excludedPath: [
    "/assets/*",
    "/*.woff2",
    "/*.woff",
    "/*.ttf",
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
