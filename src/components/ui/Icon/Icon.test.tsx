import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('should render as SVG element', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('svg-inline--fa')
  })

  it('should apply size classes', () => {
    const { container, rerender } = render(<Icon name="fa-heart" size="sm" />)
    let icon = container.querySelector('svg')
    expect(icon).toHaveClass('fa-sm')

    rerender(<Icon name="fa-heart" size="lg" />)
    icon = container.querySelector('svg')
    expect(icon).toHaveClass('fa-lg')

    rerender(<Icon name="fa-heart" size="2x" />)
    icon = container.querySelector('svg')
    expect(icon).toHaveClass('fa-2x')
  })

  it('should use medium size by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg')

    // Medium size doesn't add a size class
    expect(icon).not.toHaveClass('fa-sm')
    expect(icon).not.toHaveClass('fa-lg')
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('svg')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should be accessible when ariaLabel is provided', () => {
    render(<Icon name="fa-shield-halved" ariaLabel="Security" />)
    const icon = screen.getByLabelText('Security')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-label', 'Security')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
  })

  it('should apply custom className', () => {
    const { container } = render(<Icon name="fa-bolt" className="custom-icon" />)
    const icon = container.querySelector('svg')

    expect(icon).toHaveClass('custom-icon')
  })

  it('should handle color prop', () => {
    const { container } = render(<Icon name="fa-heart" color="#FF0000" />)
    const icon = container.querySelector('svg')

    expect(icon).toHaveStyle({ color: '#FF0000' })
  })

  it('should accept color without # prefix', () => {
    const { container } = render(<Icon name="fa-heart" color="FF0000" />)
    const icon = container.querySelector('svg')

    // Browser normalizes #FF0000 to rgb(255, 0, 0)
    expect(icon).toHaveStyle({ color: '#FF0000' })
  })

  it('should use fas prefix for solid variant', () => {
    const { container } = render(<Icon name="fa-bolt" variant="solid" />)
    const icon = container.querySelector('svg')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('fa-bolt')
  })

  it('should handle regular variant without crashing', () => {
    // Note: We don't have regular style icons in the library
    // This test verifies the component handles the variant prop without crashing
    // FontAwesome will either render nothing or fallback behavior
    const { container } = render(<Icon name="fa-bolt" variant="regular" />)
    
    // The component should render without throwing errors
    // Even if FontAwesome can't find the icon in regular style
    expect(container).toBeInTheDocument()
  })

  it('should use fab prefix for brands variant', () => {
    const { container } = render(<Icon name="fa-github" variant="brands" />)
    const icon = container.querySelector('svg')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('fa-github')
  })

  it('should auto-detect brand icons with solid variant', () => {
    const { container } = render(<Icon name="fa-github" variant="solid" />)
    const icon = container.querySelector('svg')

    // Should auto-detect github as a brand icon and use fab prefix
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('fa-github')
  })

  it('should auto-detect brand icons with regular variant', () => {
    const { container } = render(<Icon name="fa-twitter" variant="regular" />)
    const icon = container.querySelector('svg')

    // Should auto-detect twitter as a brand icon and use fab prefix
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('fa-twitter')
  })
})
