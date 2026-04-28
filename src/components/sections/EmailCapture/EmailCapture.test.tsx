import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'
import { WAITLIST_COUNT } from '@/constants/waitlist'

describe('EmailCapture Section', () => {
  afterEach(() => {
    // Ensure real timers are always restored even if a test times out
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
  })

  it('validates email input is required', () => {
    render(<EmailCapture />)
    const emailInput = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
    expect(emailInput.required).toBe(true)
  })

  it('shows loading state while submitting', () => {
    // Use fake timers so the 1000ms simulated API call never resolves,
    // keeping isLoading=true for the duration of this test.
    vi.useFakeTimers()

    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Submit the form synchronously via fireEvent (avoids async userEvent hang with fake timers)
    const form = emailInput.closest('form')!
    act(() => {
      fireEvent.submit(form)
    })

    // React flushes the synchronous state update (setIsLoading(true)) inside act();
    // the 1s setTimeout is frozen, so isLoading stays true.
    expect(screen.getByRole('button', { name: /Joining\.\.\./i })).toBeDisabled()

    // Drain the pending setTimeout so the handleSubmit promise resolves before
    // testing-library unmounts the component. Without this, React logs a
    // "state update on unmounted component" warning when afterEach swaps timers.
    act(() => {
      vi.advanceTimersByTime(1000)
    })
  })

  it('shows success state with social sharing buttons', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    await user.type(emailInput, 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    // Wait up to 3s for the simulated 1s API call to complete
    await waitFor(
      () => {
        expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Social sharing buttons should appear in the success state
    expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
  })
})
