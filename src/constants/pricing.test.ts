/**
 * Pricing Constants Tests
 *
 * Tests for PRICING_PLANS constant to ensure data structure correctness
 * and validate pricing configuration.
 */

import { describe, it, expect } from 'vitest'
import { PRICING_PLANS, type PricingPlan } from './pricing'

describe('Pricing Constants', () => {
  describe('PRICING_PLANS Structure', () => {
    it('should export PRICING_PLANS as an array', () => {
      expect(Array.isArray(PRICING_PLANS)).toBe(true)
    })

    it('should have exactly 3 pricing plans', () => {
      expect(PRICING_PLANS.length).toBe(3)
    })

    it('should have all required fields for each plan', () => {
      PRICING_PLANS.forEach((plan, index) => {
        expect(plan, `Plan at index ${index} should have an id`).toHaveProperty('id')
        expect(plan, `Plan at index ${index} should have a name`).toHaveProperty('name')
        expect(plan, `Plan at index ${index} should have a price`).toHaveProperty('price')
        expect(plan, `Plan at index ${index} should have a tagline`).toHaveProperty('tagline')
        expect(plan, `Plan at index ${index} should have features`).toHaveProperty('features')
        expect(plan, `Plan at index ${index} should have ctaText`).toHaveProperty('ctaText')
      })
    })

    it('should have unique IDs for all plans', () => {
      const ids = PRICING_PLANS.map((p) => p.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have proper TypeScript types', () => {
      const plan: PricingPlan = PRICING_PLANS[0]
      expect(typeof plan.id).toBe('string')
      expect(typeof plan.name).toBe('string')
      expect(typeof plan.tagline).toBe('string')
      expect(Array.isArray(plan.features)).toBe(true)
      expect(typeof plan.ctaText).toBe('string')
    })
  })

  describe('Pricing Plan Content Validation', () => {
    it('should have Free, Pro, and Team plans', () => {
      const planIds = PRICING_PLANS.map((p) => p.id)
      expect(planIds).toContain('free')
      expect(planIds).toContain('pro')
      expect(planIds).toContain('team')
    })

    it('should have Free plan first', () => {
      expect(PRICING_PLANS[0].id).toBe('free')
    })

    it('should have null price for free plan', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free')
      expect(freePlan?.price).toBeNull()
    })

    it('should have numeric prices for paid plans', () => {
      const paidPlans = PRICING_PLANS.filter((p) => p.id !== 'free')

      paidPlans.forEach((plan) => {
        expect(
          typeof plan.price,
          `Price for "${plan.name}" should be a number`
        ).toBe('number')
        expect(plan.price, `Price for "${plan.name}" should be positive`).toBeGreaterThan(0)
      })
    })

    it('should have reasonable price progression', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free')
      const proPlan = PRICING_PLANS.find((p) => p.id === 'pro')
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')

      expect(freePlan).toBeDefined()
      expect(proPlan).toBeDefined()
      expect(teamPlan).toBeDefined()

      expect(freePlan?.price).toBeNull()

      if (proPlan?.price && teamPlan?.price) {
        expect(proPlan.price).toBeLessThan(teamPlan.price)
      }
    })

    it('should have non-empty taglines', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(
          plan.tagline.length,
          `Tagline for "${plan.name}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have non-empty CTA text', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(
          plan.ctaText.length,
          `CTA text for "${plan.name}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have features as non-empty arrays', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(
          Array.isArray(plan.features),
          `Features for "${plan.name}" should be an array`
        ).toBe(true)
        expect(
          plan.features.length,
          `Features for "${plan.name}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })
  })

  describe('Features Validation', () => {
    it('should have at least 4 features per plan', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(
          plan.features.length,
          `"${plan.name}" should have at least 4 features`
        ).toBeGreaterThanOrEqual(4)
      })
    })

    it('should have non-empty feature descriptions', () => {
      PRICING_PLANS.forEach((plan) => {
        plan.features.forEach((feature, idx) => {
          expect(
            feature.length,
            `Feature ${idx} in "${plan.name}" should not be empty`
          ).toBeGreaterThan(0)
        })
      })
    })

    it('should have Pro plan features reference Free plan', () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === 'pro')
      const hasReference = proPlan?.features.some((f) => f.includes('Everything in Free'))

      expect(hasReference).toBe(true)
    })

    it('should have Team plan features reference Pro plan', () => {
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')
      const hasReference = teamPlan?.features.some((f) => f.includes('Everything in Pro'))

      expect(hasReference).toBe(true)
    })

    it('should have unique features for each tier', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free')
      const proPlan = PRICING_PLANS.find((p) => p.id === 'pro')
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')

      // Pro should have features not in Free
      const proUniqueFeatures = proPlan?.features.filter(
        (f) => !f.includes('Everything in') && !freePlan?.features.includes(f)
      )
      expect(proUniqueFeatures?.length).toBeGreaterThan(0)

      // Team should have features not in Pro
      const teamUniqueFeatures = teamPlan?.features.filter(
        (f) => !f.includes('Everything in') && !proPlan?.features.includes(f)
      )
      expect(teamUniqueFeatures?.length).toBeGreaterThan(0)
    })
  })

  describe('Icon Validation', () => {
    it('should have icons for all plans', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(plan.icon, `"${plan.name}" should have an icon`).toBeDefined()
      })
    })

    it('should have valid Font Awesome icon format', () => {
      PRICING_PLANS.forEach((plan) => {
        if (plan.icon) {
          expect(
            plan.icon,
            `Icon for "${plan.name}" should start with fa-`
          ).toMatch(/^fa-/)
        }
      })
    })

    it('should have unique icons for each plan', () => {
      const icons = PRICING_PLANS.map((p) => p.icon).filter(Boolean)
      const uniqueIcons = new Set(icons)

      expect(icons.length).toBe(uniqueIcons.size)
    })
  })

  describe('Popular Plan Designation', () => {
    it('should have exactly one popular plan', () => {
      const popularPlans = PRICING_PLANS.filter((p) => p.isPopular === true)
      expect(popularPlans.length).toBe(1)
    })

    it('should mark Pro plan as popular', () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === 'pro')
      expect(proPlan?.isPopular).toBe(true)
    })

    it('should not mark Free or Team as popular', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free')
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')

      expect(freePlan?.isPopular).toBeUndefined()
      expect(teamPlan?.isPopular).toBeUndefined()
    })
  })

  describe('CTA Text Variation', () => {
    it('should have different CTA text for each plan', () => {
      const ctaTexts = PRICING_PLANS.map((p) => p.ctaText)
      const uniqueCtaTexts = new Set(ctaTexts)

      expect(ctaTexts.length).toBe(uniqueCtaTexts.size)
    })

    it('should have appropriate CTA for free plan', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free')
      expect(freePlan?.ctaText.toLowerCase()).toContain('free')
    })

    it('should have appropriate CTA for team plan', () => {
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')
      const ctaLower = teamPlan?.ctaText.toLowerCase()

      expect(
        ctaLower?.includes('contact') || ctaLower?.includes('sales')
      ).toBe(true)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain consistent ID format (lowercase)', () => {
      PRICING_PLANS.forEach((plan) => {
        expect(
          plan.id,
          `ID "${plan.id}" should be lowercase`
        ).toBe(plan.id.toLowerCase())
      })
    })

    it('should have consistent price format (two decimals implied)', () => {
      const paidPlans = PRICING_PLANS.filter((p) => p.price !== null)

      paidPlans.forEach((plan) => {
        // Prices should be reasonable (e.g., 4.99, 9.99, etc.)
        expect(plan.price).toBeGreaterThan(0)
        expect(plan.price).toBeLessThan(100)
      })
    })

    it('should have Pro plan price of $4.99', () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === 'pro')
      expect(proPlan?.price).toBe(4.99)
    })

    it('should have Team plan price of $9.99', () => {
      const teamPlan = PRICING_PLANS.find((p) => p.id === 'team')
      expect(teamPlan?.price).toBe(9.99)
    })
  })

  describe('Snapshot Tests', () => {
    it('should match PRICING_PLANS snapshot', () => {
      expect(PRICING_PLANS).toMatchSnapshot()
    })

    it('should match feature counts snapshot', () => {
      const featureCounts = PRICING_PLANS.map((p) => ({
        plan: p.name,
        featureCount: p.features.length,
      }))

      expect(featureCounts).toMatchSnapshot()
    })

    it('should match pricing tiers snapshot', () => {
      const pricingTiers = PRICING_PLANS.map((p) => ({
        id: p.id,
        price: p.price,
        isPopular: p.isPopular,
      }))

      expect(pricingTiers).toMatchSnapshot()
    })
  })
})
