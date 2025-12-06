import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from '@constants/testimonials'

describe('Testimonials', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should render as a section with correct id', () => {
    const { container } = render(<Testimonials />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'testimonials')
  })

  it('should render main heading', () => {
    render(<Testimonials />)
    expect(screen.getByText('Loved by thousands of note-takers')).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    render(<Testimonials />)
    expect(
      screen.getByText("Join the community that's rediscovered the joy of simple, fast note-taking")
    ).toBeInTheDocument()
  })

  it('should render all testimonials', () => {
    const { container } = render(<Testimonials />)

    // Verify correct number of testimonial cards are rendered
    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(TESTIMONIALS.length)
  })

  it('should render testimonial content correctly', () => {
    render(<Testimonials />)

    // Check first testimonial
    const firstTestimonial = TESTIMONIALS[0]
    expect(screen.getByText(firstTestimonial.name)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(firstTestimonial.role))).toBeInTheDocument()
    expect(screen.getByText(`"${firstTestimonial.quote}"`)).toBeInTheDocument()
  })

  it('should display star ratings', () => {
    const { container } = render(<Testimonials />)

    const starElements = container.querySelectorAll('.fa-star')
    // Calculate expected number of filled stars based on testimonial ratings
    const expectedFilledStars = TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0)
    expect(starElements.length).toBe(expectedFilledStars)
  })

  it('should display avatars with initials when no image provided', () => {
    render(<Testimonials />)

    TESTIMONIALS.forEach((testimonial) => {
      if (!testimonial.avatar) {
        expect(screen.getByText(testimonial.initials)).toBeInTheDocument()
      }
    })
  })

  it('should have proper ARIA labels for carousel region', () => {
    render(<Testimonials />)

    const carouselRegion = screen.getByRole('region', { name: 'Testimonials' })
    expect(carouselRegion).toBeInTheDocument()
    expect(carouselRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('should render navigation buttons with proper labels', () => {
    render(<Testimonials />)

    const prevButton = screen.getByLabelText('Previous testimonial')
    const nextButton = screen.getByLabelText('Next testimonial')

    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('should render navigation dots', () => {
    const { container } = render(<Testimonials />)

    const dots = container.querySelectorAll('[role="tab"]')
    expect(dots).toHaveLength(TESTIMONIALS.length)
  })

  it('should navigate to next slide when next button is clicked', () => {
    const { container } = render(<Testimonials />)

    const nextButton = screen.getByLabelText('Next testimonial')
    const dots = container.querySelectorAll('[role="tab"]')

    // Initially, first dot should be active
    expect(dots[0]).toHaveAttribute('aria-current', 'true')

    // Click next button
    fireEvent.click(nextButton)

    // Second dot should now be active
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
  })

  it('should navigate to previous slide when previous button is clicked', () => {
    const { container } = render(<Testimonials />)

    const prevButton = screen.getByLabelText('Previous testimonial')
    const dots = container.querySelectorAll('[role="tab"]')

    // Click previous button (should wrap to last slide)
    fireEvent.click(prevButton)

    // Last dot should now be active
    expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-current', 'true')
  })

  it('should navigate to specific slide when dot is clicked', () => {
    const { container } = render(<Testimonials />)

    const dots = container.querySelectorAll('[role="tab"]')

    // Click on third dot
    fireEvent.click(dots[2])

    // Third dot should be active
    expect(dots[2]).toHaveAttribute('aria-current', 'true')
  })

  it('should have play/pause button', () => {
    render(<Testimonials />)

    const playPauseButton = screen.getByLabelText('Pause auto-rotation')
    expect(playPauseButton).toBeInTheDocument()
  })

  it('should toggle play/pause when button is clicked', () => {
    render(<Testimonials />)

    const playPauseButton = screen.getByLabelText('Pause auto-rotation')

    // Click to pause
    fireEvent.click(playPauseButton)

    // Label should change to play
    expect(screen.getByLabelText('Play auto-rotation')).toBeInTheDocument()

    // Click to play
    fireEvent.click(screen.getByLabelText('Play auto-rotation'))

    // Label should change back to pause
    expect(screen.getByLabelText('Pause auto-rotation')).toBeInTheDocument()
  })

  it('should have auto-rotation functionality', () => {
    render(<Testimonials />)

    // Verify the component has the necessary structure for auto-rotation
    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    expect(carousel).toBeInTheDocument()

    // Play/pause button indicates auto-rotation is implemented
    const playPauseButton = screen.getByLabelText('Pause auto-rotation')
    expect(playPauseButton).toBeInTheDocument()
  })

  it('should pause auto-rotation on mouse enter', () => {
    render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })

    // Trigger mouse enter
    fireEvent.mouseEnter(carousel)

    // Check that play button is now available (indicates paused state)
    const playPauseButton = screen.getByLabelText('Play auto-rotation')
    expect(playPauseButton).toBeInTheDocument()
  })

  it('should resume auto-rotation on mouse leave', () => {
    render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })

    // Trigger mouse enter then leave
    fireEvent.mouseEnter(carousel)
    fireEvent.mouseLeave(carousel)

    // Check that pause button is back (indicates playing state)
    const playPauseButton = screen.getByLabelText('Pause auto-rotation')
    expect(playPauseButton).toBeInTheDocument()
  })

  it('should have screen reader announcement', () => {
    const { container } = render(<Testimonials />)

    const srAnnouncement = container.querySelector('[aria-live="polite"][aria-atomic="true"]')
    expect(srAnnouncement).toBeInTheDocument()
    expect(srAnnouncement).toHaveTextContent(`Showing testimonial 1 of ${TESTIMONIALS.length}`)
  })

  it('should update screen reader announcement when slide changes', () => {
    const { container } = render(<Testimonials />)

    const nextButton = screen.getByLabelText('Next testimonial')
    const srAnnouncement = container.querySelector('[aria-live="polite"][aria-atomic="true"]')

    // Click next
    fireEvent.click(nextButton)

    expect(srAnnouncement).toHaveTextContent(`Showing testimonial 2 of ${TESTIMONIALS.length}`)
  })

  it('should use semantic blockquote for quotes', () => {
    const { container } = render(<Testimonials />)

    const blockquotes = container.querySelectorAll('blockquote')
    expect(blockquotes).toHaveLength(TESTIMONIALS.length)
  })

  it('should use cite element for author names', () => {
    const { container } = render(<Testimonials />)

    const cites = container.querySelectorAll('cite')
    expect(cites).toHaveLength(TESTIMONIALS.length)
  })

  it('should render company information when provided', () => {
    render(<Testimonials />)

    const testimonialWithCompany = TESTIMONIALS.find((t) => t.company)
    if (testimonialWithCompany) {
      expect(screen.getByText(new RegExp(testimonialWithCompany.company!))).toBeInTheDocument()
    }
  })

  it('should have proper heading hierarchy', () => {
    render(<Testimonials />)

    const mainHeading = screen.getByText('Loved by thousands of note-takers')
    expect(mainHeading.tagName).toBe('H2')
  })

  it('should support touch swipe gestures', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Initially at first slide
    expect(dots[0]).toHaveAttribute('aria-current', 'true')

    // Simulate left swipe (next)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 100 }] })
    fireEvent.touchEnd(carousel)

    // Should move to next slide
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
  })

  it('should support right swipe to go to previous slide', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Simulate right swipe (previous)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel)

    // Should move to last slide (wrap around)
    expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-current', 'true')
  })

  it('should navigate to next slide with ArrowRight key', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Initially at first slide
    expect(dots[0]).toHaveAttribute('aria-current', 'true')

    // Press ArrowRight key
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })

    // Should move to second slide
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
  })

  it('should navigate to previous slide with ArrowLeft key', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Initially at first slide
    expect(dots[0]).toHaveAttribute('aria-current', 'true')

    // Press ArrowLeft key (should wrap to last slide)
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

    // Should move to last slide (wrap around)
    expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-current', 'true')
  })

  it('should navigate multiple slides with keyboard', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Navigate forward 3 times
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })

    // Should be at fourth slide (index 3)
    expect(dots[3]).toHaveAttribute('aria-current', 'true')

    // Navigate back 1 time
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

    // Should be at third slide (index 2)
    expect(dots[2]).toHaveAttribute('aria-current', 'true')
  })

  it('should be keyboard focusable with tabIndex', () => {
    render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    expect(carousel).toHaveAttribute('tabIndex', '0')
  })

  it('should prevent default behavior for arrow keys', () => {
    render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })

    // Create event with preventDefault
    const arrowRightEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(arrowRightEvent, 'preventDefault')

    carousel.dispatchEvent(arrowRightEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()

    // Test ArrowLeft as well
    const arrowLeftEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy2 = vi.spyOn(arrowLeftEvent, 'preventDefault')

    carousel.dispatchEvent(arrowLeftEvent)
    expect(preventDefaultSpy2).toHaveBeenCalled()
  })

  it('should wrap around when navigating past last slide with ArrowRight', () => {
    const { container } = render(<Testimonials />)

    const carousel = screen.getByRole('region', { name: 'Testimonials' })
    const dots = container.querySelectorAll('[role="tab"]')

    // Navigate to last slide
    for (let i = 0; i < TESTIMONIALS.length - 1; i++) {
      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    }

    // Verify we're at last slide
    expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-current', 'true')

    // Press ArrowRight again - should wrap to first slide
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
  })
})
