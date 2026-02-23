import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrollToSection, isSafeUrl, safeNavigate } from './navigation'
import * as monitoring from './monitoring'

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

    it('should reject protocol-relative URLs', () => {
      expect(isSafeUrl('//evil.com')).toBe(false)
      expect(isSafeUrl('//evil.com/path')).toBe(false)
    })

    it('should allow paths containing :// when they resolve to same-origin', () => {
      // The URL constructor correctly resolves these as same-origin relative paths,
      // so the conservative :// substring guard is no longer needed.
      expect(isSafeUrl('/path/with://protocol')).toBe(true)
    })

    it('should allow naked relative paths (no leading / or dots)', () => {
      expect(isSafeUrl('about')).toBe(true)
      expect(isSafeUrl('features')).toBe(true)
      expect(isSafeUrl('page/subpage')).toBe(true)
      expect(isSafeUrl('docs/guide')).toBe(true)
    })

    it('should allow hash-only and query-only URLs', () => {
      expect(isSafeUrl('#section')).toBe(true)
      expect(isSafeUrl('?param=value')).toBe(true)
    })

    it('should reject external HTTP/HTTPS URLs by default (prevents open redirects)', () => {
      expect(isSafeUrl('http://example.com')).toBe(false)
      expect(isSafeUrl('https://example.com/page')).toBe(false)
      expect(isSafeUrl('https://github.com')).toBe(false)
    })

    it('should allow external HTTP/HTTPS URLs when allowExternal is true', () => {
      expect(isSafeUrl('http://example.com', { allowExternal: true })).toBe(true)
      expect(isSafeUrl('https://example.com/page', { allowExternal: true })).toBe(true)
      expect(isSafeUrl('https://github.com', { allowExternal: true })).toBe(true)
    })

    it('should still block dangerous protocols even with allowExternal: true', () => {
      expect(isSafeUrl('javascript:alert(1)', { allowExternal: true })).toBe(false)
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>', { allowExternal: true })).toBe(false)
      expect(isSafeUrl('vbscript:alert(1)', { allowExternal: true })).toBe(false)
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

    it('should reject truly malformed URLs', () => {
      // http:// has a valid scheme but no host — URL constructor throws
      expect(isSafeUrl('http://')).toBe(false)
    })

    it('should allow ambiguous strings that resolve safely as same-origin paths', () => {
      // The URL constructor resolves these as same-origin relative paths,
      // which is safe even if the input looks unusual.
      expect(isSafeUrl('not a url at all')).toBe(true)
      expect(isSafeUrl('://invalid')).toBe(true)
    })

    it('should reject URLs with leading backslashes that browsers normalize to protocol-relative paths', () => {
      expect(isSafeUrl('\\/example.com')).toBe(false)
      expect(isSafeUrl('\\\\example.com')).toBe(false)
      expect(isSafeUrl('\\/evil.com/steal')).toBe(false)
    })

    it('should reject URLs containing control characters before decoding', () => {
      expect(isSafeUrl('http://example.com/\x00')).toBe(false)
      expect(isSafeUrl('/path\x01with\x02control')).toBe(false)
      expect(isSafeUrl('/page\x0Dtest')).toBe(false)
      expect(isSafeUrl('/page\x0Atest')).toBe(false)
      expect(isSafeUrl('\x7F/delete-char')).toBe(false)
    })
  })

  describe('safeNavigate', () => {
    let originalLocation: Location

    beforeEach(() => {
      vi.clearAllMocks()
      originalLocation = window.location
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should navigate to safe relative URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigate('/')
      expect(result).toBe(true)
      expect(window.location.href).toBe('/')
    })

    it('should allow same-origin absolute URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigate('http://localhost/dashboard')
      expect(result).toBe(true)
      expect(mockLocation.href).toBe('http://localhost/dashboard')
    })

    it('should block navigation to external HTTPS URLs (prevents open redirect)', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      const result = safeNavigate('https://example.com')
      expect(result).toBe(false)
      expect(mockLocation.href).toBe('')
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Navigation blocked: URL failed security validation' }),
        { severity: 'medium', errorInfo: { reason: 'unsafe_url', urlPresent: true } },
        'navigation'
      )

      logErrorSpy.mockRestore()
    })

    it('should block navigation to javascript: URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      const result = safeNavigate('javascript:alert(1)')
      expect(result).toBe(false)
      expect(logErrorSpy).toHaveBeenCalled()

      logErrorSpy.mockRestore()
    })

    it('should return true for successful navigation', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigate('/about')
      expect(result).toBe(true)
    })

    it('should return false for blocked navigation', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      const result = safeNavigate('//evil.com')
      expect(result).toBe(false)

      logErrorSpy.mockRestore()
    })

    it('should log unsafe_url reason to monitoring for all blocked URL types', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      const blockedUrls = [
        'javascript:alert(1)',
        'data:text/html,<h1>xss</h1>',
        '//evil.com',
        'https://external.com',
      ]

      for (const url of blockedUrls) {
        logErrorSpy.mockClear()
        safeNavigate(url)
        expect(logErrorSpy).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Navigation blocked: URL failed security validation' }),
          expect.objectContaining({ errorInfo: { reason: 'unsafe_url', urlPresent: true } }),
          'navigation'
        )
      }

      logErrorSpy.mockRestore()
    })
  })
})
