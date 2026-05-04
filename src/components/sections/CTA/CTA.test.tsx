import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CTA } from './CTA'

describe('CTA', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    originalScrollIntoView = Element.prototype.scrollIntoView
    scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    vi.clearAllMocks()
  })

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
    expect(screen.getByText(/Join the waitlist today and be among the first/i)).toBeInTheDocument()
  })

  it('should render Join the Waitlist button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Join the Waitlist/i })
    expect(button).toBeInTheDocument()
  })

  it('should render Watch the Demo Again button', () => {
    render(<CTA />)

    const button = screen.getByRole('button', { name: /Watch the Demo Again/i })
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

  describe('Button click behaviour', () => {
    it('should scroll to email-capture section when Join the Waitlist is clicked', async () => {
      const user = userEvent.setup()

      const emailCaptureSection = document.createElement('div')
      emailCaptureSection.id = 'email-capture'
      document.body.appendChild(emailCaptureSection)

      render(<CTA />)

      const button = screen.getByRole('button', { name: /Join the Waitlist/i })
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(emailCaptureSection)
    })

    it('should scroll to hero section when Watch the Demo Again is clicked', async () => {
      const user = userEvent.setup()

      const heroSection = document.createElement('div')
      heroSection.id = 'hero'
      document.body.appendChild(heroSection)

      render(<CTA />)

      const button = screen.getByRole('button', { name: /Watch the Demo Again/i })
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(heroSection)
    })

    it('should not throw when target section does not exist', async () => {
      const user = userEvent.setup()
      render(<CTA />)

      const button = screen.getByRole('button', { name: /Join the Waitlist/i })
      await expect(user.click(button)).resolves.not.toThrow()
    })
  })
})
