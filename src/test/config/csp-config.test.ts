import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

interface VercelHeader {
  key: string
  value: string
}

interface VercelConfig {
  headers: Array<{
    source: string
    headers: VercelHeader[]
  }>
}

const CSP_HEADER_NAME = 'Content-Security-Policy'
const REQUIRED_WORKER_SRC_DIRECTIVE = "worker-src 'self' blob:"

const parseCspDirectives = (csp: string): Map<string, string> => {
  const directives = new Map<string, string>()

  for (const rawDirective of csp.split(';')) {
    const directive = rawDirective.trim()

    if (!directive) {
      continue
    }

    const [name, ...valueParts] = directive.split(/\s+/)
    directives.set(name, valueParts.join(' '))
  }

  return directives
}

const getNetlifyCsp = (): string => {
  const content = readFileSync(join(process.cwd(), 'netlify.toml'), 'utf-8')
  const match = content.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)

  if (!match) {
    throw new Error('Content-Security-Policy header not found in netlify.toml')
  }

  return match[1]
}

const getVercelCsp = (): string => {
  const config = JSON.parse(
    readFileSync(join(process.cwd(), 'vercel.json'), 'utf-8')
  ) as VercelConfig

  const cspHeader = config.headers
    .flatMap((route) => route.headers)
    .find((header) => header.key === CSP_HEADER_NAME)

  if (!cspHeader) {
    throw new Error('Content-Security-Policy header not found in vercel.json')
  }

  return cspHeader.value
}

describe('deployment Content Security Policy', () => {
  it('keeps Netlify and Vercel CSP values identical', () => {
    expect(getNetlifyCsp()).toBe(getVercelCsp())
  })

  it('allows Sentry Session Replay workers without reopening other worker sources', () => {
    const workerSrc = parseCspDirectives(getNetlifyCsp()).get('worker-src')

    expect(workerSrc).toBe("'self' blob:")
    expect(getNetlifyCsp()).toContain(REQUIRED_WORKER_SRC_DIRECTIVE)
    expect(getNetlifyCsp()).not.toContain("worker-src 'none'")
  })
})
