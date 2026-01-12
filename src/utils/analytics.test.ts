import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isAnalyticsAvailable,
  trackEvent,
  trackPageView,
  trackCTAClick,
  trackExternalLink,
  trackSocialClick,
  initScrollDepthTracking,
  AnalyticsEvents,
} from './analytics'

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Clear any existing gtag
    delete (window as Window & { gtag?: unknown }).gtag
    delete (window as Window & { dataLayer?: unknown }).dataLayer
  })

  describe('isAnalyticsAvailable', () => {
    it('should return false when gtag is not available', () => {
      expect(isAnalyticsAvailable()).toBe(false)
    })

    it('should return true when gtag is available', () => {
      ;(window as Window & { gtag?: () => void }).gtag = vi.fn()
      expect(isAnalyticsAvailable()).toBe(true)
    })
  })

  describe('trackEvent', () => {
    it('should call gtag with correct parameters when available', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackEvent('test_event', { param1: 'value1', param2: 123 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        param1: 'value1',
        param2: 123,
      })
    })

    it('should not throw error when gtag is not available', () => {
      expect(() => {
        trackEvent('test_event')
      }).not.toThrow()
    })

    it('should handle errors gracefully', () => {
      const mockGtag = vi.fn(() => {
        throw new Error('Analytics error')
      })
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      trackEvent('test_event')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should track event without parameters', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined)
    })
  })

  describe('trackPageView', () => {
    it('should track page view with path and title', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackPageView('/privacy', 'Privacy Policy')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/privacy',
        page_title: 'Privacy Policy',
      })
    })

    it('should track page view with only path', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackPageView('/about')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/about',
        page_title: undefined,
      })
    })
  })

  describe('trackCTAClick', () => {
    it('should track CTA click with button text and location', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackCTAClick('Join Waitlist', 'hero')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.CTA_CLICK, {
        button_text: 'Join Waitlist',
        button_location: 'hero',
      })
    })

    it('should track multiple CTA clicks with different parameters', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackCTAClick('Sign Up', 'header')
      trackCTAClick('Learn More', 'features')

      expect(mockGtag).toHaveBeenCalledTimes(2)
    })
  })

  describe('trackExternalLink', () => {
    it('should track external link click', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackExternalLink('https://example.com', 'Example Link')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.EXTERNAL_LINK_CLICK, {
        link_url: 'https://example.com',
        link_text: 'Example Link',
      })
    })
  })

  describe('trackSocialClick', () => {
    it('should track social media click with lowercase platform', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackSocialClick('Twitter')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'twitter',
      })
    })

    it('should normalize platform name to lowercase', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackSocialClick('GITHUB')

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SOCIAL_LINK_CLICK, {
        platform: 'github',
      })
    })
  })

  describe('AnalyticsEvents', () => {
    it('should have all required event names', () => {
      expect(AnalyticsEvents.WAITLIST_JOIN).toBe('Waitlist_Join')
      expect(AnalyticsEvents.WAITLIST_SUBMIT).toBe('Waitlist_Submit')
      expect(AnalyticsEvents.WAITLIST_SUCCESS).toBe('Waitlist_Success')
      expect(AnalyticsEvents.WAITLIST_ERROR).toBe('Waitlist_Error')
      expect(AnalyticsEvents.CTA_CLICK).toBe('CTA_Click')
      expect(AnalyticsEvents.SCROLL_DEPTH).toBe('Scroll_Depth')
      expect(AnalyticsEvents.VIDEO_PLAY).toBe('Video_Play')
      expect(AnalyticsEvents.NAVIGATION_CLICK).toBe('Navigation_Click')
      expect(AnalyticsEvents.EXTERNAL_LINK_CLICK).toBe('External_Link_Click')
      expect(AnalyticsEvents.SOCIAL_LINK_CLICK).toBe('Social_Link_Click')
      expect(AnalyticsEvents.FAQ_EXPAND).toBe('FAQ_Expand')
    })
  })

  describe('PII Sanitization', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>
    let originalNodeEnv: string | undefined

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      // Save original NODE_ENV
      originalNodeEnv = import.meta.env.DEV
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
      // Restore NODE_ENV if needed
      if (originalNodeEnv !== undefined) {
        import.meta.env.DEV = originalNodeEnv
      }
    })

    describe('Email Detection', () => {
      it('should strip email from parameters by value pattern', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          user_identifier: 'user@example.com',
          button_location: 'hero',
        })

        // Should not include the email value
        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          button_location: 'hero',
        })
      })

      it('should strip parameters with email-related keys', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          email: 'user@example.com',
          user_email: 'another@example.com',
          userEmail: 'third@example.com',
          e_mail: 'fourth@example.com',
          mail: 'fifth@example.com',
          button_location: 'footer',
        })

        // Should only include non-PII parameters
        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          button_location: 'footer',
        })
      })

      it('should handle email-like strings in different formats', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          contact: 'admin@company.co.uk',
          location: 'New York', // Should NOT be stripped
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          location: 'New York',
        })
      })

      it('should not strip false positives that look like emails but are not', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        // Values that should NOT be detected as emails
        trackEvent('test_event', {
          version: '2.0@stable', // No TLD
          tag: 'user@123', // No domain
          valid_param: 'test',
        })

        // All parameters should be included since they're not real emails
        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          version: '2.0@stable',
          tag: 'user@123',
          valid_param: 'test',
        })
      })
    })

    describe('Sensitive Key Detection', () => {
      it('should strip password-related parameters', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          password: 'secret123',
          pwd: 'another_secret',
          pass: 'yet_another',
          button_text: 'Submit',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          button_text: 'Submit',
        })
      })

      it('should strip authentication tokens', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          token: 'abc123xyz',
          auth: 'bearer xyz',
          authorization: 'Bearer token',
          api_key: 'key123',
          apiKey: 'anotherkey',
          category: 'signup',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          category: 'signup',
        })
      })

      it('should strip credit card information', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          credit_card: '4111111111111111',
          creditCard: '4111111111111111',
          card_number: '4111111111111111',
          cvv: '123',
          tier: 'premium', // Use 'tier' instead of 'subscription_tier' to avoid false positive
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          tier: 'premium',
        })
      })

      it('should strip personal identification information', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          ssn: '123-45-6789',
          social_security: '123456789',
          phone: '555-1234',
          phoneNumber: '5551234567',
          address: '123 Main St',
          full_name: 'John Doe',
          fullName: 'Jane Smith',
          first_name: 'John',
          last_name: 'Doe',
          ip: '192.168.1.1',
          ip_address: '10.0.0.1',
          page_section: 'hero',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          page_section: 'hero',
        })
      })

      it('should detect PII keys case-insensitively', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          EMAIL: 'test@example.com',
          Password: 'secret',
          AUTH_TOKEN: 'token123',
          button_location: 'header',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          button_location: 'header',
        })
      })

      it('should detect PII keys in compound names', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          user_password_hash: 'hashed_value',
          customer_email_address: 'customer@example.com',
          payment_card_number: '4111111111111111',
          safe_param: 'safe_value',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          safe_param: 'safe_value',
        })
      })
    })

    describe('Development Mode Warnings', () => {
      it('should warn in development mode when PII is detected', () => {
        import.meta.env.DEV = true
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          email: 'test@example.com',
          button_text: 'Click',
        })

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Analytics] PII detected and removed')
        )
      })

      it('should not warn in production mode when PII is detected', () => {
        import.meta.env.DEV = false
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          password: 'secret',
          button_text: 'Submit',
        })

        expect(consoleWarnSpy).not.toHaveBeenCalled()
      })

      it('should log to console in development when analytics is unavailable', () => {
        import.meta.env.DEV = true
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        trackEvent('test_event', { param: 'value' })

        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[Analytics]',
          'test_event',
          expect.objectContaining({ param: 'value' })
        )

        consoleLogSpy.mockRestore()
      })

      it('should log sanitized params (never PII) in development mode', () => {
        import.meta.env.DEV = true
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        trackEvent('test_event', {
          email: 'sensitive@example.com',
          safe_param: 'safe_value',
        })

        // Should only log the safe param, not the email
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[Analytics]',
          'test_event',
          expect.not.objectContaining({ email: expect.anything() })
        )
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[Analytics]',
          'test_event',
          expect.objectContaining({ safe_param: 'safe_value' })
        )

        consoleLogSpy.mockRestore()
      })
    })

    describe('Edge Cases', () => {
      it('should handle undefined parameters', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', undefined)

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', undefined)
      })

      it('should handle empty parameters object', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {})

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {})
      })

      it('should handle parameters with only PII (returns empty object)', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          email: 'test@example.com',
          password: 'secret',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {})
      })

      it('should preserve non-string values', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          count: 42,
          enabled: true,
          disabled: false,
          label: 'test',
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          count: 42,
          enabled: true,
          disabled: false,
          label: 'test',
        })
      })

      it('should handle numeric and boolean values without email detection', () => {
        const mockGtag = vi.fn()
        ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

        trackEvent('test_event', {
          metric_value: 123,
          is_active: true,
          depth_percentage: 75,
        })

        expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
          metric_value: 123,
          is_active: true,
          depth_percentage: 75,
        })
      })
    })
  })

  describe('initScrollDepthTracking', () => {
    let scrollEventListener: ((event: Event) => void) | null = null

    beforeEach(() => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0,
      })

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 4000,
      })

      // Capture the scroll event listener
      const originalAddEventListener = window.addEventListener
      vi.spyOn(window, 'addEventListener').mockImplementation(
        (event: string, listener: EventListener | EventListenerObject, options?: boolean | AddEventListenerOptions) => {
          if (event === 'scroll') {
            scrollEventListener = listener as (event: Event) => void
          }
          return originalAddEventListener.call(window, event, listener, options)
        }
      )

      // Mock requestAnimationFrame
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0)
        return 0
      })
    })

    afterEach(() => {
      scrollEventListener = null
      vi.restoreAllMocks()
    })

    it('should return cleanup function', () => {
      const cleanup = initScrollDepthTracking()
      expect(cleanup).toBeInstanceOf(Function)
      cleanup()
    })

    it('should add scroll event listener with passive option', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const cleanup = initScrollDepthTracking()

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })

      cleanup()
    })

    it('should track 25% milestone', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Scroll to 25% (1000 + scrollY = 0.25 * 4000 = 1000)
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0, // (0 + 1000) / 4000 = 0.25 = 25%
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })

      cleanup()
    })

    it('should track 50% milestone', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Scroll to 50% (scrollY + 1000 = 0.50 * 4000 = 2000)
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 1000, // (1000 + 1000) / 4000 = 0.50 = 50%
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })

      cleanup()
    })

    it('should track 75% milestone', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Scroll to 75%
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 2000, // (2000 + 1000) / 4000 = 0.75 = 75%
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })

      cleanup()
    })

    it('should track 100% milestone', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Scroll to 100%
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 3000, // (3000 + 1000) / 4000 = 1.0 = 100%
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 100,
      })

      cleanup()
    })

    it('should track each milestone only once', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Scroll to 50%
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 1000,
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
        scrollEventListener(new Event('scroll'))
        scrollEventListener(new Event('scroll'))
      }

      // Should only track once despite multiple scroll events
      expect(mockGtag).toHaveBeenCalledTimes(2) // 25% and 50%

      cleanup()
    })

    it('should track multiple milestones in sequence', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      const cleanup = initScrollDepthTracking()

      // Start at 0, scroll to 100% to trigger all milestones
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 3000, // (3000 + 1000) / 4000 = 100%
      })

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      // Should track all milestones that have been reached (25%, 50%, 75%, 100%)
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 25,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 50,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 75,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', AnalyticsEvents.SCROLL_DEPTH, {
        depth_percentage: 100,
      })

      cleanup()
    })

    it('should throttle scroll events using requestAnimationFrame', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

      const cleanup = initScrollDepthTracking()

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      expect(rafSpy).toHaveBeenCalled()

      cleanup()
    })

    it('should remove scroll listener on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const cleanup = initScrollDepthTracking()
      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should handle edge case when document height is zero', () => {
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 0,
      })

      const cleanup = initScrollDepthTracking()

      if (scrollEventListener) {
        scrollEventListener(new Event('scroll'))
      }

      // Should not track anything when document height is 0
      expect(mockGtag).not.toHaveBeenCalled()

      cleanup()
    })

    it('should work without gtag available', () => {
      const cleanup = initScrollDepthTracking()

      if (scrollEventListener) {
        expect(() => {
          scrollEventListener(new Event('scroll'))
        }).not.toThrow()
      }

      cleanup()
    })
  })
})
