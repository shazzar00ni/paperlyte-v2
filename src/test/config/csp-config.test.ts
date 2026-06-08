import { readFileSync } from 'fs'
import { join } from 'path'

import { describe, expect, it } from 'vitest'

interface VercelHeader {
  key: string
  value: string
}

interface VercelHeaderRule {
  source: string
  headers: VercelHeader[]
}

interface VercelConfig {
  headers: VercelHeaderRule[]
}

interface CspHeaderSource {
  source: string
  value: string
}

interface ParsedCsp {
  directives: Map<string, string>
  duplicates: string[]
}

const CSP_HEADER_NAME = 'content-security-policy'
const WORKER_SRC_DIRECTIVE = 'worker-src'
const REQUIRED_WORKER_SRC_VALUE = "'self' blob:"

const isCspHeader = (header: VercelHeader): boolean => header.key.toLowerCase() === CSP_HEADER_NAME

const parseCspDirectives = (csp: string): ParsedCsp => {
  const directives = new Map<string, string>()
  const duplicates: string[] = []

  for (const rawDirective of csp.split(';')) {
    const directive = rawDirective.trim()

    if (!directive) {
      continue
    }

    const [rawName, ...valueParts] = directive.split(/\s+/)
    const name = rawName.toLowerCase()

    if (directives.has(name)) {
      duplicates.push(name)
      continue
    }

    directives.set(name, valueParts.join(' '))
  }

  return { directives, duplicates }
}

/**
 * Reads the Netlify CSP from the WAF edge function (netlify/edge-functions/waf.ts).
 *
 * The static netlify.toml no longer carries a Content-Security-Policy header —
 * the WAF edge function sets it dynamically with a per-request nonce.
 * This helper parses the buildCsp() function's template literals and
 * substitutes a placeholder for the runtime nonce so the directives can be
 * verified in tests.
 */
const getWafCspTemplate = (): CspHeaderSource => {
  const wafPath = join(process.cwd(), 'netlify/edge-functions/waf.ts')
  const content = readFileSync(wafPath, 'utf-8')

  const buildCspStart = content.indexOf('function buildCsp(')
  if (buildCspStart === -1) {
    throw new Error('buildCsp function not found in netlify/edge-functions/waf.ts')
  }

  // Slice from the start of buildCsp() to its closing brace (first \n} after it).
  const bodySlice = content.slice(buildCspStart)
  const endOffset = bodySlice.search(/\n\}/)
  if (endOffset === -1) {
    throw new Error('Could not locate closing brace of buildCsp() in waf.ts')
  }
  const funcBody = bodySlice.slice(0, endOffset + 2)

  // Collect all template-literal segments (text between backticks).
  const segments = Array.from(funcBody.matchAll(/`([^`]+)`/g)).map((m) => m[1])
  if (segments.length === 0) {
    throw new Error('No CSP directive strings found inside buildCsp()')
  }

  // Replace the runtime nonce interpolation with a stable placeholder.
  const template = segments.join('').replace(/\$\{nonce\}/g, 'NONCE_PLACEHOLDER')

  return {
    source: 'netlify/edge-functions/waf.ts buildCsp()',
    value: template,
  }
}

const getVercelCspHeaders = (): CspHeaderSource[] => {
  const config = JSON.parse(
    readFileSync(join(process.cwd(), 'vercel.json'), 'utf-8')
  ) as VercelConfig

  const cspHeaders = config.headers.flatMap((route) =>
    route.headers.filter(isCspHeader).map((header) => ({
      source: `vercel.json ${route.source}`,
      value: header.value,
    }))
  )

  if (cspHeaders.length === 0) {
    throw new Error('Content-Security-Policy header not found in vercel.json')
  }

  return cspHeaders
}

describe('deployment Content Security Policy', () => {
  it('WAF edge function and vercel.json share aligned non-script-src directives', () => {
    // The Netlify WAF CSP and the Vercel static CSP intentionally diverge on
    // script-src: the WAF adds 'nonce-{n}' and 'strict-dynamic' at runtime.
    // All other directives must remain identical across both platforms.
    const wafCsp = getWafCspTemplate()
    const [vercelCsp] = getVercelCspHeaders()

    const wafDirectives = parseCspDirectives(wafCsp.value).directives
    const vercelDirectives = parseCspDirectives(vercelCsp.value).directives

    // Directives that must match between the two platforms.
    const sharedDirectiveNames = [...vercelDirectives.keys()].filter((d) => d !== 'script-src')

    for (const directive of sharedDirectiveNames) {
      expect(
        wafDirectives.get(directive),
        `${directive} in WAF CSP must match vercel.json`
      ).toBe(vercelDirectives.get(directive))
    }
  })

  it('allows Sentry Session Replay workers in every deployed CSP header', () => {
    const wafCsp = getWafCspTemplate()
    const vercelCspHeaders = getVercelCspHeaders()

    for (const cspHeader of [wafCsp, ...vercelCspHeaders]) {
      const { directives, duplicates } = parseCspDirectives(cspHeader.value)
      const workerSrc = directives.get(WORKER_SRC_DIRECTIVE)

      expect(duplicates, `${cspHeader.source} has duplicate CSP directives`).toEqual([])
      expect(workerSrc, cspHeader.source).toBe(REQUIRED_WORKER_SRC_VALUE)
    }
  })

  it('uses the first CSP directive occurrence when duplicate directives are present', () => {
    const { directives, duplicates } = parseCspDirectives(
      "default-src 'self'; worker-src 'none'; worker-src 'self' blob:;"
    )

    expect(directives.get(WORKER_SRC_DIRECTIVE)).toBe("'none'")
    expect(duplicates).toEqual([WORKER_SRC_DIRECTIVE])
  })
})
