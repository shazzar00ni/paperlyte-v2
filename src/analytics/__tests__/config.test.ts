/**
 * Tests for analytics configuration
 *
 * Tests getAnalyticsConfig() and isAnalyticsEnabled() with various
 * environment variable combinations and validates provider type handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getAnalyticsConfig, isAnalyticsEnabled } from '../config'
import { mockEnv } from '../../test/analytics-helpers'

describe('Analytics Configuration', () => {
  let restoreEnv: (() => void) | null = null

  afterEach(() => {
    // Restore original environment
    if (restoreEnv) {
      restoreEnv()
      restoreEnv = null
    }
  })

  describe('getAnalyticsConfig', () => {
    it('should return null when domain is not set', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: '',
        VITE_ANALYTICS_PROVIDER: 'plausible',
      })

      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should return null when analytics is explicitly disabled', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'false',
      })

      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should return null in development mode by default', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: false,
        DEV: true,
      })

      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should return config in production mode by default', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: true,
        DEV: false,
      })

      const config = getAnalyticsConfig()
      expect(config).not.toBeNull()
      expect(config?.domain).toBe('test.example.com')
    })

    it('should enable analytics when explicitly set to true in development', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'true',
        PROD: false,
        DEV: true,
      })

      const config = getAnalyticsConfig()
      expect(config).not.toBeNull()
      expect(config?.domain).toBe('test.example.com')
    })

    it('should use default provider when not specified', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('plausible')
    })

    it('should use specified provider', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_PROVIDER: 'fathom',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('fathom')
    })

    it('should fallback to plausible for invalid provider', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_PROVIDER: 'invalid-provider',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('plausible')
    })

    it('should validate all supported providers', () => {
      const providers = ['plausible', 'fathom', 'umami', 'simple', 'custom']

      providers.forEach((provider) => {
        restoreEnv = mockEnv({
          VITE_ANALYTICS_DOMAIN: 'test.example.com',
          VITE_ANALYTICS_PROVIDER: provider,
          VITE_ANALYTICS_ENABLED: 'true',
        })

        const config = getAnalyticsConfig()
        expect(config?.provider).toBe(provider)

        // Clean up for next iteration
        restoreEnv()
        restoreEnv = null
      })
    })

    it('should use custom script URL when provided', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_SCRIPT_URL: 'https://custom.domain.com/script.js',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.scriptUrl).toBe('https://custom.domain.com/script.js')
    })

    it('should enable debug mode when explicitly set', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_DEBUG: 'true',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(true)
    })

    it('should enable debug mode in development by default', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'true',
        DEV: true,
        PROD: false,
      })

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(true)
    })

    it('should disable debug mode when explicitly set to false in development', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_DEBUG: 'false',
        VITE_ANALYTICS_ENABLED: 'true',
        DEV: true,
        PROD: false,
      })

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(false)
    })

    it('should disable debug mode in production by default', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: true,
        DEV: false,
      })

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(false)
    })

    it('should set default tracking options', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()
      expect(config?.trackPageviews).toBe(true)
      expect(config?.trackWebVitals).toBe(true)
      expect(config?.trackScrollDepth).toBe(true)
      expect(config?.respectDNT).toBe(true)
    })

    it('should handle missing environment variables gracefully', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: true,
        DEV: false,
      })

      const config = getAnalyticsConfig()
      expect(config).not.toBeNull()
      expect(config?.provider).toBe('plausible')
      expect(config?.debug).toBe(false)
    })

    it('should return complete config object with all required fields', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_PROVIDER: 'plausible',
        VITE_ANALYTICS_SCRIPT_URL: 'https://plausible.io/js/script.js',
        VITE_ANALYTICS_DEBUG: 'true',
        VITE_ANALYTICS_ENABLED: 'true',
      })

      const config = getAnalyticsConfig()

      expect(config).toMatchObject({
        provider: 'plausible',
        domain: 'test.example.com',
        scriptUrl: 'https://plausible.io/js/script.js',
        debug: true,
        trackPageviews: true,
        trackWebVitals: true,
        trackScrollDepth: true,
        respectDNT: true,
      })
    })
  })

  describe('isAnalyticsEnabled', () => {
    it('should return false when domain is not set', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: '',
      })

      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('should return false when analytics is explicitly disabled', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'false',
      })

      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('should return false in development mode by default', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: false,
        DEV: true,
      })

      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('should return true in production mode with domain set', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        PROD: true,
        DEV: false,
      })

      expect(isAnalyticsEnabled()).toBe(true)
    })

    it('should return true when explicitly enabled in development', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'true',
        PROD: false,
        DEV: true,
      })

      expect(isAnalyticsEnabled()).toBe(true)
    })

    it('should return false when explicitly disabled in production', () => {
      restoreEnv = mockEnv({
        VITE_ANALYTICS_DOMAIN: 'test.example.com',
        VITE_ANALYTICS_ENABLED: 'false',
        PROD: true,
        DEV: false,
      })

      expect(isAnalyticsEnabled()).toBe(false)
    })
  })
})
