import type { Context } from "https://edge.netlify.com";

type GlobalWithDeno = typeof globalThis & {
  Deno?: { env: { get(key: string): string | undefined } };
};

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

/**
 * Returns true only when `text/markdown` is explicitly requested AND preferred
 * over `text/html`. Wildcards (`text/*`, `*\/*`) are intentionally excluded:
 * browser navigation sends `Accept: text/html,...,*\/*` which would otherwise
 * match and serve the Markdown mirror to normal users.
 */
function acceptsMarkdown(acceptHeader: string): boolean {
  type AcceptEntry = { mediaType: string; q: number };
  const entries: AcceptEntry[] = acceptHeader.split(",").map((t) => {
    const parts = t.trim().toLowerCase().split(";");
    const mediaType = parts[0].trim();
    const qPart = parts.find((p) => p.trim().startsWith("q="));
    const q = qPart ? parseFloat(qPart.trim().slice(2)) : 1.0;
    return { mediaType, q: isNaN(q) ? 1.0 : q };
  });

  const md = entries.find((e) => e.mediaType === "text/markdown");
  if (!md || md.q === 0) return false;

  // Prefer HTML over Markdown when both are explicitly listed at equal or
  // higher quality — e.g. `Accept: text/html, text/markdown;q=0.9`.
  const html = entries.find((e) => e.mediaType === "text/html");
  if (html && html.q >= md.q) return false;

  return true;
}

export default async function markdownResponse(
  request: Request,
  context: Context,
): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";

  if (!acceptsMarkdown(accept)) {
    return context.next();
  }

  // Use Netlify's per-deploy URL env vars as the fetch base so that deploy
  // previews and branch deploys read index.md from themselves rather than
  // production. DEPLOY_PRIME_URL reflects the current context (preview/branch/
  // production); URL is the canonical production domain and is the fallback.
  // These env vars are set by the platform and never derived from user input,
  // eliminating SSRF risk.
  // If absent (local dev without Netlify CLI), fall through to normal response.
  const env = (globalThis as GlobalWithDeno).Deno?.env;
  const deployUrl = env?.get("DEPLOY_PRIME_URL") ?? env?.get("URL");
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
        // Vary: Accept so caches distinguish HTML vs Markdown representations
        // of the same URL and never serve the wrong content type.
        "Vary": "Accept",
        ...SECURITY_HEADERS,
      },
    });
  } catch (err) {
    console.warn("[markdown-response] Unexpected error fetching /index.md:", err);
    return context.next();
  }
}

// Path is declared solely in netlify.toml so the explicit WAF-first ordering
// is authoritative. When both an inline config and a toml declaration exist,
// Netlify resolves same-path conflicts alphabetically (markdown-response < waf),
// which would run this function before the WAF. Omitting the inline config
// avoids that conflict and lets netlify.toml control execution order.
