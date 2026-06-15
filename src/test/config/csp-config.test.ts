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

const getNetlifyStaticCspHeader = (): CspHeaderSource => {
  const tomlPath = join(process.cwd(), 'netlify.toml')
  const content = readFileSync(tomlPath, 'utf-8')

  const match = content.match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m)
  if (!match) {
    throw new Error('Content-Security-Policy not found in netlify.toml')
  }

  return { source: 'netlify.toml', value: match[1] }
}

describe('deployment Content Security Policy', () => {
  it('all deployed CSP sources share aligned non-script-src directives', () => {
    // The WAF nonce-based CSP intentionally diverges from the static CSPs on
    // script-src (it adds 'nonce-{n}' and 'strict-dynamic' at runtime).
    // The two static CSPs (netlify.toml fallback and vercel.json) must be
    // identical. All non-script-src directives must match across all three.
    const wafCsp = getWafCspTemplate()
    const netlifyStaticCsp = getNetlifyStaticCspHeader()
    const vercelCsps = getVercelCspHeaders()
    expect(vercelCsps, 'Expected exactly one Vercel CSP header source').toHaveLength(1)
    const [vercelCsp] = vercelCsps

    const wafDirectives = parseCspDirectives(wafCsp.value).directives
    const netlifyDirectives = parseCspDirectives(netlifyStaticCsp.value).directives
    const vercelDirectives = parseCspDirectives(vercelCsp.value).directives

    // The two static CSPs must be identical in every directive (bidirectional).
    const staticDirectiveNames = new Set([...netlifyDirectives.keys(), ...vercelDirectives.keys()])
    for (const directive of staticDirectiveNames) {
      expect(
        vercelDirectives.get(directive),
        `${directive}: netlify.toml and vercel.json static CSPs must match`
      ).toBe(netlifyDirectives.get(directive))
    }

    // WAF and static CSPs must agree on every directive except script-src (bidirectional).
    const nonScriptDirectiveNames = new Set(
      [...wafDirectives.keys(), ...vercelDirectives.keys(), ...netlifyDirectives.keys()].filter(
        (d) => d !== 'script-src'
      )
    )
    for (const directive of nonScriptDirectiveNames) {
      expect(wafDirectives.get(directive), `${directive} in WAF CSP must match vercel.json`).toBe(
        vercelDirectives.get(directive)
      )
    }
  })

  it('allows Sentry Session Replay workers in every deployed CSP header', () => {
    const wafCsp = getWafCspTemplate()
    const netlifyStaticCsp = getNetlifyStaticCspHeader()
    const vercelCspHeaders = getVercelCspHeaders()

    for (const cspHeader of [wafCsp, netlifyStaticCsp, ...vercelCspHeaders]) {
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
