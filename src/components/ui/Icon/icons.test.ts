import { describe, it, expect } from 'vitest'
import { iconPaths, iconViewBox, getIconViewBox, strokeOnlyIcons } from './icons'

describe('icons', () => {
  describe('iconPaths', () => {
    it('should be a non-null object', () => {
      expect(typeof iconPaths).toBe('object')
      expect(iconPaths).not.toBeNull()
    })

    it('should have string values for all icon path entries', () => {
      Object.entries(iconPaths).forEach(([name, path]) => {
        expect(typeof path, `Path for "${name}" should be a string`).toBe('string')
        expect(path.length, `Path for "${name}" should not be empty`).toBeGreaterThan(0)
      })
    })

    it('should contain all expected brand icons', () => {
      expect(iconPaths).toHaveProperty('fa-github')
      expect(iconPaths).toHaveProperty('fa-twitter')
      expect(iconPaths).toHaveProperty('fa-apple')
      expect(iconPaths).toHaveProperty('fa-windows')
    })

    it('should contain all expected feature icons', () => {
      expect(iconPaths).toHaveProperty('fa-bolt')
      expect(iconPaths).toHaveProperty('fa-lock')
      expect(iconPaths).toHaveProperty('fa-tags')
      expect(iconPaths).toHaveProperty('fa-shield-halved')
      expect(iconPaths).toHaveProperty('fa-mobile-screen')
    })

    it('should contain all expected UI state icons', () => {
      expect(iconPaths).toHaveProperty('fa-spinner')
      expect(iconPaths).toHaveProperty('fa-circle-check')
      expect(iconPaths).toHaveProperty('fa-circle-exclamation')
      expect(iconPaths).toHaveProperty('fa-triangle-exclamation')
    })

    it('should contain all expected navigation and button icons', () => {
      expect(iconPaths).toHaveProperty('fa-home')
      expect(iconPaths).toHaveProperty('fa-arrow-right')
      expect(iconPaths).toHaveProperty('fa-download')
    })

    it('should contain all expected feedback widget icons', () => {
      expect(iconPaths).toHaveProperty('fa-comment-dots')
      expect(iconPaths).toHaveProperty('fa-x')
      expect(iconPaths).toHaveProperty('fa-bug')
      expect(iconPaths).toHaveProperty('fa-lightbulb')
      expect(iconPaths).toHaveProperty('fa-paper-plane')
    })

    it('should contain theme toggle icons', () => {
      expect(iconPaths).toHaveProperty('fa-moon')
      expect(iconPaths).toHaveProperty('fa-sun')
    })

    it('should contain the wifi-slash icon for offline state', () => {
      expect(iconPaths).toHaveProperty('fa-wifi-slash')
    })

    it('should contain the feather logo icon', () => {
      expect(iconPaths).toHaveProperty('fa-feather')
    })
  })

  describe('iconViewBox', () => {
    it('should be a non-null object', () => {
      expect(typeof iconViewBox).toBe('object')
      expect(iconViewBox).not.toBeNull()
    })

    it('should contain fa-apple with its viewBox override', () => {
      expect(iconViewBox['fa-apple']).toBe('0 0 24 24')
    })

    it('should contain fa-windows with its non-standard viewBox', () => {
      expect(iconViewBox['fa-windows']).toBe('0 0 23 24')
    })

    it('should have exactly 2 entries', () => {
      expect(Object.keys(iconViewBox).length).toBe(2)
    })

    it('should have string values for all viewBox entries', () => {
      Object.entries(iconViewBox).forEach(([name, viewBox]) => {
        expect(typeof viewBox, `viewBox for "${name}" should be a string`).toBe('string')
      })
    })
  })

  describe('getIconViewBox', () => {
    it('should return the custom viewBox for fa-apple', () => {
      expect(getIconViewBox('fa-apple')).toBe('0 0 24 24')
    })

    it('should return the non-standard viewBox for fa-windows', () => {
      expect(getIconViewBox('fa-windows')).toBe('0 0 23 24')
    })

    it('should return default "0 0 24 24" for icons not in iconViewBox', () => {
      expect(getIconViewBox('fa-bolt')).toBe('0 0 24 24')
    })

    it('should return default "0 0 24 24" for an empty string', () => {
      expect(getIconViewBox('')).toBe('0 0 24 24')
    })

    it('should return default "0 0 24 24" for a completely unknown icon name', () => {
      expect(getIconViewBox('fa-does-not-exist-at-all')).toBe('0 0 24 24')
    })

    it('should return a string in all cases', () => {
      expect(typeof getIconViewBox('fa-apple')).toBe('string')
      expect(typeof getIconViewBox('fa-bolt')).toBe('string')
      expect(typeof getIconViewBox('')).toBe('string')
    })

    it('should not throw for prototype pollution attempts', () => {
      // safePropertyAccess should guard against __proto__ / constructor access
      expect(() => getIconViewBox('__proto__')).not.toThrow()
      expect(getIconViewBox('__proto__')).toBe('0 0 24 24')
    })
  })

  describe('strokeOnlyIcons', () => {
    it('should be exported as a Set', () => {
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

    it('should not include standard solid icons', () => {
      expect(strokeOnlyIcons.has('fa-bolt')).toBe(false)
      expect(strokeOnlyIcons.has('fa-home')).toBe(false)
      expect(strokeOnlyIcons.has('fa-arrow-right')).toBe(false)
    })
  })
})