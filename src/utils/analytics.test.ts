import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analytics, trackEvent, trackPageView } from './analytics'

// Extend Window interface for analytics globals
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void
  }
}

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Clear analytics globals
    delete window.gtag
    delete window.dataLayer
    delete window.plausible

    // Reset analytics initialized state
    // @ts-expect-error - accessing private property for testing
    analytics.initialized = false

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Analytics Initialization', () => {
    it('should not throw error when initializing', () => {
      expect(() => analytics.init()).not.toThrow()
    })

    it('should only initialize once', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      analytics.init()
      const firstCallCount = consoleSpy.mock.calls.length

      analytics.init()
      const secondCallCount = consoleSpy.mock.calls.length

      // Should not log additional times on second init
      expect(secondCallCount).toBe(firstCallCount)
    })
  })

  describe('trackEvent', () => {
    it('should not throw error when analytics is disabled', () => {
      expect(() => {
        trackEvent('test_event')
      }).not.toThrow()
    })

    it('should not throw error with parameters', () => {
      expect(() => {
        trackEvent('test_event', { param1: 'value1', param2: 123 })
      }).not.toThrow()
    })

    it('should track event with GA4 when gtag is available', () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      trackEvent('test_event', { param1: 'value1', param2: 123 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        param1: 'value1',
        param2: 123,
      })
    })

    it('should track event with Plausible when plausible is available', () => {
      const mockPlausible = vi.fn()
      window.plausible = mockPlausible

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'plausible',
        siteId: 'example.com',
        enabled: true,
      }

      trackEvent('test_event', { param1: 'value1' })

      expect(mockPlausible).toHaveBeenCalledWith('test_event', {
        props: { param1: 'value1' },
      })
    })

    it('should handle events without parameters', () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined)
    })
  })

  describe('trackPageView', () => {
    it('should not throw error when analytics is disabled', () => {
      expect(() => {
        trackPageView('/test-page')
      }).not.toThrow()
    })

    it('should track page view with GA4 when gtag is available', () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      trackPageView('/test-page')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test-page',
      })
    })

    it('should track page view with Plausible when plausible is available', () => {
      const mockPlausible = vi.fn()
      window.plausible = mockPlausible

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'plausible',
        siteId: 'example.com',
        enabled: true,
      }

      trackPageView()

      // Should pass pageview event with page_path in props
      expect(mockPlausible).toHaveBeenCalledWith('pageview', {
        props: {
          page_path: window.location.pathname + window.location.search,
        },
      })
    })

    it('should use current URL when no URL provided with GA4', () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      trackPageView()

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: expect.any(String),
      })
    })

    it('should not call gtag when analytics is disabled', () => {
      const mockGtag = vi.fn()
      window.gtag = mockGtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'none',
        enabled: false,
      }

      trackPageView('/test')

      expect(mockGtag).not.toHaveBeenCalled()
    })
  })

  describe('GA4 Integration', () => {
    it('should initialize GA4 with privacy settings', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => null as unknown as Node)

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      // @ts-expect-error - calling private method for testing
      analytics.initGA4()

      expect(appendChildSpy).toHaveBeenCalled()
      expect(window.dataLayer).toBeDefined()
      expect(window.gtag).toBeDefined()

      // Verify privacy config was set
      expect(window.dataLayer).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['config', 'G-XXXXXXXXXX'])
        ])
      )

      appendChildSpy.mockRestore()
    })

    it('should load gtag script with correct source', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => null as unknown as Node)

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      // @ts-expect-error - calling private method for testing
      analytics.initGA4()

      const scriptElement = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptElement.tagName).toBe('SCRIPT')
      expect(scriptElement.src).toContain('googletagmanager.com/gtag/js')
      expect(scriptElement.src).toContain('G-XXXXXXXXXX')

      appendChildSpy.mockRestore()
    })
  })

  describe('Plausible Integration', () => {
    it('should initialize Plausible with correct configuration', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => null as unknown as Node)

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'plausible',
        siteId: 'example.com',
        enabled: true,
      }

      // @ts-expect-error - calling private method for testing
      analytics.initPlausible()

      expect(appendChildSpy).toHaveBeenCalled()
      const scriptElement = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
      expect(scriptElement.tagName).toBe('SCRIPT')
      expect(scriptElement.src).toContain('plausible.io')
      expect(scriptElement.dataset.domain).toBe('example.com')

      appendChildSpy.mockRestore()
    })

    it('should warn when Plausible site ID is not configured', () => {
      const warnSpy = vi.spyOn(console, 'warn')

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'plausible',
        siteId: undefined,
        enabled: true,
      }

      // @ts-expect-error - calling private method for testing
      analytics.initPlausible()

      expect(warnSpy).toHaveBeenCalledWith('Analytics: Plausible site ID not configured')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing gtag gracefully', () => {
      delete window.gtag

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'ga4',
        siteId: 'G-XXXXXXXXXX',
        enabled: true,
      }

      expect(() => trackEvent('test')).not.toThrow()
      expect(() => trackPageView('/test')).not.toThrow()
    })

    it('should handle missing plausible gracefully', () => {
      delete window.plausible

      // @ts-expect-error - setting private property for testing
      analytics.config = {
        provider: 'plausible',
        siteId: 'example.com',
        enabled: true,
      }

      expect(() => trackEvent('test')).not.toThrow()
      expect(() => trackPageView()).not.toThrow()
    })
  })
})
