import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from '@constants/testimonials'

describe('Testimonials', () => {
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

    expect(screen.getByText(/I've tried every note app out there/i)).toBeInTheDocument()
  })

  it('should render placeholder author name', () => {
    render(<Testimonials />)

    expect(screen.getByText('Marcus Johnson')).toBeInTheDocument()
  })

  it('should render placeholder author role', () => {
    render(<Testimonials />)

    expect(screen.getByText('Freelance Writer')).toBeInTheDocument()
  })

  it('should render note about beta testimonials', () => {
    render(<Testimonials />)

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
    expect(cite?.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('should render decorative quote icon', () => {
    const { container } = render(<Testimonials />)

    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote?.textContent).toContain('"')
  })
})

describe('Testimonials — Navigation', () => {
  it('should start with first slide active', () => {
    render(<Testimonials />)

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    expect(dots[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('should advance to next slide when next button is clicked', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Next testimonial'))

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'false')
    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should go back to previous slide when prev button is clicked', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Next testimonial'))
    fireEvent.click(screen.getByLabelText('Previous testimonial'))

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should wrap from first to last when clicking previous', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Previous testimonial'))

    const dots = screen.getAllByRole('tab')
    expect(dots[dots.length - 1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should wrap from last to first when clicking next', () => {
    render(<Testimonials />)

    const nextBtn = screen.getByLabelText('Next testimonial')
    for (let i = 0; i < TESTIMONIALS.length; i++) {
      fireEvent.click(nextBtn)
    }

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should jump to a specific slide when a dot is clicked', () => {
    render(<Testimonials />)

    const dots = screen.getAllByRole('tab')
    fireEvent.click(dots[4])

    expect(dots[4]).toHaveAttribute('aria-selected', 'true')
    expect(dots[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('should render a navigation dot for every testimonial', () => {
    render(<Testimonials />)

    const dots = screen.getAllByRole('tab')
    expect(dots.length).toBe(TESTIMONIALS.length)
  })
})

describe('Testimonials — Keyboard Navigation', () => {
  it('should advance slide on ArrowRight', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })

    const dots = screen.getAllByRole('tab')
    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should go back on ArrowLeft', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    fireEvent.click(screen.getByLabelText('Next testimonial'))
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should ignore other keys', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    fireEvent.keyDown(carousel, { key: 'Enter' })

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should have tabIndex on carousel for keyboard focus', () => {
    render(<Testimonials />)

    expect(screen.getByLabelText('Testimonials')).toHaveAttribute('tabindex', '0')
  })
})

describe('Testimonials — Auto-rotation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should auto-advance after 5 seconds', async () => {
    render(<Testimonials />)

    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should pause auto-rotation on mouse enter', async () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.mouseEnter(carousel)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should resume auto-rotation on mouse leave', async () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.mouseEnter(carousel)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(dots[0]).toHaveAttribute('aria-selected', 'true')

    fireEvent.mouseLeave(carousel)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Testimonials — Play/Pause Control', () => {
  it('should show pause button initially (auto-rotation is playing)', () => {
    render(<Testimonials />)

    expect(screen.getByLabelText('Pause auto-rotation')).toBeInTheDocument()
  })

  it('should toggle to play button after clicking pause', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Pause auto-rotation'))

    expect(screen.getByLabelText('Play auto-rotation')).toBeInTheDocument()
  })

  it('should toggle back to pause after clicking play', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Pause auto-rotation'))
    fireEvent.click(screen.getByLabelText('Play auto-rotation'))

    expect(screen.getByLabelText('Pause auto-rotation')).toBeInTheDocument()
  })
})

describe('Testimonials — Touch/Swipe', () => {
  it('should advance to next slide on left swipe (>= 50px)', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 240 }] })
    fireEvent.touchEnd(carousel)

    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should go to previous slide on right swipe (>= 50px)', () => {
    render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Next testimonial'))

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 160 }] })
    fireEvent.touchEnd(carousel)

    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should not change slide when swipe distance is below threshold', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 180 }] })
    fireEvent.touchEnd(carousel)

    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('should not change slide when touch end fires without a start', () => {
    render(<Testimonials />)

    const carousel = screen.getByLabelText('Testimonials')
    const dots = screen.getAllByRole('tab')

    fireEvent.touchEnd(carousel)

    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Testimonials — Star Ratings', () => {
  it('should render a star rating for every testimonial', () => {
    render(<Testimonials />)

    const ratingLabels = screen.getAllByRole('img', { name: /out of 5 stars/i })
    expect(ratingLabels.length).toBe(TESTIMONIALS.length)
  })

  it('should display the correct star count label', () => {
    render(<Testimonials />)

    const fiveStarRatings = screen.getAllByRole('img', { name: '5 out of 5 stars' })
    const expected5StarCount = TESTIMONIALS.filter((t) => t.rating === 5).length
    expect(fiveStarRatings.length).toBe(expected5StarCount)
  })

  it('should display 4-star ratings where applicable', () => {
    render(<Testimonials />)

    const fourStarRatings = screen.getAllByRole('img', { name: '4 out of 5 stars' })
    const expected4StarCount = TESTIMONIALS.filter((t) => t.rating === 4).length
    expect(fourStarRatings.length).toBe(expected4StarCount)
  })
})

describe('Testimonials — Accessibility / ARIA', () => {
  it('should have an aria-live polite region for slide announcements', () => {
    const { container } = render(<Testimonials />)

    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
  })

  it('should announce current slide position in live region', () => {
    const { container } = render(<Testimonials />)

    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toMatch(/Showing testimonial 1 of \d+/)
  })

  it('should update live region when slide changes', () => {
    const { container } = render(<Testimonials />)

    fireEvent.click(screen.getByLabelText('Next testimonial'))

    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toMatch(/Showing testimonial 2 of \d+/)
  })

  it('should label the dot group for screen readers', () => {
    render(<Testimonials />)

    expect(screen.getByRole('tablist', { name: 'Testimonial slides' })).toBeInTheDocument()
  })
})

describe('Testimonials — Testimonial Card Content', () => {
  it('should render initials when no avatar URL is present', () => {
    const { container } = render(<Testimonials />)

    // All current testimonials have no avatar; initials spans should be present
    const initialsEls = container.querySelectorAll('[class*="initials"]')
    expect(initialsEls.length).toBeGreaterThan(0)
  })

  it('should render company name alongside role when provided', () => {
    render(<Testimonials />)

    // Sarah Chen belongs to TechCorp
    expect(screen.getByText(/TechCorp/)).toBeInTheDocument()
  })

  it('should render all testimonial author names', () => {
    render(<Testimonials />)

    TESTIMONIALS.forEach((t) => {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    })
  })

  it('should render navigation arrows with correct labels', () => {
    render(<Testimonials />)

    expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument()
    expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument()
  })
})
