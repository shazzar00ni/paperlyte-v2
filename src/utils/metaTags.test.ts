import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initializeMetaTags, setMetaDescription } from './metaTags'

describe('metaTags', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Mock console.log
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('setMetaDescription', () => {
    it('should create meta description element if it does not exist', () => {
      setMetaDescription('Test description')

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription).toBeInTheDocument()
      expect(metaDescription?.getAttribute('content')).toBe('Test description')
    })

    it('should update existing meta description element', () => {
      document.head.innerHTML = '<meta name="description" content="Old description" />'

      setMetaDescription('New description')

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription?.getAttribute('content')).toBe('New description')
    })

    it('should only create one meta description element', () => {
      setMetaDescription('First description')
      setMetaDescription('Second description')

      const metaDescriptions = document.querySelectorAll('meta[name="description"]')
      expect(metaDescriptions.length).toBe(1)
      expect(metaDescriptions[0].getAttribute('content')).toBe('Second description')
    })

    it('should handle empty string content', () => {
      setMetaDescription('')

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription).toBeInTheDocument()
      expect(metaDescription?.getAttribute('content')).toBe('')
    })

    it('should handle long description content', () => {
      const longDescription =
        'This is a very long description that exceeds typical limits but should still be handled correctly by the function without any issues or errors being thrown.'

      setMetaDescription(longDescription)

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription?.getAttribute('content')).toBe(longDescription)
    })

    it('should handle special characters in content', () => {
      const specialContent = 'Description with "quotes", <tags>, & ampersands'

      setMetaDescription(specialContent)

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription?.getAttribute('content')).toBe(specialContent)
    })

    it('should append meta element to document head', () => {
      setMetaDescription('Test description')

      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription?.parentElement).toBe(document.head)
    })

    it('should preserve other meta tags when creating new description', () => {
      document.head.innerHTML = `
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="Page Title" />
      `

      setMetaDescription('Test description')

      const viewport = document.querySelector('meta[name="viewport"]')
      const ogTitle = document.querySelector('meta[property="og:title"]')
      const description = document.querySelector('meta[name="description"]')

      expect(viewport).toBeInTheDocument()
      expect(ogTitle).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(document.querySelectorAll('meta').length).toBe(3)
    })
  })

  describe('initializeMetaTags', () => {
    // In test environment (DEV mode), the function should modify meta tags
    it('should set robots to "noindex, nofollow" in development', () => {
      document.head.innerHTML = '<meta name="robots" content="index, follow" />'

      initializeMetaTags()

      const robotsMeta = document.querySelector('meta[name="robots"]')
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow')
    })

    it('should handle missing robots meta tag gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should remove keywords meta tag in development', () => {
      document.head.innerHTML = '<meta name="keywords" content="note-taking, app" />'

      initializeMetaTags()

      const keywordsMeta = document.querySelector('meta[name="keywords"]')
      expect(keywordsMeta).toBeNull()
    })

    it('should handle missing keywords meta tag gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should add [DEV] prefix to title in development', () => {
      document.head.innerHTML = '<title>Paperlyte</title>'

      initializeMetaTags()

      const titleElement = document.querySelector('title')
      expect(titleElement?.textContent).toBe('[DEV] Paperlyte')
    })

    it('should not add duplicate [DEV] prefix if already present', () => {
      document.head.innerHTML = '<title>[DEV] Paperlyte</title>'

      initializeMetaTags()

      const titleElement = document.querySelector('title')
      expect(titleElement?.textContent).toBe('[DEV] Paperlyte')
    })

    it('should handle missing title element gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should handle title with null textContent', () => {
      const title = document.createElement('title')
      document.head.appendChild(title)

      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should update og:url to current origin', () => {
      document.head.innerHTML = '<meta property="og:url" content="https://paperlyte.com/" />'

      initializeMetaTags()

      const ogUrl = document.querySelector('meta[property="og:url"]')
      const content = ogUrl?.getAttribute('content')
      expect(content).toContain('/')
      expect(content).toMatch(/^https?:\/\//)
    })

    it('should update og:image to current origin', () => {
      document.head.innerHTML =
        '<meta property="og:image" content="https://paperlyte.com/og-image.png" />'

      initializeMetaTags()

      const ogImage = document.querySelector('meta[property="og:image"]')
      const content = ogImage?.getAttribute('content')
      expect(content).toContain('/og-image.png')
      expect(content).toMatch(/^https?:\/\//)
    })

    it('should handle missing og:url gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should handle missing og:image gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should update twitter:url to current origin', () => {
      document.head.innerHTML = '<meta name="twitter:url" content="https://paperlyte.com/" />'

      initializeMetaTags()

      const twitterUrl = document.querySelector('meta[name="twitter:url"]')
      const content = twitterUrl?.getAttribute('content')
      expect(content).toContain('/')
      expect(content).toMatch(/^https?:\/\//)
    })

    it('should update twitter:image to current origin', () => {
      document.head.innerHTML =
        '<meta name="twitter:image" content="https://paperlyte.com/og-image.png" />'

      initializeMetaTags()

      const twitterImage = document.querySelector('meta[name="twitter:image"]')
      const content = twitterImage?.getAttribute('content')
      expect(content).toContain('/og-image.png')
      expect(content).toMatch(/^https?:\/\//)
    })

    it('should handle missing twitter:url gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should handle missing twitter:image gracefully', () => {
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should log environment initialization info', () => {
      initializeMetaTags()

      expect(consoleSpy).toHaveBeenCalledWith('[Meta Tags] Initialized for development environment')
      expect(consoleSpy).toHaveBeenCalledWith('  - Robots: noindex, nofollow')
      expect(consoleSpy).toHaveBeenCalledWith('  - Keywords: removed')
      expect(consoleSpy).toHaveBeenCalledWith('  - Canonical URL: unchanged (points to production)')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('  - Open Graph URLs: updated to')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('  - Twitter Card URLs: updated to')
      )
    })

    it('should update all meta tags correctly in a complete scenario', () => {
      document.head.innerHTML = `
        <title>Paperlyte - Fast Note-Taking</title>
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="note-taking, app, fast" />
        <meta property="og:url" content="https://paperlyte.com/" />
        <meta property="og:image" content="https://paperlyte.com/og-image.png" />
        <meta name="twitter:url" content="https://paperlyte.com/" />
        <meta name="twitter:image" content="https://paperlyte.com/og-image.png" />
      `

      initializeMetaTags()

      // Title should have [DEV] prefix
      const title = document.querySelector('title')
      expect(title?.textContent).toContain('[DEV]')
      expect(title?.textContent).toContain('Paperlyte')

      // Robots should be noindex, nofollow
      const robots = document.querySelector('meta[name="robots"]')
      expect(robots?.getAttribute('content')).toBe('noindex, nofollow')

      // Keywords should be removed
      const keywords = document.querySelector('meta[name="keywords"]')
      expect(keywords).toBeNull()

      // Open Graph URLs should be updated
      const ogUrl = document.querySelector('meta[property="og:url"]')
      expect(ogUrl?.getAttribute('content')).toMatch(/^https?:\/\//)

      const ogImage = document.querySelector('meta[property="og:image"]')
      expect(ogImage?.getAttribute('content')).toMatch(/^https?:\/\//)
      expect(ogImage?.getAttribute('content')).toContain('/og-image.png')

      // Twitter URLs should be updated
      const twitterUrl = document.querySelector('meta[name="twitter:url"]')
      expect(twitterUrl?.getAttribute('content')).toMatch(/^https?:\/\//)

      const twitterImage = document.querySelector('meta[name="twitter:image"]')
      expect(twitterImage?.getAttribute('content')).toMatch(/^https?:\/\//)
      expect(twitterImage?.getAttribute('content')).toContain('/og-image.png')
    })

    it('should handle partial meta tags gracefully', () => {
      document.head.innerHTML = `
        <title>Paperlyte</title>
        <meta name="robots" content="index, follow" />
      `

      expect(() => initializeMetaTags()).not.toThrow()

      // Verify existing tags are updated
      const title = document.querySelector('title')
      expect(title?.textContent).toContain('[DEV]')

      const robots = document.querySelector('meta[name="robots"]')
      expect(robots?.getAttribute('content')).toBe('noindex, nofollow')
    })

    it('should handle empty document head gracefully', () => {
      document.head.innerHTML = ''
      expect(() => initializeMetaTags()).not.toThrow()
    })

    it('should preserve title text when adding [DEV] prefix', () => {
      const originalTitle = 'My Amazing App - The Best Tool Ever'
      document.head.innerHTML = `<title>${originalTitle}</title>`

      initializeMetaTags()

      const titleElement = document.querySelector('title')
      expect(titleElement?.textContent).toBe(`[DEV] ${originalTitle}`)
    })

    it('should handle various title formats', () => {
      // Short title
      document.head.innerHTML = '<title>App</title>'
      initializeMetaTags()
      expect(document.querySelector('title')?.textContent).toBe('[DEV] App')

      // Long title with special characters
      document.head.innerHTML = '<title>App | Feature & Benefits</title>'
      initializeMetaTags()
      expect(document.querySelector('title')?.textContent).toBe('[DEV] App | Feature & Benefits')
    })
  })
})
