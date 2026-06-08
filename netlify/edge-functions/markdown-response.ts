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
 * • No external runtime dependencies — HTML sanitisation and Markdown
 *   conversion are implemented inline using only regex and Deno's built-in
 *   Web APIs. This ensures the function bundles cleanly on Netlify's
 *   Deno-based edge runtime without CDN URL imports.
 * • The source HTML is always our own trusted origin (never user input
 *   displayed in a browser), so regex-based sanitisation is appropriate.
 *   The output is plain-text Markdown consumed by AI agents, not rendered HTML.
 */

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
// conversion. Includes dangerous tags (script, style, etc.) and structural
// noise (nav, footer, aside, noscript) that should never appear in Markdown.
//
// `header` is intentionally NOT included: static pages (privacy.html,
// terms.html) use `<header>` to wrap the page title and last-updated metadata
// — content that agents need. The SPA shell (index.html) contains no
// `<header>` element at all (only <div id="root">), so omitting it from this
// set has no effect on SPA routes.
const REMOVE_TAGS: readonly string[] = [
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
]

/** Strip all HTML tags from a string and collapse internal whitespace. */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/** Decode common HTML entities to their character equivalents. */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = parseInt(code, 10)
      return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const n = parseInt(code, 16)
      return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''
    })
}

/**
 * Sanitize HTML by removing dangerous tags and event handler attributes.
 *
 * - Removes tags in REMOVE_TAGS together with their entire subtrees.
 * - Removes partial/malformed opening tags (e.g. `<script` with no `>`).
 * - Removes orphaned closing tags (e.g. `</script\t\nbar>`).
 * - Removes HTML comment nodes (including unclosed comments at end of string).
 * - Removes event handler attributes (onclick, onload, etc.).
 *
 * Returns the sanitized HTML string.
 */
function sanitizeHtml(html: string): string {
  let result = html
  const dangerPattern = REMOVE_TAGS.join('|')

  // Remove complete tag+subtree pairs (e.g. <script>…</script>).
  // Run each replacement in a loop until stable so nested same-type elements
  // (e.g. <nav>…<nav>inner</nav>tail</nav>) are fully removed rather than
  // leaving the tail of the outer element behind.
  for (const tag of REMOVE_TAGS) {
    let prev: string
    do {
      prev = result
      result = result.replace(
        new RegExp(`<${tag}(\\s[^>]*)?>(?:(?!<${tag}[\\s>])[\\s\\S])*?<\\/${tag}\\s*>`, 'gi'), // nosemgrep
        ''
      )
    } while (result !== prev)
  }

  // Remove unclosed excluded opening tags and all trailing content. Without
  // this, a bare <script>payload with no </script> would have only the opener
  // stripped by the next step, leaking the payload into the Markdown.
  result = result.replace(new RegExp(`<(?:${dangerPattern})\\b[^>]*>[\\s\\S]*$`, 'gi'), '') // nosemgrep

  // Remove partial/malformed opening tags (e.g. `<script` with no `>`).
  // The `>?` makes the closing bracket optional, catching bare fragments.
  result = result.replace(new RegExp(`<(?:${dangerPattern})\\b[^>]*>?`, 'gi'), '') // nosemgrep

  // Remove orphaned closing tags (e.g. `</script\t\nbar>`).
  // [^>]* matches whitespace and other chars that follow the tag name.
  result = result.replace(new RegExp(`<\\/(?:${dangerPattern})\\b[^>]*>`, 'gi'), '') // nosemgrep

  // Remove HTML comments, including unclosed ones that reach end of string.
  result = result.replace(/<!--[\s\S]*?(?:-->|$)/g, '')

  // Remove event handler attributes (onclick="…", onload='…', etc.).
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

  return result
}

/** Convert an `<a>` element to a Markdown link, stripping unsafe href schemes. */
function buildMarkdownLink(attrs: string, content: string): string {
  const hrefMatch = attrs.match(/href=["']([^"']*)["']/)
  if (!hrefMatch) return stripTags(content)
  const href = hrefMatch[1]
  if (href.startsWith('//') || /^(?:javascript|data|vbscript):/i.test(href)) {
    return stripTags(content)
  }
  return `[${stripTags(content)}](${href})`
}

/** Convert an `<img>` element to a Markdown image reference. */
function buildMarkdownImage(attrs: string): string {
  const srcMatch = attrs.match(/src=["']([^"']*)["']/)
  if (!srcMatch) return ''
  const altMatch = attrs.match(/alt=["']([^"']*)["']/)
  return `![${altMatch ? altMatch[1] : ''}](${srcMatch[1]})`
}

/**
 * Convert sanitized HTML to Markdown using regex-based transformations.
 *
 * Handles: ATX headings, fenced code blocks, inline code, bold, italic,
 * links, images, ordered/unordered lists, blockquotes, horizontal rules,
 * and paragraphs. No external dependencies.
 */
function htmlToMarkdown(html: string): string {
  let md = html

  // Extract <body> content from full HTML documents.
  const bodyMatch = md.match(/<body[^>]*>([\s\S]*?)<\/body\s*>/i)
  if (bodyMatch) {
    md = bodyMatch[1]
  } else {
    // Remove <head> section from fragments that include one.
    md = md.replace(/<head[^>]*>[\s\S]*?<\/head\s*>/gi, '')
  }

  // Fenced code blocks: <pre><code>…</code></pre>
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code\s*>\s*<\/pre\s*>/gi,
    (_, content: string) =>
      `\n\`\`\`\n${decodeEntities(content.replace(/<[^>]*>/g, ''))}\n\`\`\`\n`
  )

  // Inline code: <code>…</code>
  md = md.replace(
    /<code[^>]*>([\s\S]*?)<\/code\s*>/gi,
    (_, content: string) => `\`${decodeEntities(content.replace(/<[^>]*>/g, ''))}\``
  )

  // ATX headings h6→h1 (descending to avoid h1 pattern matching h10, etc.)
  for (let i = 6; i >= 1; i--) {
    md = md.replace(
      new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}\\s*>`, 'gi'), // nosemgrep
      (_, content: string) => `\n${'#'.repeat(i)} ${stripTags(content)}\n`
    )
  }

  // Blockquotes — strip inner tags, prefix each non-empty line with "> "
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote\s*>/gi, (_, content: string) => {
    const lines = stripTags(content)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `> ${line}`)
    return '\n' + lines.join('\n') + '\n'
  })

  // Bold: <strong> and <b>
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)\s*>/gi, '**$1**')

  // Italic: <em> and <i>
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)\s*>/gi, '*$1*')

  // Links — preserve href, reject unsafe schemes and protocol-relative URLs
  md = md.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (_, attrs: string, content: string) =>
    buildMarkdownLink(attrs, content)
  )

  // Images — preserve src and alt
  md = md.replace(/<img\b([^>]*)>/gi, (_, attrs: string) => buildMarkdownImage(attrs))

  // Ordered lists — reset counter per <ol>
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol\s*>/gi, (_, content: string) => {
    let counter = 0
    const items = content.replace(
      /<li[^>]*>([\s\S]*?)<\/li\s*>/gi,
      (_m: string, item: string) => `${++counter}. ${stripTags(item).trim()}\n`
    )
    return '\n' + items.replace(/<[^>]*>/g, '') + '\n'
  })

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul\s*>/gi, (_, content: string) => {
    const items = content.replace(
      /<li[^>]*>([\s\S]*?)<\/li\s*>/gi,
      (_m: string, item: string) => `- ${stripTags(item).trim()}\n`
    )
    return '\n' + items.replace(/<[^>]*>/g, '') + '\n'
  })

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n')

  // Paragraphs — closing tag becomes double newline, opening tag is stripped
  md = md.replace(/<\/p\s*>/gi, '\n\n')
  md = md.replace(/<p[^>]*>/gi, '')

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Strip all remaining HTML tags
  md = md.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  md = decodeEntities(md)

  // Protect fenced code block contents from whitespace normalization so that
  // indentation-significant code (e.g. Python) is preserved correctly.
  const codeBlocks: string[] = []
  md = md.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlocks.push(match) - 1
    return `\x00CODEBLOCK${idx}\x00`
  })
  // Normalize prose whitespace only (code blocks are placeholdered above).
  md = md.replace(/[^\S\n]+/g, ' ')
  md = md.replace(/ +$/gm, '')
  md = md.replace(/\n{3,}/g, '\n\n')
  // Restore code block contents.
  for (let i = 0; i < codeBlocks.length; i++) {
    md = md.replace(`\x00CODEBLOCK${i}\x00`, codeBlocks[i])
  }

  return md.trim()
}

/** Parse the q-value from a list of trimmed Accept media-type parameters. */
function parseQ(params: string[]): number {
  for (const p of params) {
    const eqIdx = p.indexOf('=')
    if (eqIdx !== -1 && p.slice(0, eqIdx).trim().toLowerCase() === 'q') {
      const v = parseFloat(p.slice(eqIdx + 1).trim())
      return Number.isNaN(v) ? 1.0 : v
    }
  }
  return 1.0
}

/**
 * Returns true when the request's Accept header includes `text/markdown` with
 * a positive q-value that is at least as high as text/html's q-value. Respects
 * RFC 7231 §5.3: media-type tokens are case-insensitive and optional whitespace
 * is allowed around the `=` sign (so `Q=0` and `q = 0` are valid opt-outs).
 * When text/html has a strictly higher q-value the client prefers HTML and the
 * request passes through unchanged.
 */
function acceptsMarkdownHeader(request: Request): boolean {
  const accept = request.headers.get('Accept') ?? ''
  let markdownQ = -1
  let htmlQ = -1
  for (const token of accept.split(',')) {
    const parts = token.trim().split(';')
    const mediaType = parts[0].trim().toLowerCase()
    const q = parseQ(parts.slice(1).map((p: string) => p.trim()))
    if (mediaType === 'text/markdown') markdownQ = Math.max(markdownQ, q)
    else if (mediaType === 'text/html') htmlQ = Math.max(htmlQ, q)
  }
  return markdownQ > 0 && (htmlQ < 0 || markdownQ >= htmlQ)
}

/** Returns true when the response is a byte-range fragment that must not be rewritten. */
function isPartialContent(response: Response): boolean {
  return response.status === 206 || response.headers.has('Content-Range')
}

/**
 * Build the response headers for the Markdown body, starting from the origin
 * headers and stripping or updating fields that describe the HTML payload.
 */
function buildMarkdownHeaders(origin: Response, tokenEstimate: string): Headers {
  // Start from all origin headers to preserve unrelated metadata
  // (e.g. CORS headers, X-* headers, etc.). Remove validators and
  // entity headers that describe the HTML payload — they are now stale
  // for the rewritten Markdown body and must be stripped to prevent
  // clients / CDNs from mis-handling the response (wrong Content-Length,
  // mismatched ETag, etc.).
  const headers = new Headers(origin.headers)
  headers.delete('Content-Length')
  headers.delete('Content-Encoding')
  headers.delete('Transfer-Encoding')
  // Range headers describe the HTML fragment, not the Markdown body.
  headers.delete('Content-Range')
  headers.delete('Accept-Ranges')
  headers.delete('ETag')
  headers.delete('Last-Modified')
  headers.set('Content-Type', 'text/markdown; charset=utf-8')
  headers.set('X-Markdown-Tokens', tokenEstimate)
  headers.set('Content-Signal', 'ai-train=yes, search=yes, ai-input=yes')
  // Preserve the origin Cache-Control policy when set. Otherwise prevent
  // caches from storing this Markdown transformation as if it were the
  // canonical HTML resource, which would return wrong content to subsequent
  // HTML requests sharing the same cache key.
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  // Merge Accept into any existing Vary value so CDNs store HTML and
  // Markdown as separate cache entries without losing other Vary tokens
  // (e.g. Accept-Encoding) the origin already set.
  const originVary = headers.get('Vary') ?? ''
  const varyParts = originVary.split(',').map((v: string) => v.trim()).filter(Boolean)
  const normalizedVaryParts = varyParts.map((v: string) => v.toLowerCase())
  headers.set(
    'Vary',
    normalizedVaryParts.includes('accept') ? originVary : [...varyParts, 'Accept'].join(', ')
  )
  return headers
}

/**
 * Convert a fetched origin response to Markdown, or pass it through unchanged
 * when the content-type or status makes conversion inappropriate.
 */
async function convertOriginToMarkdown(originResponse: Response): Promise<Response> {
  const contentType = (originResponse.headers.get('Content-Type') ?? '').toLowerCase()
  if (!contentType.includes('text/html')) return originResponse
  // A 206 response (or one with Content-Range) is a fragment of the full
  // document. Rewriting only that fragment into Markdown and stripping the
  // range headers would break byte-range semantics for the caller.
  if (isPartialContent(originResponse)) return originResponse
  const html = await originResponse.clone().text()
  const markdown = htmlToMarkdown(sanitizeHtml(html))
  const tokenEstimate = String(Math.ceil(markdown.length / 4))
  return new Response(markdown, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: buildMarkdownHeaders(originResponse, tokenEstimate),
  })
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
  if (!acceptsMarkdownHeader(request)) {
    return context.next()
  }

  // ── 3. Skip excluded paths ──────────────────────────────────────────────
  const { pathname } = new URL(request.url)
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return context.next()
  }

  let originResponse: Response | undefined

  try {
    // ── 4. Fetch from origin and convert ─────────────────────────────────
    originResponse = await context.next()
    return await convertOriginToMarkdown(originResponse)
  } catch (err) {
    // ── 5. Fallback: pass through to origin unchanged ─────────────────────
    // Log pathname only — never request.url — to avoid persisting sensitive
    // query parameters (tokens, emails, campaign IDs) in edge logs.
    // console.error is the correct logging mechanism in the Deno-based Edge
    // Runtime; src/utils/monitoring.ts cannot be imported here.
    console.error('[markdown-response] Markdown conversion failed; falling back to HTML', pathname, err)
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
