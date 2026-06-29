import { describe, it, expect } from 'vitest'
import { EMAIL_CAPTURE_CONTENT, BENEFITS } from './emailCapture.data'

describe('emailCapture.data', () => {
  describe('EMAIL_CAPTURE_CONTENT', () => {
    it('should have a placeholder value', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.placeholder).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.placeholder.length).toBeGreaterThan(0)
      expect(EMAIL_CAPTURE_CONTENT.placeholder).toBe('your@email.com')
    })

    it('should have a submitText value', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.submitText).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.submitText.length).toBeGreaterThan(0)
    })

    it('should have a loadingText value', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.loadingText).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.loadingText.length).toBeGreaterThan(0)
    })

    it('should have a privacy policy message', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.privacy).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.privacy).toContain('privacy')
    })

    it('should have a success title', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.successTitle).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.successTitle.length).toBeGreaterThan(0)
    })

    it('should have a success text message', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.successText).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.successText.length).toBeGreaterThan(0)
    })

    it('should have a nextStepsTitle', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.nextStepsTitle).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.nextStepsTitle.length).toBeGreaterThan(0)
    })

    it('should have nextSteps as a readonly array of non-empty strings', () => {
      expect(Array.isArray(EMAIL_CAPTURE_CONTENT.nextSteps)).toBe(true)
      expect(EMAIL_CAPTURE_CONTENT.nextSteps.length).toBeGreaterThan(0)
      EMAIL_CAPTURE_CONTENT.nextSteps.forEach((step) => {
        expect(typeof step).toBe('string')
        expect(step.length).toBeGreaterThan(0)
      })
    })

    it('should have exactly 3 nextSteps', () => {
      expect(EMAIL_CAPTURE_CONTENT.nextSteps).toHaveLength(3)
    })

    it('should have a shareText value', () => {
      expect(typeof EMAIL_CAPTURE_CONTENT.shareText).toBe('string')
      expect(EMAIL_CAPTURE_CONTENT.shareText.length).toBeGreaterThan(0)
    })

    it('should mention early access in nextSteps', () => {
      const combined = EMAIL_CAPTURE_CONTENT.nextSteps.join(' ')
      expect(combined.toLowerCase()).toContain('early access')
    })
  })

  describe('BENEFITS', () => {
    it('should be a readonly array', () => {
      expect(Array.isArray(BENEFITS)).toBe(true)
    })

    it('should contain non-empty strings', () => {
      BENEFITS.forEach((benefit) => {
        expect(typeof benefit).toBe('string')
        expect(benefit.length).toBeGreaterThan(0)
      })
    })

    it('should have at least one benefit', () => {
      expect(BENEFITS.length).toBeGreaterThan(0)
    })

    it('should have exactly 4 benefits', () => {
      expect(BENEFITS).toHaveLength(4)
    })

    it('should mention early access in the first benefit', () => {
      expect(BENEFITS[0].toLowerCase()).toContain('early access')
    })

    it('should mention pricing in one of the benefits', () => {
      const hasPricing = BENEFITS.some((b) => b.toLowerCase().includes('pricing'))
      expect(hasPricing).toBe(true)
    })
  })
})
