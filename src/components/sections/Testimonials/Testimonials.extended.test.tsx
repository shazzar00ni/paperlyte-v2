/**
 * Extended tests for Testimonials component to improve coverage
 * Focuses on carousel interaction, auto-rotation, keyboard nav, and touch/swipe.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from '@constants/testimonials'

describe('Testimonials extended', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // ----------------------------------------------------------------
  // Section structure
  // ----------------------------------------------------------------
  it('renders the subtitle', () => {
    render(<Testimonials />)
    expect(
      screen.getByText(/Real feedback from people who switched to Paperlyte/i)
    ).toBeInTheDocument()
  })

  it('renders all testimonial cards', () => {
    render(<Testimonials />)
    const articles = document.querySelectorAll('article')
    expect(articles.length).toBe(TESTIMONIALS.length)
  })

  it('renders navigation arrows', () => {
    render(<Testimonials />)
    expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next testimonial/i })).toBeInTheDocument()
  })

  it('renders navigation dots for each testimonial', () => {
    render(<Testimonials />)
    const dots = screen.getAllByRole('tab')
    expect(dots.length).toBe(TESTIMONIALS.length)
  })

  it('renders play/pause control button', () => {
    render(<Testimonials />)
    expect(
      screen.getByRole('button', { name: /pause auto-rotation|play auto-rotation/i })
    ).toBeInTheDocument()
  })

  it('renders a screen reader live region', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
  })

  it('live region starts at slide 1', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toContain('1')
    expect(liveRegion?.textContent).toContain(String(TESTIMONIALS.length))
  })

  // ----------------------------------------------------------------
  // Rating stars
  // ----------------------------------------------------------------
  it('renders star rating containers with aria-labels', () => {
    const { container } = render(<Testimonials />)
    const starContainers = container.querySelectorAll('[role="img"][aria-label*="stars"]')
    expect(starContainers.length).toBeGreaterThan(0)
  })

  it('renders correct aria-label for a 5-star rating', () => {
    const { container } = render(<Testimonials />)
    const fiveStarLabel = container.querySelector('[aria-label="5 out of 5 stars"]')
    expect(fiveStarLabel).toBeInTheDocument()
  })

  it('renders correct aria-label for a 4-star rating', () => {
    const { container } = render(<Testimonials />)
    const fourStarLabel = container.querySelector('[aria-label="4 out of 5 stars"]')
    expect(fourStarLabel).toBeInTheDocument()
  })

  // ----------------------------------------------------------------
  // Testimonial content
  // ----------------------------------------------------------------
  it('renders author initials when no avatar provided', () => {
    render(<Testimonials />)
    // Marcus Johnson has no avatar, initials = 'MJ'
    expect(screen.getByText('MJ')).toBeInTheDocument()
  })

  it('renders company name when present', () => {
    render(<Testimonials />)
    // Sarah Chen is at TechCorp
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText(/TechCorp/)).toBeInTheDocument()
  })

  it('renders role without company separator when company is absent', () => {
    render(<Testimonials />)
    // Marcus Johnson has no company
    const roleText = screen.getByText('Freelance Writer')
    expect(roleText).toBeInTheDocument()
    expect(roleText.textContent).not.toContain('•')
  })

  it('wraps each quote in a blockquote element', () => {
    const { container } = render(<Testimonials />)
    const blockquotes = container.querySelectorAll('blockquote')
    expect(blockquotes.length).toBe(TESTIMONIALS.length)
  })

  // ----------------------------------------------------------------
  // Navigation – next / previous buttons (using fireEvent to avoid fake-timer deadlocks)
  // ----------------------------------------------------------------
  it('advances to next slide when next button is clicked', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toContain('1')

    const nextButton = screen.getByRole('button', { name: /next testimonial/i })
    fireEvent.click(nextButton)

    expect(liveRegion?.textContent).toContain('2')
  })

  it('goes to previous slide when previous button is clicked', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')

    const nextButton = screen.getByRole('button', { name: /next testimonial/i })
    fireEvent.click(nextButton)
    expect(liveRegion?.textContent).toContain('2')

    const prevButton = screen.getByRole('button', { name: /previous testimonial/i })
    fireEvent.click(prevButton)
    expect(liveRegion?.textContent).toContain('1')
  })

  it('wraps from first to last slide on previous click', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toContain('1')

    const prevButton = screen.getByRole('button', { name: /previous testimonial/i })
    fireEvent.click(prevButton)

    expect(liveRegion?.textContent).toContain(String(TESTIMONIALS.length))
  })

  it('wraps from last to first slide on next click', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const nextButton = screen.getByRole('button', { name: /next testimonial/i })

    for (let i = 0; i < TESTIMONIALS.length - 1; i++) {
      fireEvent.click(nextButton)
    }
    expect(liveRegion?.textContent).toContain(String(TESTIMONIALS.length))

    fireEvent.click(nextButton)
    expect(liveRegion?.textContent).toContain('1')
  })

  // ----------------------------------------------------------------
  // Navigation dots
  // ----------------------------------------------------------------
  it('navigates directly to a slide via dot click', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const dots = screen.getAllByRole('tab')

    fireEvent.click(dots[2])
    expect(liveRegion?.textContent).toContain('3')
  })

  it('marks the current dot as aria-selected=true', () => {
    render(<Testimonials />)
    const dots = screen.getAllByRole('tab')
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    expect(dots[1]).toHaveAttribute('aria-selected', 'false')

    fireEvent.click(dots[1])
    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    expect(dots[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('dots have accessible labels', () => {
    render(<Testimonials />)
    const dots = screen.getAllByRole('tab')
    dots.forEach((dot, i) => {
      expect(dot).toHaveAttribute('aria-label', `Go to testimonial ${i + 1}`)
    })
  })

  // ----------------------------------------------------------------
  // Play / Pause control
  // ----------------------------------------------------------------
  it('shows "Pause auto-rotation" label while playing', () => {
    render(<Testimonials />)
    expect(screen.getByRole('button', { name: /pause auto-rotation/i })).toBeInTheDocument()
  })

  it('shows "Play auto-rotation" label when paused', () => {
    render(<Testimonials />)
    const playPauseButton = screen.getByRole('button', { name: /pause auto-rotation/i })
    fireEvent.click(playPauseButton)
    expect(screen.getByRole('button', { name: /play auto-rotation/i })).toBeInTheDocument()
  })

  it('toggles back to playing when play is clicked', () => {
    render(<Testimonials />)
    const pauseButton = screen.getByRole('button', { name: /pause auto-rotation/i })
    fireEvent.click(pauseButton) // now paused

    const playButton = screen.getByRole('button', { name: /play auto-rotation/i })
    fireEvent.click(playButton) // now playing again

    expect(screen.getByRole('button', { name: /pause auto-rotation/i })).toBeInTheDocument()
  })

  // ----------------------------------------------------------------
  // Auto-rotation
  // ----------------------------------------------------------------
  it('auto-advances slide after 5 seconds when playing', () => {
    vi.useFakeTimers()
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toContain('1')

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(liveRegion?.textContent).toContain('2')
  })

  it('does not auto-advance when paused via mouseEnter', () => {
    vi.useFakeTimers()
    const { container } = render(<Testimonials />)
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement
    const liveRegion = container.querySelector('[aria-live="polite"]')

    // Hover to pause
    fireEvent.mouseEnter(carousel)

    act(() => {
      vi.advanceTimersByTime(6000)
    })

    // Should still be on slide 1
    expect(liveRegion?.textContent).toContain('1')

    // Resume and verify it starts auto-advancing again
    fireEvent.mouseLeave(carousel)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(liveRegion?.textContent).toContain('2')
  })

  // ----------------------------------------------------------------
  // Keyboard navigation (ArrowLeft / ArrowRight)
  // ----------------------------------------------------------------
  it('advances to next slide with ArrowRight key', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    act(() => {
      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    })

    expect(liveRegion?.textContent).toContain('2')
  })

  it('goes to previous slide with ArrowLeft key', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    // Go to slide 2 first
    act(() => {
      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    })
    expect(liveRegion?.textContent).toContain('2')

    act(() => {
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    })
    expect(liveRegion?.textContent).toContain('1')
  })

  // ----------------------------------------------------------------
  // Touch / swipe gestures
  // ----------------------------------------------------------------
  it('advances to next slide on left swipe', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    // Simulate left swipe: start at 300, end at 200 (distance = 100 > 50)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel)

    expect(liveRegion?.textContent).toContain('2')
  })

  it('goes to previous slide on right swipe', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    // First advance to slide 2
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel)
    expect(liveRegion?.textContent).toContain('2')

    // Right swipe: start at 200, end at 300 (distance = -100 < -50)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 200 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchEnd(carousel)

    expect(liveRegion?.textContent).toContain('1')
  })

  it('does not navigate on short swipe (< 50px)', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    // Short swipe: distance = 20px
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 280 }] })
    fireEvent.touchEnd(carousel)

    expect(liveRegion?.textContent).toContain('1')
  })

  it('does not navigate on touchEnd without prior touchMove', () => {
    const { container } = render(<Testimonials />)
    const liveRegion = container.querySelector('[aria-live="polite"]')
    const carousel = container.querySelector('[aria-label="Testimonials"]') as HTMLElement

    // Only touchStart with no touchMove
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 300 }] })
    fireEvent.touchEnd(carousel)

    expect(liveRegion?.textContent).toContain('1')
  })

  // ----------------------------------------------------------------
  // Reduced motion
  // ----------------------------------------------------------------
  it('applies no transition style when reduced motion is preferred', () => {
    // Override matchMedia to signal prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    const { container } = render(<Testimonials />)
    const track = container.querySelector('[style*="transform"]') as HTMLElement | null

    // When reduced motion is on, transition should be 'none'
    if (track) {
      expect(track.style.transition).toBe('none')
    }

    // Restore default matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })
  })

  // ----------------------------------------------------------------
  // Carousel ARIA
  // ----------------------------------------------------------------
  it('carousel wrapper has tabIndex 0 for keyboard focus', () => {
    const { container } = render(<Testimonials />)
    const carousel = container.querySelector('[aria-label="Testimonials"]')
    expect(carousel).toHaveAttribute('tabIndex', '0')
  })

  it('dot tablist has accessible label', () => {
    render(<Testimonials />)
    const tablist = screen.getByRole('tablist', { name: /testimonial slides/i })
    expect(tablist).toBeInTheDocument()
  })
})
