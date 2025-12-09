import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render as button by default', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })

  it('should render as link when href is provided', () => {
    render(<Button href="/test">Link</Button>)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    // Attempting to click a disabled button won't work
    await user.click(button).catch(() => {})
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    // CSS Modules hashes class names, so check className contains the variant
    expect(screen.getByRole('button').className).toContain('primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button').className).toContain('secondary')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').className).toContain('ghost')
  })

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>)
    // CSS Modules hashes class names, so check className contains the size
    expect(screen.getByRole('button').className).toContain('small')

    rerender(<Button size="medium">Medium</Button>)
    expect(screen.getByRole('button').className).toContain('medium')

    rerender(<Button size="large">Large</Button>)
    expect(screen.getByRole('button').className).toContain('large')
  })

  it('should render with icon', () => {
    const { container } = render(<Button icon="fa-download">Download</Button>)

    const icon = container.querySelector('.fa-download')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('should apply aria-label', () => {
    render(<Button ariaLabel="Close dialog">X</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog')
  })

  it('should open external links in new tab with security attributes', () => {
    render(<Button href="https://example.com">External</Button>)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not add target and rel for internal links', () => {
    render(<Button href="/internal">Internal</Button>)

    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })
})
