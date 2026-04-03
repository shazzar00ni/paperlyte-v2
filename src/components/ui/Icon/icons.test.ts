import { describe, it, expect } from 'vitest'
import { iconPaths, iconViewBox, getIconViewBox, strokeOnlyIcons } from './icons'

describe('icons', () => {
  describe('getIconViewBox', () => {
    it('should return the default viewBox for an unknown icon', () => {
      expect(getIconViewBox('fa-unknown-icon')).toBe('0 0 24 24')
    })

    it('should return the default viewBox for fa-bolt (not in overrides)', () => {
      expect(getIconViewBox('fa-bolt')).toBe('0 0 24 24')
    })

    it('should return the default viewBox for fa-github (not in overrides)', () => {
      expect(getIconViewBox('fa-github')).toBe('0 0 24 24')
    })

    it('should return the override viewBox for fa-apple', () => {
      expect(getIconViewBox('fa-apple')).toBe('0 0 24 24')
    })

    it('should return the non-standard override viewBox for fa-windows', () => {
      expect(getIconViewBox('fa-windows')).toBe('0 0 23 24')
    })

    it('should return a string in all cases', () => {
      const result = getIconViewBox('any-icon')
      expect(typeof result).toBe('string')
    })

    it('should return the default viewBox for an empty string', () => {
      expect(getIconViewBox('')).toBe('0 0 24 24')
    })

    it('should not be susceptible to prototype pollution via __proto__', () => {
      // safePropertyAccess blocks __proto__ — must fall back to default
      expect(getIconViewBox('__proto__')).toBe('0 0 24 24')
    })

    it('should not be susceptible to prototype pollution via constructor', () => {
      expect(getIconViewBox('constructor')).toBe('0 0 24 24')
    })
  })

  describe('iconViewBox', () => {
    it('should be defined as an object', () => {
      expect(typeof iconViewBox).toBe('object')
      expect(iconViewBox).not.toBeNull()
    })

    it('should contain an entry for fa-apple', () => {
      expect(iconViewBox).toHaveProperty('fa-apple')
    })

    it('should contain an entry for fa-windows', () => {
      expect(iconViewBox).toHaveProperty('fa-windows')
    })

    it('should have a non-standard viewBox width for fa-windows', () => {
      // fa-windows uses a 23-unit-wide coordinate space
      expect(iconViewBox['fa-windows']).toBe('0 0 23 24')
    })

    it('should have string values for all entries', () => {
      Object.entries(iconViewBox).forEach(([name, viewBox]) => {
        expect(typeof viewBox, `viewBox for "${name}" should be a string`).toBe('string')
      })
    })

    it('should have viewBox values matching the "x y w h" format', () => {
      const viewBoxPattern = /^\d+ \d+ \d+ \d+$/
      Object.entries(iconViewBox).forEach(([name, viewBox]) => {
        expect(viewBoxPattern.test(viewBox), `viewBox "${viewBox}" for "${name}" should match format`).toBe(true)
      })
    })
  })

  describe('iconPaths', () => {
    it('should be defined as an object', () => {
      expect(typeof iconPaths).toBe('object')
      expect(iconPaths).not.toBeNull()
    })

    it('should contain entries for all icons with overrides in iconViewBox', () => {
      Object.keys(iconViewBox).forEach((name) => {
        expect(iconPaths, `iconPaths should include "${name}" since it has a viewBox override`).toHaveProperty(name)
      })
    })

    it('should have string values for all path entries', () => {
      Object.entries(iconPaths).forEach(([name, path]) => {
        expect(typeof path, `Path for "${name}" should be a string`).toBe('string')
        expect(path.length, `Path for "${name}" should be non-empty`).toBeGreaterThan(0)
      })
    })

    it('should include fa-bolt', () => {
      expect(iconPaths).toHaveProperty('fa-bolt')
      expect(typeof iconPaths['fa-bolt']).toBe('string')
    })

    it('should include fa-github', () => {
      expect(iconPaths).toHaveProperty('fa-github')
    })

    it('should include fa-spinner (used in loading states)', () => {
      expect(iconPaths).toHaveProperty('fa-spinner')
    })

    it('should include fa-wifi-slash (used in OfflinePage)', () => {
      expect(iconPaths).toHaveProperty('fa-wifi-slash')
    })

    it('should include fa-circle-check', () => {
      expect(iconPaths).toHaveProperty('fa-circle-check')
    })

    it('should include fa-envelope', () => {
      expect(iconPaths).toHaveProperty('fa-envelope')
    })
  })

  describe('strokeOnlyIcons', () => {
    it('should be a Set', () => {
      expect(strokeOnlyIcons).toBeInstanceOf(Set)
    })

    it('should contain fa-circle-check', () => {
      expect(strokeOnlyIcons.has('fa-circle-check')).toBe(true)
    })

    it('should contain fa-circle-exclamation', () => {
      expect(strokeOnlyIcons.has('fa-circle-exclamation')).toBe(true)
    })

    it('should contain fa-shield-halved', () => {
      expect(strokeOnlyIcons.has('fa-shield-halved')).toBe(true)
    })

    it('should have exactly 3 entries', () => {
      expect(strokeOnlyIcons.size).toBe(3)
    })

    it('should not contain fa-bolt (non-stroke-only icon)', () => {
      expect(strokeOnlyIcons.has('fa-bolt')).toBe(false)
    })

    it('should not contain fa-github (non-stroke-only icon)', () => {
      expect(strokeOnlyIcons.has('fa-github')).toBe(false)
    })

    it('should contain only icons that are also defined in iconPaths', () => {
      strokeOnlyIcons.forEach((name) => {
        expect(
          iconPaths,
          `strokeOnlyIcons member "${name}" should exist in iconPaths`
        ).toHaveProperty(name)
      })
    })
  })
})