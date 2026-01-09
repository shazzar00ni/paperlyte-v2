/**
 * Testimonials Constants Tests
 *
 * Tests for TESTIMONIALS constant to ensure data structure correctness
 * and validate testimonial content.
 */

import { describe, it, expect } from 'vitest'
import { TESTIMONIALS, type Testimonial } from './testimonials'

describe('Testimonials Constants', () => {
  describe('TESTIMONIALS Structure', () => {
    it('should export TESTIMONIALS as an array', () => {
      expect(Array.isArray(TESTIMONIALS)).toBe(true)
    })

    it('should have at least 6 testimonials', () => {
      expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(6)
    })

    it('should have all required fields for each testimonial', () => {
      TESTIMONIALS.forEach((testimonial, index) => {
        expect(testimonial, `Testimonial at index ${index} should have an id`).toHaveProperty('id')
        expect(testimonial, `Testimonial at index ${index} should have a name`).toHaveProperty(
          'name'
        )
        expect(testimonial, `Testimonial at index ${index} should have a role`).toHaveProperty(
          'role'
        )
        expect(testimonial, `Testimonial at index ${index} should have a quote`).toHaveProperty(
          'quote'
        )
        expect(testimonial, `Testimonial at index ${index} should have a rating`).toHaveProperty(
          'rating'
        )
        expect(testimonial, `Testimonial at index ${index} should have initials`).toHaveProperty(
          'initials'
        )
      })
    })

    it('should have unique IDs for all testimonials', () => {
      const ids = TESTIMONIALS.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have proper TypeScript types', () => {
      const testimonial: Testimonial = TESTIMONIALS[0]
      expect(typeof testimonial.id).toBe('string')
      expect(typeof testimonial.name).toBe('string')
      expect(typeof testimonial.role).toBe('string')
      expect(typeof testimonial.quote).toBe('string')
      expect(typeof testimonial.rating).toBe('number')
      expect(typeof testimonial.initials).toBe('string')
    })
  })

  describe('Testimonial Content Validation', () => {
    it('should have non-empty names', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.name.length,
          `Name for testimonial "${testimonial.id}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have non-empty roles', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.role.length,
          `Role for testimonial "${testimonial.id}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have non-empty quotes', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.quote.length,
          `Quote for testimonial "${testimonial.id}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have quotes with reasonable length', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.quote.length,
          `Quote for "${testimonial.id}" should be at least 50 characters`
        ).toBeGreaterThan(50)
        expect(
          testimonial.quote.length,
          `Quote for "${testimonial.id}" should be less than 300 characters`
        ).toBeLessThan(300)
      })
    })

    it('should have valid rating values (1-5)', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.rating,
          `Rating for "${testimonial.id}" should be at least 1`
        ).toBeGreaterThanOrEqual(1)
        expect(
          testimonial.rating,
          `Rating for "${testimonial.id}" should be at most 5`
        ).toBeLessThanOrEqual(5)
      })
    })

    it('should have valid initials format (2-3 uppercase letters)', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(
          testimonial.initials,
          `Initials for "${testimonial.id}" should be 2-3 uppercase letters`
        ).toMatch(/^[A-Z]{2,3}$/)
      })
    })

    it('should have initials corresponding to name', () => {
      TESTIMONIALS.forEach((testimonial) => {
        const nameParts = testimonial.name.split(' ').filter(Boolean)
        const firstInitial = nameParts[0][0].toUpperCase()
        const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase()

        expect(
          testimonial.initials[0],
          `First initial for "${testimonial.name}" should match first name`
        ).toBe(firstInitial)

        expect(
          testimonial.initials[testimonial.initials.length - 1],
          `Last initial for "${testimonial.name}" should match last name`
        ).toBe(lastInitial)
      })
    })

    it('should have company field as optional', () => {
      const withCompany = TESTIMONIALS.filter((t) => t.company)
      const withoutCompany = TESTIMONIALS.filter((t) => !t.company)

      // Should have both types
      expect(withCompany.length).toBeGreaterThan(0)
      expect(withoutCompany.length).toBeGreaterThan(0)
    })

    it('should have avatar field as optional', () => {
      // All testimonials in current data don't have avatars
      TESTIMONIALS.forEach((testimonial) => {
        if (testimonial.avatar) {
          expect(typeof testimonial.avatar).toBe('string')
        }
      })
    })
  })

  describe('Rating Distribution', () => {
    it('should have mostly high ratings (4-5 stars)', () => {
      const highRatings = TESTIMONIALS.filter((t) => t.rating >= 4)
      const percentage = (highRatings.length / TESTIMONIALS.length) * 100

      expect(percentage).toBeGreaterThanOrEqual(70)
    })

    it('should have at least one 5-star rating', () => {
      const fiveStars = TESTIMONIALS.filter((t) => t.rating === 5)
      expect(fiveStars.length).toBeGreaterThan(0)
    })

    it('should calculate average rating above 4', () => {
      const totalRating = TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0)
      const averageRating = totalRating / TESTIMONIALS.length

      expect(averageRating).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Persona Diversity', () => {
    it('should have diverse professional roles', () => {
      const roles = TESTIMONIALS.map((t) => t.role.toLowerCase())
      const uniqueRoles = new Set(roles)

      // Should have at least 6 different roles
      expect(uniqueRoles.size).toBeGreaterThanOrEqual(6)
    })

    it('should include various user personas', () => {
      const quotes = TESTIMONIALS.map((t) => t.quote.toLowerCase()).join(' ')

      // Check for different use cases mentioned
      const useCases = [
        'meeting', // Product Manager use case
        'writing', // Writer use case
        'notes', // General note-taking
        'speed', // Performance focus
        'sync', // Cross-device usage
      ]

      const mentionedUseCases = useCases.filter((useCase) => quotes.includes(useCase))
      expect(mentionedUseCases.length).toBeGreaterThan(0)
    })

    it('should have testimonials from different industries', () => {
      const companies = TESTIMONIALS.filter((t) => t.company).map((t) => t.company)

      // Should have some company affiliations
      expect(companies.length).toBeGreaterThan(3)
    })
  })

  describe('Content Quality', () => {
    it('should have testimonials mentioning key features', () => {
      const allQuotes = TESTIMONIALS.map((t) => t.quote.toLowerCase()).join(' ')

      const keyFeatures = ['fast', 'speed', 'simple', 'sync', 'offline']
      const mentionedFeatures = keyFeatures.filter((feature) => allQuotes.includes(feature))

      expect(
        mentionedFeatures.length,
        'Testimonials should mention key product features'
      ).toBeGreaterThan(2)
    })

    it('should have testimonials with specific benefits', () => {
      const allQuotes = TESTIMONIALS.map((t) => t.quote.toLowerCase()).join(' ')

      // Should mention tangible benefits
      const hasBenefits =
        allQuotes.includes('transformed') ||
        allQuotes.includes('better') ||
        allQuotes.includes('easier') ||
        allQuotes.includes('faster')

      expect(hasBenefits).toBe(true)
    })

    it('should have natural-sounding quotes (contractions, personal pronouns)', () => {
      const naturalLanguagePatterns = TESTIMONIALS.filter(
        (t) =>
          t.quote.includes("I'") ||
          t.quote.includes("don't") ||
          t.quote.includes("it's") ||
          t.quote.includes('I ')
      )

      expect(
        naturalLanguagePatterns.length,
        'Testimonials should sound natural and personal'
      ).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain consistent ID format (testimonial-N)', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(testimonial.id, `ID "${testimonial.id}" should follow testimonial-N format`).toMatch(
          /^testimonial-\d+$/
        )
      })
    })

    it('should have sequential IDs', () => {
      const ids = TESTIMONIALS.map((t) => parseInt(t.id.split('-')[1]))
      const sortedIds = [...ids].sort((a, b) => a - b)

      expect(ids).toEqual(sortedIds)
    })

    it('should have proper capitalization in names', () => {
      TESTIMONIALS.forEach((testimonial) => {
        const nameParts = testimonial.name.split(' ')
        nameParts.forEach((part) => {
          expect(
            part[0],
            `Name part "${part}" in "${testimonial.name}" should be capitalized`
          ).toBe(part[0].toUpperCase())
        })
      })
    })
  })

  describe('Snapshot Tests', () => {
    it('should match TESTIMONIALS snapshot', () => {
      expect(TESTIMONIALS).toMatchSnapshot()
    })

    it('should match rating distribution snapshot', () => {
      const distribution = TESTIMONIALS.reduce(
        (acc, t) => {
          acc[t.rating] = (acc[t.rating] || 0) + 1
          return acc
        },
        {}
      )

      expect(distribution).toMatchSnapshot()
    })

    it('should match roles distribution snapshot', () => {
      const roles = TESTIMONIALS.map((t) => t.role).sort()
      expect(roles).toMatchSnapshot()
    })
  })
})
