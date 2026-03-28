import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'
import { WAITLIST_COUNT } from '@/constants/waitlist'

// Mock monitoring
vi.mock('@utils/monitoring', () => ({
  logError: vi.fn(),
}))

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

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Should show loading text
    expect(screen.getByText('Joining...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('renders success state with social sharing buttons', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })

    // Should show social sharing buttons
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
  })

  it('renders success state with next steps', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/What happens next:/)).toBeInTheDocument()
    })

    expect(screen.getByText(/email you product updates/)).toBeInTheDocument()
    expect(screen.getByText(/early access 2 weeks before/)).toBeInTheDocument()
    expect(screen.getByText(/ask for your feedback/)).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<EmailCapture />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'email-capture')
  })
})
