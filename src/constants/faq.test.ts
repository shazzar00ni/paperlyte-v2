/**
 * FAQ Constants Tests
 *
 * Tests for FAQ_ITEMS constant to ensure data structure correctness
 * and validate content integrity.
 */

import { describe, it, expect } from 'vitest'
import { FAQ_ITEMS, type FAQItem } from './faq'
import { LAUNCH_QUARTER } from './waitlist'

describe('FAQ Constants', () => {
  describe('FAQ_ITEMS Structure', () => {
    it('should export FAQ_ITEMS as an array', () => {
      expect(Array.isArray(FAQ_ITEMS)).toBe(true)
    })

    it('should have at least 8 FAQ items', () => {
      expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(8)
    })

    it('should have all required fields for each FAQ item', () => {
      FAQ_ITEMS.forEach((item, index) => {
        expect(item, `FAQ item at index ${index} should have an id`).toHaveProperty('id')
        expect(item, `FAQ item at index ${index} should have a question`).toHaveProperty('question')
        expect(item, `FAQ item at index ${index} should have an answer`).toHaveProperty('answer')
      })
    })

    it('should have unique IDs for all FAQ items', () => {
      const ids = FAQ_ITEMS.map((item) => item.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have valid category values when category is present', () => {
      const validCategories = ['general', 'pricing', 'privacy', 'features']

      FAQ_ITEMS.forEach((item) => {
        if (item.category) {
          expect(
            validCategories,
            `Category "${item.category}" for item "${item.id}" should be valid`
          ).toContain(item.category)
        }
      })
    })

    it('should have non-empty questions and answers', () => {
      FAQ_ITEMS.forEach((item) => {
        expect(item.question.length, `Question for item "${item.id}" should not be empty`).toBeGreaterThan(0)
        expect(item.answer.length, `Answer for item "${item.id}" should not be empty`).toBeGreaterThan(0)
      })
    })

    it('should have proper TypeScript types', () => {
      const item: FAQItem = FAQ_ITEMS[0]
      expect(typeof item.id).toBe('string')
      expect(typeof item.question).toBe('string')
      expect(typeof item.answer).toBe('string')
    })
  })

  describe('FAQ Content Validation', () => {
    it('should include launch-date FAQ', () => {
      const launchDateFaq = FAQ_ITEMS.find((item) => item.id === 'launch-date')
      expect(launchDateFaq).toBeDefined()
      expect(launchDateFaq?.question).toContain('launch')
    })

    it('should include pricing FAQ', () => {
      const pricingFaq = FAQ_ITEMS.find((item) => item.id === 'pricing')
      expect(pricingFaq).toBeDefined()
      expect(pricingFaq?.question.toLowerCase()).toContain('cost')
    })

    it('should include data privacy FAQ', () => {
      const privacyFaq = FAQ_ITEMS.find((item) => item.id === 'data-privacy')
      expect(privacyFaq).toBeDefined()
      expect(privacyFaq?.answer).toContain('encryption')
    })

    it('should reference the LAUNCH_QUARTER in answers', () => {
      const itemsWithLaunchQuarter = FAQ_ITEMS.filter((item) =>
        item.answer.includes(LAUNCH_QUARTER)
      )
      expect(itemsWithLaunchQuarter.length).toBeGreaterThan(0)
    })

    it('should have contact email in appropriate FAQ', () => {
      const contactFaq = FAQ_ITEMS.find((item) => item.id === 'more-questions')
      expect(contactFaq).toBeDefined()
      expect(contactFaq?.answer).toMatch(/hello@paperlyte\.com/)
    })
  })

  describe('FAQ Categories', () => {
    it('should have general category items', () => {
      const generalItems = FAQ_ITEMS.filter((item) => item.category === 'general')
      expect(generalItems.length).toBeGreaterThan(0)
    })

    it('should have pricing category items', () => {
      const pricingItems = FAQ_ITEMS.filter((item) => item.category === 'pricing')
      expect(pricingItems.length).toBeGreaterThan(0)
    })

    it('should have privacy category items', () => {
      const privacyItems = FAQ_ITEMS.filter((item) => item.category === 'privacy')
      expect(privacyItems.length).toBeGreaterThan(0)
    })

    it('should have features category items', () => {
      const featureItems = FAQ_ITEMS.filter((item) => item.category === 'features')
      expect(featureItems.length).toBeGreaterThan(0)
    })
  })

  describe('FAQ Data Integrity', () => {
    it('should have questions ending with question marks', () => {
      FAQ_ITEMS.forEach((item) => {
        expect(
          item.question.trim().endsWith('?'),
          `Question "${item.question}" should end with a question mark`
        ).toBe(true)
      })
    })

    it('should have answers with reasonable length', () => {
      FAQ_ITEMS.forEach((item) => {
        expect(
          item.answer.length,
          `Answer for "${item.id}" should be at least 20 characters`
        ).toBeGreaterThan(20)
        expect(
          item.answer.length,
          `Answer for "${item.id}" should be less than 500 characters`
        ).toBeLessThan(500)
      })
    })

    it('should maintain consistent ID format (kebab-case)', () => {
      FAQ_ITEMS.forEach((item) => {
        expect(
          item.id,
          `ID "${item.id}" should be in kebab-case format`
        ).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })
  })

  describe('Snapshot Tests', () => {
    it('should match FAQ_ITEMS snapshot', () => {
      expect(FAQ_ITEMS).toMatchSnapshot()
    })

    it('should match FAQ categories distribution snapshot', () => {
      const categoryCounts = FAQ_ITEMS.reduce((acc, item) => {
        const category = item.category || 'uncategorized'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(categoryCounts).toMatchSnapshot()
    })
  })
})
