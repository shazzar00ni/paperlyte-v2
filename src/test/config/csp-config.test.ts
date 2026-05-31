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

const getNetlifyCspHeaders = (): CspHeaderSource[] => {
  const content = readFileSync(join(process.cwd(), 'netlify.toml'), 'utf-8')
  const matches = Array.from(content.matchAll(/Content-Security-Policy\s*=\s*"([^"]+)"/g))

  if (matches.length === 0) {
    throw new Error('Content-Security-Policy header not found in netlify.toml')
  }

  return matches.map((match, index) => ({
    source: `netlify.toml CSP header ${index + 1}`,
    value: match[1],
  }))
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

const getAllDeploymentCspHeaders = (): CspHeaderSource[] => [
  ...getNetlifyCspHeaders(),
  ...getVercelCspHeaders(),
]

describe('deployment Content Security Policy', () => {
  it('keeps every deployment CSP value aligned', () => {
    const [canonicalCsp, ...additionalCspHeaders] = getAllDeploymentCspHeaders()

    expect(additionalCspHeaders).not.toHaveLength(0)

    for (const cspHeader of additionalCspHeaders) {
      expect(cspHeader.value, cspHeader.source).toBe(canonicalCsp.value)
    }
  })

  it('allows Sentry Session Replay workers in every deployed CSP header', () => {
    for (const cspHeader of getAllDeploymentCspHeaders()) {
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
