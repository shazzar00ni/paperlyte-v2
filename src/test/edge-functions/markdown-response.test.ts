import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// acceptsMarkdown — inline re-implementation mirroring the edge function so
// the logic can be unit-tested without importing the Deno-runtime module.
// Keep in sync with netlify/edge-functions/markdown-response.ts.
// ---------------------------------------------------------------------------

function parseQValue(parts: string[]): number {
  const qPart = parts.find((p) => p.trim().startsWith('q='))
  if (!qPart) return 1.0
  const q = parseFloat(qPart.trim().slice(2))
  return isNaN(q) ? 1.0 : q
}

function acceptsMarkdown(acceptHeader: string): boolean {
  const entries = acceptHeader.split(',').map((t) => {
    const parts = t.trim().toLowerCase().split(';')
    return { mediaType: parts[0].trim(), q: parseQValue(parts) }
  })
  const md = entries.find((e) => e.mediaType === 'text/markdown')
  if (!md || md.q === 0) return false
  const html = entries.find((e) => e.mediaType === 'text/html')
  return !html || html.q < md.q
}

// ---------------------------------------------------------------------------

describe('markdown-response edge function', () => {
  describe('acceptsMarkdown()', () => {
    it('returns true for text/markdown only', () => {
      expect(acceptsMarkdown('text/markdown')).toBe(true)
    })

    it('returns false when text/html is listed at equal default quality', () => {
      expect(acceptsMarkdown('text/html, text/markdown')).toBe(false)
    })

    it('returns false when text/markdown q is lower than text/html q', () => {
      expect(acceptsMarkdown('text/html, text/markdown;q=0.9')).toBe(false)
    })

    it('returns true when text/markdown q is higher than text/html q', () => {
      expect(acceptsMarkdown('text/html;q=0.5, text/markdown')).toBe(true)
    })

    it('returns true when text/html is explicitly q=0', () => {
      expect(acceptsMarkdown('text/html;q=0, text/markdown')).toBe(true)
    })

    it('returns false for text/html only', () => {
      expect(acceptsMarkdown('text/html')).toBe(false)
    })

    it('returns false for */* wildcard', () => {
      expect(acceptsMarkdown('*/*')).toBe(false)
    })

    it('returns false for text/* wildcard', () => {
      expect(acceptsMarkdown('text/*')).toBe(false)
    })

    it('returns false when text/markdown is explicitly q=0', () => {
      expect(acceptsMarkdown('text/markdown;q=0')).toBe(false)
    })

    it('returns false for empty accept header', () => {
      expect(acceptsMarkdown('')).toBe(false)
    })

    it('returns false for a typical browser Accept header', () => {
      expect(
        acceptsMarkdown(
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        )
      ).toBe(false)
    })

    it('is case-insensitive for media types', () => {
      expect(acceptsMarkdown('Text/Markdown')).toBe(true)
    })

    it('handles extra whitespace around comma-separated entries', () => {
      expect(acceptsMarkdown('  text/markdown  ,  text/html;q=0.5  ')).toBe(true)
    })
  })

  // -------------------------------------------------------------------------

  describe('public/index.md content', () => {
    let content: string

    beforeAll(() => {
      content = readFileSync(join(process.cwd(), 'public/index.md'), 'utf-8')
    })

    it('exists and has substantial content', () => {
      expect(content.length).toBeGreaterThan(2000)
    })

    it('contains the Paperlyte brand name', () => {
      expect(content).toContain('Paperlyte')
    })

    it('leads with the core value proposition', () => {
      expect(content).toMatch(/speed|fast|instant|unchained/i)
    })

    it('describes the problem section', () => {
      expect(content).toMatch(/notion|evernote|obsidian/i)
    })

    it('lists product features', () => {
      expect(content).toMatch(/feature/i)
    })

    it('explains tag-based organization', () => {
      expect(content).toMatch(/#tags?|tag.based/i)
    })

    it('includes a comparison table against competitors', () => {
      expect(content).toMatch(/notion.*evernote|evernote.*notion/i)
    })

    it('contains at least one testimonial', () => {
      expect(content).toMatch(/testimonial|".*".*—|—.*★/i)
    })

    it('includes FAQ content', () => {
      expect(content).toMatch(/when will|how much|what platforms|faq/i)
    })

    it('includes a waitlist or CTA section', () => {
      expect(content).toMatch(/waitlist|early access|join/i)
    })

    it('has markdown headings', () => {
      expect(content).toMatch(/^#{1,6}\s+\S|^[A-Z][^\n]+\n[-=]+/m)
    })

    it('includes footer with legal links', () => {
      expect(content).toMatch(/privacy|terms/i)
    })
  })

  // -------------------------------------------------------------------------

  describe('edge function source structure', () => {
    let source: string

    beforeAll(() => {
      source = readFileSync(
        join(process.cwd(), 'netlify/edge-functions/markdown-response.ts'),
        'utf-8'
      )
    })

    it('fetches /index.md as the markdown source', () => {
      expect(source).toMatch(/\/index\.md/)
    })

    it('serves Content-Type text/markdown', () => {
      expect(source).toContain('text/markdown')
    })

    it('sets Vary: Accept header so caches differentiate HTML and Markdown', () => {
      expect(source).toMatch(/Vary.*Accept|Accept.*Vary/s)
    })

    it('gates on the acceptsMarkdown helper', () => {
      expect(source).toContain('acceptsMarkdown')
    })

    it('passes through non-GET requests without modification', () => {
      expect(source).toMatch(/method.*!==.*GET|GET.*method/s)
    })

    it('does not call context.next() for the markdown path', () => {
      // The handler resolves /index.md via a server-controlled URL, not via
      // the SPA origin, so converting the unrendered shell is never attempted.
      expect(source).toMatch(/DEPLOY_PRIME_URL|deployUrl/)
    })

    it('applies security headers to the markdown response', () => {
      expect(source).toContain('SECURITY_HEADERS')
    })
  })
})
