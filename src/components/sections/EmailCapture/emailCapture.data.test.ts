import { describe, it, expect } from 'vitest'
import { EMAIL_CAPTURE_CONTENT, BENEFITS } from './emailCapture.data'

describe('emailCapture.data', () => {
  // -------------------------------------------------------------------------
  // BENEFITS array
  // -------------------------------------------------------------------------
  describe('BENEFITS', () => {
    it('contains exactly 4 benefit items', () => {
      expect(BENEFITS).toHaveLength(4)
    })

    it('includes early access benefit', () => {
      expect(BENEFITS).toContain('Get early access before public launch')
    })

    it('includes feature influence benefit', () => {
      expect(BENEFITS).toContain('Influence features and design decisions')
    })

    it('includes founder pricing benefit', () => {
      expect(BENEFITS).toContain('Lock in founder pricing (save 50% for life)')
    })

    it('includes "Receive exclusive productivity tips and updates" as the fourth benefit (PR change)', () => {
      // This item was changed from "Get early product updates and insider tips"
      expect(BENEFITS[3]).toBe('Receive exclusive productivity tips and updates')
    })

    it('does not include old "Get early product updates and insider tips" phrasing', () => {
      expect(BENEFITS).not.toContain('Get early product updates and insider tips')
    })
  })

  // -------------------------------------------------------------------------
  // EMAIL_CAPTURE_CONTENT
  // -------------------------------------------------------------------------
  describe('EMAIL_CAPTURE_CONTENT', () => {
    it('has correct placeholder text', () => {
      expect(EMAIL_CAPTURE_CONTENT.placeholder).toBe('your@email.com')
    })

    it('has correct submit button text', () => {
      expect(EMAIL_CAPTURE_CONTENT.submitText).toBe('Join the Waitlist')
    })

    it('has correct loading text', () => {
      expect(EMAIL_CAPTURE_CONTENT.loadingText).toBe('Joining...')
    })

    it('has a privacy notice', () => {
      expect(EMAIL_CAPTURE_CONTENT.privacy).toBeTruthy()
      expect(EMAIL_CAPTURE_CONTENT.privacy).toMatch(/privacy|spam/i)
    })

    it('has a success title', () => {
      expect(EMAIL_CAPTURE_CONTENT.successTitle).toMatch(/you're on the list/i)
    })

    it('has correct success text directing user to inbox', () => {
      expect(EMAIL_CAPTURE_CONTENT.successText).toMatch(/inbox/i)
    })

    describe('nextSteps', () => {
      it('contains exactly 3 next-step items', () => {
        expect(EMAIL_CAPTURE_CONTENT.nextSteps).toHaveLength(3)
      })

      it('mentions product updates in the first step (PR change)', () => {
        // Changed from "We'll send occasional product updates — no spam"
        expect(EMAIL_CAPTURE_CONTENT.nextSteps[0]).toBe("We'll email you product updates as we build")
      })

      it('mentions early access in the second step', () => {
        expect(EMAIL_CAPTURE_CONTENT.nextSteps[1]).toMatch(/early access/i)
      })

      it('mentions feedback in the third step (PR change)', () => {
        // Changed from "You'll shape the product — we'll ask for your input as we build"
        expect(EMAIL_CAPTURE_CONTENT.nextSteps[2]).toBe(
          "We'll ask for your feedback to make Paperlyte better"
        )
      })

      it('does not contain old "no spam" phrasing', () => {
        expect(EMAIL_CAPTURE_CONTENT.nextSteps[0]).not.toMatch(/no spam/i)
      })
    })

    it('has correct shareText (PR change)', () => {
      // Changed from "Know someone who'd love this? Share Paperlyte:"
      expect(EMAIL_CAPTURE_CONTENT.shareText).toBe('Share Paperlyte with friends')
    })

    it('does not contain old "Know someone" shareText phrasing', () => {
      expect(EMAIL_CAPTURE_CONTENT.shareText).not.toMatch(/know someone/i)
    })
  })
})