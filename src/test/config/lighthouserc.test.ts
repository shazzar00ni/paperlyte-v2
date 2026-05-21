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
  let rawContent: string
  let cachedConfig: LighthouseConfig | undefined

  beforeAll(() => {
    const filePath = join(process.cwd(), '.lighthouserc.json')
    rawContent = readFileSync(filePath, 'utf-8')
  })

  const getOrParseConfig = (): LighthouseConfig => {
    if (!cachedConfig) {
      cachedConfig = JSON.parse(rawContent) as LighthouseConfig
    }

    return structuredClone(cachedConfig)
  }

  describe('JSON validity and structure', () => {
    it('should be valid JSON', () => {
      expect(() => JSON.parse(rawContent)).not.toThrow()
    })

    it('should have ci.collect configuration', () => {
      const config = getOrParseConfig()
      expect(config.ci).toBeDefined()
      expect(config.ci.collect).toBeDefined()
      expect(config.ci.collect.url).toBeInstanceOf(Array)
      expect(config.ci.collect.url.length).toBeGreaterThan(0)
    })

    it('should have ci.assert configuration', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert).toBeDefined()
      expect(config.ci.assert.preset).toBe('lighthouse:recommended')
      expect(config.ci.assert.assertions).toBeDefined()
    })

    it('should have ci.upload configuration', () => {
      const config = getOrParseConfig()
      expect(config.ci.upload).toBeDefined()
      expect(config.ci.upload.target).toBe('temporary-public-storage')
    })
  })

  describe('existing assertions', () => {
    it('should have unminified-css assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('unminified-css', 'warn')
    })

    it('should have unminified-javascript assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('unminified-javascript', 'warn')
    })

    it('should have network-dependency-tree-insight assertion as off', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('network-dependency-tree-insight', 'off')
    })

    it('should have is-on-https assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('is-on-https', 'warn')
    })

    it('should have uses-http2 assertion as off', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('uses-http2', 'off')
    })

    it('should have redirects-http assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('redirects-http', 'warn')
    })

    it('should have csp-xss assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('csp-xss', 'warn')
    })

    it('should have has-hsts assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('has-hsts', 'warn')
    })

    it('should have clickjacking-mitigation assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('clickjacking-mitigation', 'warn')
    })

    it('should have bf-cache assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('bf-cache', 'warn')
    })

    it('should have errors-in-console assertion as warn', () => {
      const config = getOrParseConfig()
      expect(config.ci.assert.assertions).toHaveProperty('errors-in-console', 'warn')
    })
  })

  describe('retained assertions', () => {
    it('should have no-document-write as error', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['no-document-write']
      expect(assertion).toBe('error')
    })

    it('should have uses-rel-preconnect as warn', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['uses-rel-preconnect']
      expect(assertion).toBe('warn')
    })

    it('should have uses-long-cache-ttl as off', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['uses-long-cache-ttl']
      expect(assertion).toBe('off')
    })

    it('should have font-display as warn', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['font-display']
      expect(assertion).toBe('warn')
    })

    it('should have unused-javascript as warn', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['unused-javascript']
      expect(assertion).toBe('warn')
    })

    it('should have modern-image-formats as warn', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['modern-image-formats']
      expect(assertion).toBe('warn')
    })
  })

  describe('core performance thresholds', () => {
    it('should enforce minimum performance score of 0.7', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['categories:performance']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { minScore: number }]
      expect(level).toBe('error')
      expect(options.minScore).toBe(0.7)
    })

    it('should enforce minimum accessibility score of 0.82', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['categories:accessibility']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { minScore: number }]
      expect(level).toBe('error')
      expect(options.minScore).toBe(0.82)
    })

    it('should enforce LCP maximum of 6000ms', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['largest-contentful-paint']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { maxNumericValue: number }]
      expect(level).toBe('error')
      expect(options.maxNumericValue).toBe(6000)
    })

    it('should enforce resource summary script size limit', () => {
      const config = getOrParseConfig()
      const assertion = config.ci.assert.assertions['resource-summary:script:size']
      expect(assertion).toBeInstanceOf(Array)
      const [level, options] = assertion as [string, { maxNumericValue: number }]
      expect(level).toBe('warn')
      expect(options.maxNumericValue).toBe(153600)
    })
  })

  describe('collect settings', () => {
    it('should use desktop preset', () => {
      const config = getOrParseConfig()
      expect(config.ci.collect.settings.preset).toBe('desktop')
    })

    it('should collect 3 runs for accuracy', () => {
      const config = getOrParseConfig()
      expect(config.ci.collect.numberOfRuns).toBe(3)
    })

    it('should include headless chrome flags', () => {
      const config = getOrParseConfig()
      expect(config.ci.collect.settings.chromeFlags).toContain('--headless')
    })
  })
})
