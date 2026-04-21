import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
      // Use fireEvent to avoid userEvent's focus handling triggering jsdom's Selection
      // setTimeout before the component's own setTimeout can be mocked
      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('network request failed')
      })

      render(<EmailCapture />)
      fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.submit(screen.getByPlaceholderText('your@email.com').closest('form')!)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Connection error/i)
      })
    })

    it('shows a validation error message when email is flagged as invalid', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('invalid email address')
      })

      render(<EmailCapture />)
      fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.submit(screen.getByPlaceholderText('your@email.com').closest('form')!)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/doesn't look right/i)
      })
    })
  })
})
