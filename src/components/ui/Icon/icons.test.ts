import { describe, it, expect } from 'vitest'
import { getIconViewBox, iconViewBox, iconPaths, strokeOnlyIcons } from './icons'

describe('icons.ts', () => {
  describe('getIconViewBox', () => {
    it('returns the default viewBox for an unknown icon', () => {
      expect(getIconViewBox('fa-unknown-icon')).toBe('0 0 24 24')
    })

    it('returns the default viewBox for an empty string', () => {
      expect(getIconViewBox('')).toBe('0 0 24 24')
    })

    it('returns the default viewBox for a standard icon not in iconViewBox', () => {
      expect(getIconViewBox('fa-bolt')).toBe('0 0 24 24')
    })

    it('returns the default viewBox for fa-apple (explicitly listed as standard 24×24)', () => {
      expect(getIconViewBox('fa-apple')).toBe('0 0 24 24')
    })

    it('returns the non-standard viewBox for fa-windows', () => {
      expect(getIconViewBox('fa-windows')).toBe('0 0 23 24')
    })

    it('returns a string for every icon name that appears in iconViewBox', () => {
      for (const [name, expectedViewBox] of Object.entries(iconViewBox)) {
        expect(getIconViewBox(name)).toBe(expectedViewBox)
      }
    })

    it('prevents prototype pollution — does not return values for __proto__', () => {
      // safePropertyAccess guards against prototype-chain lookups
      expect(getIconViewBox('__proto__')).toBe('0 0 24 24')
    })

    it('prevents prototype pollution — does not return values for constructor', () => {
      expect(getIconViewBox('constructor')).toBe('0 0 24 24')
    })
  })

  describe('iconViewBox', () => {
    it('contains an entry for fa-apple', () => {
      expect(Object.prototype.hasOwnProperty.call(iconViewBox, 'fa-apple')).toBe(true)
    })

    it('contains an entry for fa-windows', () => {
      expect(Object.prototype.hasOwnProperty.call(iconViewBox, 'fa-windows')).toBe(true)
    })

    it('fa-windows viewBox has a non-standard width of 23', () => {
      expect(iconViewBox['fa-windows']).toMatch(/^0 0 23 /)
    })
  })

  describe('iconPaths', () => {
    it('contains an entry for fa-bolt', () => {
      expect(typeof iconPaths['fa-bolt']).toBe('string')
      expect(iconPaths['fa-bolt'].length).toBeGreaterThan(0)
    })

    it('contains an entry for fa-github', () => {
      expect(typeof iconPaths['fa-github']).toBe('string')
    })

    it('contains an entry for fa-envelope', () => {
      expect(typeof iconPaths['fa-envelope']).toBe('string')
    })

    it('contains path data for all icons referenced in iconViewBox', () => {
      for (const name of Object.keys(iconViewBox)) {
        expect(
          Object.prototype.hasOwnProperty.call(iconPaths, name),
          `iconPaths should contain "${name}" since it is listed in iconViewBox`
        ).toBe(true)
      }
    })

    it('has at least 20 icon entries (guards against accidental deletions)', () => {
      expect(Object.keys(iconPaths).length).toBeGreaterThanOrEqual(20)
    })

    it('all entries are non-empty SVG path strings', () => {
      for (const [name, path] of Object.entries(iconPaths)) {
        expect(typeof path, `path for "${name}" should be a string`).toBe('string')
        expect(path.trim().length, `path for "${name}" should not be empty`).toBeGreaterThan(0)
      }
    })
  })

  describe('strokeOnlyIcons', () => {
    it('is a Set', () => {
      expect(strokeOnlyIcons).toBeInstanceOf(Set)
    })

    it('contains fa-circle-check', () => {
      expect(strokeOnlyIcons.has('fa-circle-check')).toBe(true)
    })

    it('contains fa-circle-exclamation', () => {
      expect(strokeOnlyIcons.has('fa-circle-exclamation')).toBe(true)
    })

    it('contains fa-shield-halved', () => {
      expect(strokeOnlyIcons.has('fa-shield-halved')).toBe(true)
    })

    it('does not include fa-bolt (a non-stroke icon)', () => {
      expect(strokeOnlyIcons.has('fa-bolt')).toBe(false)
    })
  })
})
