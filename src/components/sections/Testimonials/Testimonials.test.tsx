import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from '@constants/testimonials'

describe('Testimonials', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render as a section with correct id', () => {
    const { container } = render(<Testimonials />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'testimonials')
  })

  it('should render the section title', () => {
    render(<Testimonials />)

    expect(screen.getByText('What people are saying')).toBeInTheDocument()
  })

  it('should render the testimonial quote', () => {
    render(<Testimonials />)

    // Should render at least one testimonial quote (Marcus Johnson's quote)
    expect(screen.getByText(/I've tried every note app out there/i)).toBeInTheDocument()
  })

  it('should render placeholder author name', () => {
    render(<Testimonials />)

    // Should render Marcus Johnson's name (from testimonial-2)
    expect(screen.getByText('Marcus Johnson')).toBeInTheDocument()
  })

  it('should render placeholder author role', () => {
    render(<Testimonials />)

    // Should render Marcus Johnson's role
    expect(screen.getByText('Freelance Writer')).toBeInTheDocument()
  })

  it('should render note about beta testimonials', () => {
    render(<Testimonials />)

    // Should render the subtitle about real feedback
    expect(
      screen.getByText(/Real feedback from people who switched to Paperlyte/i)
    ).toBeInTheDocument()
  })

  it('should use semantic blockquote for quote', () => {
    const { container } = render(<Testimonials />)

    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
  })

  it('should use cite element for author name', () => {
    const { container } = render(<Testimonials />)

    const cite = container.querySelector('cite')
    expect(cite).toBeInTheDocument()
    // Should have a non-empty author name
    expect(cite?.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('should render decorative quote icon', () => {
    const { container } = render(<Testimonials />)

    // The quotes are part of the blockquote text content, not separate decorative elements
    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote?.textContent).toContain('"')
  })

  describe('navigation', () => {
    it('should navigate to next testimonial when next button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Testimonials />)

      const nextButton = screen.getByRole('button', { name: /Next testimonial/i })
      await user.click(nextButton)

      // Screen reader announcement should update
      expect(screen.getByText(/Showing testimonial 2 of/)).toBeInTheDocument()
    })

    it('should navigate to previous testimonial when prev button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Testimonials />)

      const prevButton = screen.getByRole('button', { name: /Previous testimonial/i })
      await user.click(prevButton)

      // Should wrap around to last testimonial
      expect(
        screen.getByText(`Showing testimonial ${TESTIMONIALS.length} of ${TESTIMONIALS.length}`)
      ).toBeInTheDocument()
    })

    it('should navigate to specific slide when dot is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Testimonials />)

      const dot3 = screen.getByRole('tab', { name: /Go to testimonial 3/i })
      await user.click(dot3)

      expect(screen.getByText(/Showing testimonial 3 of/)).toBeInTheDocument()
    })

    it('should render navigation dots for each testimonial', () => {
      render(<Testimonials />)

      const dots = screen.getAllByRole('tab')
      expect(dots).toHaveLength(TESTIMONIALS.length)
    })

    it('should mark active dot with aria-selected', () => {
      render(<Testimonials />)

      const firstDot = screen.getByRole('tab', { name: /Go to testimonial 1/i })
      expect(firstDot).toHaveAttribute('aria-selected', 'true')
    })

    it('should wrap around when navigating past the last testimonial', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Testimonials />)

      const nextButton = screen.getByRole('button', { name: /Next testimonial/i })

      // Click next for each testimonial
      for (let i = 0; i < TESTIMONIALS.length; i++) {
        await user.click(nextButton)
      }

      // Should wrap back to first
      expect(screen.getByText(/Showing testimonial 1 of/)).toBeInTheDocument()
    })
  })

  describe('play/pause', () => {
    it('should render play/pause button', () => {
      render(<Testimonials />)

      const playPauseButton = screen.getByRole('button', { name: /Pause auto-rotation/i })
      expect(playPauseButton).toBeInTheDocument()
    })

    it('should toggle to pause state when clicked', () => {
      render(<Testimonials />)

      // Use fireEvent to avoid mouseEnter on carousel wrapper
      const playPauseButton = screen.getByRole('button', { name: /Pause auto-rotation/i })
      fireEvent.click(playPauseButton)

      expect(screen.getByRole('button', { name: /Play auto-rotation/i })).toBeInTheDocument()
    })
  })

  describe('auto-rotation', () => {
    it('should auto-rotate testimonials', () => {
      render(<Testimonials />)

      // Initially showing testimonial 1
      expect(screen.getByText(/Showing testimonial 1 of/)).toBeInTheDocument()

      // Advance 5 seconds (auto-rotate interval)
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Should now show testimonial 2
      expect(screen.getByText(/Showing testimonial 2 of/)).toBeInTheDocument()
    })

    it('should pause auto-rotation on mouse enter', () => {
      render(<Testimonials />)

      const carousel = screen.getByRole('region', { name: /Testimonials/i })

      // Mouse enter to pause
      fireEvent.mouseEnter(carousel)

      // Advance time - should NOT rotate
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Should still be on testimonial 1
      expect(screen.getByText(/Showing testimonial 1 of/)).toBeInTheDocument()
    })

    it('should resume auto-rotation on mouse leave', () => {
      render(<Testimonials />)

      const carousel = screen.getByRole('region', { name: /Testimonials/i })

      // Mouse enter to pause, then leave to resume
      fireEvent.mouseEnter(carousel)
      fireEvent.mouseLeave(carousel)

      // Advance time - should rotate
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(screen.getByText(/Showing testimonial 2 of/)).toBeInTheDocument()
    })
  })

  describe('star ratings', () => {
    it('should render star ratings for testimonials', () => {
      render(<Testimonials />)

      // Each testimonial has a star rating with role="img"
      const starRatings = screen.getAllByRole('img', { name: /out of 5 stars/ })
      expect(starRatings.length).toBeGreaterThan(0)
    })
  })

  describe('screen reader support', () => {
    it('should have carousel aria-label', () => {
      render(<Testimonials />)

      const carousel = screen.getByRole('region', { name: /Testimonials/i })
      expect(carousel).toBeInTheDocument()
    })

    it('should have live region for announcements', () => {
      const { container } = render(<Testimonials />)

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion?.textContent).toContain('Showing testimonial')
    })

    it('should have tablist for navigation dots', () => {
      render(<Testimonials />)

      const tablist = screen.getByRole('tablist', { name: /Testimonial slides/i })
      expect(tablist).toBeInTheDocument()
    })
  })

  describe('testimonial content', () => {
    it('should render all testimonials', () => {
      const { container } = render(<Testimonials />)

      const articles = container.querySelectorAll('article')
      expect(articles).toHaveLength(TESTIMONIALS.length)
    })

    it('should render initials when no avatar image', () => {
      render(<Testimonials />)

      // Check that at least one testimonial shows initials
      const testimonialWithInitials = TESTIMONIALS.find((t) => !t.avatar && t.initials)
      if (testimonialWithInitials) {
        expect(screen.getByText(testimonialWithInitials.initials)).toBeInTheDocument()
      }
    })
  })
})
