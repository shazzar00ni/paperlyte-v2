/**
 * Config Constants Tests
 *
 * Tests for application configuration constants to ensure
 * data structure correctness and validate configuration values.
 */

import { describe, it, expect } from 'vitest'
import { CONTACT, SOCIAL_LINKS, APP_CONFIG } from './config'

describe('Config Constants', () => {
  describe('CONTACT Configuration', () => {
    it('should be defined as an object', () => {
      expect(typeof CONTACT).toBe('object')
      expect(CONTACT).not.toBeNull()
    })

    it('should have supportEmail field', () => {
      expect(CONTACT).toHaveProperty('supportEmail')
    })

    it('should have salesEmail field', () => {
      expect(CONTACT).toHaveProperty('salesEmail')
    })

    it('should have exactly 2 contact fields', () => {
      expect(Object.keys(CONTACT).length).toBe(2)
    })

    it('should have valid email formats', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      expect(
        emailRegex.test(CONTACT.supportEmail),
        'supportEmail should be valid'
      ).toBe(true)

      expect(
        emailRegex.test(CONTACT.salesEmail),
        'salesEmail should be valid'
      ).toBe(true)
    })

    it('should use paperlyte.com domain', () => {
      expect(CONTACT.supportEmail).toContain('@paperlyte.com')
      expect(CONTACT.salesEmail).toContain('@paperlyte.com')
    })

    it('should have support@ prefix for support email', () => {
      expect(CONTACT.supportEmail).toMatch(/^support@/)
    })

    it('should have hello@ prefix for sales email', () => {
      expect(CONTACT.salesEmail).toMatch(/^hello@/)
    })

    it('should be marked as const', () => {
      // as const is compile-time only, but we verify the structure
      expect(typeof CONTACT).toBe('object')
    })
  })

  describe('SOCIAL_LINKS Configuration', () => {
    it('should be defined as an object', () => {
      expect(typeof SOCIAL_LINKS).toBe('object')
      expect(SOCIAL_LINKS).not.toBeNull()
    })

    it('should have all social platform links', () => {
      expect(SOCIAL_LINKS).toHaveProperty('twitter')
      expect(SOCIAL_LINKS).toHaveProperty('github')
      expect(SOCIAL_LINKS).toHaveProperty('discord')
    })

    it('should have exactly 3 social links', () => {
      expect(Object.keys(SOCIAL_LINKS).length).toBe(3)
    })

    it('should have valid URL formats', () => {
      Object.entries(SOCIAL_LINKS).forEach(([platform, url]) => {
        expect(
          url.startsWith('http://') || url.startsWith('https://'),
          `URL for ${platform} should start with http:// or https://`
        ).toBe(true)
      })
    })

    it('should have twitter URL pointing to twitter.com', () => {
      expect(SOCIAL_LINKS.twitter).toContain('twitter.com')
    })

    it('should have github URL pointing to github.com', () => {
      expect(SOCIAL_LINKS.github).toContain('github.com')
    })

    it('should have discord URL pointing to discord.gg', () => {
      expect(SOCIAL_LINKS.discord).toContain('discord.gg')
    })

    it('should include paperlyte in social URLs', () => {
      Object.entries(SOCIAL_LINKS).forEach(([platform, url]) => {
        expect(
          url.toLowerCase().includes('paperlyte'),
          `${platform} URL should reference paperlyte`
        ).toBe(true)
      })
    })

    it('should be marked as const', () => {
      // as const is compile-time only, but we verify the structure
      expect(typeof SOCIAL_LINKS).toBe('object')
    })
  })

  describe('APP_CONFIG Configuration', () => {
    it('should be defined as an object', () => {
      expect(typeof APP_CONFIG).toBe('object')
      expect(APP_CONFIG).not.toBeNull()
    })

    it('should have all required app metadata', () => {
      expect(APP_CONFIG).toHaveProperty('name')
      expect(APP_CONFIG).toHaveProperty('tagline')
      expect(APP_CONFIG).toHaveProperty('description')
    })

    it('should have exactly 3 metadata fields', () => {
      expect(Object.keys(APP_CONFIG).length).toBe(3)
    })

    it('should have non-empty name', () => {
      expect(APP_CONFIG.name.length).toBeGreaterThan(0)
    })

    it('should have non-empty tagline', () => {
      expect(APP_CONFIG.tagline.length).toBeGreaterThan(0)
    })

    it('should have non-empty description', () => {
      expect(APP_CONFIG.description.length).toBeGreaterThan(0)
    })

    it('should have app name as Paperlyte', () => {
      expect(APP_CONFIG.name).toBe('Paperlyte')
    })

    it('should have tagline mentioning thoughts or notes', () => {
      const tagline = APP_CONFIG.tagline.toLowerCase()
      expect(
        tagline.includes('thought') || tagline.includes('note'),
        'Tagline should reference thoughts or notes'
      ).toBe(true)
    })

    it('should have description mentioning note-taking', () => {
      const description = APP_CONFIG.description.toLowerCase()
      expect(description).toContain('note')
    })

    it('should emphasize speed in description', () => {
      const description = APP_CONFIG.description.toLowerCase()
      expect(
        description.includes('fast') || description.includes('lightning'),
        'Description should emphasize speed'
      ).toBe(true)
    })

    it('should mention distraction-free in description', () => {
      const description = APP_CONFIG.description.toLowerCase()
      expect(description).toContain('distraction-free')
    })

    it('should be marked as const', () => {
      // as const is compile-time only, but we verify the structure
      expect(typeof APP_CONFIG).toBe('object')
    })
  })

  describe('Cross-Configuration Consistency', () => {
    it('should have consistent naming across configs', () => {
      expect(APP_CONFIG.name).toBe('Paperlyte')

      // All emails should use paperlyte.com domain
      expect(CONTACT.supportEmail).toContain('paperlyte.com')
      expect(CONTACT.salesEmail).toContain('paperlyte.com')

      // Social links should reference paperlyte
      Object.values(SOCIAL_LINKS).forEach((url) => {
        expect(url.toLowerCase()).toContain('paperlyte')
      })
    })

    it('should have all configurations marked as const', () => {
      // Verify they are objects (as const is compile-time)
      expect(typeof CONTACT).toBe('object')
      expect(typeof SOCIAL_LINKS).toBe('object')
      expect(typeof APP_CONFIG).toBe('object')
    })
  })

  describe('String Type Validation', () => {
    it('should have all CONTACT values as strings', () => {
      Object.entries(CONTACT).forEach(([key, value]) => {
        expect(
          typeof value,
          `CONTACT.${key} should be a string`
        ).toBe('string')
      })
    })

    it('should have all SOCIAL_LINKS values as strings', () => {
      Object.entries(SOCIAL_LINKS).forEach(([key, value]) => {
        expect(
          typeof value,
          `SOCIAL_LINKS.${key} should be a string`
        ).toBe('string')
      })
    })

    it('should have all APP_CONFIG values as strings', () => {
      Object.entries(APP_CONFIG).forEach(([key, value]) => {
        expect(
          typeof value,
          `APP_CONFIG.${key} should be a string`
        ).toBe('string')
      })
    })
  })

  describe('Value Lengths', () => {
    it('should have reasonable length for app name', () => {
      expect(APP_CONFIG.name.length).toBeGreaterThan(3)
      expect(APP_CONFIG.name.length).toBeLessThan(30)
    })

    it('should have reasonable length for tagline', () => {
      expect(APP_CONFIG.tagline.length).toBeGreaterThan(10)
      expect(APP_CONFIG.tagline.length).toBeLessThan(100)
    })

    it('should have reasonable length for description', () => {
      expect(APP_CONFIG.description.length).toBeGreaterThan(20)
      expect(APP_CONFIG.description.length).toBeLessThan(200)
    })
  })

  describe('Snapshot Tests', () => {
    it('should match CONTACT snapshot', () => {
      expect(CONTACT).toMatchSnapshot()
    })

    it('should match SOCIAL_LINKS snapshot', () => {
      expect(SOCIAL_LINKS).toMatchSnapshot()
    })

    it('should match APP_CONFIG snapshot', () => {
      expect(APP_CONFIG).toMatchSnapshot()
    })

    it('should match all config exports snapshot', () => {
      expect({
        CONTACT,
        SOCIAL_LINKS,
        APP_CONFIG,
      }).toMatchSnapshot()
    })
  })
})
