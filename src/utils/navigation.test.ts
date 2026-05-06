import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scrollToSection,
  _clearPendingScrollObservers,
  isSafeUrl,
  safeNavigate,
  safeNavigateExternal,
} from './navigation'

describe('navigation utilities', () => {
  describe('scrollToSection', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      // Cancel any MutationObservers left pending when a section ID wasn't found
      _clearPendingScrollObservers()
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

    it('should reject backslash-based protocol-relative URLs', () => {
      // Browsers like Chrome and Safari treat backslashes as forward slashes
      expect(isSafeUrl(String.raw`\\example.com`)).toBe(false)
      expect(isSafeUrl(String.raw`\\evil.com/path`)).toBe(false)
    })

    it('should reject mixed slash combinations', () => {
      // Mixed slash combinations can bypass naive validation
      expect(isSafeUrl(String.raw`/\example.com`)).toBe(false)
      expect(isSafeUrl(String.raw`/\evil.com/path`)).toBe(false)
    })

    it('should reject encoded backslash bypasses', () => {
      // URL-encoded backslashes can bypass validation if not properly decoded
      expect(isSafeUrl('/%5C%5Cexample.com')).toBe(false)
      expect(isSafeUrl('/%5C%5Cevil.com/path')).toBe(false)
      expect(isSafeUrl('/%5c%5cexample.com')).toBe(false) // lowercase encoding
      expect(isSafeUrl('/%5Cexample.com')).toBe(false)
    })

    it('should reject external HTTP/HTTPS URLs by default (prevents open redirect)', () => {
      expect(isSafeUrl('http://example.com')).toBe(false)
      expect(isSafeUrl('https://example.com/page')).toBe(false)
      expect(isSafeUrl('https://github.com')).toBe(false)
    })

    it('should allow external HTTP/HTTPS URLs when allowExternal is true', () => {
      expect(isSafeUrl('http://example.com', true)).toBe(true)
      expect(isSafeUrl('https://example.com/page', true)).toBe(true)
      expect(isSafeUrl('https://github.com', true)).toBe(true)
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
      const currentOrigin = globalThis.location.origin
      expect(isSafeUrl(currentOrigin)).toBe(true)
      expect(isSafeUrl(`${currentOrigin}/`)).toBe(true)
      expect(isSafeUrl(`${currentOrigin}/page`)).toBe(true)
    })

    it('should handle malformed or ambiguous URLs safely', () => {
      const result1 = isSafeUrl('not a url at all')
      const result2 = isSafeUrl('http://')
      const result3 = isSafeUrl('://invalid')

      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
      expect(typeof result3).toBe('boolean')
    })
  })

  describe('safeNavigate', () => {
    let originalLocation: Location

    beforeEach(() => {
      vi.clearAllMocks()
      originalLocation = globalThis.location
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    function mockLocation(overrides: Partial<Location> = {}) {
      const mock = { href: '', origin: 'http://localhost', ...overrides } as Location
      Object.defineProperty(window, 'location', {
        value: mock,
        writable: true,
        configurable: true,
      })
      return mock
    }

    // --- Relative URLs ---

    it('should navigate to root-relative URL', () => {
      const mock = mockLocation()
      expect(safeNavigate('/')).toBe(true)
      expect(mock.href).toBe('/')
    })

    it('should navigate to a relative path', () => {
      const mock = mockLocation()
      expect(safeNavigate('/about')).toBe(true)
      expect(mock.href).toBe('/about')
    })

    it('should navigate to dot-relative URLs', () => {
      const mock = mockLocation()
      expect(safeNavigate('./page')).toBe(true)
      expect(mock.href).toBe('./page')
    })

    it('should navigate to parent-relative URLs', () => {
      const mock = mockLocation()
      expect(safeNavigate('../page')).toBe(true)
      expect(mock.href).toBe('../page')
    })

    it('should navigate to relative URL with query and fragment', () => {
      const mock = mockLocation()
      expect(safeNavigate('/search?q=test#results')).toBe(true)
      expect(mock.href).toBe('/search?q=test#results')
    })

    // --- HTTPS URLs ---

    it('should block navigation to external HTTPS URLs (prevents open redirect)', () => {
      const mock = mockLocation()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      expect(safeNavigate('https://example.com')).toBe(false)
      expect(mock.href).toBe('')
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })

    it('should block navigation to external HTTPS URLs with path (prevents open redirect)', () => {
      const mock = mockLocation()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      expect(safeNavigate('https://example.com/page?key=val')).toBe(false)
      expect(mock.href).toBe('')
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })

    it('should block navigation to external HTTP URLs (prevents open redirect)', () => {
      const mock = mockLocation()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      expect(safeNavigate('http://example.com')).toBe(false)
      expect(mock.href).toBe('')
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })

    // --- javascript: protocol ---

    it('should block javascript:alert(1)', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('javascript:alert(1)')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should block javascript:void(0)', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('javascript:void(0)')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should block case-variant JavaScript: URLs', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('JaVaScRiPt:alert(1)')).toBe(false)
      warnSpy.mockRestore()
    })

    // --- data: protocol ---

    it('should block data:text/html payloads', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('data:text/html,<script>alert(1)</script>')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should block data:text/plain', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('data:text/plain;base64,SGVsbG8=')).toBe(false)
      warnSpy.mockRestore()
    })

    // --- Other dangerous protocols ---

    it('should block vbscript: URLs', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('vbscript:MsgBox("XSS")')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should block protocol-relative URLs', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('//evil.com')).toBe(false)
      warnSpy.mockRestore()
    })

    // --- Edge cases ---

    it('should block empty string', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should block whitespace-only string', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('   ')).toBe(false)
      warnSpy.mockRestore()
    })

    it('should not modify location.href when navigation is blocked', () => {
      const mock = mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      safeNavigate('javascript:alert(1)')
      expect(mock.href).toBe('')
      warnSpy.mockRestore()
    })

    it('should return true for successful navigation', () => {
      mockLocation()
      expect(safeNavigate('/about')).toBe(true)
    })

    it('should return false for blocked navigation', () => {
      mockLocation()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(safeNavigate('//evil.com')).toBe(false)
      warnSpy.mockRestore()
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

  describe('safeNavigateExternal', () => {
    let originalLocation: Location

    beforeEach(() => {
      vi.clearAllMocks()
      originalLocation = globalThis.location
    })

    it('should allow navigation to external HTTPS URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigateExternal('https://example.com')
      expect(result).toBe(true)
      expect(mockLocation.href).toBe('https://example.com')

      // Restore globalThis.location
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should allow navigation to external HTTP URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const result = safeNavigateExternal('http://example.com/page')
      expect(result).toBe(true)
      expect(mockLocation.href).toBe('http://example.com/page')

      // Restore globalThis.location
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should block navigation to javascript: URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = safeNavigateExternal('javascript:alert(1)')
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
      // Restore globalThis.location
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should block navigation to data: URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = safeNavigateExternal('data:text/html,<script>alert(1)</script>')
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(mockLocation.href).toBe('')

      consoleWarnSpy.mockRestore()
      // Restore globalThis.location
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should block navigation to protocol-relative URLs', () => {
      const mockLocation = { href: '', origin: 'http://localhost' } as Location
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = safeNavigateExternal('//evil.com')
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(mockLocation.href).toBe('')

      consoleWarnSpy.mockRestore()
      // Restore globalThis.location
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('should return false in SSR environment', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error - Testing SSR environment
      delete globalThis.window

      const result = safeNavigateExternal('https://example.com')
      expect(result).toBe(false)

      // Restore window
      globalThis.window = originalWindow
    })
  })
})
