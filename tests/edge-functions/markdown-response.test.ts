/**
 * Tests for the markdown-response Netlify edge function.
 *
 * The function converts HTML responses to Markdown when the request carries
 * an `Accept: text/markdown` header. All other requests pass through unchanged.
 *
 * Module resolution: vitest.config.ts maps the Deno-style `npm:` specifiers to
 * their local node_modules equivalents so the handler can be imported in Node.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Context } from '../../netlify/edge-functions/__stubs__/edge-netlify'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a minimal Request with the given URL and optional headers. */
function makeRequest(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers })
}

/** Build a mock Context whose next() returns the supplied Response. */
function makeContext(response: Response) {
  return {
    next: vi.fn<Context['next']>().mockResolvedValue(response),
  } satisfies Context
}

/** Build a plain HTML Response. */
function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

/** Build a non-HTML Response (e.g. JSON). */
function jsonResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Import handler under test ───────────────────────────────────────────────

import handler from '../../netlify/edge-functions/markdown-response'

// `handler` is imported once; the function under test is stateless so we do
// not need to re-import it for every test case.

// (If module-level state is introduced in future and per-test isolation is
// required, prefer `vi.resetModules()` with a stable specifier over adding
// unique query parameters to the import path.)
// ── Test suites ─────────────────────────────────────────────────────────────

describe('markdown-response edge function', () => {
  // ── Method gating ─────────────────────────────────────────────────────────

  describe('method gate', () => {
    it('passes through POST requests even with Accept: text/markdown', async () => {
      const req = new Request('https://example.com/', {
        method: 'POST',
        headers: { Accept: 'text/markdown' },
      })
      const ctx = makeContext(htmlResponse('<p>Data</p>'))

      await handler(req, ctx)

      // context.next called once for pass-through; Content-Type not rewritten
      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('passes through PUT requests even with Accept: text/markdown', async () => {
      const req = new Request('https://example.com/', {
        method: 'PUT',
        headers: { Accept: 'text/markdown' },
      })
      const ctx = makeContext(htmlResponse('<p>Data</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('processes GET requests with Accept: text/markdown', async () => {
      const req = new Request('https://example.com/', {
        method: 'GET',
        headers: { Accept: 'text/markdown' },
      })
      const ctx = makeContext(htmlResponse('<p>Home</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('passes through HEAD requests unchanged (HEAD responses must not include a body)', async () => {
      const req = new Request('https://example.com/', {
        method: 'HEAD',
        headers: { Accept: 'text/markdown' },
      })
      const ctx = makeContext(htmlResponse('<p>Home</p>'))

      await handler(req, ctx)

      // HEAD responses must not include a message body, so the handler passes
      // HEAD through unchanged rather than converting it to Markdown.
      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })
  })

  // ── Accept-header gating ──────────────────────────────────────────────────

  describe('Accept-header gate', () => {
    it('passes through when Accept header is absent', async () => {
      const req = makeRequest('https://example.com/')
      const ctx = makeContext(htmlResponse('<h1>Hello</h1>'))

      const result = await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      // The body and Content-Type must be unchanged; Vary: Accept is merged in
      // so CDNs know this URL has separate markdown and HTML representations.
      expect(result.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
      expect((result.headers.get('Vary') ?? '').toLowerCase()).toContain('accept')
      const body = await result.text()
      expect(body).toBe('<h1>Hello</h1>')
    })

    it('passes through for Accept: text/html', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'text/html' })
      const ctx = makeContext(htmlResponse('<h1>Hi</h1>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('passes through for Accept: application/json', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'application/json' })
      const ctx = makeContext(htmlResponse('<p>Data</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('processes request with Accept: text/markdown', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'text/markdown' })
      const ctx = makeContext(htmlResponse('<h1>Hello</h1>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('processes request when text/markdown is part of a multi-value Accept list', async () => {
      const req = makeRequest('https://example.com/', {
        Accept: 'text/html, text/markdown, */*',
      })
      const ctx = makeContext(htmlResponse('<h1>Hi</h1>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('is case-insensitive for the Accept header value', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'Text/Markdown' })
      const ctx = makeContext(htmlResponse('<h1>Hi</h1>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('passes through when Accept: text/markdown;q=0 (explicit opt-out)', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'text/markdown;q=0' })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('processes request when Accept: text/markdown;q=0.5 (positive q-value)', async () => {
      const req = makeRequest('https://example.com/', { Accept: 'text/markdown;q=0.5' })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('passes through when text/markdown appears with q=0 in a multi-value Accept list', async () => {
      const req = makeRequest('https://example.com/', {
        Accept: 'text/html, text/markdown;q=0, */*',
      })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('respects RFC 7231 case-insensitive q param: Q=0 is an opt-out', async () => {
      // RFC 7231 §5.3: parameter names are case-insensitive
      const req = makeRequest('https://example.com/', { Accept: 'text/markdown;Q=0' })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('respects RFC 7231 whitespace around = in q param: q = 0 is an opt-out', async () => {
      // RFC 7231 §5.3: optional whitespace is allowed around the '=' sign
      const req = makeRequest('https://example.com/', { Accept: 'text/markdown; q = 0' })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('passes through when text/html has a strictly higher q-value than text/markdown', async () => {
      // RFC 7231 content negotiation: prefer HTML when its q-value exceeds markdown's
      const req = makeRequest('https://example.com/', {
        Accept: 'text/html, text/markdown;q=0.5',
      })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      const result = await ctx.next.mock.results[0].value
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('serves Markdown when text/markdown and text/html share an equal q-value', async () => {
      // Equal q-values: edge function preference breaks the tie in favour of Markdown
      const req = makeRequest('https://example.com/', {
        Accept: 'text/html;q=0.9, text/markdown;q=0.9',
      })
      const ctx = makeContext(htmlResponse('<p>Page</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })
  })

  // ── Excluded-path gating ──────────────────────────────────────────────────

  describe('excluded-path gate', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it.each([
      ['/.env', 'https://example.com/.env'],
      ['/assets/', 'https://example.com/assets/logo.png'],
      ['/api/', 'https://example.com/api/subscribe'],
      ['/.netlify/', 'https://example.com/.netlify/functions/subscribe'],
      ['/favicon', 'https://example.com/favicon.ico'],
      ['/robots.txt', 'https://example.com/robots.txt'],
      ['/sitemap', 'https://example.com/sitemap.xml'],
      ['/manifest', 'https://example.com/manifest.json'],
    ])('passes through for excluded prefix %s', async (_prefix, url) => {
      const req = makeRequest(url, mdHeaders)
      const ctx = makeContext(htmlResponse('<p>ignored</p>'))

      await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('does NOT pass through for a normal page path', async () => {
      const req = makeRequest('https://example.com/privacy', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Privacy</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('does NOT pass through for the root path /', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Home</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })
  })

  // ── Non-HTML origin responses ─────────────────────────────────────────────

  describe('non-HTML origin content-type pass-through', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('returns the original response when origin content-type is not text/html', async () => {
      const req = makeRequest('https://example.com/data', mdHeaders)
      const original = jsonResponse('{"key":"value"}')
      const ctx = makeContext(original)

      const result = await handler(req, ctx)

      // Should be the original response object
      expect(result.headers.get('Content-Type')).toBe('application/json')
    })
  })

  // ── Markdown conversion ───────────────────────────────────────────────────

  describe('HTML-to-Markdown conversion', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('converts headings to ATX style', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<h1>Title</h1><h2>Subtitle</h2>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('# Title')
      expect(body).toContain('## Subtitle')
    })

    it('converts paragraphs to plain text', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hello world</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Hello world')
    })

    it('converts unordered lists with dash bullets', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<ul><li>Alpha</li><li>Beta</li></ul>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toMatch(/^-\s+Alpha/m)
      expect(body).toMatch(/^-\s+Beta/m)
    })

    it('converts ordered lists', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<ol><li>First</li><li>Second</li></ol>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('1.')
      expect(body).toContain('First')
      expect(body).toContain('Second')
    })

    it('converts links preserving href', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a href="https://example.com">Click here</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('[Click here](https://example.com)')
    })

    it('converts inline code with backticks', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Use <code>npm install</code> to install.</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('`npm install`')
    })

    it('uses a longer backtick delimiter when inline code contains a backtick', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p><code>a`b</code></p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      // Single-backtick delimiters would break — must use `` `` `` or longer.
      expect(body).toContain('``')
      expect(body).toContain('a`b')
      // The literal text must not appear as a bare inline-code fragment.
      expect(body).not.toMatch(/[^`]`a`b`[^`]|^`a`b`$/)
    })

    it('converts code blocks with fenced style', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<pre><code>const x = 1;\nconst y = 2;</code></pre>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('```')
      expect(body).toContain('const x = 1;')
    })

    it('converts bare <pre> blocks (without nested <code>) to fenced code', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<pre>  indented\n  text</pre>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('```')
      expect(body).toContain('indented')
      expect(body).toContain('text')
    })

    it('converts bold text to **strong**', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p><strong>important</strong></p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('**important**')
    })

    it('converts italic text to *em*', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p><em>emphasis</em></p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toMatch(/\*emphasis\*|_emphasis_/)
    })

    it('converts blockquotes', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<blockquote><p>A quote</p></blockquote>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('> A quote')
    })

    it('preserves paragraph boundaries inside blockquotes', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<blockquote><p>First paragraph</p><p>Second paragraph</p></blockquote>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('> First paragraph')
      expect(body).toContain('> Second paragraph')
    })

    it('converts tables to Markdown pipe tables', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse(
          '<table><tr><th>Feature</th><th>Supported</th></tr>' +
            '<tr><td>Sync</td><td>Yes</td></tr></table>'
        )
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('| Feature | Supported |')
      expect(body).toContain('| Sync | Yes |')
    })

    it('preserves image alt text and src', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<img src="/logo.png" alt="Logo">'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('![Logo](/logo.png)')
    })

    it('strips images with javascript: src', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<img src="javascript:alert(1)" alt="xss">'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('javascript:')
      expect(body).not.toContain('![')
    })

    it('strips images with data: src', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<img src="data:image/png;base64,abc" alt="payload">')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('data:')
      expect(body).not.toContain('![')
    })

    it('trims leading and trailing whitespace from output', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('   <p>Content</p>   '))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toBe(body.trim())
    })

    it('backslash-escapes ) in href so it does not terminate the link destination', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a href="https://example.com/a)b">docs</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      // ) must be escaped as \) so it is literal inside the (…) destination.
      expect(body).toContain('[docs](https://example.com/a\\)b)')
    })

    it('converts linked images to [![alt](src)](href) Markdown syntax', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<a href="/full"><img src="/thumb.jpg" alt="Photo"></a>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('[![Photo](/thumb.jpg)](/full)')
    })

    it('handles case-insensitive attribute names like HREF', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a HREF="/about">About</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('About')
      expect(body).toContain('/about')
    })

    it('handles whitespace around = in attribute assignment', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a href = "/privacy">Privacy</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Privacy')
      expect(body).toContain('/privacy')
    })

    it('handles unquoted attribute values', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a href=/terms>Terms</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Terms')
      expect(body).toContain('/terms')
    })

    it('does not match data-href as href (attribute-name boundary)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<a data-href="/admin">Label</a>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      // No real href — should emit only the label, not a link to /admin
      expect(body).toContain('Label')
      expect(body).not.toContain('](/admin)')
      expect(body).not.toContain('](<')
    })

    it('handles > inside quoted attributes without leaking attribute content', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p title="1 > 0">Safe</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Safe')
      // The attribute value must not bleed into the text output
      expect(body).not.toContain('0">')
    })

    it('preserves nested ordered list hierarchy with parent and child on separate lines', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<ol><li>Parent<ol><li>Child</li></ol></li></ol>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('1. Parent')
      expect(body).toContain('Child')
      // Parent and Child must be on separate lines — the parent item line
      // must not contain the child text (they must not be merged).
      const bodyLines = body.split('\n').map((l) => l.trim()).filter(Boolean)
      const parentLine = bodyLines.find((l) => l.startsWith('1. Parent'))
      expect(parentLine).toBeDefined()
      expect(parentLine).not.toContain('Child')
      expect(body).not.toContain('ParentChild')
    })

    it('preserves nested unordered list hierarchy with parent and child on separate lines', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<ul><li>Parent<ul><li>Child</li></ul></li></ul>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('- Parent')
      expect(body).toContain('Child')
      // Must be separate lines, not merged
      expect(body).not.toMatch(/ParentChild/)
    })

    it('uses a longer fence when fenced code block content contains backtick runs', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      // Code block content containing ```, which would close a standard ``` fence early
      const ctx = makeContext(
        htmlResponse('<pre><code>before\n```\nafter</code></pre>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('before')
      expect(body).toContain('after')
      // The fence must be longer than ``` so content backticks don't close it
      const fenceMatch = body.match(/^(`{4,})/m)
      expect(fenceMatch).not.toBeNull()
    })
  })

  // ── HTML sanitisation ─────────────────────────────────────────────────────

  describe('HTML sanitisation', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('strips <script> tags and their content', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Safe</p><script>alert("xss")</script>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('alert')
      expect(body).not.toContain('<script')
      expect(body).toContain('Safe')
    })

    it('strips <style> tags and their content', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<style>body { color: red }</style><p>Content</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('color: red')
      expect(body).not.toContain('<style')
      expect(body).toContain('Content')
    })

    it('strips <iframe> tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<iframe src="https://evil.com"></iframe><p>Page</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<iframe')
      expect(body).not.toContain('evil.com')
    })

    it('strips <nav> tags via regex sanitiser (REMOVE_TAGS)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<nav><a href="/">Home</a></nav><main><p>Content</p></main>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      // Nav links stripped but main content preserved
      expect(body).toContain('Content')
      expect(body).not.toContain('Home')
    })

    it('fully removes nested same-type excluded elements (inner closer must not leave a tail)', async () => {
      // Regression: non-greedy regex matched the inner pair first, leaving the
      // text after the inner closer ("tail") outside any tag and leaking it into output.
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<p>Before</p><nav>outer<nav>inner</nav>tail</nav><p>After</p>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('outer')
      expect(body).not.toContain('inner')
      expect(body).not.toContain('tail')
      expect(body).toContain('Before')
      expect(body).toContain('After')
    })

    it('preserves <header> content; strips <footer> content', async () => {
      // <header> is NOT in REMOVE_TAGS: static pages (privacy, terms) use
      // <header> for the page title and last-updated metadata that agents
      // need.  The SPA shell has no <header> at all so this is safe.
      // <footer> IS in REMOVE_TAGS (copyright boilerplate adds no value).
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse(
          '<header><h1>Privacy Policy</h1><p>Last Updated: 2025-01-01</p></header>' +
            '<main><p>Body</p></main>' +
            '<footer><p>Footer</p></footer>'
        )
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Body')
      expect(body).toContain('Privacy Policy')
      expect(body).toContain('Last Updated')
      expect(body).not.toContain('Footer')
    })

    it('strips disallowed attributes (e.g. onclick, onload)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p onclick="alert(1)">Text</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('onclick')
      expect(body).toContain('Text')
    })

    it('only keeps href and title on <a> tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<a href="/page" class="btn" data-track="click">Link</a>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('class=')
      expect(body).not.toContain('data-track=')
      expect(body).toContain('[Link](/page)')
    })
  })

  // ── Sanitisation: dangerous tags and content removal ─────────────────────

  describe('sanitisation: dangerous tags and content removal', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('removes HTML comments that survive sanitisation', async () => {
      // The regex sanitiser strips HTML comments via /<!--[\s\S]*?(?:-->|$)/g.
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p><!-- hidden comment -->Visible</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<!--')
      expect(body).not.toContain('-->')
      expect(body).toContain('Visible')
    })

    it('removes bare <script fragments with no closing bracket', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      // The regex sanitiser strips malformed/partial script tags via the
      // partial-opener pattern (/<(?:tag)\b[^>]*>?/gi, closing `>` optional).
      const ctx = makeContext(htmlResponse('<p>Text</p><script'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<script')
    })

    it('removes <noscript> tags and their children', async () => {
      // The regex sanitiser removes <noscript> complete subtrees via the
      // iterative tag+children removal loop in sanitizeHtml (REMOVE_TAGS).
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<noscript><p>Enable JS</p></noscript><p>Content</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<noscript')
      expect(body).not.toContain('Enable JS')
      expect(body).toContain('Content')
    })

    it('removes <noscript> with trailing whitespace in closing tag (</noscript >)', async () => {
      // Regression: the pre-strip regex must match </noscript > (with trailing
      // whitespace before >) — a valid HTML closing tag form that would
      // otherwise survive the pre-pass and leak noscript content.
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<noscript ><p>Enable JS</p></noscript ><p>Content</p>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('Enable JS')
      expect(body).toContain('Content')
    })

    it('removes <object> and <embed> tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<object data="file.swf"></object>' + '<embed src="plugin.swf"><p>Content</p>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<object')
      expect(body).not.toContain('<embed')
    })

    it('removes <applet> tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<applet code="App.class"></applet><p>Content</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<applet')
    })

    it('removes unclosed excluded tags and all trailing content (no closer = remove to end)', async () => {
      // Regression: partial opener removal only stripped the <script> tag,
      // leaving the payload text in the Markdown output.
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<p>Safe</p><script>SECRET PAYLOAD with no closing tag')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('SECRET')
      expect(body).not.toContain('PAYLOAD')
      expect(body).toContain('Safe')
    })
  })

  // ── Response headers ──────────────────────────────────────────────────────

  describe('response headers', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('sets Content-Type to text/markdown; charset=utf-8', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hello</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('sets X-Markdown-Tokens to a positive integer string', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Some content here.</p>'))

      const result = await handler(req, ctx)
      const tokens = result.headers.get('X-Markdown-Tokens')

      expect(tokens).not.toBeNull()
      const parsed = Number(tokens)
      expect(Number.isInteger(parsed)).toBe(true)
      expect(parsed).toBeGreaterThan(0)
    })

    it('X-Markdown-Tokens is Math.ceil(markdownLength / 4)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      // "Hello" → 5 chars → ceil(5/4) = 2
      const ctx = makeContext(htmlResponse('<p>Hello</p>'))

      const result = await handler(req, ctx)
      const body = await result.clone().text()
      const tokens = Number(result.headers.get('X-Markdown-Tokens'))

      expect(tokens).toBe(Math.ceil(body.length / 4))
    })

    it('sets Cache-Control to no-store when origin does not include one', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hi</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Cache-Control')).toBe('no-store')
    })

    it('preserves origin Cache-Control when already set', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const originWithCache = new Response('<p>Hi</p>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600',
        },
      })
      const ctx = makeContext(originWithCache)

      const result = await handler(req, ctx)

      expect(result.headers.get('Cache-Control')).toBe('public, max-age=3600')
    })

    it('sets Vary to Accept', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hi</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Vary')).toBe('Accept')
    })

    it('sets Content-Signal header', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hi</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Signal')).toBe('ai-train=yes, search=yes, ai-input=yes')
    })

    it('strips Accept-Ranges and Content-Range from rewritten response', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const originWithRangeHeaders = new Response('<p>Content</p>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Accept-Ranges': 'bytes',
          // Content-Range would be unusual on a 200, but test the deletion path
        },
      })
      const ctx = makeContext(originWithRangeHeaders)

      const result = await handler(req, ctx)

      expect(result.headers.get('Accept-Ranges')).toBeNull()
      expect(result.headers.get('Content-Range')).toBeNull()
      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })

    it('preserves the origin status code', async () => {
      const req = makeRequest('https://example.com/not-found', mdHeaders)
      const ctx = makeContext(
        new Response('<p>Not found</p>', {
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'text/html' },
        })
      )

      const result = await handler(req, ctx)

      expect(result.status).toBe(404)
    })
  })

  // ── Token estimate ────────────────────────────────────────────────────────

  describe('token estimate calculation (chars / 4)', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('calculates token estimate as ceiling of chars divided by 4', async () => {
      const testCases = [
        { len: 4, expected: 1 }, // exactly divisible
        { len: 5, expected: 2 }, // rounds up
        { len: 8, expected: 2 }, // exactly divisible
        { len: 9, expected: 3 }, // rounds up
      ]

      for (const { len, expected } of testCases) {
        const bodyText = 'x'.repeat(len)
        const req = makeRequest('https://example.com/', mdHeaders)
        const ctx = makeContext(htmlResponse(`<p>${bodyText}</p>`))

        const result = await handler(req, ctx)
        const markdown = await result.clone().text()
        const tokens = Number(result.headers.get('X-Markdown-Tokens'))

        // Token count must equal ceil(markdown.length / 4) and the pre-computed expected value.
        expect(tokens).toBe(Math.ceil(markdown.length / 4))
        expect(tokens).toBe(expected)
      }
    })
  })

  // ── Error / fallback handling ─────────────────────────────────────────────

  describe('error fallback', () => {
    const mdHeaders = { Accept: 'text/markdown' }
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('returns the origin response when HTML conversion throws', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)

      // Simulate context.next() resolving successfully with a response whose
      // cloned body throws when read, triggering the catch block.
      const brokenResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
      // Override the text() method to throw
      Object.defineProperty(brokenResponse, 'clone', {
        value: () => ({
          text: () => Promise.reject(new Error('read error')),
        }),
      })

      const ctx: Context = {
        next: vi.fn<Context['next']>().mockResolvedValue(brokenResponse),
      }

      const result = await handler(req, ctx)

      // Should fall back to returning the origin response
      expect(result).toBe(brokenResponse)
    })

    it('logs the error with pathname (not full url) when conversion throws', async () => {
      const req = makeRequest('https://example.com/privacy?token=secret', mdHeaders)

      const brokenResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
      Object.defineProperty(brokenResponse, 'clone', {
        value: () => ({
          text: () => Promise.reject(new Error('read error')),
        }),
      })

      const ctx: Context = {
        next: vi.fn<Context['next']>().mockResolvedValue(brokenResponse),
      }

      await handler(req, ctx)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()
      const [label, loggedPath, loggedErr] = consoleErrorSpy.mock.calls[0]
      expect(label).toContain('markdown-response')
      expect(label).toContain('falling back')
      // pathname only — sensitive query params must not appear in logs
      expect(loggedPath).toBe('/privacy')
      expect(loggedErr).toBeInstanceOf(Error)
      expect((loggedErr as Error).message).toBe('read error')
    })

    it('returns 502 when context.next() throws before origin response is fetched', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)

      // context.next() throws, so originResponse is never assigned.
      // The handler must not call context.next() again (double origin traffic);
      // it returns a synthetic 502 instead.
      const ctx: Context = {
        next: vi.fn<Context['next']>().mockRejectedValueOnce(new Error('network error')),
      }

      const result = await handler(req, ctx)

      expect(result.status).toBe(502)
      expect(ctx.next).toHaveBeenCalledOnce()
    })

    it('logs the error even when originResponse is undefined', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)

      const ctx: Context = {
        next: vi.fn<Context['next']>().mockRejectedValueOnce(new Error('network error')),
      }

      await handler(req, ctx)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()
      const [label, loggedPath, loggedErr] = consoleErrorSpy.mock.calls[0]
      expect(label).toContain('markdown-response')
      // pathname only — sensitive query params and full URL must not appear in logs
      expect(loggedPath).toBe('/')
      expect(loggedErr).toBeInstanceOf(Error)
      expect((loggedErr as Error).message).toBe('network error')
    })

    it('passes through 206 Partial Content responses unchanged', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const partialResponse = new Response('<p>Partial</p>', {
        status: 206,
        statusText: 'Partial Content',
        headers: {
          'Content-Type': 'text/html',
          'Content-Range': 'bytes 0-99/500',
        },
      })
      const ctx = makeContext(partialResponse)

      const result = await handler(req, ctx)

      // Must return the origin response without rewriting
      expect(result.status).toBe(206)
      expect(result.headers.get('Content-Type')).toBe('text/html')
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })

    it('passes through responses with Content-Range header unchanged', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const rangeResponse = new Response('<p>Range</p>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Range': 'bytes 0-99/500',
        },
      })
      const ctx = makeContext(rangeResponse)

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/html')
      expect(result.headers.get('Content-Type')).not.toBe('text/markdown; charset=utf-8')
    })
  })

  // ── Regression / edge cases ───────────────────────────────────────────────

  describe('regression and boundary cases', () => {
    const mdHeaders = { Accept: 'text/markdown' }

    it('handles an empty HTML body without throwing', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse(''))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
      const body = await result.text()
      expect(typeof body).toBe('string')
    })

    it('handles HTML with deeply nested elements', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const nested = '<div><section><article><p><strong>Deep</strong></p></article></section></div>'
      const ctx = makeContext(htmlResponse(nested))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Deep')
    })

    it('handles HTML with only disallowed tags (outputs empty or whitespace)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<script>doEvil()</script><style>body{}</style>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('doEvil')
      expect(body).not.toContain('body{}')
    })

    it('handles a very long HTML document without error', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const paragraphs = Array.from(
        { length: 500 },
        (_, i) => `<p>Paragraph ${i} with some content.</p>`
      ).join('')
      const ctx = makeContext(htmlResponse(paragraphs))

      const result = await handler(req, ctx)

      expect(result.status).toBe(200)
      const body = await result.text()
      expect(body.length).toBeGreaterThan(0)
    })

    it('handles a path that begins with an excluded prefix substring but is not excluded', async () => {
      // /apikey begins with the substring "/api" but does not match the excluded
      // prefix "/api/", so it should still be processed as Markdown.
      const includedReq = makeRequest('https://example.com/apikey', mdHeaders)
      const includedCtx = makeContext(htmlResponse('<p>API key docs</p>'))

      const includedResult = await handler(includedReq, includedCtx)
      const includedBody = await includedResult.text()

      expect(includedCtx.next).toHaveBeenCalledOnce()
      expect(includedBody).toContain('API key docs')
      expect(includedBody).not.toContain('<p>')

      // /sitemap-index.xml starts with /sitemap → excluded → raw HTML passed through
      const excludedReq = makeRequest('https://example.com/sitemap-index.xml', mdHeaders)
      const excludedCtx = makeContext(htmlResponse('<p>Sitemap</p>'))

      const excludedResult = await handler(excludedReq, excludedCtx)
      const excludedBody = await excludedResult.text()

      expect(excludedCtx.next).toHaveBeenCalledOnce()
      expect(excludedBody).toBe('<p>Sitemap</p>')
    })

    it('decodes supplementary Unicode code points (emoji) via numeric entities', async () => {
      // String.fromCharCode truncates values above U+FFFF; String.fromCodePoint handles them.
      const req = makeRequest('https://example.com/', mdHeaders)
      // &#128512; is U+1F600 😀 (decimal); &#x1F601; is 😁 (hex)
      const ctx = makeContext(htmlResponse('<p>&#128512; and &#x1F601;</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('😀')
      expect(body).toContain('😁')
    })

    it('handles XSS vectors with mixed-case and whitespace tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse(
          '<p>Safe</p>' +
            '<SCRIPT>alert(1)</SCRIPT>' +
            '<Script >alert(2)</Script>' +
            '</script\t\nbar>'
        )
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('alert')
      expect(body).toContain('Safe')
    })

    it('handles HTML comments at the end of string (no closing -->)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      // A truncated comment fragment
      const ctx = makeContext(htmlResponse('<p>Content</p><!-- truncated'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<!--')
      expect(body).toContain('Content')
    })

    it('rejects entity-encoded javascript: href (e.g. javascript&#58;alert(1))', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<a href="javascript&#58;alert(1)">Click</a>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('javascript:')
      expect(body).not.toContain('javascript&#58;')
      expect(body).not.toContain('](')
    })

    it('rejects entity-encoded javascript: img src', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<img src="javascript&#58;alert(1)" alt="xss">')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('javascript:')
      expect(body).not.toContain('javascript&#58;')
      expect(body).not.toContain('![')
    })

    it('preserves content after a void <embed> excluded element', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      // <embed> is a void element — removing it should not consume trailing content
      const ctx = makeContext(
        htmlResponse('<p>Before</p><embed src="plugin.swf"><p>After</p>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Before')
      expect(body).toContain('After')
      expect(body).not.toContain('plugin.swf')
    })

    it('adds Vary: Accept to HTML pass-through responses for non-markdown clients', async () => {
      // A browser (no Accept: text/markdown) should still get Vary: Accept
      // so CDNs know the same URL may return a different representation for
      // markdown-requesting clients.
      const req = makeRequest('https://example.com/')
      const ctx = makeContext(htmlResponse('<p>Hello</p>'))

      const result = await handler(req, ctx)

      const vary = result.headers.get('Vary') ?? ''
      expect(vary.toLowerCase()).toContain('accept')
    })

    it('does not add Vary: Accept to non-HTML pass-through responses', async () => {
      const req = makeRequest('https://example.com/data.json')
      const ctx = makeContext(jsonResponse('{"key":"value"}'))

      const result = await handler(req, ctx)

      const vary = result.headers.get('Vary') ?? ''
      expect(vary.toLowerCase()).not.toContain('accept')
    })
  })
})
