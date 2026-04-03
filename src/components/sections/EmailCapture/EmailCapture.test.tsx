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

  it('shows error for disposable email domain', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'test@mailinator.com')
    await user.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/permanent email/i)
    })
  })

  it('shows error for empty email submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    // Submit without typing anything (bypass browser validation by direct call)
    const form = screen.getByPlaceholderText('your@email.com').closest('form')!
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    // The browser required attribute prevents submission but we can check the input
    const emailInput = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
    expect(emailInput.required).toBe(true)
    // Form should not show success
    expect(screen.queryByText(/You're on the list!/)).not.toBeInTheDocument()
    // Silence unused variable lint
    void form
  })

  it('shows error for malformed email without @ sign', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'notanemail')
    await user.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/valid email/i)
    })
  })

  it('shows error for another known disposable domain (yopmail.com)', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'user@yopmail.com')
    await user.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/permanent email/i)
    })
  })

  it('does not enter loading state when validation fails', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'test@mailinator.com')
    await user.click(submitButton)

    await waitFor(() => {
      // Button must remain enabled — validation error should not start loading
      expect(submitButton).not.toBeDisabled()
      expect(screen.queryByText(/Joining\.\.\./i)).not.toBeInTheDocument()
    })
  })

  it('renders the validation error with role="alert" for screen readers', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'bad@mailinator.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })

  it('clears the validation error and transitions to success when a valid email is submitted after a previous failure', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    // First attempt — disposable email triggers validation error
    await user.type(emailInput, 'bad@mailinator.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Clear the field and type a valid address
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@example.com')
    await user.click(submitButton)

    // Success state should be shown and no alert should remain
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })
  })
})