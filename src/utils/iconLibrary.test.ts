/**
 * Icon Library Tests
 *
 * These tests ensure the icon registry remains consistent and prevents drift
 * between multiple sources of truth (imports, library.add, iconNameMap, brandIconNames, validIconNames).
 */

import { describe, it, expect } from 'vitest'
import {
  iconNameMap,
  brandIconNames,
  validIconNames,
  convertIconName,
  isBrandIcon,
  isValidIcon,
} from './iconLibrary'

describe('iconLibrary', () => {
  /**
   * Helper function to verify icon conversion and validity
   * Reduces duplication in test cases
   */
  const assertIconConversion = (
    icons: Array<{ input: string; expected: string }>,
   const assertIconConversion = (
     icons: Array<{ input: string; expected: string }>
   ) => {
     icons.forEach(({ input, expected }) => {
       const converted = convertIconName(input)
       expect(converted).toBe(expected)
       expect(validIconNames.has(converted)).toBe(true)
     })
   }
    it('should have all mapped icons registered in validIconNames', () => {
      // Every value in iconNameMap should exist in validIconNames
      // This prevents mapping to non-existent icons
      const mappedIcons = Object.values(iconNameMap)

      mappedIcons.forEach((iconName) => {
        expect(
          validIconNames.has(iconName),
          `Icon "${iconName}" from iconNameMap is not registered in validIconNames`
        ).toBe(true)
      })
    })

    it('should have all brand icons from iconNameMap in brandIconNames', () => {
      // Known brand icons from the mapping
      const expectedBrandIcons = ['github', 'twitter', 'apple', 'windows']

      expectedBrandIcons.forEach((iconName) => {
        expect(
          brandIconNames.has(iconName),
          `Brand icon "${iconName}" should be in brandIconNames`
        ).toBe(true)
      })
    })

    it('should have fallback icon in validIconNames', () => {
      // The fallback icon (circle-question) must always be valid
      expect(validIconNames.has('circle-question')).toBe(true)
    })

    it('should not have brand icons overlap with solid icons', () => {
      // Brand and solid icons should be mutually exclusive
      const solidIcons = Array.from(validIconNames).filter((icon) => !brandIconNames.has(icon))

      // Check that no brand icon appears in the solid icon set
      const brandArray = Array.from(brandIconNames)
      brandArray.forEach((brandIcon) => {
        expect(
          solidIcons.includes(brandIcon),
          `Brand icon "${brandIcon}" should not appear in solid icons set`
        ).toBe(false)
      })

      // Verify intersection is empty
      const intersection = brandArray.filter((icon) => solidIcons.includes(icon))
      expect(intersection.length).toBe(0)
    })
  })

  describe('convertIconName', () => {
    it('should convert old fa- prefixed names correctly', () => {
      expect(convertIconName('fa-bolt')).toBe('bolt')
      expect(convertIconName('fa-pen-nib')).toBe('pen-nib')
      expect(convertIconName('fa-github')).toBe('github')
    })

    it('should only strip leading fa- prefix', () => {
      // Should only strip leading 'fa-' prefix; preserve 'fa-' occurrences elsewhere in the string
      expect(convertIconName('fa-wifi-fa-test')).toBe('wifi-fa-test')
    })

    it('should return unmapped names without fa- prefix', () => {
      // Unknown icon names should have fa- prefix stripped
      expect(convertIconName('fa-unknown-icon')).toBe('unknown-icon')
    })

    it('should handle names without fa- prefix', () => {
      // Names already in new format should pass through
      expect(convertIconName('bolt')).toBe('bolt')
      expect(convertIconName('github')).toBe('github')
    })
  })

  describe('isBrandIcon', () => {
    it('should correctly identify brand icons', () => {
      expect(isBrandIcon('github')).toBe(true)
      expect(isBrandIcon('twitter')).toBe(true)
      expect(isBrandIcon('apple')).toBe(true)
      expect(isBrandIcon('windows')).toBe(true)
    })

    it('should return false for solid icons', () => {
      expect(isBrandIcon('bolt')).toBe(false)
      expect(isBrandIcon('pen-nib')).toBe(false)
      expect(isBrandIcon('heart')).toBe(false)
    })

    it('should return false for unknown icons', () => {
      expect(isBrandIcon('unknown-icon')).toBe(false)
    })
  })

  describe('isValidIcon', () => {
    it('should return true for all mapped icons', () => {
      const mappedIcons = Object.values(iconNameMap)

      mappedIcons.forEach((iconName) => {
        expect(isValidIcon(iconName)).toBe(true)
      })
    })

    it('should return true for fallback icon', () => {
      expect(isValidIcon('circle-question')).toBe(true)
    })

    it('should return false for unmapped/unregistered icons', () => {
      expect(isValidIcon('unknown-icon')).toBe(false)
      expect(isValidIcon('fa-unknown')).toBe(false)
      expect(isValidIcon('not-an-icon')).toBe(false)
    })

    it('should validate known solid icons', () => {
      expect(isValidIcon('bolt')).toBe(true)
      expect(isValidIcon('heart')).toBe(true)
      expect(isValidIcon('download')).toBe(true)
    })

    it('should validate known brand icons', () => {
      expect(isValidIcon('github')).toBe(true)
      expect(isValidIcon('twitter')).toBe(true)
    })
  })

  describe('Icon Name Mapping', () => {
    it('should have unique values in iconNameMap', () => {
      const values = Object.values(iconNameMap)
      const uniqueValues = new Set(values)

      expect(values.length).toBe(uniqueValues.size)
    })

    it('should convert all expected feature icons', () => {
      // Core feature icons that must be convertible
      const featureIcons = [
        { input: 'fa-bolt', expected: 'bolt' }, // Lightning Speed
        { input: 'fa-pen-nib', expected: 'pen-nib' }, // Beautiful Simplicity
        { input: 'fa-tags', expected: 'tags' }, // Tag-Based Organization
        { input: 'fa-mobile-screen', expected: 'mobile-screen' }, // Universal Access
        { input: 'fa-shield-halved', expected: 'shield-halved' }, // Privacy Focused
      ]

      assertIconConversion(featureIcons, 'feature icons')
    })

    it('should convert all expected UI icons', () => {
      // UI icons that must be convertible
      const uiIcons = [
        { input: 'fa-bars', expected: 'bars' }, // Mobile menu
        { input: 'fa-xmark', expected: 'xmark' }, // Close
        { input: 'fa-moon', expected: 'moon' }, // Dark mode
        { input: 'fa-sun', expected: 'sun' }, // Light mode
      ]

      assertIconConversion(uiIcons, 'UI icons')
    })
  })

  describe('Regression Prevention', () => {
    it('should have at least 31 solid icons registered', () => {
      // Based on current imports - prevents accidental removal
      // Icon breakdown: 31 solid (non-fallback) + 4 brand + 1 fallback = 36 total
      const solidIcons = Array.from(validIconNames).filter(
        (icon) => !brandIconNames.has(icon) && icon !== 'circle-question'
      )

      expect(solidIcons.length).toBeGreaterThanOrEqual(31)
    })

    it('should have exactly 4 brand icons registered', () => {
      // Icon breakdown: 31 solid (non-fallback) + 4 brand + 1 fallback = 36 total
      expect(brandIconNames.size).toBe(4)
    })

    it('should maintain icon count in validIconNames', () => {
      // Icon breakdown: 31 solid (non-fallback) + 4 brand + 1 fallback = 36 total
      expect(validIconNames.size).toBeGreaterThanOrEqual(36)
    })
  })
})
