/**
 * Features Constants Tests
 *
 * Tests for FEATURES constant to ensure data structure correctness
 * and validate feature content.
 */

import { describe, it, expect } from 'vitest'
import { FEATURES, type Feature } from './features'
import { escapeRegExp } from '@/utils/test/regexHelpers'

/**
 * Counts occurrences of words in a text using word boundary matching.
 * Uses escapeRegExp() to safely construct regex patterns from word list.
 *
 * @param text - Text to search in
 * @param words - Array of words to count
 * @returns Total count of all word occurrences
 */
function countOccurrences(text: string, words: string[]): number {
  return words.reduce((count, word) => {
    // Safe: word is escaped via escapeRegExp() before RegExp construction
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi') // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp, javascript_dos_rule-non-literal-regexp
    const matches = text.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

describe('Features Constants', () => {
  describe('FEATURES Structure', () => {
    it('should export FEATURES as an array', () => {
      expect(Array.isArray(FEATURES)).toBe(true)
    })

    it('should have exactly 6 core features', () => {
      expect(FEATURES.length).toBe(6)
    })

    it('should have all required fields for each feature', () => {
      FEATURES.forEach((feature, index) => {
        expect(feature, `Feature at index ${index} should have an id`).toHaveProperty('id')
        expect(feature, `Feature at index ${index} should have an icon`).toHaveProperty('icon')
        expect(feature, `Feature at index ${index} should have a title`).toHaveProperty('title')
        expect(feature, `Feature at index ${index} should have a description`).toHaveProperty(
          'description'
        )
      })
    })

    it('should have unique IDs for all features', () => {
      const ids = FEATURES.map((f) => f.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have proper TypeScript types', () => {
      const feature: Feature = FEATURES[0]
      expect(typeof feature.id).toBe('string')
      expect(typeof feature.icon).toBe('string')
      expect(typeof feature.title).toBe('string')
      expect(typeof feature.description).toBe('string')
    })
  })

  describe('Feature Content Validation', () => {
    it('should have non-empty titles', () => {
      FEATURES.forEach((feature) => {
        expect(
          feature.title.length,
          `Title for feature "${feature.id}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have non-empty descriptions', () => {
      FEATURES.forEach((feature) => {
        expect(
          feature.description.length,
          `Description for feature "${feature.id}" should not be empty`
        ).toBeGreaterThan(0)
      })
    })

    it('should have descriptions with reasonable length', () => {
      FEATURES.forEach((feature) => {
        expect(
          feature.description.length,
          `Description for "${feature.id}" should be at least 50 characters`
        ).toBeGreaterThan(50)
        expect(
          feature.description.length,
          `Description for "${feature.id}" should be less than 200 characters`
        ).toBeLessThan(200)
      })
    })

    it('should have valid Font Awesome icon format', () => {
      FEATURES.forEach((feature) => {
        expect(feature.icon, `Icon for "${feature.id}" should start with fa-`).toMatch(/^fa-/)
      })
    })

    it('should have unique icons for each feature', () => {
      const icons = FEATURES.map((f) => f.icon)
      const uniqueIcons = new Set(icons)

      expect(icons.length).toBe(uniqueIcons.size)
    })
  })

  describe('Core Features Coverage', () => {
    it('should include speed/lightning feature', () => {
      const speedFeature = FEATURES.find((f) => f.id === 'speed')
      expect(speedFeature).toBeDefined()
      expect(speedFeature?.title).toContain('Speed')
    })

    it('should include simplicity feature', () => {
      const simplicityFeature = FEATURES.find((f) => f.id === 'simplicity')
      expect(simplicityFeature).toBeDefined()
      expect(simplicityFeature?.title).toContain('Simplicity')
    })

    it('should include tags/organization feature', () => {
      const tagsFeature = FEATURES.find((f) => f.id === 'tags')
      expect(tagsFeature).toBeDefined()
      expect(tagsFeature?.title.toLowerCase()).toContain('tag')
    })

    it('should include universal/cross-platform feature', () => {
      const universalFeature = FEATURES.find((f) => f.id === 'universal')
      expect(universalFeature).toBeDefined()
      expect(universalFeature?.title).toContain('Universal')
    })

    it('should include offline feature', () => {
      const offlineFeature = FEATURES.find((f) => f.id === 'offline')
      expect(offlineFeature).toBeDefined()
      expect(offlineFeature?.title).toContain('Offline')
    })

    it('should include privacy feature', () => {
      const privacyFeature = FEATURES.find((f) => f.id === 'privacy')
      expect(privacyFeature).toBeDefined()
      expect(privacyFeature?.title).toContain('Privacy')
    })
  })

  describe('Feature Icons Validation', () => {
    it('should use bolt icon for speed', () => {
      const speedFeature = FEATURES.find((f) => f.id === 'speed')
      expect(speedFeature?.icon).toBe('fa-bolt')
    })

    it('should use pen-nib icon for simplicity', () => {
      const simplicityFeature = FEATURES.find((f) => f.id === 'simplicity')
      expect(simplicityFeature?.icon).toBe('fa-pen-nib')
    })

    it('should use tags icon for organization', () => {
      const tagsFeature = FEATURES.find((f) => f.id === 'tags')
      expect(tagsFeature?.icon).toBe('fa-tags')
    })

    it('should use mobile-screen icon for universal access', () => {
      const universalFeature = FEATURES.find((f) => f.id === 'universal')
      expect(universalFeature?.icon).toBe('fa-mobile-screen')
    })

    it('should use wifi-slash icon for offline', () => {
      const offlineFeature = FEATURES.find((f) => f.id === 'offline')
      expect(offlineFeature?.icon).toBe('fa-wifi-slash')
    })

    it('should use shield icon for privacy', () => {
      const privacyFeature = FEATURES.find((f) => f.id === 'privacy')
      expect(privacyFeature?.icon).toBe('fa-shield-halved')
    })
  })

  describe('Feature Descriptions Quality', () => {
    it('should have speed feature mention performance metrics', () => {
      const speedFeature = FEATURES.find((f) => f.id === 'speed')
      const description = speedFeature?.description.toLowerCase() ?? ''

      const hasPerformanceKeywords =
        description.includes('instant') ||
        description.includes('fast') ||
        description.includes('speed') ||
        description.includes('quick')

      expect(hasPerformanceKeywords).toBe(true)
    })

    it('should have offline feature mention connectivity', () => {
      const offlineFeature = FEATURES.find((f) => f.id === 'offline')
      const description = offlineFeature?.description.toLowerCase() ?? ''

      const hasConnectivityKeywords =
        description.includes('offline') ||
        description.includes('internet') ||
        description.includes('online')

      expect(hasConnectivityKeywords).toBe(true)
    })

    it('should have privacy feature mention security', () => {
      const privacyFeature = FEATURES.find((f) => f.id === 'privacy')
      const description = privacyFeature?.description.toLowerCase() ?? ''

      const hasSecurityKeywords =
        description.includes('encrypt') ||
        description.includes('private') ||
        description.includes('security') ||
        description.includes('privacy')

      expect(hasSecurityKeywords).toBe(true)
    })

    it('should have universal feature mention devices or platforms', () => {
      const universalFeature = FEATURES.find((f) => f.id === 'universal')
      const description = universalFeature?.description.toLowerCase() ?? ''

      const hasDeviceKeywords =
        description.includes('device') ||
        description.includes('platform') ||
        description.includes('phone') ||
        description.includes('laptop')

      expect(hasDeviceKeywords).toBe(true)
    })
  })

  describe('Value Proposition Alignment', () => {
    it('should emphasize benefits over technical details', () => {
      const allDescriptions = FEATURES.map((f) => f.description.toLowerCase()).join(' ')

      // Count occurrences of benefit words vs technical jargon
      const benefitWords = ['your', 'you', 'fast', 'simple', 'easy', 'seamless', 'instant']
      const techWords = [
        'api',
        'sdk',
        'cli',
        'endpoint',
        'protocol',
        'latency',
        'throughput',
        'integration',
      ]

      const benefitCount = countOccurrences(allDescriptions, benefitWords)
      const techCount = countOccurrences(allDescriptions, techWords)

      expect(
        benefitCount,
        'Descriptions should focus on user benefits over technical jargon'
      ).toBeGreaterThan(techCount)
    })

    it('should use action-oriented language', () => {
      // Check for active verbs and action-oriented phrases
      const actionVerbs = ['captured', 'work', 'sync', 'adapt', 'keep']

      const descriptionsWithActionVerbs = FEATURES.filter((feature) => {
        const desc = feature.description.toLowerCase()
        return actionVerbs.some((verb) => desc.includes(verb))
      })

      const proportion = descriptionsWithActionVerbs.length / FEATURES.length

      expect(
        proportion,
        `At least 80% of features should use action-oriented language (found ${Math.round(proportion * 100)}%)`
      ).toBeGreaterThanOrEqual(0.8)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain consistent ID format (lowercase, single word or hyphenated)', () => {
      FEATURES.forEach((feature) => {
        expect(feature.id, `ID "${feature.id}" should be lowercase without spaces`).toMatch(
          /^[a-z]+(-[a-z]+)*$/
        )
      })
    })

    it('should have proper capitalization in titles', () => {
      FEATURES.forEach((feature) => {
        const firstChar = feature.title[0]
        expect(firstChar, `Title "${feature.title}" should start with uppercase`).toBe(
          firstChar.toUpperCase()
        )
      })
    })

    it('should end descriptions with periods', () => {
      FEATURES.forEach((feature) => {
        expect(
          feature.description.trim().endsWith('.'),
          `Description for "${feature.id}" should end with a period`
        ).toBe(true)
      })
    })
  })

  describe('Feature Ordering', () => {
    it('should start with speed as first feature', () => {
      expect(FEATURES[0].id).toBe('speed')
    })

    it('should have strategic ordering (speed, simplicity, then others)', () => {
      // Speed and simplicity are top differentiators, should be first
      expect(FEATURES[0].id).toBe('speed')
      expect(FEATURES[1].id).toBe('simplicity')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match FEATURES snapshot', () => {
      expect(FEATURES).toMatchSnapshot()
    })

    it('should match feature IDs and icons snapshot', () => {
      const idsAndIcons = FEATURES.map((f) => ({
        id: f.id,
        icon: f.icon,
      }))

      expect(idsAndIcons).toMatchSnapshot()
    })

    it('should match feature titles snapshot', () => {
      const titles = FEATURES.map((f) => f.title)
      expect(titles).toMatchSnapshot()
    })
  })
})
