/**
 * Test suite for netlify.toml configuration
 *
 * Validates that the Netlify configuration has the expected build settings,
 * edge functions, security headers, redirect rules, and caching directives.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let tomlContent: string

beforeAll(() => {
  const tomlPath = resolve(__dirname, '../../netlify.toml')
  tomlContent = readFileSync(tomlPath, 'utf-8')
})

describe('netlify.toml — build configuration', () => {
  it('should set base directory to repo root', () => {
    expect(tomlContent).toContain('base = "."')
  })

  it('should use npm run build as build command', () => {
    expect(tomlContent).toContain('command = "npm run build"')
  })

  it('should publish dist directory', () => {
    expect(tomlContent).toContain('publish = "dist"')
  })

  it('should set functions directory to netlify/functions', () => {
    expect(tomlContent).toContain('functions = "netlify/functions"')
  })

  it('should use Node 20', () => {
    expect(tomlContent).toContain('NODE_VERSION = "20"')
  })
})

describe('netlify.toml — edge functions', () => {
  it('should configure an edge_functions directory', () => {
    expect(tomlContent).toMatch(/edge_functions\s*=\s*"netlify\/edge-functions"/)
  })

  it('should contain a [[edge_functions]] block', () => {
    expect(tomlContent).toContain('[[edge_functions]]')
  })

  it('should reference the WAF edge function', () => {
    expect(tomlContent).toMatch(/function\s*=\s*["']waf["']/)
  })

  it('should have an edge function path rule', () => {
    // The WAF block uses path = "/*" under [[edge_functions]]
    expect(tomlContent).toMatch(/\[\[edge_functions\]\][\s\S]*?path\s*=/)
  })
})

describe('netlify.toml — SPA redirect rule', () => {
  it('should have a catch-all redirect for SPA routing', () => {
    expect(tomlContent).toContain('from = "/*"')
    expect(tomlContent).toContain('to = "/index.html"')
    expect(tomlContent).toContain('status = 200')
  })

  it('should apply redirect before security headers section', () => {
    const redirectsIndex = tomlContent.indexOf('[[redirects]]')
    const headersIndex = tomlContent.indexOf('[[headers]]')
    expect(redirectsIndex).toBeGreaterThan(-1)
    expect(headersIndex).toBeGreaterThan(-1)
    expect(redirectsIndex).toBeLessThan(headersIndex)
  })
})

describe('netlify.toml — security headers', () => {
  it('should apply headers to all paths via "/*"', () => {
    // The main headers block targets "/*"
    expect(tomlContent).toMatch(/for\s*=\s*"\/\*"/)
  })

  it('should set X-Frame-Options to DENY', () => {
    expect(tomlContent).toContain('X-Frame-Options = "DENY"')
  })

  it('should set X-Content-Type-Options to nosniff', () => {
    expect(tomlContent).toContain('X-Content-Type-Options = "nosniff"')
  })

  it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(tomlContent).toContain('Referrer-Policy = "strict-origin-when-cross-origin"')
  })

  describe('Strict-Transport-Security', () => {
    it('should be present', () => {
      expect(tomlContent).toContain('Strict-Transport-Security')
    })

    it('should use 2-year max-age (63072000)', () => {
      expect(tomlContent).toMatch(/Strict-Transport-Security\s*=\s*"max-age=63072000/)
    })

    it('should NOT use 1-year max-age (31536000) for HSTS', () => {
      expect(tomlContent).not.toMatch(/Strict-Transport-Security\s*=\s*"max-age=31536000/)
    })

    it('should include includeSubDomains', () => {
      expect(tomlContent).toMatch(/Strict-Transport-Security\s*=\s*"[^"]*includeSubDomains/)
    })

    it('should include preload directive', () => {
      expect(tomlContent).toMatch(/Strict-Transport-Security\s*=\s*"[^"]*preload/)
    })
  })

  describe('Permissions-Policy', () => {
    it('should be present', () => {
      expect(tomlContent).toContain('Permissions-Policy')
    })

    it('should restrict geolocation', () => {
      expect(tomlContent).toMatch(/Permissions-Policy\s*=\s*"[^"]*geolocation=\(\)/)
    })

    it('should restrict microphone', () => {
      expect(tomlContent).toMatch(/Permissions-Policy\s*=\s*"[^"]*microphone=\(\)/)
    })

    it('should restrict camera', () => {
      expect(tomlContent).toMatch(/Permissions-Policy\s*=\s*"[^"]*camera=\(\)/)
    })

    it('should include the extended set of restricted APIs', () => {
      // Config restricts payment, usb, bluetooth, serial, etc.
      expect(tomlContent).toMatch(/Permissions-Policy\s*=\s*"[^"]*payment=\(\)/)
      expect(tomlContent).toMatch(/Permissions-Policy\s*=\s*"[^"]*usb=\(\)/)
    })
  })

  describe('Content-Security-Policy', () => {
    it('should be present', () => {
      expect(tomlContent).toContain('Content-Security-Policy')
    })

    it('should restrict default-src to self', () => {
      expect(tomlContent).toMatch(/Content-Security-Policy\s*=\s*"[^"]*default-src 'self'/)
    })

    it('should allow plausible.io in script-src', () => {
      expect(tomlContent).toContain("script-src 'self' https://plausible.io")
    })

    it('should allow plausible.io in connect-src', () => {
      const cspLine = tomlContent
        .split('\n')
        .find(line => line.includes('Content-Security-Policy ='))
      expect(cspLine).toBeDefined()
      expect(cspLine).toContain('https://plausible.io')
    })

    it('should allow sentry in connect-src', () => {
      const cspLine = tomlContent
        .split('\n')
        .find(line => line.includes('Content-Security-Policy ='))
      expect(cspLine).toBeDefined()
      expect(cspLine).toContain('https://*.ingest.sentry.io')
    })

    it('should restrict style-src to self', () => {
      expect(tomlContent).toContain("style-src 'self'")
    })

    it('should restrict font-src to self', () => {
      expect(tomlContent).toContain("font-src 'self'")
    })

    it('should allow data: URIs for images', () => {
      expect(tomlContent).toContain("img-src 'self' data:")
    })

    it('should restrict connect-src to self', () => {
      expect(tomlContent).toContain("connect-src 'self'")
    })

    it('should set frame-ancestors to none', () => {
      expect(tomlContent).toContain("frame-ancestors 'none'")
    })

    it('should set base-uri to self', () => {
      expect(tomlContent).toContain("base-uri 'self'")
    })

    it('should set form-action to self', () => {
      expect(tomlContent).toContain("form-action 'self'")
    })
  })
})

describe('netlify.toml — caching headers', () => {
  it('should cache /assets/* for 1 year with immutable', () => {
    const assetsSection = tomlContent.indexOf('for = "/assets/*"')
    expect(assetsSection).toBeGreaterThan(-1)
    const snippet = tomlContent.slice(assetsSection, assetsSection + 200)
    expect(snippet).toContain('max-age=31536000')
    expect(snippet).toContain('immutable')
  })

  it('should cache /*.woff2 fonts for 1 year', () => {
    const fontsSection = tomlContent.indexOf('for = "/*.woff2"')
    expect(fontsSection).toBeGreaterThan(-1)
    const snippet = tomlContent.slice(fontsSection, fontsSection + 200)
    expect(snippet).toContain('max-age=31536000')
    expect(snippet).toContain('immutable')
  })

  it('should skip Netlify build processing', () => {
    expect(tomlContent).toContain('skip_processing = true')
  })
})

describe('netlify.toml — deploy-preview noindex headers', () => {
  it('should set X-Robots-Tag to noindex for deploy-preview context', () => {
    expect(tomlContent).toContain('X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet"')
  })

  it('should have context.deploy-preview.headers block', () => {
    expect(tomlContent).toContain('[[context.deploy-preview.headers]]')
  })

  it('should have context.branch-deploy.headers block', () => {
    expect(tomlContent).toContain('[[context.branch-deploy.headers]]')
  })
})
