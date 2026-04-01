/**
 * Netlify Edge Function: markdown-response
 *
 * Serves Markdown instead of HTML when AI agents request it via the
 * `Accept: text/markdown` header. Reduces token usage by ~80% compared
 * to raw HTML.
 *
 * ─── TESTING ──────────────────────────────────────────────────────────────
 *
 * Test the Markdown response with curl:
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/privacy
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/terms
 *
 * Test locally with Netlify Dev:
 *   1. Install the Netlify CLI: npm install -g netlify-cli
 *   2. Run: netlify dev
 *   3. curl -H "Accept: text/markdown" http://localhost:8888/
 *
 * ─── ADDING / REMOVING PATHS ──────────────────────────────────────────────
 *
 * Paths are registered in netlify.toml via [[edge_functions]] blocks.
 * To add a new path, append a new block:
 *
 *   [[edge_functions]]
 *     path = "/blog/my-new-post"
 *     function = "markdown-response"
 *
 * To remove a path, delete its corresponding [[edge_functions]] block.
 * To cover all paths at once, set:  path = "/*"
 * (but exclude API/asset paths by adding more specific non-edge-function rules
 * or by checking the pathname inside this function, as done below.)
 *
 * ─── NOTES ────────────────────────────────────────────────────────────────
 *
 * • This site is a React SPA; the static HTML shell is minimal. The edge
 *   function faithfully converts whatever HTML the origin returns, so
 *   SSR or pre-rendered pages will produce richer Markdown output.
 * • Turndown is imported via the `npm:` specifier supported by the Netlify
 *   Edge Runtime (Deno-based). No npm install needed.
 */

import TurndownService from 'npm:turndown@7.1.2'
import type { Context } from 'https://edge.netlify.com'

// Paths that should never be converted even if accidentally matched.
const EXCLUDED_PREFIXES = [
  '/.env',
  '/assets/',
  '/api/',
  '/.netlify/',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
]

export default async function handler(
  request: Request,
  context: Context,
): Promise<Response> {
  // ── 1. Gate on Accept header ────────────────────────────────────────────
  const accept = request.headers.get('Accept') ?? ''
  if (!accept.includes('text/markdown')) {
    return context.next()
  }

  // ── 2. Skip excluded paths ──────────────────────────────────────────────
  const { pathname } = new URL(request.url);
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    // For excluded paths, bypass Markdown conversion and pass through.
    return context.next();
  }

  let originResponse: Response | undefined;

  try {
    // ── 3. Fetch HTML from origin ─────────────────────────────────────────
    originResponse = await context.next();
    const contentType = originResponse.headers.get("Content-Type") ?? "";

    if (!contentType.includes("text/html")) {
      return originResponse;
    }

    const responseForMarkdown = originResponse.clone();
    const html = await responseForMarkdown.text();

    // ── 4. Strip non-content elements ─────────────────────────────────────
    // End tags may have whitespace before the closing `>` (e.g. </script >),
    // so all closing-tag patterns use `\s*>` instead of a bare `>`.

    // Remove script tags (and inline content)
    let cleaned = html.replace(
      /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,
      "",
    );
    // Remove style tags (and inline content)
    cleaned = cleaned.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");
    // Remove <link> tags (stylesheets, preloads, etc.)
    cleaned = cleaned.replace(/<link\b[^>]*\/?>/gi, "");
    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
    // Remove structural chrome: nav, header, footer, aside, noscript
    cleaned = cleaned.replace(
      /<(nav|header|footer|aside|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    );
    // Remove common sidebar / cookie-banner class patterns (best-effort)
    cleaned = cleaned.replace(
      /<([a-z][a-z0-9]*)\b[^>]*\b(?:class|id)="[^"]*(?:sidebar|cookie|banner|ad-|advertisement)[^"]*"[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    );

    // ── 5. HTML → Markdown via Turndown ───────────────────────────────────
    const td = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      hr: "---",
    });

    // Layer 1: Turndown's DOM-based removal.
    // Regex alone can't handle nested/obfuscated patterns like
    // <scr<script>ipt>, so we also let Turndown strip these via its
    // own HTML parser, which builds a proper node tree before converting.
    td.remove([
      "script", "style", "noscript",
      "iframe", "object", "embed", "applet",
      "svg", "canvas", "picture", "figure", "template",
    ]);

    let markdown = td.turndown(cleaned).trim();

    // Layer 2: final pass on the Markdown string.
    // Turndown may pass through unrecognised inline HTML as literal text.
    // Step A – strip well-formed tags and HTML comments.
    markdown = markdown.replace(/<!--[\s\S]*?-->/g, "");
    markdown = markdown.replace(
      /<\/?(script|style|iframe|object|embed|applet|noscript)\b[^>]*\/?>/gi,
      "",
    );
    // Step B – escape any surviving `<` that precedes a dangerous element name,
    // including malformed/incomplete tags with no closing `>` (e.g. bare `<script`).
    // A lookahead is enough: once `<` becomes `&lt;` the sequence can't be parsed
    // as an HTML tag by any renderer.
    markdown = markdown.replace(
      /<(?=\s*\/?\s*(?:script|style|iframe|object|embed|applet|noscript)\b)/gi,
      "&lt;",
    );

    // ── 6. Compute estimated token count (chars / 4) ──────────────────────
    const tokenEstimate = String(Math.ceil(markdown.length / 4));

    return new Response(markdown, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "X-Markdown-Tokens": tokenEstimate,
        "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
        // Prevent this stripped response from being cached as HTML
        "Cache-Control": "no-store",
        // Vary so CDN caches both representations separately
        Vary: "Accept",
      },
    });
  } catch {
    // ── 7. Fallback: pass through to origin unchanged ─────────────────────
    // Use the already-fetched HTML response if available (conversion failed),
    // otherwise pass through to origin (origin fetch failed).
    if (originResponse) return originResponse;
    return context.next();
  }
}
