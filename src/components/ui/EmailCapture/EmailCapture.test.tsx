/**
 * Tests for ui/EmailCapture component
 *
 * This component (src/components/ui/EmailCapture/EmailCapture.tsx) is the small,
 * reusable email-capture form that integrates with Netlify Functions.
 * It is distinct from the section-level EmailCapture
 * (src/components/sections/EmailCapture/EmailCapture.tsx).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'

// Mock analytics to avoid side-effects
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock validation so we can control isValid in specific tests
vi.mock('@utils/validation', async (importOriginal) => {
  const original = await importOriginal<typeof import('@utils/validation')>()
  return { ...original }
})

describe('ui/EmailCapture', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    vi.restoreAllMocks()
    global.fetch = originalFetch
  })

  // ------------------------------------------------------------------
  // Rendering – default props
  // ------------------------------------------------------------------
  describe('Default rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<EmailCapture />)).not.toThrow()
    })

    it('renders the email input', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    })

    it('email input has type="email"', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText(/Email address/i)).toHaveAttribute('type', 'email')
    })

    it('renders with default placeholder text', () => {
      render(<EmailCapture />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('renders with default button text', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('button', { name: /Join Waitlist/i })).toBeInTheDocument()
    })

    it('renders the GDPR consent checkbox', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders the Privacy Policy link', () => {
      render(<EmailCapture />)
      const link = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/privacy.html')
    })

    it('Privacy Policy link opens in a new tab with safe rel', () => {
      render(<EmailCapture />)
      const link = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not show an error alert initially', () => {
      render(<EmailCapture />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // ------------------------------------------------------------------
  // Custom props
  // ------------------------------------------------------------------
  describe('Custom props', () => {
    it('respects a custom placeholder prop', () => {
      render(<EmailCapture placeholder="your@email.com" />)
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    })

    it('respects a custom buttonText prop', () => {
      render(<EmailCapture buttonText="Get Early Access" />)
      expect(screen.getByRole('button', { name: /Get Early Access/i })).toBeInTheDocument()
    })

    it('renders with variant="centered" without crashing', () => {
      expect(() => render(<EmailCapture variant="centered" />)).not.toThrow()
    })

    it('renders with variant="inline" without crashing', () => {
      expect(() => render(<EmailCapture variant="inline" />)).not.toThrow()
    })
  })

  // ------------------------------------------------------------------
  // Form interaction
  // ------------------------------------------------------------------
  describe('Form interaction', () => {
    it('updates email input value as the user types', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)
      const input = screen.getByLabelText(/Email address/i) as HTMLInputElement
      await user.type(input, 'hello@example.com')
      expect(input.value).toBe('hello@example.com')
    })

    it('toggles the GDPR consent checkbox', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
      await user.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })
  })

  // ------------------------------------------------------------------
  // Validation: invalid email
  // ------------------------------------------------------------------
  describe('Email validation', () => {
    it('shows an error when an invalid email is submitted', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      // Type an invalid address (no domain)
      await user.type(screen.getByLabelText(/Email address/i), 'notanemail')
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('shows an error when GDPR consent is not given for a valid email', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      // Do NOT tick the GDPR checkbox
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Please agree to receive emails from Paperlyte/i)).toBeInTheDocument()
      })
    })

    it('sets aria-invalid on the input when there is an error', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'notanemail')
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const input = screen.getByLabelText(/Email address/i)
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-describedby pointing at the error element', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'notanemail')
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const input = screen.getByLabelText(/Email address/i)
        expect(input).toHaveAttribute('aria-describedby', 'email-error')
      })
    })

    it('error element has aria-live="polite"', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'notanemail')
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const errorEl = screen.getByRole('alert')
        expect(errorEl).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  // ------------------------------------------------------------------
  // Honeypot (spam protection)
  // ------------------------------------------------------------------
  describe('Honeypot spam protection', () => {
    it('does not call fetch when the honeypot field is filled and form is submitted', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      const user = userEvent.setup()
      render(<EmailCapture />)

      // Fill the visible fields correctly
      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))

      // Fill the honeypot field using fireEvent (React synthetic change)
      const honeypotInput = document.querySelector<HTMLInputElement>('input[name="website"]')
      expect(honeypotInput).not.toBeNull()
      fireEvent.change(honeypotInput!, { target: { value: 'botvalue' } })

      // Submit the form – honeypot is filled so fetch should NOT be called
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('renders the honeypot field as aria-hidden', () => {
      render(<EmailCapture />)
      const honeypot = document.querySelector('input[name="website"]')
      expect(honeypot).toHaveAttribute('aria-hidden', 'true')
    })

    it('honeypot field has tabIndex=-1', () => {
      render(<EmailCapture />)
      const honeypot = document.querySelector('input[name="website"]')
      expect(honeypot).toHaveAttribute('tabIndex', '-1')
    })
  })

  // ------------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------------
  describe('Loading state', () => {
    beforeEach(() => {
      // Provide a fetch that never resolves so we can inspect the loading state
      global.fetch = vi.fn(() => new Promise(() => {}))
    })

    it('shows "Joining..." button text while loading', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))

      // Start submit (do not await – the fetch never resolves)
      void user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Joining\.\.\./i })).toBeInTheDocument()
      })
    })

    it('disables the submit button while loading', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))

      void user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /Joining\.\.\./i })
        expect(btn).toBeDisabled()
      })
    })

    it('disables the email input while loading', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))

      void user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const input = screen.getByLabelText(/Email address/i)
        expect(input).toBeDisabled()
      })
    })
  })

  // ------------------------------------------------------------------
  // Success state
  // ------------------------------------------------------------------
  describe('Success state', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )
    })

    it('shows the success message after a successful submission', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
      })
    })

    it('success alert contains confirmation message', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/Check your email to confirm your subscription/i)
        ).toBeInTheDocument()
      })
    })

    it('tracks the email_signup analytics event on success', async () => {
      const { trackEvent } = await import('@utils/analytics')
      const trackEventMock = trackEvent as ReturnType<typeof vi.fn>
      trackEventMock.mockClear()

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(trackEventMock).toHaveBeenCalledWith('email_signup', {
          category: 'engagement',
          label: 'waitlist',
        })
      })
    })
  })

  // ------------------------------------------------------------------
  // Error state – server error
  // ------------------------------------------------------------------
  describe('Error state (server error)', () => {
    it('shows an error message when the server returns a non-OK response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Email already registered' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Email already registered/i)).toBeInTheDocument()
      })
    })

    it('shows a fallback error message when the server response has no error field', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({}), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Subscription failed/i)).toBeInTheDocument()
      })
    })

    it('shows an error when fetch throws a network error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network failure')))

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Network failure/i)).toBeInTheDocument()
      })
    })

    it('shows a generic fallback when a non-Error is thrown', async () => {
      global.fetch = vi.fn(() => Promise.reject('string error'))

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText(/Email address/i), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })
    })
  })
})
