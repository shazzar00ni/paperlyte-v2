/**
 * Tests for shared analytics provider utilities
 */

import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { isDNTEnabled, isValidScriptUrl } from './utils'

describe('analytics/providers/utils', () => {
  describe('isDNTEnabled', () => {
    const originalNavigatorDnt = Object.getOwnPropertyDescriptor(navigator, 'doNotTrack')
    const originalWindowDnt = Object.getOwnPropertyDescriptor(window, 'doNotTrack')

    afterEach(() => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: null,
      })
      Object.defineProperty(window, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: null,
      })
    })

    afterAll(() => {
      if (originalNavigatorDnt) {
        Object.defineProperty(navigator, 'doNotTrack', originalNavigatorDnt)
      } else {
        Reflect.deleteProperty(
          navigator as Navigator & { doNotTrack?: string | null },
          'doNotTrack'
        )
      }
      if (originalWindowDnt) {
        Object.defineProperty(window, 'doNotTrack', originalWindowDnt)
      } else {
        Reflect.deleteProperty(window as Window & { doNotTrack?: string | null }, 'doNotTrack')
      }
    })

    it('should return false when doNotTrack is null', () => {
      expect(isDNTEnabled()).toBe(false)
    })

    it('should return false in SSR environments where navigator is undefined', () => {
      const original = globalThis.navigator
      Object.defineProperty(globalThis, 'navigator', {
        value: undefined,
        configurable: true,
        writable: true,
      })
      try {
        expect(isDNTEnabled()).toBe(false)
      } finally {
        Object.defineProperty(globalThis, 'navigator', {
          value: original,
          configurable: true,
          writable: true,
        })
      }
    })

    it('should return true when navigator.doNotTrack is "1"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: '1',
      })
      expect(isDNTEnabled()).toBe(true)
    })

    it('should return true when navigator.doNotTrack is "yes"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: 'yes',
      })
      expect(isDNTEnabled()).toBe(true)
    })

    it('should return true when window.doNotTrack is "1"', () => {
      Object.defineProperty(window, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: '1',
      })
      expect(isDNTEnabled()).toBe(true)
    })

    it('should return false when doNotTrack is "0"', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        configurable: true,
        value: '0',
      })
      expect(isDNTEnabled()).toBe(false)
    })

    it('should return true when navigator.msDoNotTrack is "1"', () => {
      const originalMsDnt = Object.getOwnPropertyDescriptor(navigator, 'msDoNotTrack')
      Object.defineProperty(navigator, 'msDoNotTrack', {
        writable: true,
        configurable: true,
        value: '1',
      })
      try {
        expect(isDNTEnabled()).toBe(true)
      } finally {
        if (originalMsDnt) {
          Object.defineProperty(navigator, 'msDoNotTrack', originalMsDnt)
        } else {
          Reflect.deleteProperty(navigator as Navigator & { msDoNotTrack?: string }, 'msDoNotTrack')
        }
      }
    })
  })

  describe('isValidScriptUrl', () => {
    it('should return true for a valid HTTPS .js URL', () => {
      expect(isValidScriptUrl('https://cdn.example.com/script.js')).toBe(true)
    })

    it('should return false for an HTTP URL', () => {
      expect(isValidScriptUrl('http://cdn.example.com/script.js')).toBe(false)
    })

    it('should return false for a URL without .js extension', () => {
      expect(isValidScriptUrl('https://cdn.example.com/tracker')).toBe(false)
    })

    it('should return false for a non-URL string', () => {
      expect(isValidScriptUrl('not-a-url')).toBe(false)
    })

    it('should return false for an empty string', () => {
      expect(isValidScriptUrl('')).toBe(false)
    })

    it('should return true for provider URLs', () => {
      expect(isValidScriptUrl('https://plausible.io/js/script.js')).toBe(true)
      expect(isValidScriptUrl('https://cdn.usefathom.com/script.js')).toBe(true)
      expect(isValidScriptUrl('https://scripts.simpleanalyticscdn.com/latest.js')).toBe(true)
    })
  })
})
