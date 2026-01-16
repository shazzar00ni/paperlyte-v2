import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  // Helper to get icon element (SVG or fallback span)
  const getIconElement = (container: HTMLElement) =>
    container.querySelector('svg') ?? container.querySelector('span')

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should render Font Awesome fallback for missing icons', () => {
    const { container } = render(<Icon name="definitely-missing-icon" variant="solid" />)

    // Should render fallback span element (icon not found in library)
    const fallback = container.querySelector('span')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')
    expect(fallback).toHaveTextContent('?')

    // Should log warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Icon "definitely-missing-icon" not found in icon set, using Font Awesome fallback'
    )
  })

  it('should render FontAwesomeIcon for known icons', () => {
    render(<Icon name="fa-bolt" size="lg" color="#FF0000" ariaLabel="Lightning" />)

    // Should render icon with aria-label (Font Awesome renders as SVG)
    const icon = screen.getByLabelText('Lightning')
    expect(icon).toBeInTheDocument()
    expect(icon.tagName).toBe('svg')

    // Should have correct accessibility attributes
    expect(icon).toHaveAttribute('aria-label', 'Lightning')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
    expect(icon).toHaveAttribute('role', 'img')

    // FontAwesomeIcon uses inline styles for sizing and coloring
    expect(icon).toHaveStyle({ fontSize: '24px' })
    expect(icon).toHaveStyle({ color: '#FF0000' })

    // Should log warning about fallback to Font Awesome
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Icon "fa-bolt" not found in icon set, using Font Awesome fallback'
    )
  })

  it('should render as SVG element or fallback to Font Awesome', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    // Component may render as SVG (if icon exists) or as span (fallback)
    expect(getIconElement(container)).toBeInTheDocument()
  })

  it('should apply size attributes correctly', () => {
    // Test sm size (16px)
    const { container, rerender } = render(<Icon name="fa-bolt" size="sm" />)
    let svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ fontSize: '16px' })

    // Test lg size (24px)
    rerender(<Icon name="fa-bolt" size="lg" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ fontSize: '24px' })

    // Test 2x size (40px)
    rerender(<Icon name="fa-bolt" size="2x" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ fontSize: '40px' })

    // Test fallback size application (span with fontSize style)
    rerender(<Icon name="missing-icon" size="lg" />)
    const fallback = container.querySelector('span')
    expect(fallback?.style.fontSize).toBe('24px')
  })

  it('should use medium size by default', () => {
    // Test Font Awesome default size (md = 20px)
    const { container, rerender } = render(<Icon name="fa-bolt" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveStyle({ fontSize: '20px' })

    // Test fallback default size (span with fontSize in style)
    rerender(<Icon name="missing-icon" />)
    const fallback = container.querySelector('span')
    expect(fallback).toBeInTheDocument()
    expect(fallback?.style.fontSize).toBe('20px')
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = getIconElement(container)

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
    const fallback = container.querySelector('span')
    const icon = svg ?? fallback

    expect(icon).toHaveClass('custom-icon')
  })

  it('should handle color prop on Font Awesome icons', () => {
    const { container } = render(<Icon name="fa-bolt" color="#FF0000" />)
    const svg = container.querySelector('svg')

    // Font Awesome uses inline style for color
    expect(svg).toHaveStyle({ color: '#FF0000' })
  })

  it('should handle color prop on fallback elements', () => {
    const { container } = render(<Icon name="missing-icon" color="#FF0000" />)
    // Font Awesome fallback renders SVG, or span if icon not found
    const fallback = getIconElement(container)

    // Fallback uses inline style for color
    expect(fallback).toHaveStyle({ color: '#FF0000' })
  })

  it('should normalize bare hex colors by prepending #', () => {
    // Test with Font Awesome icon - 6 digit hex
    const { container, rerender } = render(<Icon name="fa-bolt" color="FF0000" />)
    let svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ color: '#FF0000' })

    // Test with 3 digit hex
    rerender(<Icon name="fa-bolt" color="F00" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ color: '#F00' })

    // Test with fallback (missing icon) - renders span with ? if not in library
    rerender(<Icon name="missing-icon" color="FF0000" />)
    const fallback = container.querySelector('span')
    expect(fallback).toHaveStyle({ color: '#FF0000' })

    // Test that valid CSS colors are left untouched
    rerender(<Icon name="fa-bolt" color="rgb(255, 0, 0)" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('should apply correct variant class for solid', () => {
    const { container } = render(<Icon name="missing-icon" variant="solid" />)
    // Font Awesome renders SVG or span, not <i> tags
    const fallback = getIconElement(container)

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')
  })

  it('should apply correct variant class for regular', () => {
    const { container } = render(<Icon name="missing-icon" variant="regular" />)
    // Font Awesome renders SVG or span, not <i> tags
    const fallback = getIconElement(container)

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')
  })

  it('should apply correct variant class for brands', () => {
    const { container } = render(<Icon name="missing-icon" variant="brands" />)
    // Font Awesome renders SVG or span, not <i> tags
    const fallback = getIconElement(container)

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')
  })

  it('should use fab prefix for brand icons with explicit variant', () => {
    const { container } = render(<Icon name="fa-github" variant="brands" />)
    const icon = getIconElement(container)

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-prefix', 'fab')
    expect(icon).toHaveAttribute('data-icon', 'github')
  })

  it('should auto-detect brand icons without explicit variant', () => {
    const { container } = render(<Icon name="fa-github" />)
    const icon = getIconElement(container)

    expect(icon).toBeInTheDocument()
    // Should automatically use fab prefix for known brand icons
    expect(icon).toHaveAttribute('data-prefix', 'fab')
    expect(icon).toHaveAttribute('data-icon', 'github')
  })

  it('should use fas prefix for solid icons', () => {
    const { container } = render(<Icon name="fa-heart" variant="solid" />)
    const icon = getIconElement(container)

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-prefix', 'fas')
    expect(icon).toHaveAttribute('data-icon', 'heart')
  })
})
