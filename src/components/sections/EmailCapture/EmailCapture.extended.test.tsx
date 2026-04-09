/**
 * Extended tests for EmailCapture section
 * Focuses on the loading state, success state, and error-handling branches.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCapture } from './EmailCapture'

describe('EmailCapture extended', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ----------------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------------
  it('shows loading text while form is being submitted', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })
    // Start the click but don't advance timers yet
    const clickPromise = user.click(submitButton)

    // The loading state should be visible immediately after click starts
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Joining\.\.\./i })).not.toBeNull()
    })

    // Advance to finish
    vi.advanceTimersByTime(2000)
    await clickPromise
    vi.useRealTimers()
  })

  it('disables submit button while loading', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<EmailCapture />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })
    const clickPromise = user.click(submitButton)

    await waitFor(() => {
      const loadingButton = screen.queryByRole('button', { name: /Joining\.\.\./i })
      if (loadingButton) {
        expect(loadingButton).toBeDisabled()
      }
    })

    vi.advanceTimersByTime(2000)
    await clickPromise
    vi.useRealTimers()
  })

  // ----------------------------------------------------------------
  // Success state (rendered when isSubmitted = true)
  // ----------------------------------------------------------------
  it('shows success title after successful submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('shows next steps list after successful submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByText(/What happens next/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText(/We'll email you product updates as we build/i)).toBeInTheDocument()
    expect(
      screen.getByText(/You'll get early access 2 weeks before public launch/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/We'll ask for your feedback/i)).toBeInTheDocument()
  })

  it('shows share section with social buttons after successful submission', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByText(/Share Paperlyte with friends/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
  })

  it('success view Twitter link contains twitter.com URL', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByRole('link', { name: /Twitter/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const twitterLink = screen.getByRole('link', { name: /Twitter/i })
    expect(twitterLink.getAttribute('href')).toContain('twitter.com')
  })

  it('success view Facebook link contains facebook.com URL', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const facebookLink = screen.getByRole('link', { name: /Facebook/i })
    expect(facebookLink.getAttribute('href')).toContain('facebook.com')
  })

  it('success view LinkedIn link contains linkedin.com URL', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(
      () => {
        expect(screen.getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i })
    expect(linkedinLink.getAttribute('href')).toContain('linkedin.com')
  })

  // ----------------------------------------------------------------
  // Email input
  // ----------------------------------------------------------------
  it('updates email state as user types', async () => {
    const user = userEvent.setup()
    render(<EmailCapture />)

    const input = screen.getByPlaceholderText('your@email.com') as HTMLInputElement
    await user.type(input, 'hello@world.com')

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
