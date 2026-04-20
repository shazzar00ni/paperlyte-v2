import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scrollToSection,
  isSafeUrl,
  safeNavigate,
  hasDangerousProtocol,
  isRelativeUrl,
  isAllowedAbsoluteUrl,
} from './navigation'
import * as monitoring from './monitoring'

describe('navigation utilities', () => {
  describe('scrollToSection', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should scroll to element when it exists', () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'test-section'
      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      document.body.appendChild(mockElement)

      scrollToSection('test-section')

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

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

  describe('hasDangerousProtocol', () => {
    it('should detect javascript: protocol', () => {
      expect(hasDangerousProtocol('javascript:alert(1)')).toBe(true)
      expect(hasDangerousProtocol('javascript:void(0)')).toBe(true)
    })

    it('should detect data: protocol', () => {
      expect(hasDangerousProtocol('data:text/html,<script>alert(1)</script>')).toBe(true)
    })

    it('should detect vbscript:, file:, and about: protocols', () => {
      expect(hasDangerousProtocol('vbscript:alert(1)')).toBe(true)
      expect(hasDangerousProtocol('file:///etc/passwd')).toBe(true)
      expect(hasDangerousProtocol('about:blank')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(hasDangerousProtocol('JavaScript:alert(1)')).toBe(true)
      expect(hasDangerousProtocol('JAVASCRIPT:alert(1)')).toBe(true)
      expect(hasDangerousProtocol('DATA:text/html')).toBe(true)
    })

    it('should detect whitespace-obfuscated protocols', () => {
      expect(hasDangerousProtocol('javascript :alert(1)')).toBe(true)
    })

    it('should detect percent-encoded protocols', () => {
      expect(hasDangerousProtocol('java%73cript:alert(1)')).toBe(true)
      expect(hasDangerousProtocol('%6A%61%76%61%73%63%72%69%70%74:alert(1)')).toBe(true)
    })

    it('should not flag non-percent-encoded strings as dangerous', () => {
      // %ZZ is not valid percent-encoding, so no decode attempt is made
      expect(hasDangerousProtocol('%ZZ%ZZ:alert(1)')).toBe(false)
    })

    it('should allow safe protocols', () => {
      expect(hasDangerousProtocol('https://example.com')).toBe(false)
      expect(hasDangerousProtocol('http://example.com')).toBe(false)
    })

    it('should allow strings with no protocol', () => {
      expect(hasDangerousProtocol('/relative/path')).toBe(false)
      expect(hasDangerousProtocol('./local')).toBe(false)
    })
  })

  describe('isRelativeUrl', () => {
    it('should accept slash-relative URLs', () => {
      expect(isRelativeUrl('/')).toBe(true)
      expect(isRelativeUrl('/about')).toBe(true)
      expect(isRelativeUrl('/path/to/page')).toBe(true)
    })

    it('should accept dot-relative URLs', () => {
      expect(isRelativeUrl('./')).toBe(true)
      expect(isRelativeUrl('./page')).toBe(true)
      expect(isRelativeUrl('../')).toBe(true)
      expect(isRelativeUrl('../page')).toBe(true)
    })

    it('should reject protocol-relative URLs', () => {
      expect(isRelativeUrl('//evil.com')).toBe(false)
    })

    it('should reject relative paths with embedded protocol injection', () => {
      expect(isRelativeUrl('/path/with://protocol')).toBe(false)
      expect(isRelativeUrl('./foo://bar')).toBe(false)
    })

    it('should reject absolute URLs', () => {
      expect(isRelativeUrl('https://example.com')).toBe(false)
      expect(isRelativeUrl('http://example.com')).toBe(false)
    })
  })

  describe('isAllowedAbsoluteUrl', () => {
    it('should allow http: URLs', () => {
      expect(isAllowedAbsoluteUrl('http://example.com')).toBe(true)
    })

    it('should allow https: URLs', () => {
      expect(isAllowedAbsoluteUrl('https://example.com')).toBe(true)
      expect(isAllowedAbsoluteUrl('https://github.com/path')).toBe(true)
    })

    it('should allow same-origin URLs', () => {
      const currentOrigin = window.location.origin
      expect(isAllowedAbsoluteUrl(`${currentOrigin}/page`)).toBe(true)
    })

    it('should reject unparseable URLs', () => {
      // URL constructor with an invalid absolute URL and no valid base
      // will throw — isAllowedAbsoluteUrl catches this and returns false.
      // However, with a base (window.location.origin), most strings parse.
      // We rely on the outer isSafeUrl checks for those cases.
      expect(isAllowedAbsoluteUrl('http://')).toBe(false)
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
      // even though isRelativeUrl conservatively rejects them.
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

    function mockWindowLocation(overrides: Partial<Location> = {}) {
      const mock = { href: '', origin: 'http://localhost', assign: vi.fn((url: string) => { mock.href = url }) , ...overrides } as unknown as Location
      Object.defineProperty(window, 'location', {
        value: mock,
        writable: true,
        configurable: true,
      })
      return mock
    }

    // --- Relative URLs ---

    it('should navigate to root-relative URL', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('/')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('/')
    })

    it('should navigate to a relative path', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('/about')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('/about')
    })

    it('should navigate to dot-relative URLs', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('./page')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('./page')
    })

    it('should navigate to parent-relative URLs', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('../page')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('../page')
    })

    it('should navigate to relative URL with query and fragment', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('/search?q=test#results')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('/search?q=test#results')
    })

    // --- Same-origin absolute URLs ---

    it('should allow same-origin absolute URLs', () => {
      const mock = mockWindowLocation()
      expect(safeNavigate('http://localhost/dashboard')).toBe(true)
      expect(mock.assign).toHaveBeenCalledWith('http://localhost/dashboard')
    })

    // --- External URLs blocked (prevents open redirect) ---

    it('should block navigation to external HTTPS URLs (prevents open redirect)', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      expect(safeNavigate('https://example.com')).toBe(false)
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Navigation blocked: URL failed security validation' }),
        { severity: 'medium', errorInfo: { reason: 'unsafe_url', urlPresent: true } },
        'navigation'
      )

      logErrorSpy.mockRestore()
    })

    it('should block navigation to external HTTP URLs', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})

      expect(safeNavigate('http://example.com')).toBe(false)

      logErrorSpy.mockRestore()
    })

    // --- javascript: protocol ---

    it('should block javascript:alert(1)', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('javascript:alert(1)')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should block javascript:void(0)', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('javascript:void(0)')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should block case-variant JavaScript: URLs', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('JaVaScRiPt:alert(1)')).toBe(false)
      logErrorSpy.mockRestore()
    })

    // --- data: protocol ---

    it('should block data:text/html payloads', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('data:text/html,<script>alert(1)</script>')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should block data:text/plain', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('data:text/plain;base64,SGVsbG8=')).toBe(false)
      logErrorSpy.mockRestore()
    })

    // --- Other dangerous protocols ---

    it('should block vbscript: URLs', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('vbscript:MsgBox("XSS")')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should block protocol-relative URLs', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('//evil.com')).toBe(false)
      logErrorSpy.mockRestore()
    })

    // --- Edge cases ---

    it('should block empty string', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should block whitespace-only string', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('   ')).toBe(false)
      logErrorSpy.mockRestore()
    })

    it('should not call assign when navigation is blocked', () => {
      const mock = mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      safeNavigate('javascript:alert(1)')
      expect(mock.assign).not.toHaveBeenCalled()
      logErrorSpy.mockRestore()
    })

    it('should return true for successful navigation', () => {
      mockWindowLocation()
      expect(safeNavigate('/about')).toBe(true)
    })

    it('should return false for blocked navigation', () => {
      mockWindowLocation()
      const logErrorSpy = vi.spyOn(monitoring, 'logError').mockImplementation(() => {})
      expect(safeNavigate('//evil.com')).toBe(false)
      logErrorSpy.mockRestore()
    })

    // --- Monitoring integration ---

    it('should log unsafe_url reason to monitoring for all blocked URL types', () => {
      mockWindowLocation()
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

    // --- SSR ---

    it('should return false during server-side rendering when window is undefined', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error -- simulate SSR by removing window
      delete globalThis.window

      try {
        expect(safeNavigate('/dashboard')).toBe(false)
        expect(safeNavigate('https://example.com')).toBe(false)
      } finally {
        globalThis.window = originalWindow
      }
    })
  })
})
