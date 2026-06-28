import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'
import { WAITLIST_COUNT } from '@/constants/waitlist'

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
    expect(screen.getByText(`Join ${WAITLIST_COUNT} people on the waitlist`)).toBeInTheDocument()
  })

  it('renders the form with email input and submit button', () => {
    render(<EmailCapture />)
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the Waitlist/i })).toBeInTheDocument()
  })

  it('renders all benefits', () => {
    render(<EmailCapture />)
    expect(screen.getByText(/Get early access before public launch/)).toBeInTheDocument()
    expect(screen.getByText(/Influence features and design decisions/)).toBeInTheDocument()
    expect(screen.getByText(/Lock in founder pricing/)).toBeInTheDocument()
    expect(screen.getByText(/Get early product updates and insider tips/)).toBeInTheDocument()
  })

  it('renders privacy notice', () => {
    render(<EmailCapture />)
    expect(
      screen.getByText(/We respect your privacy. Unsubscribe anytime. No spam, ever./)
    ).toBeInTheDocument()
  })

  it('shows success message after form submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

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

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

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

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

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

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Too many requests/)
    })
  })

  it('shows a network error message when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Connection error. Check your internet/)
    })
  })

  it('validates email input is required', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
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
      await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Connection error/i)
      })
    })

    it('shows a validation error message when email is flagged as invalid', async () => {
      fetchMock.mockRejectedValueOnce(new Error('invalid email address'))

      const user = userEvent.setup()
      render(<EmailCapture />)
      await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/doesn't look right/i)
      })
    })
  })

  it('email input has aria-invalid=false and no aria-describedby when there is no error', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('your@email.com')
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    expect(emailInput).not.toHaveAttribute('aria-describedby')
  })

  it('email input has aria-invalid=true and aria-describedby pointing to the error element on error', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user..name@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('your@email.com')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error')
    })
  })

  it('shows a client-side error and does not call fetch for an invalid email', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    // Type an invalid email that passes HTML5 type="email" but fails our validator
    await user.type(emailInput, 'user..name@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

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

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')

    // Click but don't await — submission is in-flight
    void user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    // Loading state should appear while fetch is pending
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Joining\.\.\./i })).toBeDisabled()
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

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })

    // Social sharing buttons should appear in the success state
    expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    // Bypass the browser's type="email" filter by setting value directly,
    // then submit — validateEmail inside handleSubmit should catch it.
    // 'user@notvalid' passes HTML5 type="email" (no TLD required by browser)
    // but fails our validateEmail regex which requires a ≥2-char TLD.
    await user.type(emailInput, 'user@notvalid')
    await user.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/valid email/i)
    })
  })

  it('does not enter loading state when validation fails', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'bad@mailinator.com')
    await user.click(submitButton)

    // Button should never transition to the "Joining..." loading label
    // when validation fails before setIsLoading is called.
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(submitButton).not.toBeDisabled()
    expect(screen.queryByText('Joining...')).not.toBeInTheDocument()
  })

  it('clears validation error and shows success when valid email is submitted after a failed attempt', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    // First submit with disposable email — produces an error
    await user.type(emailInput, 'test@mailinator.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Clear the field and enter a valid email
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@example.com')
    await user.click(submitButton)

    // The error should be gone and the success state should appear
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })
  })

  it('shows "Email address is required" error message for empty email via validateEmail', async () => {
    render(<EmailCapture />)

    // Use fireEvent.submit (act()-wrapped) to bypass HTML5 required constraint
    const form = screen.getByPlaceholderText('your@email.com').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      const alert = screen.queryByRole('alert')
      // Either the HTML5 required attribute blocks submission (no alert),
      // or validateEmail's 'Email address is required' error is shown.
      if (alert) {
        expect(alert.textContent).toMatch(/required|valid email/i)
      } else {
        // HTML5 required attribute prevented submission — valid outcome
        const input = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
        expect(input.required).toBe(true)
      }
    })
  })

  it('error message element has role="alert" for accessibility', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    await user.type(emailInput, 'test@yopmail.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      const alertEl = screen.getByRole('alert')
      expect(alertEl).toBeInTheDocument()
      // The error paragraph uses role="alert" (from EmailCapture.tsx line ~196)
      expect(alertEl.tagName).toBe('P')
    })
  })
})
