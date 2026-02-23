import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'

// Mock the analytics utility
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

describe('EmailCapture UI Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  describe('rendering', () => {
    it('renders the email input with default placeholder', () => {
      render(<EmailCapture />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('renders custom placeholder text', () => {
      render(<EmailCapture placeholder="you@company.com" />)
      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    })

    it('renders custom button text', () => {
      render(<EmailCapture buttonText="Get Early Access" />)
      expect(screen.getByRole('button', { name: /Get Early Access/i })).toBeInTheDocument()
    })

    it('renders the GDPR consent checkbox', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText(/I agree to receive emails from Paperlyte/i)).toBeInTheDocument()
    })

    it('renders privacy policy link', () => {
      render(<EmailCapture />)
      const link = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(link).toHaveAttribute('href', '/privacy.html')
    })

    it('renders honeypot field hidden from users', () => {
      const { container } = render(<EmailCapture />)
      const honeypot = container.querySelector('input[name="website"]')
      expect(honeypot).toBeInTheDocument()
      expect(honeypot).toHaveAttribute('aria-hidden', 'true')
      expect(honeypot).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('email validation', () => {
    it('shows error for empty email submission', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      // Check the GDPR consent
      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      // Submit with empty email
      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter your email address')).toBeInTheDocument()
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'not-an-email')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('shows error when GDPR consent is not checked', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      expect(
        screen.getByText('Please agree to receive emails from Paperlyte')
      ).toBeInTheDocument()
    })

    it('accepts valid email addresses', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      global.fetch = mockFetch

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'user@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/subscribe', expect.any(Object))
      })
    })
  })

  describe('honeypot logic', () => {
    it('silently rejects submission when honeypot field is filled', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      const { container } = render(<EmailCapture />)

      // Fill in valid email and consent
      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'real-user@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      // Fill the honeypot field (simulating a bot)
      const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement
      // Directly fire change event on honeypot
      await user.type(honeypot, 'http://spam.com')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      // The fetch should never be called because honeypot detected a bot
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does not show any error message when honeypot blocks submission', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn()

      const { container } = render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'real@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement
      await user.type(honeypot, 'spam')

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      // No error messages should appear - silent rejection
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('submission states', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      // Create a promise that we can control
      let resolveResponse!: (value: unknown) => void
      global.fetch = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveResponse = resolve
        })
      )

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Joining.../i)).toBeInTheDocument()
      })

      // Resolve the fetch
      resolveResponse({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    })

    it('disables input and button during loading', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toBeDisabled()
        expect(screen.getByRole('button', { name: /Joining.../i })).toBeDisabled()
      })
    })

    it('shows success state after successful submission', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
        expect(
          screen.getByText(/Check your email to confirm your subscription/i)
        ).toBeInTheDocument()
      })
    })

    it('shows error state on API failure', async () => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => {})

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      })

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
      })
    })

    it('shows generic error on network failure', async () => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => {})

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('has accessible label for email input', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('sets aria-invalid on email input when in error state', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      const input = screen.getByPlaceholderText('Enter your email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('links error message to input via aria-describedby', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      const input = screen.getByPlaceholderText('Enter your email')
      expect(input).toHaveAttribute('aria-describedby', 'email-error')

      const errorEl = document.getElementById('email-error')
      expect(errorEl).toBeInTheDocument()
    })

    it('error message uses role="alert" for screen reader announcement', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      await user.click(submitButton)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('success state uses role="alert" for screen reader announcement', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(<EmailCapture />)

      const input = screen.getByPlaceholderText('Enter your email')
      await user.type(input, 'test@example.com')

      const checkbox = screen.getByLabelText(/I agree to receive emails/i)
      await user.click(checkbox)

      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })
})
