import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { EmailCapture } from './EmailCapture'

vi.mock('@utils/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('@utils/monitoring', () => ({ logError: vi.fn() }))

const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  consent = true
) => {
  await user.type(screen.getByLabelText('Email address'), email)
  if (consent) {
    await user.click(screen.getByRole('checkbox'))
  }
  await user.click(screen.getByRole('button', { name: /join waitlist/i }))
}

describe('EmailCapture (ui)', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the email input and submit button', () => {
      render(<EmailCapture />)

      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument()
    })

    it('accepts custom placeholder and buttonText props', () => {
      render(<EmailCapture placeholder="you@company.com" buttonText="Get Access" />)

      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /get access/i })).toBeInTheDocument()
    })

    it('renders the GDPR consent checkbox', () => {
      render(<EmailCapture />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText(/I agree to receive product updates/i)).toBeInTheDocument()
    })

    it('renders privacy policy link', () => {
      render(<EmailCapture />)

      const link = screen.getByRole('link', { name: /privacy policy/i })
      expect(link).toHaveAttribute('href', '/privacy.html')
    })
  })

  describe('Validation', () => {
    it('shows an error when submitting with an empty email', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.click(screen.getByRole('button', { name: /join waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('shows an error for an invalid email address', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText('Email address'), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /join waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('shows an error when GDPR consent is not given', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      // Do NOT tick the consent checkbox
      await user.click(screen.getByRole('button', { name: /join waitlist/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/please confirm you'd like to receive updates/i)
        ).toBeInTheDocument()
      })
    })

    it('sets aria-invalid on the input when there is an error', async () => {
      const user = userEvent.setup()
      render(<EmailCapture />)

      await user.type(screen.getByLabelText('Email address'), 'bad')
      await user.click(screen.getByRole('button', { name: /join waitlist/i }))

      await waitFor(() => {
        expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('Successful submission', () => {
    it('shows success state after a successful fetch', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}), { status: 200 })))

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/you're on the list/i)
      })
    })

    it('shows loading state while fetch is in-flight', async () => {
      const user = userEvent.setup()
      let resolveFetch!: () => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(new Response(JSON.stringify({}), { status: 200 }))
      })
      global.fetch = vi.fn(() => fetchPromise)

      render(<EmailCapture />)
      const clickPromise = fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByText('Joining...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /joining/i })).toBeDisabled()
      })

      resolveFetch()
      await clickPromise
    })
  })

  describe('Fetch error handling', () => {
    it('shows error message when fetch throws an Error', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn(() => Promise.reject(new Error('Network failure')))

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByText(/couldn't add you to the list/i)).toBeInTheDocument()
      })
    })

    it('shows error message when fetch rejects with a non-Error value', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn(() => Promise.reject('string error'))

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByText(/couldn't add you to the list/i)).toBeInTheDocument()
      })
    })

    it('shows error message when the server returns a non-ok response', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Already subscribed' }), { status: 400 })
        )
      )

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByText(/couldn't add you to the list/i)).toBeInTheDocument()
      })
    })

    it('calls logError with the original Error instance', async () => {
      const { logError } = await import('@utils/monitoring')
      const user = userEvent.setup()
      const networkError = new Error('Network failure')
      global.fetch = vi.fn(() => Promise.reject(networkError))

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(
          networkError,
          expect.objectContaining({
            tags: expect.objectContaining({ component: 'EmailCapture', action: 'subscribe' }),
          }),
          'EmailCapture'
        )
      })
    })

    it('calls logError with a wrapped Error when a non-Error is thrown', async () => {
      const { logError } = await import('@utils/monitoring')
      const user = userEvent.setup()
      global.fetch = vi.fn(() => Promise.reject('string error'))

      render(<EmailCapture />)
      await fillAndSubmit(user, 'test@example.com')

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(
          expect.objectContaining({ message: expect.stringContaining('Subscribe failed') }),
          expect.objectContaining({
            tags: expect.objectContaining({ errorType: 'string' }),
          }),
          'EmailCapture'
        )
      })
    })
  })

  describe('Honeypot spam protection', () => {
    it('silently ignores submission when the honeypot field is filled', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn()

      render(<EmailCapture />)

      // Fill the hidden honeypot input directly — bypass pointer interaction since it's non-interactive
      const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')!
      fireEvent.change(honeypot, { target: { value: 'spambot' } })

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /join waitlist/i }))

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
