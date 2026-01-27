import { describe, it, expect } from 'vitest'
import { isSafePropertyKey, safePropertyAccess } from './security'

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

  describe('safePropertyAccess', () => {
    it('should return property value for safe keys', () => {
      const obj = { name: 'test', value: 123 }
      expect(safePropertyAccess(obj, 'name')).toBe('test')
      expect(safePropertyAccess(obj, 'value')).toBe(123)
    })

    it('should return undefined for __proto__', () => {
      const obj: Record<string, unknown> = { name: 'test' }
      obj['__proto__'] = 'malicious'
      expect(safePropertyAccess(obj, '__proto__')).toBeUndefined()
    })

    it('should return undefined for constructor', () => {
      const obj: Record<string, unknown> = { name: 'test' }
      obj['constructor'] = 'malicious'
      expect(safePropertyAccess(obj, 'constructor')).toBeUndefined()
    })

    it('should return undefined for prototype', () => {
      const obj: Record<string, unknown> = { name: 'test' }
      obj['prototype'] = 'malicious'
      expect(safePropertyAccess(obj, 'prototype')).toBeUndefined()
    })

    it('should return undefined for non-existent keys', () => {
      const obj = { name: 'test' }
      expect(safePropertyAccess(obj, 'nonexistent')).toBeUndefined()
    })

    it('should only return own properties, not inherited ones', () => {
      const parent = { inherited: 'value' }
      const child = Object.create(parent)
      child.own = 'ownValue'

      expect(safePropertyAccess(child, 'own')).toBe('ownValue')
      expect(safePropertyAccess(child, 'inherited')).toBeUndefined()
    })

    it('should handle objects with various value types', () => {
      const obj = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: 'value' },
      }

      expect(safePropertyAccess(obj, 'string')).toBe('text')
      expect(safePropertyAccess(obj, 'number')).toBe(42)
      expect(safePropertyAccess(obj, 'boolean')).toBe(true)
      expect(safePropertyAccess(obj, 'null')).toBeNull()
      expect(safePropertyAccess(obj, 'undefined')).toBeUndefined()
      expect(safePropertyAccess(obj, 'array')).toEqual([1, 2, 3])
      expect(safePropertyAccess(obj, 'object')).toEqual({ nested: 'value' })
    })
  })
})
