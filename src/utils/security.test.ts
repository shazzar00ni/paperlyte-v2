import { describe, it, expect } from 'vitest'
import { isSafePropertyKey } from './security'

describe('Security Utilities', () => {
  describe('isSafePropertyKey', () => {
    it('should return true for safe property keys', () => {
      expect(isSafePropertyKey('name')).toBe(true)
      expect(isSafePropertyKey('value')).toBe(true)
      expect(isSafePropertyKey('button_text')).toBe(true)
      expect(isSafePropertyKey('location')).toBe(true)
      expect(isSafePropertyKey('safe_param')).toBe(true)
    })

    it('should return false for __proto__', () => {
      expect(isSafePropertyKey('__proto__')).toBe(false)
    })

    it('should return false for constructor', () => {
      expect(isSafePropertyKey('constructor')).toBe(false)
    })

    it('should return false for prototype', () => {
      expect(isSafePropertyKey('prototype')).toBe(false)
    })

    it('should be case-sensitive', () => {
      // These are different from the dangerous keys, so they should be allowed
      expect(isSafePropertyKey('Constructor')).toBe(true)
      expect(isSafePropertyKey('Prototype')).toBe(true)
      expect(isSafePropertyKey('CONSTRUCTOR')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(isSafePropertyKey('')).toBe(true)
    })

    it('should handle special characters', () => {
      expect(isSafePropertyKey('key-with-dashes')).toBe(true)
      expect(isSafePropertyKey('key_with_underscores')).toBe(true)
      expect(isSafePropertyKey('key.with.dots')).toBe(true)
    })
  })
})
