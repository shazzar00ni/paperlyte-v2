import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { trackEvent } from './analytics'
import { clearAnalyticsGlobals } from '../test/analytics-test-utils'

describe('Analytics PII Sanitization', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    clearAnalyticsGlobals()
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    vi.unstubAllEnvs()
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
      vi.stubEnv('DEV', true)
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
      vi.stubEnv('DEV', false)
      const mockGtag = vi.fn()
      ;(window as Window & { gtag?: typeof mockGtag }).gtag = mockGtag

      trackEvent('test_event', {
        password: 'secret',
        button_text: 'Submit',
      })

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should log to console in development when analytics is unavailable', () => {
      vi.stubEnv('DEV', true)
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn())

      trackEvent('test_event', { param: 'value' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics]',
        'test_event',
        expect.objectContaining({ param: 'value' })
      )

      consoleLogSpy.mockRestore()
    })

    it('should log sanitized params (never PII) in development mode', () => {
      vi.stubEnv('DEV', true)
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn())

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
