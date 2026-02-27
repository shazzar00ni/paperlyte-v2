import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'
import { expectIconSize } from '@/test/iconTestHelpers'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'

// Mock findIconDefinition to test variant prefix behavior
vi.mock('@fortawesome/fontawesome-svg-core', async () => {
  const actual = await vi.importActual('@fortawesome/fontawesome-svg-core')
  return {
    ...actual,
    findIconDefinition: vi.fn(),
  }
})

describe('Icon', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  const mockFindIconDefinition = vi.mocked(findIconDefinition)

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockFindIconDefinition.mockClear()
    mockFindIconDefinition.mockReturnValue(null) // Return null to trigger fallback
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should render Font Awesome fallback for missing icons', () => {
    const { container } = render(<Icon name="definitely-missing-icon" variant="solid" />)

    // Should render fallback <span> element with "?" for icons not in library
    const fallback = container.querySelector('span.icon-fallback')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')
    expect(fallback).toHaveTextContent('?')
    expect(fallback).toHaveAttribute('title', 'Icon "definitely-missing-icon" not found')

    // Should log unified warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Icon "definitely-missing-icon" not found in custom set or Font Awesome library'
    )
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
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
    // Component may render as SVG (if icon exists) or as <span> (fallback)
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('span.icon-fallback')

    expect(svg ?? fallback).toBeInTheDocument()
  })

  it('should apply size attributes correctly', () => {
    // Test sm size (16px)
    const { container, rerender } = render(<Icon name="fa-bolt" size="sm" />)
    let svg = container.querySelector('svg')
    expectIconSize(svg, '16')

    // Test lg size (24px)
    rerender(<Icon name="fa-bolt" size="lg" />)
    svg = container.querySelector('svg')
    expectIconSize(svg, '24')

    // Test 2x size (40px)
    rerender(<Icon name="fa-bolt" size="2x" />)
    svg = container.querySelector('svg')
    expectIconSize(svg, '40')

    // Test fallback size application
    rerender(<Icon name="missing-icon" size="lg" />)
    const fallback = container.querySelector('span.icon-fallback')
    expectIconSize(fallback, '24')
  })

  it('should use medium size by default', () => {
    // Test SVG default size (md = 20px)
    const { container, rerender } = render(<Icon name="fa-bolt" />)
    const svg = container.querySelector('svg')
    expectIconSize(svg, '20')

    // Test fallback default size
    rerender(<Icon name="missing-icon" />)
    const fallback = container.querySelector('span.icon-fallback')
    expectIconSize(fallback, '20')
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg') ?? container.querySelector('span.icon-fallback')

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
    const fallback = container.querySelector('span.icon-fallback')
    const icon = svg ?? fallback

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
    const fallback = container.querySelector('span.icon-fallback')

    // Fallback uses inline style for color (both span and SVG)
    expect(fallback).toBeInTheDocument()
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
    const fallback = container.querySelector('span.icon-fallback')
    expect(fallback).toHaveStyle({ color: '#FF0000' })

    // Test that valid CSS colors are left untouched
    rerender(<Icon name="fa-bolt" color="rgb(255, 0, 0)" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', 'rgb(255, 0, 0)')

    rerender(<Icon name="fa-bolt" color="currentColor" />)
    svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('should use fas prefix for solid variant', () => {
    const { container } = render(<Icon name="test-icon" variant="solid" />)
    const fallback = container.querySelector('span.icon-fallback')

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')

    // Verify findIconDefinition was called with 'fas' prefix for solid variant
    expect(mockFindIconDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: 'fas',
        iconName: 'test-icon',
      })
    )
  })

  it('should use far prefix for regular variant', () => {
    const { container } = render(<Icon name="test-icon" variant="regular" />)
    const fallback = container.querySelector('span.icon-fallback')

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')

    // Verify findIconDefinition was called with 'far' prefix for regular variant
    expect(mockFindIconDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: 'far',
        iconName: 'test-icon',
      })
    )
  })

  it('should use fab prefix for brands variant', () => {
    const { container } = render(<Icon name="test-icon" variant="brands" />)
    const fallback = container.querySelector('span.icon-fallback')

    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass('icon-fallback')

    // Verify findIconDefinition was called with 'fab' prefix for brands variant
    expect(mockFindIconDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: 'fab',
        iconName: 'test-icon',
      })
    )
  })

  it('should render fa-arrow-right as a custom SVG with correct path', () => {
    const { container } = render(<Icon name="fa-arrow-right" />)

    // fa-arrow-right is in iconPaths; must render as custom SVG, not a fallback
    const svg = container.querySelector('svg[data-icon="fa-arrow-right"]')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('icon-svg')

    // Path 'M5 12h14 M12 5l7 7-7 7' doesn't split on ' M ' (no space before M12)
    // So it renders as a single path element
    const paths = svg!.querySelectorAll('path')
    expect(paths).toHaveLength(1)
    expect(paths[0]).toHaveAttribute('d', 'M5 12h14 M12 5l7 7-7 7')

    // Custom path icons never reach Font Awesome
    expect(mockFindIconDefinition).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should render fa-apple as a custom SVG, not via Font Awesome', () => {
    const { container } = render(<Icon name="fa-apple" variant="brands" />)

    // fa-apple is in iconPaths; variant prop must not trigger a Font Awesome lookup
    const svg = container.querySelector('svg[data-icon="fa-apple"]')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('icon-svg')

    // Two path segments (the path contains ' M ' as separator)
    const paths = svg!.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(1)

    expect(mockFindIconDefinition).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should render fa-windows as a custom SVG, not via Font Awesome', () => {
    const { container } = render(<Icon name="fa-windows" variant="brands" />)

    // fa-windows is in iconPaths; variant prop must not trigger a Font Awesome lookup
    const svg = container.querySelector('svg[data-icon="fa-windows"]')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('icon-svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 23 24')

    expect(mockFindIconDefinition).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should call findIconDefinition with fab prefix for an unknown brand icon', () => {
    // A brand icon not in iconPaths falls through to Font Awesome with prefix "fab"
    render(<Icon name="fa-linux" variant="brands" />)

    expect(mockFindIconDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: 'fab',
        iconName: 'linux',
      })
    )
  })
})
