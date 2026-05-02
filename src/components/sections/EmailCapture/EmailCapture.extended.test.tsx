import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { EmailCapture } from './EmailCapture'

/**
 * Helper: render the form, type an email, submit it, and advance fake timers
 * past the simulated 1000ms API call so the success state is shown.
 * Caller must have called vi.useFakeTimers() before invoking this.
 */
async function submitAndSucceed() {
  render(<EmailCapture />)
  fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
    target: { value: 'user@example.com' },
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Join the Waitlist/i }))
  })
  await act(async () => {
    vi.advanceTimersByTime(1500)
  })
}

describe('EmailCapture extended', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // ----------------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------------
  it('shows loading text while form is being submitted', async () => {
    vi.useFakeTimers()
    render(<EmailCapture />)

    // Use fireEvent.change to set the controlled input value synchronously
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'user@example.com' },
    })

    // Click submit and flush React state updates via act
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Join the Waitlist/i }))
    })

    expect(screen.getByRole('button', { name: /Joining\.\.\./i })).toBeInTheDocument()

    // Advance timers to complete the simulated API call
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
  })

  it('disables submit button while loading', async () => {
    vi.useFakeTimers()
    render(<EmailCapture />)

    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'user@example.com' },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Join the Waitlist/i }))
    })

    const loadingButton = screen.getByRole('button', { name: /Joining\.\.\./i })
    expect(loadingButton).toBeDisabled()

    // Advance timers to complete the simulated API call
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
  })

  // ----------------------------------------------------------------
  // Success state (rendered when isSubmitted = true)
  // ----------------------------------------------------------------
  it('shows success title after successful submission', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()
    expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
  })

  it('shows next steps list after successful submission', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()

    expect(screen.getByText(/What happens next/i)).toBeInTheDocument()
    expect(screen.getByText(/We'll email you product updates as we build/i)).toBeInTheDocument()
    expect(
      screen.getByText(/You'll get early access 2 weeks before public launch/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/We'll ask for your feedback/i)).toBeInTheDocument()
  })

  it('shows share section with social buttons after successful submission', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()

    expect(screen.getByText(/Share Paperlyte with friends/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
  })

  it('success view Twitter link contains twitter.com URL', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()

    const twitterLink = screen.getByRole('link', { name: /Twitter/i })
    expect(twitterLink.getAttribute('href')).toContain('twitter.com')
  })

  it('success view Facebook link contains facebook.com URL', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()

    const facebookLink = screen.getByRole('link', { name: /Facebook/i })
    expect(facebookLink.getAttribute('href')).toContain('facebook.com')
  })

  it('success view LinkedIn link contains linkedin.com URL', async () => {
    vi.useFakeTimers()
    await submitAndSucceed()

    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i })
    expect(linkedinLink.getAttribute('href')).toContain('linkedin.com')
  })

  // ----------------------------------------------------------------
  // Email input
  // ----------------------------------------------------------------
  it('updates email state as user types', async () => {
    render(<EmailCapture />)

    const input = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hello@world.com' } })

    expect(input.value).toBe('hello@world.com')
  })

  // ----------------------------------------------------------------
  // Section structure
  // ----------------------------------------------------------------
  it('renders in a Section with id email-capture', () => {
    const { container } = render(<EmailCapture />)
    const section = container.querySelector('#email-capture')
    expect(section).toBeInTheDocument()
  })

  it('email input has correct type', () => {
    render(<EmailCapture />)
    const input = screen.getByLabelText(/Email address/i)
    expect(input).toHaveAttribute('type', 'email')
  })

  it('form has privacy notice text', () => {
    render(<EmailCapture />)
    expect(screen.getByText(/We respect your privacy/i)).toBeInTheDocument()
  })

  it('no error message shown initially', () => {
    render(<EmailCapture />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
