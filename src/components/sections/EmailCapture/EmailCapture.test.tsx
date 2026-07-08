import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'
import { LAUNCH_QUARTER, WAITLIST_COUNT } from '@/constants/waitlist'

describe('EmailCapture Section', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('renders the section title', () => {
    render(<EmailCapture />)
    expect(screen.getByText('Get Paperlyte before public launch')).toBeInTheDocument()
    expect(
      screen.getByText(`Launching ${LAUNCH_QUARTER} · ${WAITLIST_COUNT} already waiting`)
    ).toBeInTheDocument()
  })

  it('renders the form with an explicitly associated email label and submit button', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByLabelText('Work email or personal email')

    expect(emailInput).toHaveAttribute('id', 'email')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(screen.getByRole('button', { name: /Claim Early Access/i })).toBeInTheDocument()
  })

  it('renders all benefits', () => {
    render(<EmailCapture />)
    expect(
      screen.getByText(/Early invite before the public launch queue opens/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Founder pricing: save 50% for life/)).toBeInTheDocument()
    expect(screen.getByText(/Product updates focused on launch progress/)).toBeInTheDocument()
    expect(screen.getByText(/A chance to influence the editor/)).toBeInTheDocument()
  })

  it('renders privacy notice', () => {
    render(<EmailCapture />)
    expect(
      screen.getByText(
        /No spam. One-click unsubscribe. We only use your email for Paperlyte updates./
      )
    ).toBeInTheDocument()
  })

  it('shows success message after form submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const submitButton = screen.getByRole('button', { name: /Claim Early Access/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })

    // Verify the correct HTTP contract was used
    expect(fetchMock).toHaveBeenCalledWith('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
  })

  it('shows a generic error message when the API returns a 5xx response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    })

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Couldn't add you to the waitlist/i)
    })
  })

  it('shows the server error message for a 400 response without reaching the catch block', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid email address' }),
    })

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address')
    })
  })

  it('shows the server error message for a 429 rate-limit response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Too many requests. Please try again in a minute.' }),
    })

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Too many requests/)
    })
  })

  it('shows a network error message when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Connection error. Check your internet/)
    })
  })

  it('validates email input is required', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement
    expect(emailInput.required).toBe(true)
  })

  describe('Error handling', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('shows a network error message when a network failure occurs', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('network request failed'))

      const user = userEvent.setup()
      render(<EmailCapture />)
      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Connection error/i)
      })
    })

    it('shows a validation error message when email is flagged as invalid', async () => {
      fetchMock.mockRejectedValueOnce(new Error('invalid email address'))

      const user = userEvent.setup()
      render(<EmailCapture />)
      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/doesn't look right/i)
      })
    })
  })

  it('email input has aria-invalid=false and no aria-describedby when there is no error', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('you@example.com')
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    expect(emailInput).not.toHaveAttribute('aria-describedby')
  })

  it('email input has aria-invalid=true and aria-describedby pointing to the error element on error', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user..name@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('you@example.com')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error')
    })
  })

  it('shows a client-side error and does not call fetch for an invalid email', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('you@example.com')
    // Type an invalid email that passes HTML5 type="email" but fails our validator
    await user.type(emailInput, 'user..name@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/valid email address/)
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows loading state while submitting', async () => {
    // Use a deferred promise so isLoading stays true while we assert the loading UI
    let resolveSubmit!: () => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<{ ok: boolean; json: () => Promise<{ success: boolean }> }>((resolve) => {
          resolveSubmit = () =>
            resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        })
    )

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')

    // Click but don't await — submission is in-flight
    void user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    // Loading state should appear while fetch is pending
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Saving your spot\.\.\./i })).toBeDisabled()
    })

    // Resolve so component finishes cleanly and avoids unmounted-state warnings
    resolveSubmit()
    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })
  })

  it('shows success state with social sharing buttons', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Claim Early Access/i }))

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })

    // Social sharing buttons should appear in the success state
    expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
  })

  it('moves focus to the success heading so the result is announced to screen readers', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /You're on the list!/i })
      expect(heading).toHaveFocus()
    })
  })
})
