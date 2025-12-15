import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'

describe('EmailCapture Section', () => {
  it('renders the section title', () => {
    render(<EmailCapture />)
    expect(screen.getByText('Join 500+ people on the waitlist')).toBeInTheDocument()
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
    expect(
      screen.getByText(/Receive exclusive productivity tips and updates/)
    ).toBeInTheDocument()
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
})
