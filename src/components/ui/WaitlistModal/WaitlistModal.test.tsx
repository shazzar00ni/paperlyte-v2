import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WaitlistModal } from './WaitlistModal'

describe('WaitlistModal', () => {
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
  })

  it('renders nothing when closed', () => {
    render(<WaitlistModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the form when open', () => {
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'waitlist-modal-title')
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the Waitlist/i })).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<WaitlistModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<WaitlistModal isOpen={true} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<WaitlistModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('traps Tab focus: tabbing past the last element wraps to the first', () => {
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    submitButton.focus()
    expect(submitButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })

  it('traps Tab focus: shift+Tab on the first element wraps to the last', () => {
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })

    closeButton.focus()
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(submitButton).toHaveFocus()
  })

  it('allows Tab to advance from a middle element', async () => {
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)
    const user = userEvent.setup()

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', { name: /Join the Waitlist/i })
    emailInput.focus()
    await user.tab()
    expect(submitButton).toHaveFocus()
  })

  it('locks body scroll while open', () => {
    const { rerender } = render(<WaitlistModal isOpen={false} onClose={vi.fn()} />)
    expect(document.body.style.overflow).toBe('')

    rerender(<WaitlistModal isOpen={true} onClose={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<WaitlistModal isOpen={false} onClose={vi.fn()} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('submits the email and shows a success confirmation without leaving the page', async () => {
    const user = userEvent.setup()
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
      signal: expect.any(AbortSignal),
    })
  })

  it('keeps focus trapped inside the modal after a successful submission', async () => {
    const user = userEvent.setup()
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    const successHeading = await screen.findByRole('heading', { name: /You're on the list!/i })
    expect(successHeading).toHaveFocus()

    // The success view's only tabbable element (per getFocusableElements) is the
    // close button — the heading itself is tabIndex={-1}. Tab from it must wrap
    // to the close button instead of escaping the still-open modal.
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })

  it('shows a validation error for an invalid email without calling the API', async () => {
    const user = userEvent.setup()
    render(<WaitlistModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('discards a stale response if the modal is closed and reopened before it resolves', async () => {
    // Never resolves on its own — only settles via its own AbortSignal's 'abort'
    // listener — so the test proves the close flow actually calls abort(),
    // rather than passing merely because we manually rejected the promise.
    let capturedSignal: AbortSignal | undefined
    fetchMock.mockImplementationOnce(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          capturedSignal = options.signal ?? undefined
          options.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
    )

    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(<WaitlistModal isOpen={true} onClose={onClose} />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Joining/i })).toBeDisabled()
    })

    // Close mid-submission and reopen
    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    // Prove the close flow actually aborted the in-flight request
    expect(capturedSignal?.aborted).toBe(true)

    rerender(<WaitlistModal isOpen={true} onClose={onClose} />)

    // The reopened modal shows a fresh form, not a stale success/error from the
    // request that was in flight when it closed
    expect(screen.getByPlaceholderText('your@email.com')).toHaveValue('')
    expect(screen.queryByText(/You're on the list!/)).not.toBeInTheDocument()

    // Let the abort listener's rejection settle naturally; it must not
    // resurrect success state on the now-reopened modal
    await Promise.resolve()
    expect(screen.queryByText(/You're on the list!/)).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('your@email.com')).toHaveValue('')
  })
})
