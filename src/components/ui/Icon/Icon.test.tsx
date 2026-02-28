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

    it('should render FontAwesome SVG for known FA icons', () => {
      // fa-bolt is registered in iconLibrary.ts — renders via FontAwesome fallback
      const { container } = render(<Icon name="fa-bolt" />)

      // All icons fall back to Font Awesome since iconPaths is empty
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // FontAwesome renders its own SVG without width/height attributes
      expect(svg).not.toHaveAttribute('width')
    })

    it('should only warn once for icons found in Font Awesome library', () => {
      render(<Icon name="fa-bolt" />)

      // Only first warning fires (not in custom icon set), icon IS found in FA
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Icon "fa-bolt" not found in icon set, using Font Awesome fallback'
      )
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
      const { container } = render(
        <Icon name="definitely-missing-icon" ariaLabel="Missing icon" />
      )
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveAttribute('aria-hidden', 'false')
      expect(fallback).toHaveAttribute('aria-label', 'Missing icon')
      expect(fallback).toHaveAttribute('role', 'img')
    })
  })

  describe('Brand icon prefix detection', () => {
    it('should automatically assign fab prefix for known brand icons via isBrandIcon()', () => {
      // fa-github is a brand icon detected by isBrandIcon() — no explicit variant needed
      const { container } = render(<Icon name="fa-github" />)
      const svg = container.querySelector('svg')
      // Brand icons render via FontAwesome with the fab prefix
      expect(svg).toBeInTheDocument()
      // Should warn only once (found in FA library)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('not found in Font Awesome library')
      )
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

  describe('Color normalization', () => {
    it('should prepend # to bare 6-digit hex colors', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="FF0000" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: '#FF0000' })
    })

    it('should prepend # to bare 3-digit hex colors', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="F00" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: '#F00' })
    })

    it('should pass CSS variables through unchanged', () => {
      const { container } = render(
        <Icon name="definitely-missing-icon" color="var(--color-primary)" />
      )
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: 'var(--color-primary)' })
    })

    it('should pass rgb() values through unchanged', () => {
      const { container } = render(
        <Icon name="definitely-missing-icon" color="rgb(255, 0, 0)" />
      )
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })

    it('should pass already-prefixed hex colors through unchanged', () => {
      const { container } = render(<Icon name="definitely-missing-icon" color="#FF0000" />)
      const fallback = container.querySelector('span.icon-fallback')
      expect(fallback).toHaveStyle({ color: '#FF0000' })
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

    it('should apply custom className to FontAwesome SVG', () => {
      const { container } = render(<Icon name="fa-bolt" className="custom-class" />)
      const icon = container.querySelector('svg') ?? container.querySelector('span.icon-fallback')
      expect(icon).toHaveClass('custom-class')
    })
  })
})
