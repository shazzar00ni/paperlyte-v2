import type { Context } from "https://edge.netlify.com";

type GlobalWithDeno = typeof globalThis & {
  Deno?: { env: { get(key: string): string | undefined } };
};

type AcceptEntry = { mediaType: string; q: number };

// Security headers mirroring the static [[headers]] in netlify.toml.
// Netlify header rules do not apply to edge-function responses, so they
// must be set explicitly here.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "1; mode=block",
};

/** Parses the `q=` parameter from a split Accept entry. Defaults to 1.0. */
function parseQValue(parts: string[]): number {
  const qPart = parts.find((p) => p.trim().startsWith("q="));
  if (!qPart) return 1.0;
  const q = parseFloat(qPart.trim().slice(2));
  return isNaN(q) ? 1.0 : q;
}

/**
 * Returns true only when `text/markdown` is explicitly requested AND preferred
 * over `text/html`. Wildcards (`text/*`, `*\/*`) are intentionally excluded:
 * browser navigation sends `Accept: text/html,...,*\/*` which would otherwise
 * match and serve the Markdown mirror to normal users.
 */
function acceptsMarkdown(acceptHeader: string): boolean {
  const entries: AcceptEntry[] = acceptHeader.split(",").map((t) => {
    const parts = t.trim().toLowerCase().split(";");
    return { mediaType: parts[0].trim(), q: parseQValue(parts) };
  });

  const md = entries.find((e) => e.mediaType === "text/markdown");
  if (!md || md.q === 0) return false;

  // Prefer HTML over Markdown when both are explicitly listed at equal or
  // higher quality — e.g. `Accept: text/html, text/markdown;q=0.9`.
  const html = entries.find((e) => e.mediaType === "text/html");
  return !html || html.q < md.q;
}

/**
 * Reads the best available Netlify deploy-root URL from the Deno environment.
 * DEPLOY_PRIME_URL reflects the current context (preview/branch/production);
 * URL is the canonical production domain and serves as fallback.
 * Both are set by the platform and never derived from user input (no SSRF).
 * Returns undefined in local dev where neither variable is set.
 */
function getDeployUrl(): string | undefined {
  const deno = (globalThis as GlobalWithDeno).Deno;
  return deno?.env.get("DEPLOY_PRIME_URL") ?? deno?.env.get("URL");
}

export default async function markdownResponse(
  request: Request,
  context: Context,
): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";

  if (!acceptsMarkdown(accept)) {
    return context.next();
  }

  // If absent (local dev without Netlify CLI), fall through to normal response.
  const deployUrl = getDeployUrl();
  if (!deployUrl) {
    return context.next();
  }

  try {
    const mdResponse = await fetch(`${deployUrl}/index.md`);

    if (!mdResponse.ok) {
      console.warn(
        `[markdown-response] Failed to fetch /index.md: ${mdResponse.status}`,
      );
      return context.next();
    }

    const body = await mdResponse.text();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        // Vary: Accept so caches distinguish HTML vs Markdown for the same URL.
        "Vary": "Accept",
        ...SECURITY_HEADERS,
      },
    });
  } catch (err) {
    console.warn("[markdown-response] Unexpected error fetching /index.md:", err);
    return context.next();
  }
}

// Path declared solely in netlify.toml (not inline) so WAF-first ordering
// in netlify.toml is authoritative; inline + toml declarations on the same
// path resolve alphabetically, which would put markdown-response before waf.
