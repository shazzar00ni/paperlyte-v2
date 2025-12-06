import { useState, useEffect, useRef, useCallback } from 'react'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { TESTIMONIALS } from '@constants/testimonials'
import type { Testimonial } from '@constants/testimonials'
import styles from './Testimonials.module.css'

/**
 * Testimonials section with accessible carousel slider
 *
 * Features:
 * - Auto-rotation with pause-on-hover
 * - Keyboard navigation (Arrow keys, Tab)
 * - Touch/swipe gestures
 * - Navigation dots and arrows
 * - Responsive layout (1 on mobile, 2-3 on desktop)
 * - Screen reader accessible with ARIA labels
 * - Respects prefers-reduced-motion
 */
export const Testimonials = (): React.ReactElement => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Auto-rotation interval (5 seconds)
  const AUTO_ROTATE_INTERVAL = 5000
  // Minimum swipe distance (in px) to trigger slide change
  const MIN_SWIPE_DISTANCE = 50

  // Calculate how many testimonials to show per view based on screen size
  // This will be handled via CSS, but we track it for navigation
  const totalSlides = TESTIMONIALS.length

  /**
   * Navigate to next slide
   */
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides)
  }, [totalSlides])

  /**
   * Navigate to previous slide
   */
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  /**
   * Navigate to specific slide
   */
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
    },
    [goToNext, goToPrevious]
  )

  /**
   * Handle touch start
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  /**
   * Handle touch move
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  /**
   * Handle touch end - detect swipe direction
   */
  const handleTouchEnd = () => {
    const start = touchStart
    const end = touchEnd
    
    // Reset touch state first
    setTouchStart(0)
    setTouchEnd(0)
    
    if (!start || !end) return

    const distance = start - end
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  /**
   * Auto-rotation effect
   */
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return

    const interval = setInterval(() => {
      goToNext()
    }, AUTO_ROTATE_INTERVAL)

    return () => clearInterval(interval)
  }, [isPlaying, goToNext, prefersReducedMotion])

  /**
   * Keyboard navigation effect
   */
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.addEventListener('keydown', handleKeyDown as EventListener)
    return () => {
      carousel.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [handleKeyDown])

  /**
   * Render star rating
   */
  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars} role="img" aria-label={`${rating} out of 5 stars`}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name={index < rating ? 'fa-star' : 'fa-star-o'}
            size="sm"
            color={index < rating ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
          />
        ))}
      </div>
    )
  }

  /**
   * Render testimonial card
   */
  const renderTestimonial = (testimonial: Testimonial) => {
    return (
      <article key={testimonial.id} className={styles.card}>
        {renderStars(testimonial.rating)}
        <blockquote className={styles.quote}>"{testimonial.quote}"</blockquote>
        <div className={styles.author}>
          <div className={styles.avatar} aria-hidden="true">
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt=""
                loading="lazy"
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.initials}>{testimonial.initials}</span>
            )}
          </div>
          <div className={styles.authorInfo}>
            <cite className={styles.name}>{testimonial.name}</cite>
            <p className={styles.role}>
              {testimonial.role}
              {testimonial.company && ` • ${testimonial.company}`}
            </p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <Section id="testimonials" background="surface">
      <AnimatedElement animation="fadeIn">
        <div className={styles.header}>
          <h2 className={styles.title}>Loved by thousands of note-takers</h2>
          <p className={styles.subtitle}>
            Join the community that's rediscovered the joy of simple, fast note-taking
          </p>
        </div>
      </AnimatedElement>

      <section
        ref={carouselRef}
        className={styles.carouselWrapper}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Testimonials"
        tabIndex={0}
      >
        <AnimatedElement animation="slideUp" delay={100}>
          <div className={styles.carousel}>
            <div
              className={styles.track}
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {TESTIMONIALS.map((testimonial) => renderTestimonial(testimonial))}
            </div>
          </div>
        </AnimatedElement>

        {/* Navigation Arrows */}
        <button
          className={`${styles.navButton} ${styles.navPrev}`}
          onClick={goToPrevious}
          aria-label="Previous testimonial"
          type="button"
        >
          <Icon name="fa-chevron-left" size="lg" />
        </button>
        <button
          className={`${styles.navButton} ${styles.navNext}`}
          onClick={goToNext}
          aria-label="Next testimonial"
          type="button"
        >
          <Icon name="fa-chevron-right" size="lg" />
        </button>

        {/* Navigation Dots */}
        <div className={styles.dots} role="tablist" aria-label="Testimonial slides">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              role="tab"
              type="button"
            />
          ))}
        </div>

        {/* Play/Pause Control (for accessibility) */}
        <button
          className={styles.playPauseButton}
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
          type="button"
        >
          <Icon
            name={isPlaying ? 'fa-pause' : 'fa-play'}
            size="sm"
          />
        </button>
      </div>

      {/* Screen reader announcement */}
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        Showing testimonial {currentIndex + 1} of {totalSlides}
      </div>
    </Section>
  )
}
