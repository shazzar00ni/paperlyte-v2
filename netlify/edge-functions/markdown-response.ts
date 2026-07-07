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

// Void excluded elements that have no closing tag — only the opening tag is
// removed. Applying the "truncate to end" strategy to void elements would
// silently delete all document content following the tag.
const VOID_REMOVE_TAGS: readonly string[] = ['embed']

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

/**
 * Remove all HTML tags from a string, honoring `>` characters inside quoted
 * attribute values so that `<p title="1 > 0">` does not leak attribute
 * content into the output.
 */
function removeTags(s: string): string {
  return s.replace(/<(?:[^>"']+|"[^"]*"|'[^']*')*>/g, '')
}

/** Strip all HTML tags from a string and collapse internal whitespace. */
function stripTags(html: string): string {
  return removeTags(html).replace(/\s+/g, ' ').trim()
}

/** Decode a numeric HTML entity code point to a character (or '' if out of range). */
function decodeNumericEntity(code: string, base: 10 | 16): string {
  const n = parseInt(code, base)
  return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''
}

/**
 * Decode common HTML entities to their character equivalents.
 * Uses a single combined regex so that `&amp;lt;` decodes to the literal
 * text `&lt;` rather than `<` (which a sequential chain would produce by
 * first replacing `&amp;` → `&` and then matching the resulting `&lt;`).
 */
function decodeEntities(text: string): string {
  return text.replace(
    /&(?:amp|lt|gt|quot|apos|nbsp|#39|#(\d+)|#x([0-9a-f]+));/gi,
    (match, dec: string | undefined, hex: string | undefined): string => {
      if (dec !== undefined) return decodeNumericEntity(dec, 10)
      if (hex !== undefined) return decodeNumericEntity(hex, 16)
      switch (match.toLowerCase()) {
        case '&amp;':
          return '&'
        case '&lt;':
          return '<'
        case '&gt;':
          return '>'
        case '&quot;':
          return '"'
        case '&apos;':
        case '&#39;':
          return "'"
        case '&nbsp;':
          return ' '
        default:
          return match
      }
    }
  )
}

/**
 * Sanitize HTML by removing dangerous tags and event handler attributes.
 *
 * - Removes tags in REMOVE_TAGS together with their entire subtrees.
 * - Removes void excluded elements (VOID_REMOVE_TAGS) — only their tag, not
 *   trailing content, since they have no closing tag.
 * - Removes partial/malformed opening tags (e.g. `<script` with no `>`).
 * - Removes orphaned closing tags (e.g. `</script\t\nbar>`).
 * - Removes HTML comment nodes (including unclosed comments at end of string).
 * - Removes event handler attributes (onclick, onload, etc.).
 *
 * Returns the sanitized HTML string.
 */
function sanitizeHtml(html: string): string {
  let result = html

  // Remove HTML comments first so that excluded-tag patterns in later steps
  // are not triggered by tag names that only appear inside comment text.
  // e.g. <!-- don't add <script> here --> would otherwise match the
  // unclosed-tag truncation and delete all following content.
  result = result.replace(/<!--[\s\S]*?(?:-->|$)/g, '')

  // Remove void excluded elements first — they have no closing tag so the
  // subtree-removal and truncate-to-end steps would over-consume content.
  for (const tag of VOID_REMOVE_TAGS) {
    result = result.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '') // nosemgrep
    // Also strip truncated tags with no closing >: terminate at the next opening
    // < (start of another tag) or end of string, whichever comes first.
    result = result.replace(new RegExp(`<${tag}\\b[^<>]*(?=<|$)`, 'gi'), '')
  }

  const nonVoidRemoveTags = REMOVE_TAGS.filter((t) => !VOID_REMOVE_TAGS.includes(t))
  const dangerPattern = nonVoidRemoveTags.join('|')

  // Remove complete tag+subtree pairs (e.g. <script>…</script>).
  // Run each replacement in a loop until stable so nested same-type elements
  // (e.g. <nav>…<nav>inner</nav>tail</nav>) are fully removed rather than
  // leaving the tail of the outer element behind.
  for (const tag of nonVoidRemoveTags) {
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

  // Also remove orphaned closing tags for void excluded elements.
  for (const tag of VOID_REMOVE_TAGS) {
    result = result.replace(new RegExp(`<\\/${tag}\\b[^>]*>`, 'gi'), '') // nosemgrep
  }

  // Remove event handler attributes (onclick="…", onload='…', etc.).
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

  return result
}

/**
 * Extract an attribute value from an attribute string.
 *
 * Handles:
 * - Case-insensitive attribute names (`HREF`, `Href`, `href`)
 * - Optional whitespace around `=` (`href = "..."`)
 * - Double-quoted, single-quoted, and unquoted values
 * - Attribute-name boundary so `data-href` does not match `href`
 */
function extractAttr(attrs: string, name: string): string {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]*))`, 'i').exec(
    attrs
  )
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : ''
}

/**
 * Decode HTML entities to a fixed point (loop until the string stops changing).
 * A single decode pass cannot stop a double-encoded payload like `&amp;#58;`
 * from surviving a scheme check — it would decode to `&#58;` on the first pass
 * and then `:` on a subsequent pass in the global `decodeEntities(md)` call.
 * Decoding to a fixed point ensures both the safety check and the emitted URL
 * see the same fully-resolved string, so the trailing document decode pass
 * cannot resurrect a hidden unsafe scheme.
 */
function decodeEntitiesFully(text: string): string {
  let prev: string
  let cur = text
  do {
    prev = cur
    cur = decodeEntities(cur)
  } while (cur !== prev)
  return cur
}

/**
 * Returns false when the href must not become a link (unsafe scheme or empty).
 * Decodes HTML entities to a fixed point before checking so that multi-encoded
 * schemes like `javascript&amp;#58;alert(1)` are correctly rejected.
 */
function isSafeHref(href: string): boolean {
  // Strip C0 controls (U+0000–U+001F) and DEL (U+007F) before scheme checks.
  // Browsers/URL parsers strip these before scheme resolution, so a href like
  // `java\nscript:` canonicalises to `javascript:` and bypasses trim()-only.
  const decoded = decodeEntitiesFully(href)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
  return Boolean(decoded) && !/^(\/\/|javascript:|data:|vbscript:)/i.test(decoded)
}

/**
 * Escape Markdown link/image destination metacharacters.
 * Backslash-escapes `)` and `\` so they are treated as literal characters
 * inside an inline `(…)` destination rather than closing the span or
 * introducing unintended escape sequences.
 */
function safeLinkDest(href: string): string {
  // eslint-disable-next-line no-control-regex
  return href.replace(/[\x00-\x1F\x7F]/g, '').replace(/\\/g, '\\\\').replace(/\)/g, '\\)')
}

/** Convert an `<a>` element to a Markdown link, stripping unsafe href schemes. */
function buildMarkdownLink(attrs: string, content: string): string {
  const href = extractAttr(attrs, 'href')
  if (!isSafeHref(href)) return stripTags(content)
  // Convert nested <img> elements first so they appear as Markdown image
  // syntax rather than being silently stripped by stripTags.
  const inner = content.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (_, a: string) => buildMarkdownImage(a))
  // Fully decode href to a fixed point before safeLinkDest so the emitted URL
  // is already resolved and the trailing decodeEntities(md) pass has nothing
  // left to decode — preventing multi-encoded schemes from slipping through.
  return `[${stripTags(inner)}](${safeLinkDest(decodeEntitiesFully(href))})`
}

/** Convert an `<img>` element to a Markdown image reference. */
function buildMarkdownImage(attrs: string): string {
  const src = extractAttr(attrs, 'src')
  if (!src || !isSafeHref(src)) return ''
  return `![${extractAttr(attrs, 'alt')}](${safeLinkDest(decodeEntitiesFully(src))})`
}

/**
 * Wrap inline code text in backtick delimiters long enough that no backtick
 * run inside the content closes the span prematurely (CommonMark §6.1).
 */
function buildInlineCode(content: string): string {
  const text = decodeEntities(removeTags(content))
  const runs = text.match(/`+/g) ?? []
  const len = runs.length > 0 ? Math.max(...runs.map((r) => r.length)) + 1 : 1
  const delim = '`'.repeat(len)
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${delim}${pad}${text}${pad}${delim}`
}

/**
 * Convert an ordered `<li>` item's content to a numbered Markdown list entry.
 * Nested list content (already converted to Markdown) appears on subsequent
 * lines after the item's own text, preserving boundary between levels.
 */
function buildOrderedListItem(item: string, n: number): string {
  // Convert block-level tags to newlines before stripping so that content like
  // <p>First</p><p>Second</p> or <br> is not concatenated into one line.
  const text = item.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n')
  const lines = removeTags(text)
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return ''
  const prefix = `${n}. `
  const indent = ' '.repeat(prefix.length)
  return lines.map((l, i) => (i === 0 ? `${prefix}${l}` : `${indent}${l}`)).join('\n') + '\n'
}

/**
 * Convert an unordered `<li>` item's content to a dash Markdown list entry.
 * Nested list content appears on subsequent lines.
 */
function buildUnorderedListItem(item: string): string {
  // Convert block-level tags to newlines before stripping so that content like
  // <p>First</p><p>Second</p> or <br> is not concatenated into one line.
  const text = item.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n')
  const lines = removeTags(text)
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return ''
  return lines.map((l, i) => (i === 0 ? `- ${l}` : `  ${l}`)).join('\n') + '\n'
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

  // Code blocks and inline code are placeholdered at the point of conversion so
  // that no backtick sequences ever appear in `md` during whitespace normalization.
  // This prevents two classes of bugs:
  //   1. A backtick run in prose (e.g. ``` from an earlier conversion) matching as
  //      a prefix of a longer generated fence, so the lazy protection regex would
  //      close the span prematurely and leave fence content unprotected.
  //   2. Whitespace inside generated inline code spans being collapsed by the
  //      prose normalization pass before the protection regex could shield them.
  const codeBlocks: string[] = []
  const protectCode = (rendered: string): string => {
    const idx = codeBlocks.push(rendered) - 1
    return `\x00CODEBLOCK${idx}\x00`
  }

  // Extract <body> content from full HTML documents.
  const bodyMatch = md.match(/<body[^>]*>([\s\S]*?)<\/body\s*>/i)
  if (bodyMatch) {
    md = bodyMatch[1]
  } else {
    // Remove <head> section from fragments that include one.
    md = md.replace(/<head[^>]*>[\s\S]*?<\/head\s*>/gi, '')
  }

  // Fenced code blocks: <pre><code>…</code></pre>
  // Choose a fence character-run longer than any backtick run in the content
  // so that code containing ``` does not close the generated fence early.
  // Immediately placeholder the result so no backtick sequences appear in md.
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code\s*>\s*<\/pre\s*>/gi,
    (_, content: string) => {
      const text = decodeEntities(removeTags(content))
      const runs = text.match(/`+/g) ?? []
      const fenceLen = Math.max(3, runs.length > 0 ? Math.max(...runs.map((r) => r.length)) + 1 : 3)
      const fence = '`'.repeat(fenceLen)
      return protectCode(`\n${fence}\n${text}\n${fence}\n`)
    }
  )

  // Bare <pre> blocks without a nested <code>: treat as fenced code.
  // This runs after the <pre><code> handler so combined patterns are already
  // consumed; remaining <pre>…</pre> tags are bare preformatted blocks.
  // Dynamic fence length prevents content backticks from closing the fence.
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre\s*>/gi, (_, content: string) => {
    const text = decodeEntities(removeTags(content))
    const runs = text.match(/`+/g) ?? []
    const fenceLen = Math.max(3, runs.length > 0 ? Math.max(...runs.map((r) => r.length)) + 1 : 3)
    const fence = '`'.repeat(fenceLen)
    return protectCode(`\n${fence}\n${text}\n${fence}\n`)
  })

  // Inline code: <code>…</code> — placeholder immediately to preserve internal
  // whitespace (e.g. <code>a  b</code> must not have its spaces collapsed).
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code\s*>/gi, (_, content: string) =>
    protectCode(buildInlineCode(content))
  )

  // Strip leading horizontal whitespace that originates from the source HTML's
  // human-readable indentation (e.g. text inside <p> blocks indented 10 spaces).
  // Code content is already placeholdered above so it is not affected.
  // List-builder functions (buildOrderedListItem / buildUnorderedListItem) run
  // below and add their OWN intentional indentation afterwards; the lookbehind
  // normalisation pass further below then preserves only that intentional
  // indentation, not the HTML-source indentation we strip here.
  md = md.replace(/^[^\S\n]+/gm, '')

  // ATX headings h6→h1 (descending to avoid h1 pattern matching h10, etc.)
  // Quote-aware opening-tag match so `>` inside a quoted attribute (e.g.
  // <h1 title="1 > 0">) does not truncate the match and leak attribute content.
  // <br> inside heading content is replaced with a space before tag-stripping so
  // multi-line headings (e.g. "Foo,<br/>Bar") don't merge into "Foo,Bar".
  for (let i = 6; i >= 1; i--) {
    md = md.replace(
      new RegExp(`<h${i}((?:[^>"']|"[^"]*"|'[^']*')*)>([\\s\\S]*?)<\\/h${i}\\s*>`, 'gi'), // nosemgrep
      (_match: string, _attrs: string, content: string) =>
        `\n${'#'.repeat(i)} ${stripTags(content.replace(/<br\s*\/?>/gi, ' '))}\n`
    )
  }

  // Blockquotes — convert block tags to newlines first so paragraph
  // boundaries inside <blockquote><p>…</p><p>…</p></blockquote> are preserved.
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote\s*>/gi, (_, content: string) => {
    const text = removeTags(content.replace(/<\/p\s*>/gi, '\n').replace(/<br\s*\/?>/gi, '\n'))
      .replace(/[ \t]+/g, ' ')
      .trim()
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `> ${line}`)
    return '\n' + lines.join('\n') + '\n'
  })

  // Bold: <strong> and <b>. The \b word boundary prevents <br> from matching
  // as an opening <b> tag, which would then consume content up to the next
  // </strong> and corrupt the output.
  md = md.replace(/<(?:strong|b)\b(?:[^>]*)>([\s\S]*?)<\/(?:strong|b)\s*>/gi, '**$1**')

  // Italic: <em> and <i>. Skip aria-hidden elements (e.g. Font Awesome icon
  // <i> tags) and empty spans — both would produce stray `*` or `**` markers.
  // The \b word boundary prevents <ins> or <input> from matching as <i>.
  md = md.replace(
    /<(?:em|i)\b([^>]*?)>([\s\S]*?)<\/(?:em|i)\s*>/gi,
    (_match: string, attrs: string, content: string): string => {
      if (/aria-hidden\s*=\s*["']true["']/i.test(attrs) || content.trim() === '') return ''
      return `*${content}*`
    }
  )

  // Links — preserve href, reject unsafe schemes and protocol-relative URLs
  md = md.replace(/<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a\s*>/gi, (_, attrs: string, content: string) =>
    buildMarkdownLink(attrs, content)
  )

  // Images — preserve src and alt
  md = md.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (_, attrs: string) => buildMarkdownImage(attrs))

  // Ordered and unordered lists — process innermost lists first so that
  // nested list Markdown is already in place before the outer list converts
  // its items. The negative lookahead `(?!<(?:ol|ul)[\s>])` prevents the
  // pattern from consuming an opening nested-list tag, ensuring we always
  // match the deepest list level in each global-replace pass.
  {
    let listPrev: string
    do {
      listPrev = md

      md = md.replace(
        /<ol[^>]*>((?:(?!<(?:ol|ul)[\s>])[\s\S])*?)<\/ol\s*>/gi,
        (_, content: string) => {
          let counter = 0
          const items = content.replace(
            /<li[^>]*>([\s\S]*?)<\/li\s*>/gi,
            (_m: string, item: string) => buildOrderedListItem(item, ++counter)
          )
          return '\n' + removeTags(items) + '\n'
        }
      )

      md = md.replace(
        /<ul[^>]*>((?:(?!<(?:ol|ul)[\s>])[\s\S])*?)<\/ul\s*>/gi,
        (_, content: string) => {
          const items = content.replace(
            /<li[^>]*>([\s\S]*?)<\/li\s*>/gi,
            (_m: string, item: string) => buildUnorderedListItem(item)
          )
          return '\n' + removeTags(items) + '\n'
        }
      )
    } while (md !== listPrev)
  }

  // Tables — convert to Markdown pipe tables so structured data (e.g. the
  // comparison matrix) is legible to AI agents rather than concatenated text.
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table\s*>/gi, (_, tableContent: string) => {
    const rows: string[][] = []
    tableContent.replace(/<tr[^>]*>([\s\S]*?)<\/tr\s*>/gi, (_m: string, rowContent: string) => {
      const cells: string[] = []
      rowContent.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]\s*>/gi, (_c: string, cell: string) => {
        cells.push(stripTags(cell).trim())
        return ''
      })
      if (cells.length > 0) rows.push(cells)
      return ''
    })
    if (rows.length === 0) return ''
    const header = rows[0]
    const separator = header.map(() => '---')
    const mdRows = [header, separator, ...rows.slice(1)].map((row) => '| ' + row.join(' | ') + ' |')
    return '\n' + mdRows.join('\n') + '\n'
  })

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n')

  // Paragraphs — closing tag becomes double newline, opening tag is stripped.
  // Use a quote-aware pattern for opening tags so that `>` inside a quoted
  // attribute (e.g. <p title="1 > 0">) does not terminate the match early
  // and leak attribute content into the output.
  md = md.replace(/<\/p\s*>/gi, '\n\n')
  md = md.replace(/<p(?:[^>"']+|"[^"]*"|'[^']*')*>/gi, '')

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Insert paragraph breaks for block-level container closing tags that have
  // no explicit Markdown equivalent, preventing adjacent text nodes from
  // running together (e.g. <div>10M+</div><div>Notes</div> → "10M+Notes").
  md = md.replace(/<\/(?:div|section|article|figure|details|summary)\b[^>]*>/gi, '\n')

  // Strip all remaining HTML tags (quote-aware so `>` inside attributes
  // does not leak attribute content into the Markdown output).
  md = removeTags(md)

  // Decode HTML entities
  md = decodeEntities(md)

  // Normalize prose whitespace. Code blocks and inline code are already
  // placeholdered (see top of function) so their internal whitespace is intact.
  // Only collapse runs that follow a non-whitespace character: leading spaces at
  // the start of a line are intentional list-continuation indentation
  // (buildOrderedListItem/buildUnorderedListItem add them so CommonMark parsers
  // render child items at the correct nesting level).
  md = md.replace(/(?<=\S)[^\S\n]+/g, ' ')
  md = md.replace(/ +$/gm, '')
  md = md.replace(/\n{3,}/g, '\n\n')
  // Restore code block contents (function replacer avoids $-pattern interpretation).
  for (let i = 0; i < codeBlocks.length; i++) {
    md = md.replace(`\x00CODEBLOCK${i}\x00`, () => codeBlocks[i])
  }

  return md.trim()
}

/**
 * Parse the q-value from a single Accept token string, e.g. "text/markdown;q=0.9".
 * RFC 7231 §5.3: 'q' is case-insensitive; optional whitespace around '='.
 */
function parseQValue(token: string): number {
  const m = /;\s*q\s*=\s*([\d.]+)/i.exec(token)
  if (!m) return 1.0
  const v = parseFloat(m[1])
  return Number.isNaN(v) ? 1.0 : v
}

/**
 * Return true when markdown is preferred over HTML given their respective
 * q-values. markdown must have a positive q; HTML either absent (q=-1) or
 * at most equal to markdown's q.
 */
function prefersMarkdownOverHtml(markdownQ: number, htmlQ: number): boolean {
  if (markdownQ <= 0) return false
  return htmlQ < 0 || markdownQ >= htmlQ
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
    const mediaType = token.trim().split(';')[0].trim().toLowerCase()
    const q = parseQValue(token.trim())
    if (mediaType === 'text/markdown') markdownQ = Math.max(markdownQ, q)
    else if (mediaType === 'text/html') htmlQ = Math.max(htmlQ, q)
  }
  return prefersMarkdownOverHtml(markdownQ, htmlQ)
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
  const varyParts = originVary
    .split(',')
    .map((v: string) => v.trim())
    .filter(Boolean)
  const normalizedVaryParts = varyParts.map((v: string) => v.toLowerCase())
  headers.set(
    'Vary',
    normalizedVaryParts.includes('accept') ? originVary : [...varyParts, 'Accept'].join(', ')
  )
  return headers
}

/**
 * Merge `Accept` into the `Vary` header of an HTML pass-through response so
 * CDNs know that the same URL may return different representations depending
 * on the Accept header, preventing stale HTML from being served to markdown
 * clients that share a cache key.
 */
function addVaryAccept(response: Response): Response {
  const h = new Headers(response.headers)
  const vary = h.get('Vary') ?? ''
  const parts = vary
    .split(',')
    .map((v: string) => v.trim())
    .filter(Boolean)
  if (!parts.map((v: string) => v.toLowerCase()).includes('accept')) {
    h.set('Vary', [...parts, 'Accept'].join(', '))
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: h,
  })
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
    // Add Vary: Accept to HTML responses so CDNs store HTML and Markdown as
    // separate cache entries and don't serve a cached HTML response to a
    // client that requested text/markdown.
    const resp = await context.next()
    const ct = (resp.headers.get('Content-Type') ?? '').toLowerCase()
    return ct.includes('text/html') ? addVaryAccept(resp) : resp
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
    console.error(
      '[markdown-response] Markdown conversion failed; falling back to HTML',
      pathname,
      err
    )
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
