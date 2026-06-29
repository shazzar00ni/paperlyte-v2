import { describe, it, expect } from 'vitest'
import { iconPaths, iconViewBox, getIconViewBox, strokeOnlyIcons } from './icons'

describe('icons', () => {
  describe('iconPaths', () => {
    it('should be a non-empty Record of SVG path strings', () => {
      expect(typeof iconPaths).toBe('object')
      expect(Object.keys(iconPaths).length).toBeGreaterThan(0)
    })

    it('should contain the fa-bolt icon', () => {
      expect(iconPaths['fa-bolt']).toBeDefined()
      expect(typeof iconPaths['fa-bolt']).toBe('string')
    })

    it('should contain the fa-github icon', () => {
      expect(iconPaths['fa-github']).toBeDefined()
    })

    it('should contain the fa-moon and fa-sun icons for theme toggle', () => {
      expect(iconPaths['fa-moon']).toBeDefined()
      expect(iconPaths['fa-sun']).toBeDefined()
    })

    it('should contain the fa-bars and fa-xmark icons for navigation', () => {
      expect(iconPaths['fa-bars']).toBeDefined()
      expect(iconPaths['fa-xmark']).toBeDefined()
    })

    it('should store path data as non-empty strings', () => {
      Object.values(iconPaths).forEach((path) => {
        expect(typeof path).toBe('string')
        expect(path.length).toBeGreaterThan(0)
      })
    })

    it('should have keys prefixed with fa-', () => {
      Object.keys(iconPaths).forEach((key) => {
        expect(key).toMatch(/^fa-/)
      })
    })
  })

  describe('iconViewBox', () => {
    it('should provide a custom viewBox for fa-apple', () => {
      expect(iconViewBox['fa-apple']).toBe('0 0 24 24')
    })

    it('should provide a custom viewBox for fa-windows', () => {
      expect(iconViewBox['fa-windows']).toBe('0 0 23 24')
    })
  })

  describe('getIconViewBox', () => {
    it('should return custom viewBox for fa-apple', () => {
      expect(getIconViewBox('fa-apple')).toBe('0 0 24 24')
    })

    it('should return custom viewBox for fa-windows', () => {
      expect(getIconViewBox('fa-windows')).toBe('0 0 23 24')
    })

    it('should return default "0 0 24 24" for icons not in iconViewBox', () => {
      expect(getIconViewBox('fa-bolt')).toBe('0 0 24 24')
      expect(getIconViewBox('fa-github')).toBe('0 0 24 24')
      expect(getIconViewBox('fa-star')).toBe('0 0 24 24')
    })

    it('should return default "0 0 24 24" for unknown icon names', () => {
      expect(getIconViewBox('fa-nonexistent')).toBe('0 0 24 24')
      expect(getIconViewBox('')).toBe('0 0 24 24')
    })

    it('should not be susceptible to prototype pollution via __proto__', () => {
      expect(getIconViewBox('__proto__')).toBe('0 0 24 24')
      expect(getIconViewBox('constructor')).toBe('0 0 24 24')
    })
  })

  describe('strokeOnlyIcons', () => {
    it('should be a Set', () => {
      expect(strokeOnlyIcons instanceof Set).toBe(true)
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

    it('should contain fa-circle-info', () => {
      expect(strokeOnlyIcons.has('fa-circle-info')).toBe(true)
    })

    it('should contain fa-clock', () => {
      expect(strokeOnlyIcons.has('fa-clock')).toBe(true)
    })

    it('should contain fa-wifi', () => {
      expect(strokeOnlyIcons.has('fa-wifi')).toBe(true)
    })

    it('should contain fa-note-sticky', () => {
      expect(strokeOnlyIcons.has('fa-note-sticky')).toBe(true)
    })

    it('should have exactly 7 entries', () => {
      expect(strokeOnlyIcons.size).toBe(7)
    })

    it('should not contain non-stroke icons like fa-bolt', () => {
      expect(strokeOnlyIcons.has('fa-bolt')).toBe(false)
    })

    it('should only contain icons that exist in iconPaths', () => {
      strokeOnlyIcons.forEach((iconName) => {
        expect(
          iconPaths[iconName],
          `strokeOnlyIcons contains "${iconName}" but it is not in iconPaths`
        ).toBeDefined()
      })
    })
  })
})
