import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('should render with Font Awesome classes', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('.fa-bolt')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('fa-solid')
    expect(icon).toHaveClass('fa-bolt')
  })

  it('should apply size classes', () => {
    const { container, rerender } = render(<Icon name="fa-heart" size="sm" />)
    let icon = container.querySelector('i')
    expect(icon).toHaveClass('fa-sm')

    rerender(<Icon name="fa-heart" size="lg" />)
    icon = container.querySelector('i')
    expect(icon).toHaveClass('fa-lg')

    rerender(<Icon name="fa-heart" size="2x" />)
    icon = container.querySelector('i')
    expect(icon).toHaveClass('fa-2x')
  })

  it('should use medium size by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('i')

    // Medium size doesn't add a size class (empty string)
    expect(icon).not.toHaveClass('fa-sm')
    expect(icon).not.toHaveClass('fa-lg')
  })

  it('should be hidden from screen readers by default', () => {
    const { container } = render(<Icon name="fa-bolt" />)
    const icon = container.querySelector('i')

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
    const icon = container.querySelector('i')

    expect(icon).toHaveClass('custom-icon')
  })

  it('should handle color prop', () => {
    const { container } = render(<Icon name="fa-heart" color="FF0000" />)
    const icon = container.querySelector('i')

    expect(icon).toHaveClass('icon-color-FF0000')
  })

  it('should strip # from color prop', () => {
    const { container } = render(<Icon name="fa-heart" color="#FF0000" />)
    const icon = container.querySelector('i')

    expect(icon).toHaveClass('icon-color-FF0000')
    expect(icon).not.toHaveClass('icon-color-#FF0000')
  })
})
