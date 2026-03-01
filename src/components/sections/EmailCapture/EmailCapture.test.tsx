import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'
import { WAITLIST_COUNT } from '@/constants/waitlist'

describe('EmailCapture Section', () => {
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

  it('displays error message when submission fails', async () => {
    const user = userEvent.setup()

    // Make the simulated API promise reject by throwing inside setTimeout
    // when called with the 1000ms delay used by the component.
    // Use a flag to only throw once, avoiding interference with waitFor.
    const origSetTimeout = globalThis.setTimeout
    let shouldThrow = false

    globalThis.setTimeout = ((fn: TimerHandler, ms?: number, ...args: unknown[]) => {
      if (ms === 1000 && shouldThrow) {
        shouldThrow = false
        throw new Error('Simulated API failure')
      }
      return origSetTimeout(fn as (...a: unknown[]) => void, ms, ...args)
    }) as typeof setTimeout

    try {
      render(<EmailCapture />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

      await user.type(emailInput, 'test@example.com')

      // Enable the throw right before submitting
      shouldThrow = true
      await user.click(submitButton)

      // Restore before waitFor to avoid interference
      globalThis.setTimeout = origSetTimeout

      await waitFor(() => {
        expect(screen.getByText(/Failed to join waitlist/)).toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Submit button should be re-enabled after error
      expect(screen.getByRole('button', { name: /Join the Waitlist/i })).not.toBeDisabled()
    } finally {
      globalThis.setTimeout = origSetTimeout
    }
  })
})
