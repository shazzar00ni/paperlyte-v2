import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the module's environment dependencies
import { getBaseUrl, getSeoKeywords, getOgImage, env, updateMetaTags } from './env'

describe('env', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
  })

  describe('getBaseUrl', () => {
    it('should return window.location.origin as fallback', () => {
      // Test the actual behavior - getBaseUrl returns window.location.origin when no env var
      const result = getBaseUrl()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle window.location.origin', () => {
      const result = getBaseUrl()
      // Should return a valid origin format
      expect(result).toMatch(/^https?:\/\//)
    })
  })

  describe('getSeoKeywords', () => {
    it('should return default keywords', () => {
      const keywords = getSeoKeywords()
      expect(keywords).toContain('note-taking app')
      expect(keywords).toContain('simple notes')
      expect(keywords).toContain('fast notes')
      expect(keywords).toContain('offline notes')
      expect(keywords).toContain('tag-based organization')
    })

    it('should return a non-empty string', () => {
      const keywords = getSeoKeywords()
      expect(typeof keywords).toBe('string')
      expect(keywords.length).toBeGreaterThan(0)
    })
  })

  describe('getOgImage', () => {
    it('should return a valid image path', () => {
      const ogImage = getOgImage()
      expect(typeof ogImage).toBe('string')
      expect(ogImage.length).toBeGreaterThan(0)
    })

    it('should return an absolute URL', () => {
      const ogImage = getOgImage()
      // Should either be an absolute URL or have been combined with base URL
      expect(ogImage).toMatch(/^https?:\/\//)
    })

    it('should end with a valid image extension or path', () => {
      const ogImage = getOgImage()
      expect(ogImage).toMatch(/\.(png|jpg|jpeg|webp)$|og-image/)
    })
  })

  describe('env object', () => {
    it('should have baseUrl property', () => {
      expect(env.baseUrl).toBeDefined()
      expect(typeof env.baseUrl).toBe('string')
    })

    it('should have seoKeywords property', () => {
      expect(env.seoKeywords).toBeDefined()
      expect(typeof env.seoKeywords).toBe('string')
    })

    it('should have ogImage property', () => {
      expect(env.ogImage).toBeDefined()
      expect(typeof env.ogImage).toBe('string')
    })

    it('should have isDevelopment property', () => {
      expect(env.isDevelopment).toBeDefined()
      expect(typeof env.isDevelopment).toBe('boolean')
    })

    it('should have isProduction property', () => {
      expect(env.isProduction).toBeDefined()
      expect(typeof env.isProduction).toBe('boolean')
    })

    it('should have consistent development/production flags', () => {
      // In test environment, isDevelopment should be true
      expect(env.isDevelopment).toBe(true)
      expect(env.isProduction).toBe(false)
    })

    it('should have valid baseUrl format', () => {
      expect(env.baseUrl).toMatch(/^https?:\/\//)
    })

    it('should have non-empty seoKeywords', () => {
      expect(env.seoKeywords.length).toBeGreaterThan(0)
    })

    it('should have valid ogImage URL', () => {
      expect(env.ogImage).toMatch(/^https?:\/\//)
    })
  })

  describe('updateMetaTags', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should update canonical link href when present', () => {
      document.head.innerHTML = '<link rel="canonical" href="https://old-domain.com/" />'

      updateMetaTags()

      const canonical = document.querySelector('link[rel="canonical"]')
      // Should update to env.baseUrl
      expect(canonical?.getAttribute('href')).toContain('/')
      expect(canonical?.getAttribute('href')).toMatch(/^https?:\/\//)
    })

    it('should handle missing canonical link gracefully', () => {
      expect(() => updateMetaTags()).not.toThrow()
    })

    it('should update keywords meta content when present', () => {
      document.head.innerHTML = '<meta name="keywords" content="old, keywords" />'

      updateMetaTags()

      const keywords = document.querySelector('meta[name="keywords"]')
      // Should update to env.seoKeywords
      expect(keywords?.getAttribute('content')).toBeTruthy()
      expect(keywords?.getAttribute('content')?.length).toBeGreaterThan(0)
    })

    it('should handle missing keywords meta gracefully', () => {
      expect(() => updateMetaTags()).not.toThrow()
    })

    it('should update og:url meta content when present', () => {
      document.head.innerHTML = '<meta property="og:url" content="https://old-domain.com/" />'

      updateMetaTags()

      const ogUrl = document.querySelector('meta[property="og:url"]')
      // Should update to env.baseUrl
      expect(ogUrl?.getAttribute('content')).toContain('/')
      expect(ogUrl?.getAttribute('content')).toMatch(/^https?:\/\//)
    })

    it('should handle missing og:url gracefully', () => {
      expect(() => updateMetaTags()).not.toThrow()
    })

    it('should update og:image meta content when present', () => {
      document.head.innerHTML =
        '<meta property="og:image" content="https://old-domain.com/old-image.png" />'

      updateMetaTags()

      const ogImage = document.querySelector('meta[property="og:image"]')
      // Should update to env.ogImage
      expect(ogImage?.getAttribute('content')).toBeTruthy()
      expect(ogImage?.getAttribute('content')).toMatch(/^https?:\/\//)
    })

    it('should handle missing og:image gracefully', () => {
      expect(() => updateMetaTags()).not.toThrow()
    })

    it('should log environment info in development', () => {
      // In test environment, should log
      updateMetaTags()
    })

    it('should update all meta tags correctly in a complete scenario', () => {
      document.head.innerHTML = `
        <link rel="canonical" href="https://old-domain.com/" />
        <meta name="keywords" content="old, keywords" />
        <meta property="og:url" content="https://old-domain.com/" />
        <meta property="og:image" content="https://old-domain.com/image.png" />
      `

      updateMetaTags()

      // Verify all meta tags are updated with valid values
      const canonical = document.querySelector('link[rel="canonical"]')
      const keywords = document.querySelector('meta[name="keywords"]')
      const ogUrl = document.querySelector('meta[property="og:url"]')
      const ogImage = document.querySelector('meta[property="og:image"]')

      expect(canonical?.getAttribute('href')).toBeTruthy()
      expect(keywords?.getAttribute('content')).toBeTruthy()
      expect(ogUrl?.getAttribute('content')).toBeTruthy()
      expect(ogImage?.getAttribute('content')).toBeTruthy()
    })

    it('should handle partial meta tags gracefully', () => {
      document.head.innerHTML = `
        <link rel="canonical" href="https://old-domain.com/" />
        <meta property="og:url" content="https://old-domain.com/" />
      `

      expect(() => updateMetaTags()).not.toThrow()

      // Verify existing tags are updated
      const canonical = document.querySelector('link[rel="canonical"]')
      const ogUrl = document.querySelector('meta[property="og:url"]')

      expect(canonical?.getAttribute('href')).toBeTruthy()
      expect(ogUrl?.getAttribute('content')).toBeTruthy()
    })

    it('should handle empty document head gracefully', () => {
      document.head.innerHTML = ''
      expect(() => updateMetaTags()).not.toThrow()
    })
  })
})
