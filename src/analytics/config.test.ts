/**
 * Tests for analytics configuration module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAnalyticsConfig, isAnalyticsEnabled } from './config'

describe('analytics/config', () => {
  beforeEach(() => {
    // Reset environment before each test
    vi.stubEnv('VITE_ANALYTICS_ENABLED', undefined)
    vi.stubEnv('VITE_ANALYTICS_PROVIDER', undefined)
    vi.stubEnv('VITE_ANALYTICS_DOMAIN', undefined)
    vi.stubEnv('VITE_ANALYTICS_SCRIPT_URL', undefined)
    vi.stubEnv('VITE_ANALYTICS_DEBUG', undefined)
    vi.stubEnv('PROD', false)
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    // Restore original environment
    vi.unstubAllEnvs()
  })

  describe('getAnalyticsConfig', () => {
    it('should return null when no domain is provided', () => {
      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should return null when analytics is explicitly disabled', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'false')

      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should return config when analytics is explicitly enabled with domain', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')

      const config = getAnalyticsConfig()
      expect(config).not.toBeNull()
      expect(config?.domain).toBe('example.com')
    })

    it('should default to plausible provider', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('plausible')
    })

    it('should use specified provider when valid', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_ANALYTICS_PROVIDER', 'fathom')

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('fathom')
    })

    it('should fallback to plausible for invalid provider', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_ANALYTICS_PROVIDER', 'invalid-provider')

      const config = getAnalyticsConfig()
      expect(config?.provider).toBe('plausible')
    })

    it('should include custom script URL when provided', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_ANALYTICS_SCRIPT_URL', 'https://custom.analytics.com/script.js')

      const config = getAnalyticsConfig()
      expect(config?.scriptUrl).toBe('https://custom.analytics.com/script.js')
    })

    it('should enable debug mode when explicitly set to true', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_ANALYTICS_DEBUG', 'true')

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(true)
    })

    it('should enable debug mode in development by default', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('DEV', true)

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(true)
    })

    it('should disable debug mode when explicitly set to false in dev', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_ANALYTICS_DEBUG', 'false')
      vi.stubEnv('DEV', true)

      const config = getAnalyticsConfig()
      expect(config?.debug).toBe(false)
    })

    it('should enable analytics in production by default', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('PROD', true)
      vi.stubEnv('DEV', false)

      const config = getAnalyticsConfig()
      expect(config).not.toBeNull()
    })

    it('should disable analytics in development by default', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('PROD', false)
      vi.stubEnv('DEV', true)

      const config = getAnalyticsConfig()
      expect(config).toBeNull()
    })

    it('should set default tracking options', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')

      const config = getAnalyticsConfig()
      expect(config?.trackPageviews).toBe(true)
      expect(config?.trackWebVitals).toBe(true)
      expect(config?.trackScrollDepth).toBe(true)
      expect(config?.respectDNT).toBe(true)
    })
  })

  describe('isAnalyticsEnabled', () => {
    it('should return false when no domain is provided', () => {
      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('should return false when analytics is explicitly disabled', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'false')

      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('should return true when analytics is enabled with domain', () => {
      vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'example.com')
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')

      expect(isAnalyticsEnabled()).toBe(true)
    })
  })
})
