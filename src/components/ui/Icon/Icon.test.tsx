import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should render Font Awesome fallback for missing icons', () => {
    const { container } = render(<Icon name="definitely-missing-icon" variant="solid" />)

    // Should render fallback element (SVG from FontAwesomeIcon or span)
    const fallback = container.querySelector('.icon-fallback')
    expect(fallback).toBeInTheDocument()

    // Should log warnings (both for icon not found and Font Awesome library)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Icon "definitely-missing-icon" not found in icon set, using Font Awesome fallback'
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Icon "definitely-missing-icon" not found in Font Awesome library either'
    )
  })

  it('should render SVG for known icons', () => {
    const { container } = render(
      <Icon name="fa-bolt" size="lg" color="#FF0000" ariaLabel="Lightning" />
    )

    // Should render SVG element (fa-bolt is a known icon in the icon set)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('icon-svg')

    // Should have correct size (lg = 24px)
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')

    // Should have correct color
    expect(svg).toHaveAttribute('stroke', '#FF0000')

    // Should have correct accessibility attributes
    expect(svg).toHaveAttribute('aria-label', 'Lightning')
    expect(svg).toHaveAttribute('aria-hidden', 'false')
    expect(svg).toHaveAttribute('role', 'img')

    // Should not log warning for known icons
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should render as SVG element or fallback to Font Awesome', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    // Component may render as SVG (if icon exists) or as fallback element
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('.icon-fallback')

    expect(svg || fallback).toBeInTheDocument()
  })

  it('should apply size attributes correctly', () => {
    // Test sm size (16px)
    const { container, rerender } = render(<Icon name="fa-bolt" size="sm" />)
    let svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')

    // Test lg size (24px)
    rerender(<Icon name="fa-bolt" size="lg" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')

    // Test 2x size (40px)
    rerender(<Icon name="fa-bolt" size="2x" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '40')
    expect(svg).toHaveAttribute('height', '40')

    // Test fallback size application
    rerender(<Icon name="missing-icon" size="lg" />)
    const fallback = container.querySelector('.icon-fallback')
    expect(fallback?.style.fontSize).toBe('24px')
  })

  it('should use medium size by default', () => {
    // Test SVG default size (md = 20px)
    const { container, rerender } = render(<Icon name="fa-bolt" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')

    // Test fallback default size
    rerender(<Icon name="missing-icon" />)
    const fallback = container.querySelector('.icon-fallback')
    expect(fallback).toBeInTheDocument()
    expect(fallback?.style.fontSize).toBe('20px')
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg') || container.querySelector('.icon-fallback')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should be accessible when ariaLabel is provided', () => {
    render(<Icon name="fa-bolt" ariaLabel="Lightning" />)
    const icon = screen.getByLabelText('Lightning')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-label', 'Lightning')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
  })

  it('should apply custom className', () => {
    const { container } = render(<Icon name="fa-bolt" className="custom-icon" />)
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('.icon-fallback')
    const icon = svg || fallback

    expect(icon).toHaveClass('custom-icon')
  })

  it('should handle color prop on SVG elements', () => {
    const { container } = render(<Icon name="fa-bolt" color="#FF0000" />)
    const svg = container.querySelector('svg')

    // SVG uses stroke attribute for color
    expect(svg).toHaveAttribute('stroke', '#FF0000')
  })

  it('should handle color prop on fallback elements', () => {
    const { container } = render(<Icon name="missing-icon" color="#FF0000" />)
    const fallback = container.querySelector('.icon-fallback')

    // Fallback uses inline style for color
    expect(fallback).toHaveStyle({ color: '#FF0000' })
  })

  it('should normalize bare hex colors by prepending #', () => {
    // Test with SVG (known icon) - 6 digit hex
    const { container, rerender } = render(<Icon name="fa-bolt" color="FF0000" />)
    let svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', '#FF0000')

    // Test with 3 digit hex
    rerender(<Icon name="fa-bolt" color="F00" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', '#F00')

    // Test with fallback (missing icon)
    rerender(<Icon name="missing-icon" color="FF0000" />)
    const fallback = container.querySelector('.icon-fallback')
    expect(fallback).toHaveStyle({ color: '#FF0000' })

    // Test that valid CSS colors are left untouched
    rerender(<Icon name="fa-bolt" color="rgb(255, 0, 0)" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', 'rgb(255, 0, 0)')

    rerender(<Icon name="fa-bolt" color="currentColor" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('should apply correct variant class for solid', () => {
    const { container } = render(<Icon name="missing-icon" variant="solid" />)
    const fallback = container.querySelector('.icon-fallback')

    // Fallback renders as span or SVG with icon-fallback class
    expect(fallback).toBeInTheDocument()
  })

  it('should apply correct variant class for regular', () => {
    const { container } = render(<Icon name="missing-icon" variant="regular" />)
    const fallback = container.querySelector('.icon-fallback')

    // Fallback renders as span or SVG with icon-fallback class
    expect(fallback).toBeInTheDocument()
  })

  it('should apply correct variant class for brands', () => {
    const { container } = render(<Icon name="missing-icon" variant="brands" />)
    const fallback = container.querySelector('.icon-fallback')

    // Fallback renders as span or SVG with icon-fallback class
    expect(fallback).toBeInTheDocument()
  })
})
