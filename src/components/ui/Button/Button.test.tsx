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

    // FontAwesome renders SVG, not CSS classes
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
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

  describe('URL Security Validation', () => {
    it('should render as disabled button for javascript: protocol URLs', () => {
      render(<Button href="javascript:alert(1)">Dangerous</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).not.toHaveAttribute('href')
    })

    it('should render as disabled button for data: protocol URLs', () => {
      render(<Button href="data:text/html,<script>alert(1)</script>">Dangerous</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should render as disabled button for vbscript: protocol URLs', () => {
      render(<Button href="vbscript:msgbox(1)">Dangerous</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should render as disabled button for file: protocol URLs', () => {
      render(<Button href="file:///etc/passwd">Dangerous</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should allow safe external HTTPS URLs', () => {
      render(<Button href="https://example.com">Safe External</Button>)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should allow safe external HTTP URLs', () => {
      render(<Button href="http://example.com">Safe External HTTP</Button>)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'http://example.com')
    })

    it('should allow safe relative URLs starting with /', () => {
      render(<Button href="/about">About</Button>)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/about')
    })

    it('should allow safe relative URLs starting with ./', () => {
      render(<Button href="./page">Page</Button>)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', './page')
    })

    it('should allow safe relative URLs starting with ../', () => {
      render(<Button href="../parent">Parent</Button>)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '../parent')
    })

    it('should render mailto: links as disabled buttons (not anchor links)', () => {
      render(<Button href="mailto:user@example.com">Email us</Button>)

      // mailto: is not http/https and not a relative path, so isSafeUrl rejects it
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('should render tel: links as disabled buttons (not anchor links)', () => {
      render(<Button href="tel:+15551234567">Call us</Button>)

      // tel: is not http/https and not a relative path, so isSafeUrl rejects it
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('should render hash-only anchor links as internal links without target="_blank"', () => {
      render(<Button href="#features">Features</Button>)

      // #features resolves to same origin, so isSafeUrl allows it
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '#features')
      // Hash links are same-page, so they must NOT open in a new tab
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })

    it('should render as a plain button (not a link) for empty href', () => {
      render(<Button href="">Empty</Button>)

      // href="" is falsy, so the link branch is skipped entirely
      // The component falls through to the plain <button> render path
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
      // No href attribute should be present on a <button>
      expect(button).not.toHaveAttribute('href')
    })

    it('should warn in development mode for unsafe URLs', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(<Button href="javascript:alert(1)">Dangerous</Button>)

      if (import.meta.env.DEV) {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Button component: Unsafe URL rejected')
        )
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('javascript:alert(1)'))
      }

      consoleSpy.mockRestore()
    })
  })
})
