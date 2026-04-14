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

// Turndown instance — initialised once at module scope because the
// configuration and custom rules are static across all requests.
const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  hr: '---',
})
td.remove(['svg', 'canvas', 'template'])

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
  // ── 1. Gate on HTTP method ──────────────────────────────────────────────
  // Only GET requests should enter the conversion path.
  // HEAD responses must not include a message body, so pass them through
  // unchanged instead of rewriting them into Markdown.
  // Non-GET requests may also be non-idempotent; replaying them via
  // context.next() inside the error catch block would be unsafe.
  if (request.method !== 'GET') {
    return context.next()
  }

  // ── 2. Gate on Accept header ────────────────────────────────────────────
  // Parse the Accept header properly, respecting q=0 (explicit opt-out).
  // A token is accepted if:
  //   • its media type is text/markdown (case-insensitive), AND
  //   • it has no q parameter OR its q value is > 0.
  const acceptsMarkdown = (request.headers.get('Accept') ?? '').split(',').some((token) => {
    const [type, ...params] = token.trim().split(';')
    if (type.trim().toLowerCase() !== 'text/markdown') return false
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
    return qParam === undefined || parseFloat(qParam.slice(2)) > 0
  })
  if (!acceptsMarkdown) {
    return context.next()
  }

  // ── 3. Skip excluded paths ──────────────────────────────────────────────
  const { pathname } = new URL(request.url)
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return context.next()
  }

  let originResponse: Response | undefined

  try {
    // ── 4. Fetch HTML from origin ─────────────────────────────────────────
    originResponse = await context.next()
    const contentType = (originResponse.headers.get('Content-Type') ?? '').toLowerCase()

    if (!contentType.includes('text/html')) {
      return originResponse
    }

    const html = await originResponse.clone().text()

    // ── 5. Sanitize with allowlist parser ─────────────────────────────────
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
    // sanitizeHtml IS the sanitizer: passing untrusted HTML to it is exactly
    // correct.  Static analysers that flag "untrusted HTML reaches sanitizeHtml"
    // as a sink are producing a false positive here.
    // nosemgrep: javascript.lang.security.audit.xss.raw-html-concat
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
      // Drop structural chrome together with ALL descendants so navigation
      // links and other UI chrome do not leak into the Markdown output.
      exclusiveFilter(frame) {
        return DROP_WITH_CHILDREN.has(frame.tag)
      },
    })

    // ── 6. HTML → Markdown via Turndown ───────────────────────────────────
    // Convert the sanitized HTML to Markdown. Sanitization must happen on the
    // parsed HTML tree (step 5), not on the final Markdown text, so we rely on
    // sanitize-html above and only normalise surrounding whitespace here.
    const markdown = td.turndown(sanitized).trim()

    // ── 7. Compute estimated token count (chars / 4) ──────────────────────
    const tokenEstimate = String(Math.ceil(markdown.length / 4))

    // Start from all origin headers so we preserve unrelated metadata
    // (e.g. any existing Cache-Control policy, CORS headers, etc.).  We
    // then remove validators and entity headers that describe the HTML
    // payload — they are now stale for the rewritten Markdown body and
    // must be stripped to prevent clients / CDNs from mis-handling the
    // response (wrong Content-Length, mismatched ETag, etc.).
    const headers = new Headers(originResponse.headers)
    headers.delete('Content-Length')
    headers.delete('Content-Encoding')
    headers.delete('Transfer-Encoding')
    headers.delete('ETag')
    headers.delete('Last-Modified')
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('X-Markdown-Tokens', tokenEstimate)
    headers.set('Content-Signal', 'ai-train=yes, search=yes, ai-input=yes')
    // The Markdown body is a lossy transformation of the HTML; caching it
    // as if it were the canonical resource would return wrong content to
    // subsequent HTML requests sharing the same cache key.  Force-bypass.
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
  } catch (err) {
    // ── 7. Fallback: pass through to origin unchanged ─────────────────────
    // Log the failure so it appears in Netlify edge function logs.
    // console.error is the correct logging mechanism in the Deno-based Edge
    // Runtime; src/utils/monitoring.ts cannot be imported here because it
    // depends on @sentry/react and Vite's import.meta.env.
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error && err.stack ? err.stack : undefined
    console.error('[markdown-response] Markdown conversion failed; falling back to HTML', {
      url: request.url,
      pathname,
      error: message,
      ...(stack !== undefined ? { stack } : {}),
    })
    if (originResponse) return originResponse
    return context.next()
  }
}
