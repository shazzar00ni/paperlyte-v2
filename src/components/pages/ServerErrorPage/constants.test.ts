import { describe, it, expect } from 'vitest'
import { BUTTON_LABELS } from './constants'

describe('ServerErrorPage constants', () => {
  describe('BUTTON_LABELS', () => {
    it('should have a RETRY label', () => {
      expect(typeof BUTTON_LABELS.RETRY).toBe('string')
      expect(BUTTON_LABELS.RETRY.length).toBeGreaterThan(0)
    })

    it('should have a HOMEPAGE label', () => {
      expect(typeof BUTTON_LABELS.HOMEPAGE).toBe('string')
      expect(BUTTON_LABELS.HOMEPAGE.length).toBeGreaterThan(0)
    })

    it('should have the exact RETRY label value', () => {
      expect(BUTTON_LABELS.RETRY).toBe('Retry loading the page')
    })

    it('should have the exact HOMEPAGE label value', () => {
      expect(BUTTON_LABELS.HOMEPAGE).toBe('Return to homepage')
    })

    it('should export exactly two button labels', () => {
      expect(Object.keys(BUTTON_LABELS)).toHaveLength(2)
      expect(Object.keys(BUTTON_LABELS)).toEqual(expect.arrayContaining(['RETRY', 'HOMEPAGE']))
    })
  })
})
