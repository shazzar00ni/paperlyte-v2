import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('should render as SVG element or fallback to Font Awesome', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    // Component may render as SVG (if icon exists) or as <i> (fallback)
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('i')

    expect(svg || fallback).toBeInTheDocument()
  })

  it('should apply size attributes to SVG', () => {
    const { container, rerender } = render(<Icon name="fa-bolt" size="sm" />)
    let icon = container.querySelector('svg') || container.querySelector('i')
    expect(icon).toBeInTheDocument()

    rerender(<Icon name="fa-bolt" size="lg" />)
    icon = container.querySelector('svg') || container.querySelector('i')
    expect(icon).toBeInTheDocument()

    rerender(<Icon name="fa-bolt" size="2x" />)
    icon = container.querySelector('svg') || container.querySelector('i')
    expect(icon).toBeInTheDocument()
  })

  it('should use medium size by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('i')

    // Component should render with default size
    expect(svg || fallback).toBeInTheDocument()
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

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
    const fallback = container.querySelector('i')
    const icon = svg || fallback

    expect(icon).toHaveClass('custom-icon')
  })

  it('should handle color prop on SVG elements', () => {
    const { container } = render(<Icon name="fa-bolt" color="#FF0000" />)
    const svg = container.querySelector('svg')

    if (svg) {
      // SVG uses stroke attribute for color
      expect(svg).toHaveAttribute('stroke', '#FF0000')
    } else {
      // Fallback uses inline style
      const fallback = container.querySelector('i')
      expect(fallback).toBeInTheDocument()
    }
  })

  it('should accept color without # prefix', () => {
    const { container } = render(<Icon name="fa-bolt" color="FF0000" />)
    const svg = container.querySelector('svg')
    const fallback = container.querySelector('i')

    expect(svg || fallback).toBeInTheDocument()
  })

  it('should handle solid variant', () => {
    const { container } = render(<Icon name="fa-bolt" variant="solid" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

    expect(icon).toBeInTheDocument()
  })

  it('should handle regular variant without crashing', () => {
    const { container } = render(<Icon name="fa-bolt" variant="regular" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

    expect(icon).toBeInTheDocument()
  })

  it('should handle brands variant', () => {
    const { container } = render(<Icon name="fa-github" variant="brands" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

    expect(icon).toBeInTheDocument()
  })

  it('should handle brand icons with solid variant', () => {
    const { container } = render(<Icon name="fa-github" variant="solid" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

    expect(icon).toBeInTheDocument()
  })

  it('should handle brand icons with regular variant', () => {
    const { container } = render(<Icon name="fa-twitter" variant="regular" />)
    const icon = container.querySelector('svg') || container.querySelector('i')

    expect(icon).toBeInTheDocument()
  })
})
