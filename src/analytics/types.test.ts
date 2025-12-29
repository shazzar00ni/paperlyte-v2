/**
 * Tests for analytics types
 *
 * This file primarily validates type definitions and ensures
 * types are correctly exported and structured.
 */

import { describe, it, expect } from 'vitest'
import type {
  CoreWebVitals,
  EventProperties,
  ScrollDepth,
  EventName,
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsProvider,
  PerformanceMetric,
} from './types'

describe('analytics/types', () => {
  describe('CoreWebVitals', () => {
    it('should allow valid Core Web Vitals object', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        TTFB: 800,
        FCP: 1800,
        INP: 200,
      }

      expect(vitals).toBeDefined()
      expect(vitals.LCP).toBe(2500)
      expect(vitals.FID).toBe(100)
      expect(vitals.CLS).toBe(0.1)
    })

    it('should allow partial Core Web Vitals object', () => {
      const vitals: CoreWebVitals = {
        LCP: 2500,
      }

      expect(vitals).toBeDefined()
      expect(vitals.LCP).toBe(2500)
      expect(vitals.FID).toBeUndefined()
    })

    it('should allow empty Core Web Vitals object', () => {
      const vitals: CoreWebVitals = {}

      expect(vitals).toBeDefined()
      expect(Object.keys(vitals).length).toBe(0)
    })
  })

  describe('EventProperties', () => {
    it('should allow string, number, and boolean properties', () => {
      const properties: EventProperties = {
        stringProp: 'value',
        numberProp: 123,
        booleanProp: true,
      }

      expect(properties).toBeDefined()
      expect(properties.stringProp).toBe('value')
      expect(properties.numberProp).toBe(123)
      expect(properties.booleanProp).toBe(true)
    })

    it('should allow undefined properties', () => {
      const properties: EventProperties = {
        undefinedProp: undefined,
      }

      expect(properties).toBeDefined()
      expect(properties.undefinedProp).toBeUndefined()
    })
  })

  describe('ScrollDepth', () => {
    it('should accept valid scroll depth values', () => {
      const depths: ScrollDepth[] = [25, 50, 75, 100]

      expect(depths).toBeDefined()
      expect(depths).toHaveLength(4)
      expect(depths).toContain(25)
      expect(depths).toContain(50)
      expect(depths).toContain(75)
      expect(depths).toContain(100)
    })
  })

  describe('EventName', () => {
    it('should accept predefined event names', () => {
      const events: EventName[] = [
        'page_view',
        'cta_click',
        'scroll_depth',
        'web_vitals',
        'download_click',
        'navigation_click',
        'feature_interaction',
      ]

      expect(events).toBeDefined()
      expect(events).toHaveLength(7)
    })

    it('should accept custom event names', () => {
      const customEvent: EventName = 'custom_event'

      expect(customEvent).toBe('custom_event')
    })
  })

  describe('AnalyticsEvent', () => {
    it('should allow event with name only', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
      }

      expect(event).toBeDefined()
      expect(event.name).toBe('test_event')
      expect(event.properties).toBeUndefined()
      expect(event.timestamp).toBeUndefined()
    })

    it('should allow event with properties', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          key: 'value',
        },
      }

      expect(event).toBeDefined()
      expect(event.properties?.key).toBe('value')
    })

    it('should allow event with timestamp', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        timestamp: 1234567890,
      }

      expect(event).toBeDefined()
      expect(event.timestamp).toBe(1234567890)
    })

    it('should allow event with all fields', () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        properties: {
          key: 'value',
        },
        timestamp: 1234567890,
      }

      expect(event).toBeDefined()
      expect(event.name).toBe('test_event')
      expect(event.properties?.key).toBe('value')
      expect(event.timestamp).toBe(1234567890)
    })
  })

  describe('AnalyticsConfig', () => {
    it('should allow valid config with all providers', () => {
      const providers: AnalyticsConfig['provider'][] = [
        'plausible',
        'fathom',
        'umami',
        'simple',
        'custom',
      ]

      providers.forEach((provider) => {
        const config: AnalyticsConfig = {
          provider,
          domain: 'example.com',
        }

        expect(config).toBeDefined()
        expect(config.provider).toBe(provider)
      })
    })

    it('should allow config with optional fields', () => {
      const config: AnalyticsConfig = {
        provider: 'plausible',
        domain: 'example.com',
        scriptUrl: 'https://custom.analytics.com/script.js',
        debug: true,
        trackPageviews: true,
        trackWebVitals: true,
        trackScrollDepth: true,
        respectDNT: true,
      }

      expect(config).toBeDefined()
      expect(config.scriptUrl).toBe('https://custom.analytics.com/script.js')
      expect(config.debug).toBe(true)
      expect(config.trackPageviews).toBe(true)
      expect(config.trackWebVitals).toBe(true)
      expect(config.trackScrollDepth).toBe(true)
      expect(config.respectDNT).toBe(true)
    })

    it('should allow minimal config', () => {
      const config: AnalyticsConfig = {
        provider: 'plausible',
        domain: 'example.com',
      }

      expect(config).toBeDefined()
      expect(config.provider).toBe('plausible')
      expect(config.domain).toBe('example.com')
    })
  })

  describe('PerformanceMetric', () => {
    it('should allow valid performance metric', () => {
      const metric: PerformanceMetric = {
        name: 'LCP',
        value: 2500,
        rating: 'good',
      }

      expect(metric).toBeDefined()
      expect(metric.name).toBe('LCP')
      expect(metric.value).toBe(2500)
      expect(metric.rating).toBe('good')
    })

    it('should allow all rating values', () => {
      const ratings: PerformanceMetric['rating'][] = ['good', 'needs-improvement', 'poor']

      ratings.forEach((rating) => {
        const metric: PerformanceMetric = {
          name: 'TEST',
          value: 100,
          rating,
        }

        expect(metric).toBeDefined()
        expect(metric.rating).toBe(rating)
      })
    })

    it('should allow optional fields', () => {
      const metric: PerformanceMetric = {
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 100,
        id: 'metric-1',
        entries: [],
      }

      expect(metric).toBeDefined()
      expect(metric.delta).toBe(100)
      expect(metric.id).toBe('metric-1')
      expect(metric.entries).toEqual([])
    })
  })
})
