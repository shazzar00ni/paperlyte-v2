import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
    expect(screen.getByText(/Receive exclusive productivity tips and updates/)).toBeInTheDocument()
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
      expect(screen.getByRole('alert')).toBeInTheDocument()
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
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Network error. Please check your connection/
      )
    })
  })

  it('validates email input is required', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
    expect(emailInput.required).toBe(true)
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
})
