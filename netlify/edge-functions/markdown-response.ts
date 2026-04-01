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
 * ─── PATH SCOPE ───────────────────────────────────────────────────────────
 *
 * netlify.toml registers this function on `path = "/*"` (all paths).
 * Edge functions run before Netlify redirects, so this correctly intercepts
 * every route — including unknown URLs that would otherwise hit the SPA
 * catch-all redirect — without affecting normal browser traffic.
 *
 * Non-content paths (assets, API routes, etc.) are filtered here via
 * EXCLUDED_PREFIXES; any request without `Accept: text/markdown` is passed
 * through immediately via context.next().
 *
 * To exclude additional paths: add their prefix to EXCLUDED_PREFIXES below.
 *
 * ─── NOTES ────────────────────────────────────────────────────────────────
 *
 * • This site is a React SPA; the static HTML shell is minimal. The edge
 *   function faithfully converts whatever HTML the origin returns, so
 *   SSR or pre-rendered pages will produce richer Markdown output.
 * • Both Turndown and sanitize-html are imported via the `npm:` specifier
 *   supported by the Netlify Edge Runtime (Deno-based). No npm install needed.
 * • sanitize-html is the primary sanitizer: it parses HTML into a real node
 *   tree and applies an allowlist, which is far more robust than regex.
 */

import TurndownService from 'npm:turndown@7.1.2'
import sanitizeHtml from 'npm:sanitize-html@2.13.1'
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

// Tags whose content Turndown can convert to useful Markdown.
// Everything not in this list is discarded by sanitize-html.
const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'del',
  'ins',
  'mark',
  'code',
  'pre',
  'kbd',
  'samp',
  'cite',
  'q',
  'abbr',
  'time',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'blockquote',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'section',
  'article',
  'main',
  'div',
  'span',
  'details',
  'summary',
  'figure',
  'figcaption',
]

/**
 * Edge function handler. Intercepts requests that carry `Accept: text/markdown`
 * and returns a sanitized Markdown version of the page instead of HTML.
 * All other requests are passed through to the origin unchanged.
 *
 * @param request - The incoming HTTP request.
 * @param context - Netlify edge function context (provides `context.next()`).
 * @returns A Markdown response, the original HTML response, or a pass-through.
 */
export default async function handler(request: Request, context: Context): Promise<Response> {
  // ── 1. Gate on Accept header ────────────────────────────────────────────
  const accept = (request.headers.get('Accept') ?? '').toLowerCase()
  if (!accept.includes('text/markdown')) {
    return context.next()
  }

  // ── 2. Skip excluded paths ──────────────────────────────────────────────
  const { pathname } = new URL(request.url)
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return context.next()
  }

  let originResponse: Response | undefined

  try {
    // ── 3. Fetch HTML from origin ─────────────────────────────────────────
    originResponse = await context.next()
    const contentType = originResponse.headers.get('Content-Type') ?? ''

    if (!contentType.includes('text/html')) {
      return originResponse
    }

    const html = await originResponse.clone().text()

    // ── 4. Sanitize with allowlist parser ─────────────────────────────────
    // sanitize-html parses HTML into a real node tree and discards every
    // element not in ALLOWED_TAGS (script, style, nav, header, footer,
    // iframe, object, embed, applet, noscript etc. are all excluded).
    // This handles malformed markup, nested tag obfuscation, whitespace in
    // closing tags (e.g. </script\t\n bar>), and HTML comments — all in a
    // single allowlist pass, unlike a chain of regexes.
    const sanitized = sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title'],
        th: ['colspan', 'rowspan', 'scope'],
        td: ['colspan', 'rowspan'],
      },
      // Discard disallowed elements and their children entirely.
      disallowedTagsMode: 'discard',
    })

    // ── 5. HTML → Markdown via Turndown ───────────────────────────────────
    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      hr: '---',
    })

    td.remove(['svg', 'canvas', 'template'])

    let markdown = td.turndown(sanitized).trim()

    // ── 6. Belt-and-suspenders scrub on the Markdown string ───────────────
    // Turndown may pass through unrecognised HTML as literal text.  Each
    // pattern below is an explicit per-tag literal.  The [\s\S]*?(?:>|$)
    // tail covers both complete tags AND bare fragments with no closing `>`
    // (e.g. a truncated `<script` at end of string).  HTML comments use
    // (?:-->|$) for the same reason.
    markdown = markdown
      .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
      .replace(/<\/?\s*script[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*style[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*iframe[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*object[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*embed[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*applet[\s\S]*?(?:>|$)/gim, '')
      .replace(/<\/?\s*noscript[\s\S]*?(?:>|$)/gim, '')

    // ── 7. Compute estimated token count (chars / 4) ──────────────────────
    const tokenEstimate = String(Math.ceil(markdown.length / 4))

    return new Response(markdown, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Markdown-Tokens': tokenEstimate,
        'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
        // Prevent this stripped response from being cached as HTML
        'Cache-Control': 'no-store',
        // Vary so CDN caches both representations separately
        Vary: 'Accept',
      },
    })
  } catch {
    // ── 8. Fallback: pass through to origin unchanged ─────────────────────
    if (originResponse) return originResponse
    return context.next()
  }
}
