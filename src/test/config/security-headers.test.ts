/**
 * Validation tests for security response headers declared in netlify.toml and vercel.json.
 *
 * These tests cover the changes introduced in the PR:
 * - Headers reordered to alphabetical order in both files
 * - Cross-Origin-Embedder-Policy added / repositioned to "unsafe-none"
 * - Content-Security-Policy directives reordered alphabetically
 * - Both configs must remain in sync with each other
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const projectRoot = process.cwd()

// ---------------------------------------------------------------------------
// Expected values (shared between netlify.toml and vercel.json assertions)
// ---------------------------------------------------------------------------

const EXPECTED_CSP =
  "base-uri 'self'; connect-src 'self' https://plausible.io https://*.ingest.sentry.io; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' https://plausible.io; style-src 'self'; upgrade-insecure-requests; worker-src 'self' blob:;"

const REQUIRED_HEADERS: Record<string, string> = {
  'Content-Security-Policy': EXPECTED_CSP,
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none',
}

// ---------------------------------------------------------------------------
// netlify.toml – text-based assertions (TOML, not JSON)
// ---------------------------------------------------------------------------

describe('netlify.toml – security headers', () => {
  let content: string

  beforeAll(() => {
    content = readFileSync(join(projectRoot, 'netlify.toml'), 'utf-8')
  })

  it('should be a non-empty file', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('should have a [[headers]] section for "/*"', () => {
    expect(content).toMatch(/\[\[headers\]\]\s+for\s*=\s*"\\/\*"/)
  })

  describe('required security header presence', () => {
    it.each(Object.keys(REQUIRED_HEADERS))('should declare %s header', (headerName) => {
      expect(content).toContain(headerName)
    })
  })

  describe('security header values', () => {
    it('should set Content-Security-Policy with alphabetically-ordered directives', () => {
      expect(content).toContain(EXPECTED_CSP)
    })

    it('should set Cross-Origin-Embedder-Policy to unsafe-none (disables COEP to allow analytics)', () => {
      expect(content).toMatch(/Cross-Origin-Embedder-Policy\s*=\s*"unsafe-none"/)
    })

    it('should set Cross-Origin-Opener-Policy to same-origin', () => {
      expect(content).toMatch(/Cross-Origin-Opener-Policy\s*=\s*"same-origin"/)
    })

    it('should set Cross-Origin-Resource-Policy to same-origin', () => {
      expect(content).toMatch(/Cross-Origin-Resource-Policy\s*=\s*"same-origin"/)
    })

    it('should set X-Frame-Options to DENY (clickjacking protection)', () => {
      expect(content).toMatch(/X-Frame-Options\s*=\s*"DENY"/)
    })

    it('should set X-Content-Type-Options to nosniff (MIME sniffing protection)', () => {
      expect(content).toMatch(/X-Content-Type-Options\s*=\s*"nosniff"/)
    })

    it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
      expect(content).toMatch(/Referrer-Policy\s*=\s*"strict-origin-when-cross-origin"/)
    })

    it('should set Strict-Transport-Security with 2-year max-age, includeSubDomains, preload', () => {
      expect(content).toMatch(
        /Strict-Transport-Security\s*=\s*"max-age=63072000; includeSubDomains; preload"/
      )
    })

    it('should set Permissions-Policy disabling all sensitive APIs', () => {
      expect(content).toMatch(/Permissions-Policy\s*=\s*"geolocation=\(\)/)
      expect(content).toContain('microphone=()')
      expect(content).toContain('camera=()')
    })

    it('should set X-Permitted-Cross-Domain-Policies to none', () => {
      expect(content).toMatch(/X-Permitted-Cross-Domain-Policies\s*=\s*"none"/)
    })
  })

  describe('header ordering (alphabetical)', () => {
    it('headers should appear in the [headers.values] block in alphabetical order', () => {
      // Extract the [headers.values] block for "/*" – it ends when a line at column 0
      // (un-indented, non-blank) is encountered, i.e. the next [[headers]] section.
      const headersBlockMatch = content.match(/\[headers\.values\]([\s\S]*?)(?=\n[^\s\n])/)
      expect(headersBlockMatch).not.toBeNull()
      const headersBlock = headersBlockMatch![1]

      // Extract header names from lines like `    Header-Name = "..."` (4-space indent)
      const headerNames = [...headersBlock.matchAll(/^ {4}([A-Za-z][A-Za-z0-9-]*)\s*=/gm)].map(
        (m) => m[1]
      )

      // Must have found at least the required security headers
      expect(headerNames.length).toBeGreaterThanOrEqual(Object.keys(REQUIRED_HEADERS).length)

      // Verify headers are in ascending alphabetical order
      const sortedNames = [...headerNames].sort((a, b) => a.localeCompare(b))
      expect(headerNames).toEqual(sortedNames)
    })

    it('Content-Security-Policy should appear before X-Frame-Options', () => {
      const cspIndex = content.indexOf('Content-Security-Policy')
      const xfoIndex = content.indexOf('X-Frame-Options')
      expect(cspIndex).toBeGreaterThan(-1)
      expect(xfoIndex).toBeGreaterThan(-1)
      expect(cspIndex).toBeLessThan(xfoIndex)
    })

    it('Cross-Origin-Embedder-Policy should appear before Cross-Origin-Opener-Policy', () => {
      const coepIndex = content.indexOf('Cross-Origin-Embedder-Policy')
      const coopIndex = content.indexOf('Cross-Origin-Opener-Policy')
      expect(coepIndex).toBeGreaterThan(-1)
      expect(coopIndex).toBeGreaterThan(-1)
      expect(coepIndex).toBeLessThan(coopIndex)
    })
  })

  describe('CSP directive content', () => {
    it('CSP should allow plausible.io for scripts (analytics)', () => {
      expect(content).toContain('https://plausible.io')
    })

    it('CSP should allow sentry ingest for error telemetry', () => {
      expect(content).toContain('https://*.ingest.sentry.io')
    })

    it('CSP should block framing with frame-ancestors none', () => {
      expect(content).toContain("frame-ancestors 'none'")
    })

    it('CSP should restrict base URI to self', () => {
      expect(content).toContain("base-uri 'self'")
    })

    it('CSP should include upgrade-insecure-requests directive', () => {
      expect(content).toContain('upgrade-insecure-requests')
    })
  })
})

// ---------------------------------------------------------------------------
// vercel.json – JSON-based assertions
// ---------------------------------------------------------------------------

interface VercelHeader {
  key: string
  value: string
}

interface VercelHeaderRule {
  source: string
  headers: VercelHeader[]
}

interface VercelConfig {
  cleanUrls?: boolean
  trailingSlash?: boolean
  headers: VercelHeaderRule[]
  rewrites?: Array<{ source: string; destination: string }>
}

describe('vercel.json – security headers', () => {
  let config: VercelConfig
  let globalHeaders: VercelHeader[]

  beforeAll(() => {
    const raw = readFileSync(join(projectRoot, 'vercel.json'), 'utf-8')
    config = JSON.parse(raw) as VercelConfig

    // Find the global "/(.*)" header rule
    const globalRule = config.headers.find((rule) => rule.source === '/(.*)')
    expect(globalRule, 'Expected a global "/(.*)" header rule in vercel.json').toBeDefined()
    globalHeaders = globalRule!.headers
  })

  it('should be valid JSON', () => {
    expect(config).toBeDefined()
    expect(config.headers).toBeInstanceOf(Array)
  })

  it('should have a global "/(.*)" header rule', () => {
    expect(globalHeaders).toBeInstanceOf(Array)
    expect(globalHeaders.length).toBeGreaterThan(0)
  })

  describe('required security header presence', () => {
    it.each(Object.keys(REQUIRED_HEADERS))('should declare %s header', (headerName) => {
      const header = globalHeaders.find((h) => h.key === headerName)
      expect(header, `Header "${headerName}" not found in vercel.json`).toBeDefined()
    })
  })

  describe('security header values', () => {
    const getHeader = (key: string): VercelHeader | undefined =>
      globalHeaders.find((h) => h.key === key)

    it('Content-Security-Policy should have alphabetically-ordered directives', () => {
      expect(getHeader('Content-Security-Policy')?.value).toBe(EXPECTED_CSP)
    })

    it('Cross-Origin-Embedder-Policy should be unsafe-none', () => {
      expect(getHeader('Cross-Origin-Embedder-Policy')?.value).toBe('unsafe-none')
    })

    it('Cross-Origin-Opener-Policy should be same-origin', () => {
      expect(getHeader('Cross-Origin-Opener-Policy')?.value).toBe('same-origin')
    })

    it('Cross-Origin-Resource-Policy should be same-origin', () => {
      expect(getHeader('Cross-Origin-Resource-Policy')?.value).toBe('same-origin')
    })

    it('X-Frame-Options should be DENY', () => {
      expect(getHeader('X-Frame-Options')?.value).toBe('DENY')
    })

    it('X-Content-Type-Options should be nosniff', () => {
      expect(getHeader('X-Content-Type-Options')?.value).toBe('nosniff')
    })

    it('Referrer-Policy should be strict-origin-when-cross-origin', () => {
      expect(getHeader('Referrer-Policy')?.value).toBe('strict-origin-when-cross-origin')
    })

    it('Strict-Transport-Security should have 2-year max-age with preload', () => {
      expect(getHeader('Strict-Transport-Security')?.value).toBe(
        'max-age=63072000; includeSubDomains; preload'
      )
    })

    it('X-Permitted-Cross-Domain-Policies should be none', () => {
      expect(getHeader('X-Permitted-Cross-Domain-Policies')?.value).toBe('none')
    })

    it('X-XSS-Protection should be set as defence-in-depth', () => {
      expect(getHeader('X-XSS-Protection')?.value).toBe('1; mode=block')
    })
  })

  describe('header ordering (alphabetical)', () => {
    it('global headers should be in alphabetical order by key', () => {
      const keys = globalHeaders.map((h) => h.key)
      const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b))
      expect(keys).toEqual(sortedKeys)
    })

    it('Content-Security-Policy should come before X-Frame-Options', () => {
      const cspIdx = globalHeaders.findIndex((h) => h.key === 'Content-Security-Policy')
      const xfoIdx = globalHeaders.findIndex((h) => h.key === 'X-Frame-Options')
      expect(cspIdx).toBeGreaterThan(-1)
      expect(xfoIdx).toBeGreaterThan(-1)
      expect(cspIdx).toBeLessThan(xfoIdx)
    })

    it('Cross-Origin-Embedder-Policy should come before Cross-Origin-Opener-Policy', () => {
      const coepIdx = globalHeaders.findIndex((h) => h.key === 'Cross-Origin-Embedder-Policy')
      const coopIdx = globalHeaders.findIndex((h) => h.key === 'Cross-Origin-Opener-Policy')
      expect(coepIdx).toBeGreaterThan(-1)
      expect(coopIdx).toBeGreaterThan(-1)
      expect(coepIdx).toBeLessThan(coopIdx)
    })
  })

  describe('netlify/vercel header parity', () => {
    it('CSP value should match netlify.toml', () => {
      const netlifyContent = readFileSync(join(projectRoot, 'netlify.toml'), 'utf-8')
      const cspHeader = globalHeaders.find((h) => h.key === 'Content-Security-Policy')
      expect(netlifyContent).toContain(cspHeader?.value)
    })

    it('X-Frame-Options value should match netlify.toml', () => {
      const netlifyContent = readFileSync(join(projectRoot, 'netlify.toml'), 'utf-8')
      expect(netlifyContent).toMatch(/X-Frame-Options\s*=\s*"DENY"/)
    })

    it('both configs should share the same Cross-Origin-Embedder-Policy value', () => {
      const netlifyContent = readFileSync(join(projectRoot, 'netlify.toml'), 'utf-8')
      const vercelValue = globalHeaders.find((h) => h.key === 'Cross-Origin-Embedder-Policy')?.value
      expect(netlifyContent).toContain(vercelValue)
    })
  })
})