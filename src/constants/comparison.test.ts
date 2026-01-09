/**
 * Comparison Constants Tests
 *
 * Tests for COMPARISON_FEATURES and COMPETITORS constants
 * to ensure data structure correctness and validate comparison data.
 */

import { describe, it, expect } from 'vitest'
import {
  COMPARISON_FEATURES,
  COMPETITORS,
  type ComparisonFeature,
  type Competitor,
} from './comparison'

describe('Comparison Constants', () => {
  describe('COMPARISON_FEATURES Structure', () => {
    it('should export COMPARISON_FEATURES as an array', () => {
      expect(Array.isArray(COMPARISON_FEATURES)).toBe(true)
    })

    it('should have at least 8 comparison features', () => {
      expect(COMPARISON_FEATURES.length).toBeGreaterThanOrEqual(8)
    })

    it('should have all required fields for each feature', () => {
      COMPARISON_FEATURES.forEach((feature, index) => {
        expect(feature, `Feature at index ${index} should have a feature name`).toHaveProperty(
          'feature'
        )
        expect(feature, `Feature at index ${index} should have paperlyte value`).toHaveProperty(
          'paperlyte'
        )
        expect(feature, `Feature at index ${index} should have notion value`).toHaveProperty(
          'notion'
        )
        expect(feature, `Feature at index ${index} should have evernote value`).toHaveProperty(
          'evernote'
        )
        expect(feature, `Feature at index ${index} should have onenote value`).toHaveProperty(
          'onenote'
        )
      })
    })

    it('should have valid value types (boolean or string)', () => {
      COMPARISON_FEATURES.forEach((feature) => {
        const validateValue = (value: boolean | string) => {
          return typeof value === 'boolean' || typeof value === 'string'
        }

        expect(
          validateValue(feature.paperlyte),
          `Paperlyte value for "${feature.feature}" should be boolean or string`
        ).toBe(true)
        expect(
          validateValue(feature.notion),
          `Notion value for "${feature.feature}" should be boolean or string`
        ).toBe(true)
        expect(
          validateValue(feature.evernote),
          `Evernote value for "${feature.feature}" should be boolean or string`
        ).toBe(true)
        expect(
          validateValue(feature.onenote),
          `OneNote value for "${feature.feature}" should be boolean or string`
        ).toBe(true)
      })
    })

    it('should have proper TypeScript types', () => {
      const feature: ComparisonFeature = COMPARISON_FEATURES[0]
      expect(typeof feature.feature).toBe('string')
    })
  })

  describe('COMPARISON_FEATURES Content Validation', () => {
    it('should include startup time comparison', () => {
      const startupTime = COMPARISON_FEATURES.find((f) => f.feature === 'Startup Time')
      expect(startupTime).toBeDefined()
      expect(startupTime?.paperlyte).toBe('<1s')
    })

    it('should include offline access comparison', () => {
      const offlineAccess = COMPARISON_FEATURES.find((f) => f.feature === 'Offline Access')
      expect(offlineAccess).toBeDefined()
      expect(offlineAccess?.paperlyte).toBe(true)
    })

    it('should include end-to-end encryption comparison', () => {
      const encryption = COMPARISON_FEATURES.find((f) => f.feature === 'End-to-End Encryption')
      expect(encryption).toBeDefined()
      expect(encryption?.paperlyte).toBe(true)
    })

    it('should highlight Paperlyte advantages', () => {
      // Count features where Paperlyte has true and others have false
      const advantages = COMPARISON_FEATURES.filter(
        (f) =>
          f.paperlyte === true &&
          (f.notion === false || f.evernote === false || f.onenote === false)
      )

      expect(advantages.length).toBeGreaterThan(0)
    })

    it('should have non-empty feature names', () => {
      COMPARISON_FEATURES.forEach((feature) => {
        expect(feature.feature.length, `Feature name should not be empty`).toBeGreaterThan(0)
      })
    })
  })

  describe('COMPETITORS Structure', () => {
    it('should export COMPETITORS as an array', () => {
      expect(Array.isArray(COMPETITORS)).toBe(true)
    })

    it('should have exactly 4 competitors', () => {
      expect(COMPETITORS.length).toBe(4)
    })

    it('should have all required fields for each competitor', () => {
      COMPETITORS.forEach((competitor, index) => {
        expect(competitor, `Competitor at index ${index} should have an id`).toHaveProperty('id')
        expect(competitor, `Competitor at index ${index} should have a name`).toHaveProperty('name')
        expect(competitor, `Competitor at index ${index} should have a color`).toHaveProperty(
          'color'
        )
      })
    })

    it('should have unique IDs for all competitors', () => {
      const ids = COMPETITORS.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have proper TypeScript types', () => {
      const competitor: Competitor = COMPETITORS[0]
      expect(typeof competitor.id).toBe('string')
      expect(typeof competitor.name).toBe('string')
      expect(typeof competitor.color).toBe('string')
    })
  })

  describe('COMPETITORS Content Validation', () => {
    it('should include Paperlyte as first competitor', () => {
      expect(COMPETITORS[0].id).toBe('paperlyte')
      expect(COMPETITORS[0].name).toBe('Paperlyte')
    })

    it('should include Notion', () => {
      const notion = COMPETITORS.find((c) => c.id === 'notion')
      expect(notion).toBeDefined()
      expect(notion?.name).toBe('Notion')
    })

    it('should include Evernote', () => {
      const evernote = COMPETITORS.find((c) => c.id === 'evernote')
      expect(evernote).toBeDefined()
      expect(evernote?.name).toBe('Evernote')
    })

    it('should include OneNote', () => {
      const onenote = COMPETITORS.find((c) => c.id === 'onenote')
      expect(onenote).toBeDefined()
      expect(onenote?.name).toBe('OneNote')
    })

    it('should have valid color values', () => {
      COMPETITORS.forEach((competitor) => {
        expect(competitor.color, `Color for "${competitor.name}" should not be empty`).toBeTruthy()
        // Check if it's a hex color or CSS variable
        expect(
          competitor.color.match(/^(#[0-9A-F]{6}|var\(.+\))$/i),
          `Color "${competitor.color}" for "${competitor.name}" should be hex or CSS variable`
        ).toBeTruthy()
      })
    })
  })

  describe('Data Consistency', () => {
    it('should have matching competitor IDs between arrays', () => {
      const competitorIds = COMPETITORS.map((c) => c.id)

      // Check that all competitor IDs are used as keys in ComparisonFeature objects
      COMPARISON_FEATURES.forEach((feature) => {
        competitorIds.forEach((id) => {
          if (id !== 'paperlyte') {
            expect(
              feature,
              `Feature "${feature.feature}" should have ${id} property`
            ).toHaveProperty(id)
          }
        })
      })
    })

    it('should maintain consistent ID format (lowercase)', () => {
      COMPETITORS.forEach((competitor) => {
        expect(competitor.id, `ID "${competitor.id}" should be lowercase`).toBe(
          competitor.id.toLowerCase()
        )
      })
    })
  })

  describe('Snapshot Tests', () => {
    it('should match COMPARISON_FEATURES snapshot', () => {
      expect(COMPARISON_FEATURES).toMatchSnapshot()
    })

    it('should match COMPETITORS snapshot', () => {
      expect(COMPETITORS).toMatchSnapshot()
    })

    it('should match Paperlyte advantages snapshot', () => {
      const advantages = COMPARISON_FEATURES.filter((f) => f.paperlyte === true)
      expect(advantages.map((a) => a.feature)).toMatchSnapshot()
    })
  })
})
