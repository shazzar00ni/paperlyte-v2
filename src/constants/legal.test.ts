/**
 * Legal Constants Tests
 *
 * Tests for LEGAL_CONFIG and helper functions to ensure
 * data structure correctness and validation logic.
 */

import { describe, it, expect } from 'vitest'
import { LEGAL_CONFIG, needsLegalReview, getPlaceholderFields, type CompanyConfig } from './legal'

describe('Legal Constants', () => {
  describe('LEGAL_CONFIG Structure', () => {
    it('should have all top-level sections', () => {
      expect(LEGAL_CONFIG).toHaveProperty('company')
      expect(LEGAL_CONFIG).toHaveProperty('address')
      expect(LEGAL_CONFIG).toHaveProperty('documents')
      expect(LEGAL_CONFIG).toHaveProperty('social')
      expect(LEGAL_CONFIG).toHaveProperty('metadata')
    })

    it('should have exactly 5 top-level sections', () => {
      expect(Object.keys(LEGAL_CONFIG).length).toBe(5)
    })

    it('should be marked as const', () => {
      // as const is compile-time only, but we can verify structure
      expect(typeof LEGAL_CONFIG).toBe('object')
      expect(LEGAL_CONFIG).not.toBeNull()
    })
  })

  describe('Company Section', () => {
    it('should have all required company fields', () => {
      expect(LEGAL_CONFIG.company).toHaveProperty('name')
      expect(LEGAL_CONFIG.company).toHaveProperty('legalName')
      expect(LEGAL_CONFIG.company).toHaveProperty('email')
      expect(LEGAL_CONFIG.company).toHaveProperty('supportEmail')
      expect(LEGAL_CONFIG.company).toHaveProperty('privacyEmail')
      expect(LEGAL_CONFIG.company).toHaveProperty('legalEmail')
      expect(LEGAL_CONFIG.company).toHaveProperty('securityEmail')
      expect(LEGAL_CONFIG.company).toHaveProperty('dpoEmail')
      expect(LEGAL_CONFIG.company).toHaveProperty('arbitrationOptOutEmail')
    })

    it('should have valid email formats', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      const emails = [
        LEGAL_CONFIG.company.email,
        LEGAL_CONFIG.company.supportEmail,
        LEGAL_CONFIG.company.privacyEmail,
        LEGAL_CONFIG.company.legalEmail,
        LEGAL_CONFIG.company.securityEmail,
        LEGAL_CONFIG.company.dpoEmail,
        LEGAL_CONFIG.company.arbitrationOptOutEmail,
      ]

      emails.forEach((email) => {
        expect(emailRegex.test(email), `Email "${email}" should be valid`).toBe(true)
      })
    })

    it('should have company name set to Paperlyte', () => {
      expect(LEGAL_CONFIG.company.name).toBe('Paperlyte')
    })

    it('should have all emails using paperlyte.com domain', () => {
      const emails = [
        LEGAL_CONFIG.company.email,
        LEGAL_CONFIG.company.supportEmail,
        LEGAL_CONFIG.company.privacyEmail,
        LEGAL_CONFIG.company.legalEmail,
        LEGAL_CONFIG.company.securityEmail,
        LEGAL_CONFIG.company.dpoEmail,
        LEGAL_CONFIG.company.arbitrationOptOutEmail,
      ]

      emails.forEach((email) => {
        expect(email).toContain('@paperlyte.com')
      })
    })

    it('should match CompanyConfig interface structure', () => {
      const company: CompanyConfig = LEGAL_CONFIG.company
      expect(typeof company.name).toBe('string')
      expect(typeof company.legalName).toBe('string')
      expect(typeof company.email).toBe('string')
    })
  })

  describe('Address Section', () => {
    it('should have all required address fields', () => {
      expect(LEGAL_CONFIG.address).toHaveProperty('street')
      expect(LEGAL_CONFIG.address).toHaveProperty('city')
      expect(LEGAL_CONFIG.address).toHaveProperty('state')
      expect(LEGAL_CONFIG.address).toHaveProperty('zip')
      expect(LEGAL_CONFIG.address).toHaveProperty('country')
    })

    it('should have exactly 5 address fields', () => {
      expect(Object.keys(LEGAL_CONFIG.address).length).toBe(5)
    })

    it('should have string values for all fields', () => {
      Object.entries(LEGAL_CONFIG.address).forEach(([field, value]) => {
        expect(typeof value, `Address field "${field}" should be a string`).toBe('string')
      })
    })
  })

  describe('Documents Section', () => {
    it('should have all required document links', () => {
      expect(LEGAL_CONFIG.documents).toHaveProperty('privacy')
      expect(LEGAL_CONFIG.documents).toHaveProperty('terms')
      expect(LEGAL_CONFIG.documents).toHaveProperty('cookies')
      expect(LEGAL_CONFIG.documents).toHaveProperty('security')
      expect(LEGAL_CONFIG.documents).toHaveProperty('dmca')
      expect(LEGAL_CONFIG.documents).toHaveProperty('accessibility')
    })

    it('should have valid link formats', () => {
      Object.entries(LEGAL_CONFIG.documents).forEach(([doc, link]) => {
        expect(
          link.startsWith('/') || link.startsWith('#') || link.startsWith('http'),
          `Document link for "${doc}" should be valid`
        ).toBe(true)
      })
    })

    it('should have privacy and terms documents available', () => {
      expect(LEGAL_CONFIG.documents.privacy).toBe('/privacy.html')
      expect(LEGAL_CONFIG.documents.terms).toBe('/terms.html')
    })
  })

  describe('Social Section', () => {
    it('should have all social media links', () => {
      expect(LEGAL_CONFIG.social).toHaveProperty('github')
      expect(LEGAL_CONFIG.social).toHaveProperty('twitter')
      expect(LEGAL_CONFIG.social).toHaveProperty('linkedin')
      expect(LEGAL_CONFIG.social).toHaveProperty('discord')
    })

    it('should have valid GitHub URL', () => {
      expect(LEGAL_CONFIG.social.github).toMatch(/^https:\/\/github\.com\//)
    })

    it('should have string values for all social links', () => {
      Object.entries(LEGAL_CONFIG.social).forEach(([platform, url]) => {
        expect(typeof url, `Social link for "${platform}" should be a string`).toBe('string')
      })
    })
  })

  describe('Metadata Section', () => {
    it('should have all required metadata fields', () => {
      expect(LEGAL_CONFIG.metadata).toHaveProperty('privacyLastUpdated')
      expect(LEGAL_CONFIG.metadata).toHaveProperty('termsLastUpdated')
      expect(LEGAL_CONFIG.metadata).toHaveProperty('termsVersion')
      expect(LEGAL_CONFIG.metadata).toHaveProperty('jurisdiction')
      expect(LEGAL_CONFIG.metadata).toHaveProperty('governingLaw')
    })

    it('should have valid date format for update fields', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/

      expect(
        dateRegex.test(LEGAL_CONFIG.metadata.privacyLastUpdated),
        'privacyLastUpdated should be in YYYY-MM-DD format'
      ).toBe(true)

      expect(
        dateRegex.test(LEGAL_CONFIG.metadata.termsLastUpdated),
        'termsLastUpdated should be in YYYY-MM-DD format'
      ).toBe(true)
    })

    it('should have valid version format', () => {
      expect(LEGAL_CONFIG.metadata.termsVersion).toMatch(/^\d+\.\d+$/)
    })
  })

  describe('needsLegalReview Function', () => {
    it('should be defined and exportable', () => {
      expect(typeof needsLegalReview).toBe('function')
    })

    it('should return a boolean', () => {
      const result = needsLegalReview()
      expect(typeof result).toBe('boolean')
    })

    it('should return true when placeholders exist', () => {
      // Based on the current config, placeholders exist
      const result = needsLegalReview()
      expect(result).toBe(true)
    })

    it('should detect placeholder in legalName', () => {
      expect(LEGAL_CONFIG.company.legalName).toContain('[')
      expect(needsLegalReview()).toBe(true)
    })

    it('should detect placeholder in address', () => {
      expect(LEGAL_CONFIG.address.street).toContain('[')
      expect(needsLegalReview()).toBe(true)
    })

    it('should detect placeholder in jurisdiction', () => {
      expect(LEGAL_CONFIG.metadata.jurisdiction).toContain('[')
      expect(needsLegalReview()).toBe(true)
    })
  })

  describe('getPlaceholderFields Function', () => {
    it('should be defined and exportable', () => {
      expect(typeof getPlaceholderFields).toBe('function')
    })

    it('should return an array', () => {
      const result = getPlaceholderFields()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return placeholder field names', () => {
      const placeholders = getPlaceholderFields()
      expect(placeholders.length).toBeGreaterThan(0)

      placeholders.forEach((field) => {
        expect(typeof field).toBe('string')
        expect(field.length).toBeGreaterThan(0)
      })
    })

    it('should identify Company Legal Name as placeholder', () => {
      const placeholders = getPlaceholderFields()
      expect(placeholders).toContain('Company Legal Name')
    })

    it('should identify Physical Address as placeholder', () => {
      const placeholders = getPlaceholderFields()
      expect(placeholders).toContain('Physical Address')
    })

    it('should identify Jurisdiction as placeholder', () => {
      const placeholders = getPlaceholderFields()
      expect(placeholders).toContain('Jurisdiction/Governing Law')
    })

    it('should have exactly 3 placeholder fields', () => {
      const placeholders = getPlaceholderFields()
      expect(placeholders.length).toBe(3)
    })
  })

  describe('Data Consistency', () => {
    it('should have consistent email domains', () => {
      const emails = Object.values(LEGAL_CONFIG.company).filter(
        (value) => typeof value === 'string' && value.includes('@')
      )

      const domains = emails.map((email) => email.split('@')[1])
      const uniqueDomains = new Set(domains)

      expect(uniqueDomains.size).toBe(1)
      expect(Array.from(uniqueDomains)[0]).toBe('paperlyte.com')
    })

    it('should have valid last updated dates for privacy and terms', () => {
      const { privacyLastUpdated, termsLastUpdated } = LEGAL_CONFIG.metadata

      expect(typeof privacyLastUpdated).toBe('string')
      expect(privacyLastUpdated.length).toBeGreaterThan(0)
      expect(new Date(privacyLastUpdated).toString()).not.toBe('Invalid Date')

      expect(typeof termsLastUpdated).toBe('string')
      expect(termsLastUpdated.length).toBeGreaterThan(0)
      expect(new Date(termsLastUpdated).toString()).not.toBe('Invalid Date')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match LEGAL_CONFIG snapshot', () => {
      expect(LEGAL_CONFIG).toMatchSnapshot()
    })

    it('should match placeholder fields snapshot', () => {
      expect(getPlaceholderFields()).toMatchSnapshot()
    })

    it('should match needsLegalReview result snapshot', () => {
      expect(needsLegalReview()).toMatchSnapshot()
    })
  })
})
