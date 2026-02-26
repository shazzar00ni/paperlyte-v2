import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Testimonials } from './Testimonials'
import { TESTIMONIALS } from '@constants/testimonials'

// Mock useReducedMotion to control auto-rotation behavior
vi.mock('@hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

import { useReducedMotion } from '@hooks/useReducedMotion'

describe('Testimonials Interaction Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('carousel navigation', () => {
    it('navigates to next testimonial on next button click', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      render(<Testimonials />)

      const nextButton = screen.getByRole('button', { name: /Next testimonial/i })
      await user.click(nextButton)

      // After clicking next, the second dot should be active
      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('navigates to previous testimonial on previous button click', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      render(<Testimonials />)

      const prevButton = screen.getByRole('button', { name: /Previous testimonial/i })
      await user.click(prevButton)

      // Should wrap to the last testimonial
      const dots = screen.getAllByRole('tab')
      expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-selected', 'true')
    })

    it('wraps from last to first testimonial', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      render(<Testimonials />)

      const nextButton = screen.getByRole('button', { name: /Next testimonial/i })

      // Click next for each testimonial to reach the end
      for (let i = 0; i < TESTIMONIALS.length; i++) {
        await user.click(nextButton)
      }

      // Should wrap back to first
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('navigates to specific slide when dot is clicked', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      render(<Testimonials />)

      const dots = screen.getAllByRole('tab')
      await user.click(dots[3])

      expect(dots[3]).toHaveAttribute('aria-selected', 'true')
    })

    it('renders all navigation dots matching testimonial count', () => {
      render(<Testimonials />)

      const dots = screen.getAllByRole('tab')
      expect(dots).toHaveLength(TESTIMONIALS.length)
    })

    it('renders screen reader live region with current testimonial index', () => {
      render(<Testimonials />)

      expect(
        screen.getByText(`Showing testimonial 1 of ${TESTIMONIALS.length}`)
      ).toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('navigates to next slide with ArrowRight key', () => {
      const { container } = render(<Testimonials />)

      const carousel = container.querySelector('[aria-label="Testimonials"]')!
      // Use fireEvent to properly trigger React's synthetic event system
      fireEvent.keyDown(carousel, { key: 'ArrowRight' })

      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('navigates to previous slide with ArrowLeft key', () => {
      const { container } = render(<Testimonials />)

      const carousel = container.querySelector('[aria-label="Testimonials"]')!
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

      // Should wrap to last
      const dots = screen.getAllByRole('tab')
      expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-selected', 'true')
    })

    it('carousel region is focusable via tabindex', () => {
      const { container } = render(<Testimonials />)

      const carousel = container.querySelector('[aria-label="Testimonials"]')
      expect(carousel).toHaveAttribute('tabindex', '0')
    })
  })

  describe('auto-rotation', () => {
    it('auto-advances to next slide after 5 seconds', () => {
      render(<Testimonials />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('auto-advances through multiple slides', () => {
      render(<Testimonials />)

      // Advance through 3 intervals
      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const dots = screen.getAllByRole('tab')
      expect(dots[3]).toHaveAttribute('aria-selected', 'true')
    })

    it('pauses auto-rotation on mouse enter', () => {
      const { container } = render(<Testimonials />)
      const carouselWrapper = container.querySelector('[aria-label="Testimonials"]')!

      // Use fireEvent for React synthetic mouse events
      fireEvent.mouseEnter(carouselWrapper)

      // Advance time - should NOT change slides because hover paused it
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('resumes auto-rotation on mouse leave', () => {
      const { container } = render(<Testimonials />)
      const carouselWrapper = container.querySelector('[aria-label="Testimonials"]')!

      // Pause on hover
      fireEvent.mouseEnter(carouselWrapper)

      // Resume on mouse leave
      fireEvent.mouseLeave(carouselWrapper)

      // Now advance time - should rotate
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('toggles auto-rotation with play/pause button', () => {
      render(<Testimonials />)

      // Find and click the pause button using fireEvent (compatible with fake timers)
      const pauseButton = screen.getByRole('button', { name: /Pause auto-rotation/i })
      fireEvent.click(pauseButton)

      // Now it should show play button
      expect(screen.getByRole('button', { name: /Play auto-rotation/i })).toBeInTheDocument()
    })

    it('does not auto-rotate when prefers-reduced-motion is active', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)

      render(<Testimonials />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      // Should still be on the first slide
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('touch gestures', () => {
    it('swipes left to go to next slide', () => {
      const { container } = render(<Testimonials />)
      const carouselWrapper = container.querySelector('[aria-label="Testimonials"]')!

      // Use fireEvent which properly creates React synthetic events with targetTouches
      fireEvent.touchStart(carouselWrapper, {
        targetTouches: [{ clientX: 300, clientY: 200 }],
      })

      fireEvent.touchMove(carouselWrapper, {
        targetTouches: [{ clientX: 100, clientY: 200 }],
      })

      fireEvent.touchEnd(carouselWrapper)

      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('swipes right to go to previous slide', () => {
      const { container } = render(<Testimonials />)
      const carouselWrapper = container.querySelector('[aria-label="Testimonials"]')!

      fireEvent.touchStart(carouselWrapper, {
        targetTouches: [{ clientX: 100, clientY: 200 }],
      })

      fireEvent.touchMove(carouselWrapper, {
        targetTouches: [{ clientX: 300, clientY: 200 }],
      })

      fireEvent.touchEnd(carouselWrapper)

      // Should wrap to last slide
      const dots = screen.getAllByRole('tab')
      expect(dots[TESTIMONIALS.length - 1]).toHaveAttribute('aria-selected', 'true')
    })

    it('ignores short swipes below minimum distance', () => {
      const { container } = render(<Testimonials />)
      const carouselWrapper = container.querySelector('[aria-label="Testimonials"]')!

      // Swipe only 30px (below MIN_SWIPE_DISTANCE of 50px)
      fireEvent.touchStart(carouselWrapper, {
        targetTouches: [{ clientX: 200, clientY: 200 }],
      })

      fireEvent.touchMove(carouselWrapper, {
        targetTouches: [{ clientX: 170, clientY: 200 }],
      })

      fireEvent.touchEnd(carouselWrapper)

      // Should still be on first slide
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('testimonial content', () => {
    it('renders all testimonials in the carousel track', () => {
      const { container } = render(<Testimonials />)

      const articles = container.querySelectorAll('article')
      expect(articles).toHaveLength(TESTIMONIALS.length)
    })

    it('renders star ratings for each testimonial', () => {
      render(<Testimonials />)

      const starRatings = screen.getAllByRole('img', { name: /out of 5 stars/i })
      expect(starRatings).toHaveLength(TESTIMONIALS.length)
    })

    it('renders author names using cite element', () => {
      const { container } = render(<Testimonials />)

      const cites = container.querySelectorAll('cite')
      expect(cites).toHaveLength(TESTIMONIALS.length)
      expect(cites[0]?.textContent).toBe(TESTIMONIALS[0].name)
    })

    it('renders company info when available', () => {
      render(<Testimonials />)

      // Sarah Chen has company TechCorp
      expect(screen.getByText(/TechCorp/)).toBeInTheDocument()
    })

    it('renders initials when avatar is not provided', () => {
      render(<Testimonials />)

      // All testimonials use initials (no avatars)
      expect(screen.getByText('SC')).toBeInTheDocument() // Sarah Chen
      expect(screen.getByText('MJ')).toBeInTheDocument() // Marcus Johnson
    })
  })
})
