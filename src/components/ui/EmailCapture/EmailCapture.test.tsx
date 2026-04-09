import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach } from 'vitest'
import { EmailCapture } from './EmailCapture'

// Mock analytics to prevent side effects
vi.mock('@utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

describe('EmailCapture (UI component)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Default rendering', () => {
    it('should render with default props', () => {
      render(<EmailCapture />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('should render the default button text "Join Waitlist"', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('button', { name: /Join Waitlist/i })).toBeInTheDocument()
    })

    it('should render the GDPR consent checkbox', () => {
      render(<EmailCapture />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should render the GDPR consent label', () => {
      render(<EmailCapture />)
      expect(screen.getByText(/I agree to receive emails from Paperlyte/i)).toBeInTheDocument()
    })

    it('should render a link to the privacy policy', () => {
      render(<EmailCapture />)
      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy.html')
    })

    it('should render the email input with label', () => {
      render(<EmailCapture />)
      const label = screen.getByText('Email address')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Custom props', () => {
    it('should use a custom placeholder', () => {
      render(<EmailCapture placeholder="your@company.com" />)
      expect(screen.getByPlaceholderText('your@company.com')).toBeInTheDocument()
    })

    it('should use custom button text', () => {
      render(<EmailCapture buttonText="Get Early Access" />)
      expect(screen.getByRole('button', { name: /Get Early Access/i })).toBeInTheDocument()
    })

    it('should accept "centered" variant without error', () => {
      const { container } = render(<EmailCapture variant="centered" />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should accept "inline" variant without error', () => {
      const { container } = render(<EmailCapture variant="inline" />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Email validation errors', () => {
    it('should show an error for an empty email submission', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should show an error for an invalid email format', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'not-an-email')
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
      })
    })

    it('should mark email input as aria-invalid on error', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'bad-email')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('Enter your email')
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should have an error element referenced by aria-describedby', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'bad-email')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('Enter your email')
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
        expect(document.getElementById('email-error')).toBeInTheDocument()
      })
    })
  })

  describe('GDPR consent validation', () => {
    it('should show an error when submitting valid email without GDPR consent', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      // Do NOT check the GDPR checkbox
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/Please agree to receive emails from Paperlyte/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Honeypot spam protection', () => {
    it('should not submit when the honeypot field is filled', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      // Fill the honeypot field (it is aria-hidden and tabIndex=-1 but accessible in tests)
      const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement
      expect(honeypot).toBeInTheDocument()

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))

      // Directly set honeypot value to simulate a bot
      Object.defineProperty(honeypot, 'value', { value: 'http://spam.com', writable: true })
      honeypot.dispatchEvent(new Event('input', { bubbles: true }))

      // Attempt submission and verify the honeypot prevents any network request
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(fetchMock).not.toHaveBeenCalled()
      })
    })
  })

  describe('Successful submission', () => {
    it('should display success state after a successful API response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Subscribed!' }),
      })

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
      })
    })

    it('should show a confirmation message to check email', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Subscribed!' }),
      })

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/Check your email to confirm/i)).toBeInTheDocument()
      })
    })

    it('should render the success state as an alert', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Subscribed!' }),
      })

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('Error from API', () => {
    it('should display a server error message when API returns non-ok response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already registered' }),
      })

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/Email already registered/i)).toBeInTheDocument()
      })
    })

    it('should display a generic error when fetch throws a network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should display fallback error message when non-Error is thrown', async () => {
      fetchMock.mockRejectedValueOnce('unexpected failure')

      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Loading state', () => {
    it('should disable the submit button while loading', async () => {
      // Keep the fetch pending
      fetchMock.mockImplementationOnce(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Joining/i })
        expect(button).toBeDisabled()
      })
    })

    it('should disable the email input while loading', async () => {
      fetchMock.mockImplementationOnce(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('Enter your email')
        expect(emailInput).toBeDisabled()
      })
    })

    it('should show "Joining..." text while loading', async () => {
      fetchMock.mockImplementationOnce(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByText(/Joining\.\.\./i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have an accessible email label', () => {
      render(<EmailCapture />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('should have the email input as required', () => {
      render(<EmailCapture />)
      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
      expect(emailInput.required).toBe(true)
    })

    it('should render the privacy policy link with noopener noreferrer', () => {
      render(<EmailCapture />)
      const link = screen.getByRole('link', { name: /Privacy Policy/i })
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should render the error live region with aria-live="polite"', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByPlaceholderText('Enter your email'), 'bad')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Join Waitlist/i }))

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
