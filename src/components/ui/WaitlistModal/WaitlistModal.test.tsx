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
    // Never resolves on its own — only settles (or rejects) via the abort signal —
    // so we can control exactly when the "server" responds relative to close/reopen.
    let rejectFirstRequest!: (reason: unknown) => void
    fetchMock.mockImplementationOnce(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          rejectFirstRequest = reject
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

    // Close mid-submission (aborts the in-flight request) and reopen
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    rerender(<WaitlistModal isOpen={true} onClose={onClose} />)

    // The reopened modal shows a fresh form, not a stale success/error from the
    // request that was in flight when it closed
    expect(screen.getByPlaceholderText('your@email.com')).toHaveValue('')
    expect(screen.queryByText(/You're on the list!/)).not.toBeInTheDocument()

    // Letting the original request's promise settle after the abort must not
    // resurrect the success state on the now-reopened modal
    rejectFirstRequest(new DOMException('Aborted', 'AbortError'))
    await Promise.resolve()
    expect(screen.queryByText(/You're on the list!/)).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('your@email.com')).toHaveValue('')
  })
})
