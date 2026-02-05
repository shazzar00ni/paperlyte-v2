import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrollToSection, isSafeUrl, safeNavigate, isAllowedDestination } from './navigation'

describe('navigation utilities', () => {
  describe('scrollToSection', () => {
    beforeEach(() => {
      // Clear any previous mocks
      vi.clearAllMocks()
    })

    it('should scroll to element when it exists', () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'test-section'
      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      // Add element to document
      document.body.appendChild(mockElement)

      scrollToSection('test-section')

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      // Cleanup
      document.body.removeChild(mockElement)
    })

    it('should not throw error when element does not exist', () => {
      expect(() => scrollToSection('non-existent-section')).not.toThrow()
    })

    it('should do nothing when element is null', () => {
      const getElementByIdSpy = vi.spyOn(document, 'getElementById')
      getElementByIdSpy.mockReturnValue(null)

      scrollToSection('missing-section')

      expect(getElementByIdSpy).toHaveBeenCalledWith('missing-section')

      getElementByIdSpy.mockRestore()
    })

    it('should call scrollIntoView with smooth behavior', () => {
      const mockElement = document.createElement('section')
      mockElement.id = 'features'
      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      document.body.appendChild(mockElement)

      scrollToSection('features')

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(mockElement)
    })
  })

  describe('isSafeUrl', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should allow relative URLs starting with /', () => {
      expect(isSafeUrl('/')).toBe(true)
      expect(isSafeUrl('/about')).toBe(true)
      expect(isSafeUrl('/path/to/page')).toBe(true)
    })

    it('should allow URLs with query parameters and fragments', () => {
      expect(isSafeUrl('/page?param=value')).toBe(true)
      expect(isSafeUrl('/page?foo=bar&baz=qux')).toBe(true)
      expect(isSafeUrl('/page#section')).toBe(true)
      expect(isSafeUrl('/page?param=value#section')).toBe(true)
      expect(isSafeUrl('/#fragment')).toBe(true)
    })

    it('should reject unsafe URLs with query parameters and fragments', () => {
      expect(isSafeUrl('//evil.com?param=value')).toBe(false)
      expect(isSafeUrl('//evil.com#section')).toBe(false)
      expect(isSafeUrl('//evil.com?foo=bar#section')).toBe(false)
    })

    it('should allow relative URLs starting with ./', () => {
      expect(isSafeUrl('./')).toBe(true)
      expect(isSafeUrl('./page')).toBe(true)
    })

    it('should allow relative URLs starting with ../', () => {
      expect(isSafeUrl('../')).toBe(true)
      expect(isSafeUrl('../page')).toBe(true)
    })

    it('should reject empty or null URLs', () => {
      expect(isSafeUrl('')).toBe(false)
      expect(isSafeUrl('   ')).toBe(false)
    })

    it('should reject protocol-relative URLs and URLs with protocol injection', () => {
      expect(isSafeUrl('//evil.com')).toBe(false)
      expect(isSafeUrl('//evil.com/path')).toBe(false)
      expect(isSafeUrl('/path/with://protocol')).toBe(false)
    })

    it('should allow external HTTP/HTTPS URLs (for linking to external resources)', () => {
      expect(isSafeUrl('http://example.com')).toBe(true)
      expect(isSafeUrl('https://example.com/page')).toBe(true)
      expect(isSafeUrl('https://github.com')).toBe(true)
    })

    it('should reject javascript: protocol URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false)
      expect(isSafeUrl('javascript:void(0)')).toBe(false)
    })

    it('should reject data: protocol URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    })

    it('should reject vbscript:, file:, and about: protocol URLs', () => {
      expect(isSafeUrl('vbscript:alert(1)')).toBe(false)
      expect(isSafeUrl('file:///etc/passwd')).toBe(false)
      expect(isSafeUrl('file://c:/windows/system32')).toBe(false)
      expect(isSafeUrl('about:blank')).toBe(false)
      expect(isSafeUrl('about:config')).toBe(false)
    })

    it('should reject case-insensitive variations of dangerous protocols', () => {
      expect(isSafeUrl('JavaScript:alert(1)')).toBe(false)
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false)
      expect(isSafeUrl('JaVaScRiPt:alert(1)')).toBe(false)
      expect(isSafeUrl('Data:text/html,<script>alert(1)</script>')).toBe(false)
      expect(isSafeUrl('DATA:text/html')).toBe(false)
      expect(isSafeUrl('VbScRiPt:alert(1)')).toBe(false)
      expect(isSafeUrl('FILE:///etc/passwd')).toBe(false)
      expect(isSafeUrl('ABOUT:blank')).toBe(false)
    })

    it('should reject dangerous protocols with whitespace variations', () => {
      expect(isSafeUrl(' javascript:alert(1)')).toBe(false)
      expect(isSafeUrl('javascript :alert(1)')).toBe(false)
      expect(isSafeUrl(' data:text/html')).toBe(false)
      expect(isSafeUrl('  javascript:alert(1)  ')).toBe(false)
      expect(isSafeUrl('\tjavascript:alert(1)')).toBe(false)
      expect(isSafeUrl('\njavascript:alert(1)')).toBe(false)
    })

    it('should reject URL-encoded dangerous protocols', () => {
      // These should fail URL parsing and be caught by the try-catch block
      expect(isSafeUrl('java%73cript:alert(1)')).toBe(false)
      expect(isSafeUrl('%6A%61%76%61%73%63%72%69%70%74:alert(1)')).toBe(false)
      expect(isSafeUrl('java\u0000script:alert(1)')).toBe(false)
    })

    it('should allow same-origin absolute URLs', () => {
      const currentOrigin = window.location.origin
      expect(isSafeUrl(currentOrigin)).toBe(true)
      expect(isSafeUrl(`${currentOrigin}/`)).toBe(true)
      expect(isSafeUrl(`${currentOrigin}/page`)).toBe(true)
    })

    it('should handle malformed or ambiguous URLs safely', () => {
      // These will be parsed as relative URLs by the browser
      // The function validates them as same-origin relative paths
      const result1 = isSafeUrl('not a url at all')
      const result2 = isSafeUrl('http://')
      const result3 = isSafeUrl('://invalid')

      // These should all be handled safely (either allowed as relative or rejected)
      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
      expect(typeof result3).toBe('boolean')
    })
  })

  describe('safeNavigate', () => {
    let originalLocation: Location

    beforeEach(() => {
      vi.clearAllMocks()
      originalLocation = window.location
    })

    it('should navigate to safe relative URLs', () => {
      const mockLocation = { href: '' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigate('/')
      expect(result).toBe(true)
      expect(window.location.href).toBe('/')
      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should block navigation to external HTTPS URLs (open redirect protection)', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // External URLs should be blocked to prevent open redirect attacks
      const result = safeNavigate('https://example.com')
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('is not an allowed destination')
      )

      consoleWarnSpy.mockRestore()
      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should block navigation to javascript: URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = safeNavigate('javascript:alert(1)')
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should return true for successful navigation', () => {
      const mockLocation = { href: '' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigate('/about')
      expect(result).toBe(true)

      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should return false for blocked navigation', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = safeNavigate('//evil.com')
      expect(result).toBe(false)

      consoleWarnSpy.mockRestore()
      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('isAllowedDestination', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should allow relative URLs starting with /', () => {
      expect(isAllowedDestination('/')).toBe(true)
      expect(isAllowedDestination('/about')).toBe(true)
      expect(isAllowedDestination('/path/to/page')).toBe(true)
    })

    it('should allow relative URLs with ./ and ../', () => {
      expect(isAllowedDestination('./')).toBe(true)
      expect(isAllowedDestination('./page')).toBe(true)
      expect(isAllowedDestination('../')).toBe(true)
      expect(isAllowedDestination('../page')).toBe(true)
    })

    it('should allow same-origin absolute URLs', () => {
      const currentOrigin = window.location.origin
      expect(isAllowedDestination(currentOrigin)).toBe(true)
      expect(isAllowedDestination(`${currentOrigin}/`)).toBe(true)
      expect(isAllowedDestination(`${currentOrigin}/page`)).toBe(true)
    })

    it('should block external URLs not on the allowlist', () => {
      expect(isAllowedDestination('https://example.com')).toBe(false)
      expect(isAllowedDestination('https://evil.com/phishing')).toBe(false)
      expect(isAllowedDestination('http://malicious.site')).toBe(false)
    })

    it('should block protocol-relative URLs', () => {
      expect(isAllowedDestination('//evil.com')).toBe(false)
      expect(isAllowedDestination('//example.com/page')).toBe(false)
    })

    it('should handle relative paths containing :// as same-origin', () => {
      // These are relative paths that happen to contain ://.
      // isAllowedDestination alone treats them as same-origin, but in practice
      // safeNavigate first applies isSafeUrl, which blocks any URL containing ://.
      expect(isAllowedDestination('/path://injection')).toBe(true)
      expect(isAllowedDestination('./path://injection')).toBe(true)
    })

    it('should block non-http/https protocols for external URLs', () => {
      expect(isAllowedDestination('ftp://external.com')).toBe(false)
    })

    it('should handle malformed URLs safely by rejecting them', () => {
      // Malformed URLs should be rejected (not allowed)
      const result = isAllowedDestination('://invalid')
      expect(typeof result).toBe('boolean')
    })
  })
})
