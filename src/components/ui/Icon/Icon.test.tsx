import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'
import { expectIconSize } from '@/test/iconTestHelpers'

describe('Icon', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('Fallback rendering', () => {
    it('should render ? fallback span when icon is not in custom set or Font Awesome', () => {
      const { container } = render(<Icon name="definitely-missing-icon" variant="solid" />)

      // Should render fallback <span> element with "?" for icons not in library
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveClass('icon-fallback')
      expect(fallback).toHaveTextContent('?')
      expect(fallback).toHaveAttribute('title', 'Icon "definitely-missing-icon" not found')
    })

    it('should warn twice for icons missing from both custom set and Font Awesome library', () => {
      render(<Icon name="definitely-missing-icon" variant="solid" />)

      // First warning: not in icon set, falling back to Font Awesome
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Icon "definitely-missing-icon" not found in icon set, using Font Awesome fallback'
      )
      // Second warning: not found in Font Awesome library either
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Icon "definitely-missing-icon" (converted to "definitely-missing-icon") not found in Font Awesome library. ' +
          'Rendering empty/decorative fallback span.'
      )
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2)
    })

    it('should render custom SVG for known icons in iconPaths', () => {
      // fa-bolt is defined in iconPaths — renders via custom SVG path
      const { container } = render(<Icon name="fa-bolt" />)

      const svg = container.querySelector('svg.icon-svg')
      expect(svg).toBeInTheDocument()
      // Custom SVG renders with explicit width/height attributes
      expect(svg).toHaveAttribute('width')
    })

    it('should not warn for icons found in custom iconPaths', () => {
      render(<Icon name="fa-bolt" />)

      // No warnings: fa-bolt is found in iconPaths, no fallback needed
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
    })
  })

  describe('Accessibility', () => {
    it('should apply aria-hidden="true" when no ariaLabel is provided', () => {
      const { container } = render(<Icon name="fa-bolt" />)
      // FontAwesomeIcon renders as svg; find it or the span fallback
      const icon = container.querySelector('svg') ?? container.querySelector('span.icon-fallback')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should apply aria-hidden="false" and role="img" when ariaLabel is provided', () => {
      render(<Icon name="fa-bolt" ariaLabel="Lightning bolt" />)
      const icon = screen.getByLabelText('Lightning bolt')

      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'false')
      expect(icon).toHaveAttribute('role', 'img')
    })

    it('should apply aria-hidden="true" to ? fallback span when no ariaLabel', () => {
      const { container } = render(<Icon name="definitely-missing-icon" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveAttribute('aria-hidden', 'true')
    })

    it('should expose ? fallback span to screen readers when ariaLabel is provided', () => {
      const { container } = render(<Icon name="definitely-missing-icon" ariaLabel="Missing icon" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveAttribute('aria-hidden', 'false')
      expect(fallback).toHaveAttribute('aria-label', 'Missing icon')
      expect(fallback).toHaveAttribute('role', 'img')
    })
  })

  describe('Brand icon prefix detection', () => {
    it('should automatically render custom SVG for known brand icons in iconPaths', () => {
      // fa-github is defined in iconPaths — renders via custom SVG path
      const { container } = render(<Icon name="fa-github" />)
      const svg = container.querySelector('svg.icon-svg')
      // Brand icons in iconPaths render as custom SVG without any warning
      expect(svg).toBeInTheDocument()
      // No warnings: fa-github is found in iconPaths
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
    })

    it('should assign fab prefix when variant="brands" is explicitly set', () => {
      const { container } = render(<Icon name="fa-github" variant="brands" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should not render ? fallback for brand icons that exist in Font Awesome', () => {
      const { container } = render(<Icon name="fa-github" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).not.toBeInTheDocument()
    })
  })

  // This describe block is isolated because it uses vi.resetModules() and vi.doMock(),
  // which mutate global module registry state. Keeping it separate with its own
  // beforeEach/afterEach lifecycle prevents module state leakage into other tests.
  describe('Brand icon prefix detection (module mock isolation)', () => {
    let isolatedConsoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      isolatedConsoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      isolatedConsoleWarnSpy.mockRestore()
      vi.doUnmock('./icons')
      vi.resetModules()
    })

    it('should use fab prefix via isBrandIcon() when brand icon falls through to FA fallback', async () => {
      // Mock iconPaths to omit all custom icons, forcing the FA fallback path
      vi.resetModules()
      vi.doMock('./icons', () => ({
        iconPaths: {},
        getIconViewBox: () => '0 0 24 24',
        strokeOnlyIcons: new Set(),
      }))

      const { Icon: FallbackIcon } = await import('./Icon')
      const { container } = render(<FallbackIcon name="fa-github" />)

      // isBrandIcon('github') → true → fab prefix → found in FA library → SVG, not ? placeholder
      expect(container.querySelector('span.icon-fallback')).not.toBeInTheDocument()
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // One warning (not in icon set) but NOT the "not found in FA library" warning
      expect(isolatedConsoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(isolatedConsoleWarnSpy).toHaveBeenCalledWith(
        'Icon "fa-github" not found in icon set, using Font Awesome fallback'
      )
      expect(isolatedConsoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('not found in Font Awesome library')
      )
    })
  })

  describe('Color normalization', () => {
    it('should prepend # to bare 6-digit hex colors', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="FF0000" />)
      const fallback = container.querySelector('span.icon-fallback')
      // jsdom normalizes hex colors to rgb() in computed styles; use rgb() for reliable comparison
      expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })

    it('should prepend # to bare 3-digit hex colors', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="F00" />)
      const fallback = container.querySelector('span.icon-fallback')
      // jsdom normalizes shorthand hex #F00 to rgb(255, 0, 0) in computed styles
      expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })

    it('should pass CSS variables through unchanged', () => {
      const { container } = render(
        <Icon name="definitely-missing-icon" color="var(--color-primary)" />
      )
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: 'var(--color-primary)' })
    })

    it('should pass rgb() values through unchanged', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="rgb(255, 0, 0)" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })

    it('should pass already-prefixed hex colors through unchanged', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="#FF0000" />)
      const fallback = container.querySelector('span.icon-fallback')
      // jsdom normalizes hex colors to rgb() in computed styles; use rgb() for reliable comparison
      expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })
  })

  describe('Size', () => {
    it('should apply size attributes correctly for SVG icons', () => {
      const { container, rerender } = render(<Icon name="fa-bolt" size="sm" />)
      let svg = container.querySelector('svg')
      expectIconSize(svg, '16')

      rerender(<Icon name="fa-bolt" size="lg" />)
      svg = container.querySelector('svg')
      expectIconSize(svg, '24')

      rerender(<Icon name="fa-bolt" size="2x" />)
      svg = container.querySelector('svg')
      expectIconSize(svg, '40')
    })

    it('should apply size to fallback span elements', () => {
      const { container, rerender } = render(<Icon name="missing-icon" size="lg" />)
      const fallback = container.querySelector('span.icon-fallback')
      expectIconSize(fallback, '24')

      rerender(<Icon name="missing-icon" size="sm" />)
      const fallbackSm = container.querySelector('span.icon-fallback')
      expectIconSize(fallbackSm, '16')
    })

    it('should use medium size (20px) by default', () => {
      const { container } = render(<Icon name="missing-icon" />)
      const fallback = container.querySelector('span.icon-fallback')
      expectIconSize(fallback, '20')
    })
  })

  describe('Styling', () => {
    it('should apply custom className to fallback span', () => {
      const { container } = render(<Icon name="missing-icon" className="custom-class" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveClass('custom-class')
    })

    it('should apply custom className to custom SVG icon (fa-bolt)', () => {
      const { container } = render(<Icon name="fa-bolt" className="custom-class" />)
      const icon = container.querySelector('svg') ?? container.querySelector('span.icon-fallback')
      expect(icon).toHaveClass('custom-class')
    })
  })
})
