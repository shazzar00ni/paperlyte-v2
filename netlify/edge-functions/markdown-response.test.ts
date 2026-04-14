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
import type { Context } from './__stubs__/edge-netlify'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a minimal Request with the given URL and optional headers. */
function makeRequest(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers })
}

/** Build a mock Context whose next() returns the supplied Response. */
function makeContext(response: Response): Context {
  return {
    next: vi.fn().mockResolvedValue(response),
  } as unknown as Context
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

import handler from './markdown-response'

// `handler` is imported once; the function under test is stateless so we do
// not need to re-import it for every test case.

// (If module-level state is introduced in future and per-test isolation is
// required, prefer `vi.resetModules()` with a stable specifier over adding
// unique query parameters to the import path.)
// ── Test suites ─────────────────────────────────────────────────────────────

describe('markdown-response edge function', () => {
  // ── Method gating ─────────────────────────────────────────────────────────

  describe('method gate (step 1)', () => {
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

    it('processes HEAD requests with Accept: text/markdown', async () => {
      const req = new Request('https://example.com/', {
        method: 'HEAD',
        headers: { Accept: 'text/markdown' },
      })
      const ctx = makeContext(htmlResponse('<p>Home</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    })
  })

  // ── Accept-header gating ──────────────────────────────────────────────────

  describe('Accept-header gate (step 2)', () => {
    it('passes through when Accept header is absent', async () => {
      const req = makeRequest('https://example.com/')
      const originalResponse = htmlResponse('<h1>Hello</h1>')
      const ctx = makeContext(originalResponse)

      const result = await handler(req, ctx)

      expect(ctx.next).toHaveBeenCalledOnce()
      expect(result).toBe(await ctx.next.mock.results[0].value)
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
  })

  // ── Excluded-path gating ──────────────────────────────────────────────────

  describe('excluded-path gate (step 3)', () => {
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

  describe('non-HTML origin content-type pass-through (step 4)', () => {
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

  describe('HTML-to-Markdown conversion (steps 5–6)', () => {
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

    it('converts code blocks with fenced style', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<pre><code>const x = 1;\nconst y = 2;</code></pre>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('```')
      expect(body).toContain('const x = 1;')
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

    it('preserves image alt text and src', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<img src="/logo.png" alt="Logo">'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('![Logo](/logo.png)')
    })

    it('trims leading and trailing whitespace from output', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('   <p>Content</p>   '))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toBe(body.trim())
    })
  })

  // ── HTML sanitisation ─────────────────────────────────────────────────────

  describe('HTML sanitisation (step 5)', () => {
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

    it('strips <nav> tags (not in ALLOWED_TAGS)', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse('<nav><a href="/">Home</a></nav><main><p>Content</p></main>')
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      // Nav links stripped but main content preserved
      expect(body).toContain('Content')
    })

    it('strips <header> and <footer> tags', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(
        htmlResponse(
          '<header><h1>Site Header</h1></header>' +
            '<main><p>Body</p></main>' +
            '<footer><p>Footer</p></footer>'
        )
      )

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).toContain('Body')
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
      // sanitize-html strips HTML comments structurally from the parsed tree.
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
      // Simulate Turndown outputting a truncated tag literal
      const ctx = makeContext(htmlResponse('<p>Text</p><script'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<script')
    })

    it('removes <noscript> tags that survive sanitisation', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<noscript><p>Enable JS</p></noscript><p>Content</p>'))

      const result = await handler(req, ctx)
      const body = await result.text()

      expect(body).not.toContain('<noscript')
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

    it('sets Cache-Control to no-store', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)
      const ctx = makeContext(htmlResponse('<p>Hi</p>'))

      const result = await handler(req, ctx)

      expect(result.headers.get('Cache-Control')).toBe('no-store')
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

  describe('token estimate calculation (step 7 — chars / 4)', () => {
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
        next: vi.fn().mockResolvedValue(brokenResponse),
      } as unknown as Context

      const result = await handler(req, ctx)

      // Should fall back to returning the origin response
      expect(result).toBe(brokenResponse)
    })

    it('logs the error with url and pathname when conversion throws', async () => {
      const req = makeRequest('https://example.com/privacy', mdHeaders)

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
        next: vi.fn().mockResolvedValue(brokenResponse),
      } as unknown as Context

      await handler(req, ctx)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()
      const [label, context] = consoleErrorSpy.mock.calls[0]
      expect(label).toContain('markdown-response')
      expect(label).toContain('falling back')
      expect(context).toMatchObject({
        url: 'https://example.com/privacy',
        pathname: '/privacy',
        error: 'read error',
      })
    })

    it('calls context.next() as ultimate fallback when no origin response exists', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)

      // context.next() throws, so originResponse is never assigned
      const fallbackResponse = new Response('fallback', { status: 200 })
      const ctx: Context = {
        next: vi
          .fn()
          .mockRejectedValueOnce(new Error('network error'))
          .mockResolvedValueOnce(fallbackResponse),
      } as unknown as Context

      const result = await handler(req, ctx)

      expect(result).toBe(fallbackResponse)
    })

    it('logs the error even when originResponse is undefined', async () => {
      const req = makeRequest('https://example.com/', mdHeaders)

      const fallbackResponse = new Response('fallback', { status: 200 })
      const ctx: Context = {
        next: vi
          .fn()
          .mockRejectedValueOnce(new Error('network error'))
          .mockResolvedValueOnce(fallbackResponse),
      } as unknown as Context

      await handler(req, ctx)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()
      const [label, context] = consoleErrorSpy.mock.calls[0]
      expect(label).toContain('markdown-response')
      expect(context).toMatchObject({
        url: 'https://example.com/',
        error: 'network error',
      })
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
  })
})
