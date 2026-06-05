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
 * • Turndown is imported via the `npm:` specifier — the Netlify Edge Runtime
 *   (Deno-based) resolves `npm:` specifiers natively at deploy time.
 *   Turndown is also listed in `devDependencies` so Vitest can resolve it
 *   from node_modules for local testing.
 * • HTML sanitisation uses the native DOMParser Web API (no external
 *   dependencies).  DOMParser is available in both the Deno-based Netlify
 *   Edge Runtime and the jsdom Vitest test environment.
 */

import TurndownService from 'npm:turndown@7.1.2'
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

// Tags whose entire subtree (tag + all children) must be removed before
// conversion.  Includes dangerous tags (script, style, etc.) and structural
// noise (nav, footer, aside, noscript) that should never appear in Markdown.
//
// `header` is intentionally NOT included: static pages (privacy.html,
// terms.html) use `<header>` to wrap the page title and last-updated metadata
// — content that agents need.  The SPA shell (index.html) contains no
// `<header>` element at all (only <div id="root">), so omitting it from this
// set has no effect on SPA routes.
const REMOVE_WITH_CHILDREN: ReadonlySet<string> = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'nav',
  'footer',
  'aside',
  'noscript',
  'svg',
  'canvas',
  'template',
])

// Attributes allowed per tag — all others are stripped.
const ALLOWED_ATTRS: Record<string, readonly string[] | undefined> = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'title'],
  th: ['colspan', 'rowspan', 'scope'],
  td: ['colspan', 'rowspan'],
}

// Allowed URL protocols for href and src attributes.
const ALLOWED_URL_PROTOCOLS: ReadonlySet<string> = new Set([
  'http:',
  'https:',
  'ftp:',
  'mailto:',
])

// Turndown instance — initialised once at module scope because the
// configuration and custom rules are static across all requests.
const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  hr: '---',
})
td.remove(['svg', 'canvas', 'template'])

/**
 * Sanitize HTML using the native DOMParser API.
 *
 * - Removes dangerous tags (script, style, iframe, object, embed, applet)
 *   together with their entire subtrees.
 * - Removes structural noise (nav, footer, aside, noscript, svg, canvas,
 *   template) together with their entire subtrees.
 * - Strips all element attributes except an explicit per-tag allowlist.
 * - Blocks unsafe URL schemes (javascript:, data:, etc.) from href/src.
 * - Blocks protocol-relative URLs (//evil.com) from href/src.
 * - Removes HTML comment nodes.
 *
 * Returns the sanitized innerHTML of the document body.
 */
function sanitizeHtml(html: string): string {
  // Strip <noscript> blocks at the string level before DOMParser sees them.
  // When scripting is disabled (jsdom and Deno's DOMParser), the HTML5 parser
  // treats <noscript> content as regular HTML and may promote block-level
  // children (e.g. <p>) to the parent scope — defeating el.remove() on the
  // noscript wrapper.  A pre-parse replacement is the most reliable approach
  // because <noscript> is well-defined (no nesting, predictable content model).
  const stripped = html.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
  const doc = new DOMParser().parseFromString(stripped, 'text/html')

  // Remove entire subtrees for dangerous and noise tags.
  // querySelectorAll returns a static snapshot so removals during iteration
  // are safe.
  const removeSelector = [...REMOVE_WITH_CHILDREN].join(',')
  for (const el of Array.from(doc.querySelectorAll(removeSelector))) {
    el.remove()
  }

  // Strip disallowed attributes and unsafe URL schemes from remaining elements.
  for (const el of Array.from(doc.body.querySelectorAll('*'))) {
    const tag = el.tagName.toLowerCase()
    const allowedForTag = ALLOWED_ATTRS[tag] ?? []

    // Snapshot the attribute list before mutating it.
    for (const attr of Array.from(el.attributes)) {
      if (!allowedForTag.includes(attr.name)) {
        el.removeAttribute(attr.name)
      }
    }

    // Validate URL schemes for href and src.
    for (const urlAttr of ['href', 'src'] as const) {
      const val = el.getAttribute(urlAttr)
      if (val === null) continue
      // Block protocol-relative URLs (//evil.com style).
      if (val.startsWith('//')) {
        el.removeAttribute(urlAttr)
        continue
      }
      try {
        const { protocol } = new URL(val)
        if (!ALLOWED_URL_PROTOCOLS.has(protocol)) {
          el.removeAttribute(urlAttr)
        }
      } catch {
        // Relative URL (e.g. /page, ../foo) — keep as-is.
      }
    }
  }

  // Remove HTML comment nodes from the entire body subtree.
  const removeComments = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child)
      } else {
        removeComments(child)
      }
    }
  }
  removeComments(doc.body)

  return doc.body.innerHTML
}

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
    // RFC 7231 §5.3: parameter names are case-insensitive and optional
    // whitespace is allowed around the '=' sign, so 'Q=0' and 'q = 0' are
    // valid opt-outs that must be recognised.
    const qParamValue = params
      .map((p) => p.trim())
      .map((p) => {
        const eqIdx = p.indexOf('=')
        if (eqIdx === -1) return undefined
        const name = p.slice(0, eqIdx).trim().toLowerCase()
        const value = p.slice(eqIdx + 1).trim()
        return name === 'q' ? value : undefined
      })
      .find((value): value is string => value !== undefined)
    return qParamValue === undefined || parseFloat(qParamValue) > 0
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

    // ── 5. Sanitize with DOMParser ─────────────────────────────────────────
    // Parse HTML into a real DOM tree and sanitize using native Web APIs.
    // Removes dangerous tags with their entire subtrees, strips disallowed
    // attributes, and blocks unsafe URL schemes and protocol-relative URLs.
    const sanitized = sanitizeHtml(html)

    // ── 6. HTML → Markdown via Turndown ───────────────────────────────────
    // Convert the sanitized HTML to Markdown. Sanitization must happen on the
    // parsed HTML tree (step 5), not on the final Markdown text, so we rely on
    // sanitizeHtml above and only normalise surrounding whitespace here.
    const markdown = td.turndown(sanitized).trim()
    // ── 7. Compute estimated token count (chars / 4) ──────────────────────
    const tokenEstimate = String(Math.ceil(markdown.length / 4))

    // Start from all origin headers to preserve unrelated metadata
    // (e.g. CORS headers, X-* headers, etc.).  Remove validators and
    // entity headers that describe the HTML payload — they are now stale
    // for the rewritten Markdown body and must be stripped to prevent
    // clients / CDNs from mis-handling the response (wrong Content-Length,
    // mismatched ETag, etc.).  Cache-Control is unconditionally overridden
    // below; the origin value is intentionally discarded.
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
    // ── 8. Fallback: pass through to origin unchanged ─────────────────────
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
    // context.next() threw before any origin response was received; calling it
    // again would double origin traffic and could throw a second unhandled error.
    // Return a synthetic 502 so the caller gets a well-formed Response.
    return new Response('Bad Gateway', {
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
