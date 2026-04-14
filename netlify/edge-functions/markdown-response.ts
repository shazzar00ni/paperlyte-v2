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
 *   supported by the Netlify Edge Runtime (Deno-based), so the deployed
 *   Edge Function does not require a separate `npm install` step.
 * • For local Node/Vitest tests and other build tooling, these packages
 *   are also present in `devDependencies` and must exist in `node_modules`.
 * • sanitize-html is the primary sanitizer: it parses HTML into a real node
 *   tree and applies an allowlist, which is far more robust than regex.
 */

import TurndownService from 'npm:turndown@7.1.2'
import sanitizeHtml from 'npm:sanitize-html@2.13.1'
import type { Context } from 'https://edge.netlify.com'

// Paths that should never be converted even if accidentally matched.
const EXCLUDED_PREFIXES: readonly string[] = [
  '/.env',
  '/assets/',
  '/api/',
  '/.netlify/',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
]

// Structural chrome tags whose entire subtree (tag + all descendants) should
// be dropped so nav links, header text, and footer content do not bleed into
// the Markdown output.  These must NOT appear in ALLOWED_TAGS.
const DROP_WITH_CHILDREN: ReadonlySet<string> = new Set(['nav', 'header', 'footer', 'aside'])

// Combined regex for belt-and-suspenders Markdown scrub (step 6).
// Matches HTML comments AND dangerous inline tag fragments in a single pass,
// covering both complete tags and bare fragments with no closing delimiter
// (e.g. a truncated `<script` at end of string).
const DANGEROUS_FRAGMENT_RE =
  /<!--[\s\S]*?(?:-->|$)|<\/?\s*(?:script|style|iframe|object|embed|applet|noscript)[\s\S]*?(?:>|$)/gim

// Tags whose content Turndown can convert to useful Markdown.
// Everything not in this list is discarded by sanitize-html.
const ALLOWED_TAGS: readonly string[] = [
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
 * Serve a sanitized Markdown representation of the origin page when the
 * request carries `Accept: text/markdown`; otherwise delegate unchanged.
 *
 * @param request - The incoming HTTP request.
 * @param context - Netlify Edge Function context (provides `context.next()`).
 * @returns Markdown response on success, original HTML response on conversion
 *   failure, or a pass-through to the origin for non-markdown requests.
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
    const contentType = (originResponse.headers.get('Content-Type') ?? '').toLowerCase()

    if (!contentType.includes('text/html')) {
      return originResponse
    }

    const html = await originResponse.clone().text()

    // ── 4. Sanitize with allowlist parser ─────────────────────────────────
    // sanitize-html parses HTML into a real node tree and applies a strict
    // allowlist (script, style, nav, header, footer, iframe, object, embed,
    // applet, noscript etc. are excluded).  Using an allowlist-based parser
    // is far more robust than regex: it handles malformed markup, nested tag
    // obfuscation, and whitespace in closing tags (e.g. </script\t\n bar>).
    //
    // Key hardening options:
    //   • allowedSchemes / allowedSchemesByTag — blocks javascript: and
    //     data: URIs from leaking into Markdown links/images.
    //   • allowProtocolRelative: false — blocks //evil.com style URLs.
    //   • exclusiveFilter — drops nav/header/footer/aside together with ALL
    //     their descendants, so navigation links and UI chrome never bleed
    //     into the Markdown output.
    const sanitized = sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title'],
        th: ['colspan', 'rowspan', 'scope'],
        td: ['colspan', 'rowspan'],
      },
      // Restrict URL schemes to prevent javascript: / vbscript: / data: injection.
      allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
      allowedSchemesByTag: {
        img: ['http', 'https'],
      },
      allowProtocolRelative: false,
      // Discard disallowed elements and their children entirely.
      disallowedTagsMode: 'discard',
      // Explicitly drop structural containers like nav/header/footer/aside
      // together with all of their descendants so navigation/chrome content
      // doesn't leak into the Markdown.
      exclusiveFilter(frame) {
        const dropWithChildren = new Set(['nav', 'header', 'footer', 'aside'])
        return dropWithChildren.has(frame.tag)
      },
      // Drop structural chrome together with ALL descendants so navigation
      // links and other UI chrome do not leak into the Markdown output.
      exclusiveFilter(frame) {
        return DROP_WITH_CHILDREN.has(frame.tag)
      },
    })

    // ── 5. HTML → Markdown via Turndown ───────────────────────────────────
    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      hr: '---',
    })

    td.remove(['svg', 'canvas', 'template'])

    // Convert sanitized HTML to Markdown, then scrub any dangerous fragments
    // that Turndown may have passed through as literal text (belt-and-suspenders,
    // step 6). DANGEROUS_FRAGMENT_RE (defined at module level) covers HTML
    // comments and all dangerous tag fragments in a single pass; the final
    // .trim() normalises any whitespace reintroduced by the scrub.
    const markdown = td
      .turndown(sanitized)
      .trim()
      .replace(DANGEROUS_FRAGMENT_RE, '')
      .trim()

    // ── 6. Compute estimated token count (chars / 4) ──────────────────────
    const tokenEstimate = String(Math.ceil(markdown.length / 4))

    // Start from all origin headers so we preserve things like ETag,
    // Last-Modified, and any existing Cache-Control policy.  We then
    // override only the fields specific to the Markdown representation.
    const headers = new Headers(originResponse.headers)
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('X-Markdown-Tokens', tokenEstimate)
    headers.set('Content-Signal', 'ai-train=yes, search=yes, ai-input=yes')
    // Prevent stale Markdown representations from being served from cache.
    headers.set('Cache-Control', 'no-store')

    // Merge Accept into any existing Vary value so CDNs store HTML and
    // Markdown as separate cache entries without losing other Vary tokens
    // (e.g. Accept-Encoding) the origin already set.
    const originVary = headers.get('Vary') ?? ''
    const varyParts = originVary
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    const normalizedVaryParts = varyParts.map((v) => v.toLowerCase())
    headers.set(
      'Vary',
      normalizedVaryParts.includes('accept') ? originVary : [...varyParts, 'Accept'].join(', ')
    )

    return new Response(markdown, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    })
  } catch {
    // ── 7. Fallback: pass through to origin unchanged ─────────────────────
    if (originResponse) return originResponse
    return context.next()
  }
}
