/**
 * Statistics Constants Tests
 *
 * Tests for STATISTICS constant to ensure data structure correctness
 * and validate statistic content.
 */

import { describe, it, expect } from 'vitest'
import { STATISTICS, type StatisticItem } from './statistics'
import { WAITLIST_COUNT_NUMERIC } from './waitlist'

describe('Statistics Constants', () => {
  describe('STATISTICS Structure', () => {
    it('should export STATISTICS as an array', () => {
      expect(Array.isArray(STATISTICS)).toBe(true)
    })

    it('should have at least one statistic', () => {
      expect(STATISTICS.length).toBeGreaterThan(0)
    })

    it('should have all required fields for each statistic', () => {
      STATISTICS.forEach((stat, index) => {
        expect(stat, `Statistic at index ${index} should have a value`).toHaveProperty('value')
        expect(stat, `Statistic at index ${index} should have a label`).toHaveProperty('label')
        expect(stat, `Statistic at index ${index} should have an icon`).toHaveProperty('icon')
      })
    })

    it('should have unique labels for all statistics', () => {
      const labels = STATISTICS.map((s) => s.label)
      expect(labels.length).toBe(new Set(labels).size)
    })

    it('should have proper TypeScript types', () => {
      const stat: StatisticItem = STATISTICS[0]
      expect(typeof stat.value).toBe('number')
      expect(typeof stat.label).toBe('string')
      expect(typeof stat.icon).toBe('string')
    })
  })

  describe('Statistic Content Validation', () => {
    it('should have non-empty labels', () => {
      STATISTICS.forEach((stat) => {
        expect(stat.label.length, `Label for "${stat.icon}" should not be empty`).toBeGreaterThan(0)
      })
    })

    it('should have valid Font Awesome icon format', () => {
      STATISTICS.forEach((stat) => {
        expect(stat.icon, `Icon for "${stat.label}" should start with fa-`).toMatch(/^fa-/)
      })
    })

    it('should source the waitlist member count from the shared constant', () => {
      const waitlistStat = STATISTICS.find((s) => s.label === 'Waitlist Members')
      expect(waitlistStat?.value).toBe(WAITLIST_COUNT_NUMERIC)
    })
  })

  describe('Snapshot Tests', () => {
    it('should match STATISTICS snapshot', () => {
      expect(STATISTICS).toMatchSnapshot()
    })
  })
})
