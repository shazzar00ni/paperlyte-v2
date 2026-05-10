import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

interface LighthouseAssertions {
  [key: string]: string | [string, { maxNumericValue?: number; minScore?: number }]
}

interface LighthouseConfig {
  ci: {
    collect: {
      url: string[]
      numberOfRuns: number
      settings: {
        preset: string
        chromeFlags: string
        throttling: {
          rttMs: number
          throughputKbps: number
          cpuSlowdownMultiplier: number
        }
      }
    }
    assert: {
      preset: string
      assertions: LighthouseAssertions
    }
    upload: {
      target: string
    }
  }
}

describe('.lighthouserc.json configuration', () => {
  let config: LighthouseConfig
  let rawContent: string

  beforeAll(() => {
    const filePath = join(process.cwd(), '.lighthouserc.json')
    rawContent = readFileSync(filePath, 'utf-8')
    config = JSON.parse(rawContent) as LighthouseConfig
  })

  describe('JSON validity and structure', () => {
    it('should be valid JSON', () => {
      expect(() => JSON.parse(rawContent)).not.toThrow()
    })

    it('should have ci.collect configuration', () => {
      expect(config.ci).toBeDefined()
      expect(config.ci.collect).toBeDefined()
      expect(config.ci.collect.url).toBeInstanceOf(Array)
      expect(config.ci.collect.url.length).toBeGreaterThan(0)
    })

    it('should have ci.assert configuration', () => {
      expect(config.ci.assert).toBeDefined()
      expect(config.ci.assert.preset).toBe('lighthouse:recommended')
      expect(config.ci.assert.assertions).toBeDefined()
    })

    it('should have ci.upload configuration', () => {
      expect(config.ci.upload).toBeDefined()
      expect(config.ci.upload.target).toBe('temporary-public-storage')
    })
  })

  describe('removed assertions (PR cleanup)', () => {
    it('should NOT have unminified-css assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('unminified-css')
    })

    it('should NOT have unminified-javascript assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('unminified-javascript')
    })

    it('should NOT have network-dependency-tree-insight assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('network-dependency-tree-insight')
    })

    it('should NOT have is-on-https assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('is-on-https')
    })

    it('should NOT have uses-http2 assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('uses-http2')
    })

    it('should NOT have redirects-http assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('redirects-http')
    })

    it('should NOT have csp-xss assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('csp-xss')
    })

    it('should NOT have has-hsts assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('has-hsts')
    })

    it('should NOT have clickjacking-mitigation assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('clickjacking-mitigation')
    })

    it('should NOT have bf-cache assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('bf-cache')
    })

    it('should NOT have errors-in-console assertion', () => {
      expect(config.ci.assert.assertions).not.toHaveProperty('errors-in-console')
    })
  })

  describe('retained assertions', () => {
    it('should have no-document-write as error', () => {
      const assertion = config.ci.assert.assertions['no-document-write']
      expect(assertion).toBe('error')
    })

    it('should have uses-rel-preconnect as warn', () => {
      const assertion = config.ci.assert.assertions['uses-rel-preconnect']
      expect(assertion).toBe('warn')
    })

    it('should have uses-long-cache-ttl as off', () => {
      const assertion = config.ci.assert.assertions['uses-long-cache-ttl']
      expect(assertion).toBe('off')
    })

    it('should have font-display as warn', () => {
      const assertion = config.ci.assert.assertions['font-display']
      expect(assertion).toBe('warn')
    })

    it('should have unused-javascript as warn', () => {
      const assertion = config.ci.assert.assertions['unused-javascript']
      expect(assertion).toBe('warn')
    })

    it('should have modern-image-formats as warn', () => {
      const assertion = config.ci.assert.assertions['modern-image-formats']
      expect(assertion).toBe('warn')
    })
  })

  describe('core performance thresholds', () => {
    it('should enforce minimum performance score of 0.7', () => {
      const assertion = config.ci.assert.assertions['categories:performance']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { minScore: number }]
      expect(level).toBe('error')
      expect(options.minScore).toBe(0.7)
    })

    it('should enforce minimum accessibility score of 0.82', () => {
      const assertion = config.ci.assert.assertions['categories:accessibility']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { minScore: number }]
      expect(level).toBe('error')
      expect(options.minScore).toBe(0.82)
    })

    it('should enforce LCP maximum of 6000ms', () => {
      const assertion = config.ci.assert.assertions['largest-contentful-paint']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { maxNumericValue: number }]
      expect(level).toBe('error')
      expect(options.maxNumericValue).toBe(6000)
    })

    it('should enforce resource summary script size limit', () => {
      const assertion = config.ci.assert.assertions['resource-summary:script:size']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { maxNumericValue: number }]
      expect(level).toBe('warn')
      expect(options.maxNumericValue).toBe(153600)
    })
  })

  describe('collect settings', () => {
    it('should use desktop preset', () => {
      expect(config.ci.collect.settings.preset).toBe('desktop')
    })

    it('should collect 3 runs for accuracy', () => {
      expect(config.ci.collect.numberOfRuns).toBe(3)
    })

    it('should include headless chrome flags', () => {
      expect(config.ci.collect.settings.chromeFlags).toContain('--headless')
    })
  })
})
