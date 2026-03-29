import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'

// Mock analytics
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock validation
vi.mock('@utils/validation', () => ({
  validateEmail: vi.fn((email: string) => {
    if (!email?.includes('@')) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }
    return { isValid: true }
  }),
}))

describe('EmailCapture UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render email input with default placeholder', () => {
      render(<EmailCapture />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('should render submit button with default text', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('button', { name: /Join Waitlist/i })).toBeInTheDocument()
    })

    it('should render GDPR consent checkbox', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should render privacy policy link', () => {
      render(<EmailCapture />)
      const link = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/privacy.html')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render honeypot field hidden from users', () => {
      const { container } = render(<EmailCapture />)
      const honeypot = container.querySelector('input[name="website"]')
      expect(honeypot).toBeInTheDocument()
      expect(honeypot).toHaveAttribute('tabIndex', '-1')
      expect(honeypot).toHaveAttribute('aria-hidden', 'true')
    })

    it('should render with custom placeholder', () => {
      render(<EmailCapture placeholder="your@email.com" />)
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    })

    it('should render with custom button text', () => {
      render(<EmailCapture buttonText="Get Early Access" />)
      expect(screen.getByRole('button', { name: /Get Early Access/i })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'invalid-email')
      await user.click(checkbox)
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should show error when GDPR consent not given', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'test@example.com')
      await user.click(button)

      await waitFor(() => {
        expect(
          screen.getByText(/Please agree to receive emails from Paperlyte/)
        ).toBeInTheDocument()
      })
    })

    it('should silently reject honeypot submissions', async () => {
      const user = userEvent.setup()
      const { container } = render(<EmailCapture />)

      const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement
      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      // Fill honeypot (bot behavior)
      await user.type(honeypot, 'spam-bot')
      await user.type(input, 'test@example.com')
      await user.click(checkbox)
      await user.click(button)

      // Should not show success or error - just silently return
      expect(screen.queryByText(/on the list/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      // Mock fetch to delay resolution
      globalThis.fetch = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Response(JSON.stringify({}))), 2000)
          )
      ) as typeof fetch

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'test@example.com')
      await user.click(checkbox)
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Joining...')).toBeInTheDocument()
      })
    })

    it('should show success state after successful submission', async () => {
      const user = userEvent.setup()
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
      ) as typeof fetch

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'test@example.com')
      await user.click(checkbox)
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText(/on the list/i)).toBeInTheDocument()
      })
    })

    it('should show error for failed API response', async () => {
      const user = userEvent.setup()
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ error: 'Server error' }), { status: 500 }))
      ) as typeof fetch

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'test@example.com')
      await user.click(checkbox)
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should show error for network failure', async () => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => {})
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as typeof fetch

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'test@example.com')
      await user.click(checkbox)
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should set aria-invalid on error', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'bad')
      await user.click(button)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should have aria-describedby pointing to error on error state', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      const button = screen.getByRole('button', { name: /Join Waitlist/i })

      await user.type(input, 'bad')
      await user.click(button)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'email-error')
      })
    })

    it('should have accessible label for email input', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    })
  })
})
