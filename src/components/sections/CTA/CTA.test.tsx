import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CTA } from './CTA'

describe('CTA', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<CTA />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'download')
  })

  it('should render main heading', () => {
    render(<CTA />)
    expect(
      screen.getByText('Stop fighting your tools. Start thinking clearly.')
    ).toBeInTheDocument()
  })

  it('should render subtitle about note-taking', () => {
    render(<CTA />)
    expect(screen.getByText(/Note-taking shouldn't feel like work/i)).toBeInTheDocument()
  })

  it('should render waitlist message', () => {
    render(<CTA />)
    expect(screen.getByText(/Join the waitlist and get early access/i)).toBeInTheDocument()
  })

  it('should render Join the Waitlist button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Watch the Demo button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Watch the Demo/i })
    expect(button).toBeInTheDocument()
  })

  it('should render microcopy with launch details', () => {
    render(<CTA />)

    expect(screen.getByText(/Launching Q2 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/500\+ already waiting/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<CTA />)

    const mainHeading = screen.getByRole('heading', {
      level: 2,
      name: /Stop fighting your tools/i,
    })
    expect(mainHeading).toBeInTheDocument()
  })

  it('should render two CTA buttons', () => {
    render(<CTA />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('should render without crashing', () => {
    const { container } = render(<CTA />)
    expect(container).toBeDefined()
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  describe('Waitlist modal', () => {
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

    it('does not render the modal until the button is clicked', () => {
      render(<CTA />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('opens the waitlist modal instead of navigating away when clicked', async () => {
      const user = userEvent.setup()
      render(<CTA />)

      await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-labelledby', 'waitlist-modal-title')
    })

    it('lets the user submit their name and email and join the waitlist from within the modal', async () => {
      const user = userEvent.setup()
      render(<CTA />)

      await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))
      await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
      await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
      await user.click(screen.getByRole('dialog').querySelector('button[type="submit"]')!)

      await waitFor(() => {
        expect(screen.getByText(/You're on the list!/)).toBeInTheDocument()
      })
      expect(fetchMock).toHaveBeenCalledWith('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ada Lovelace', email: 'test@example.com' }),
        signal: expect.any(AbortSignal),
      })
    })

    it('closes the modal when the close button is clicked', async () => {
      const user = userEvent.setup()
      render(<CTA />)

      await user.click(screen.getByRole('button', { name: /Join the Waitlist/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
