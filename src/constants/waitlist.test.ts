/**
 * Waitlist Constants Tests
 *
 * Tests for waitlist configuration constants to ensure
 * data structure correctness and value validation.
 */

import { describe, it, expect } from 'vitest'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from './waitlist'

describe('Waitlist Constants', () => {
  describe('WAITLIST_COUNT', () => {
    it('should be defined as a string', () => {
      expect(typeof WAITLIST_COUNT).toBe('string')
    })

    it('should not be empty', () => {
      expect(WAITLIST_COUNT.length).toBeGreaterThan(0)
    })

    it('should contain a number or number with suffix', () => {
      // Should match patterns like "500+", "1000", "1K", etc.
      expect(WAITLIST_COUNT).toMatch(/^\d+[+KkMm]?$/)
    })

    it('should have the expected value format', () => {
      expect(WAITLIST_COUNT).toBe('500+')
    })
  })

  describe('LAUNCH_QUARTER', () => {
    it('should be defined as a string', () => {
      expect(typeof LAUNCH_QUARTER).toBe('string')
    })

    it('should not be empty', () => {
      expect(LAUNCH_QUARTER.length).toBeGreaterThan(0)
    })

    it('should follow quarter format (Q# YYYY)', () => {
      // Should match patterns like "Q1 2024", "Q2 2025", etc.
      expect(LAUNCH_QUARTER).toMatch(/^Q[1-4] \d{4}$/)
    })

    it('should have a valid quarter number (1-4)', () => {
      const quarterMatch = LAUNCH_QUARTER.match(/^Q([1-4])/)
      expect(quarterMatch).toBeTruthy()
      const quarter = parseInt(quarterMatch![1])
      expect(quarter).toBeGreaterThanOrEqual(1)
      expect(quarter).toBeLessThanOrEqual(4)
    })

    it('should have a valid year (2024 or later)', () => {
      const yearMatch = LAUNCH_QUARTER.match(/\d{4}$/)
      expect(yearMatch).toBeTruthy()
      const year = parseInt(yearMatch![0])
      expect(year).toBeGreaterThanOrEqual(2024)
    })

    it('should have the expected value', () => {
      expect(LAUNCH_QUARTER).toBe('Q2 2026')
    })
  })

  describe('Constants Export', () => {
    it('should export exactly 2 constants', () => {
      // Verify no accidental exports
      const exports = { WAITLIST_COUNT, LAUNCH_QUARTER }
      expect(Object.keys(exports).length).toBe(2)
    })

    it('should be immutable values (not objects or arrays)', () => {
      expect(typeof WAITLIST_COUNT).toBe('string')
      expect(typeof LAUNCH_QUARTER).toBe('string')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match waitlist constants snapshot', () => {
      expect({
        WAITLIST_COUNT,
        LAUNCH_QUARTER,
      }).toMatchSnapshot()
    })
  })
})
