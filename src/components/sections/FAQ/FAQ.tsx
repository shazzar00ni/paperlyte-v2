import { useState, useRef, useEffect, useCallback } from 'react'
import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import { FAQ_ITEMS } from '@constants/faq'
import {
  getFocusableElements,
  handleArrowNavigation,
  handleHomeEndNavigation,
} from '@utils/keyboard'
import styles from './FAQ.module.css'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  delay: number
}

/**
 * Individual FAQ item component with accordion functionality
 * Supports keyboard navigation and animated expand/collapse
 *
 * @param props - FAQ item props
 * @returns An animated accordion item for FAQ
 */
const FAQItemComponent = ({
  question,
  answer,
  isOpen,
  onToggle,
  delay,
}: FAQItemProps): React.ReactElement => {
  const sanitizedQuestion = question
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
  const answerId = `answer-${sanitizedQuestion}`
  const questionId = `question-${sanitizedQuestion}`

  return (
    <AnimatedElement animation="slideUp" delay={delay}>
      <article className={styles.item}>
        <h3>
          <button
            id={questionId}
            type="button"
            className={styles.question}
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={answerId}
          >
            <span className={styles.questionText}>{question}</span>
            <Icon
              name={isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}
              size="sm"
              color="var(--color-primary)"
              ariaLabel={isOpen ? 'Collapse answer' : 'Expand answer'}
            />
          </button>
        </h3>
        <div
          id={answerId}
          role="region"
          aria-labelledby={questionId}
          className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
          aria-hidden={!isOpen}
        >
          <p className={styles.answerText}>{answer}</p>
        </div>
      </article>
    </AnimatedElement>
  )
}

export const FAQ = (): React.ReactElement => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [announcement, setAnnouncement] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  const announcementTimeoutRef = useRef<number | null>(null)

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      const isOpening = !newSet.has(id)

      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }

      // Announce the change for screen readers
      const item = FAQ_ITEMS.find((item) => item.id === id)
      if (item) {
        // Clear any pending timeout to prevent memory leaks
        if (announcementTimeoutRef.current !== null) {
          clearTimeout(announcementTimeoutRef.current)
        }

        setAnnouncement(`${item.question} ${isOpening ? 'expanded' : 'collapsed'}`)
        // Clear announcement after sufficient time for screen readers (3 seconds)
        // This ensures users with slower reading speeds or busy screen readers can hear the announcement
        announcementTimeoutRef.current = window.setTimeout(() => {
          setAnnouncement('')
          announcementTimeoutRef.current = null
        }, 3000)
      }

      return newSet
    })
  }

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current !== null) {
        clearTimeout(announcementTimeoutRef.current)
      }
    }
  }, [])

  // Keyboard navigation handler - memoized to prevent recreating on every render
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const grid = gridRef.current
    if (!grid) return

    // Only handle keyboard navigation when focus is on an FAQ button
    if (!(event.target instanceof HTMLElement && event.target.tagName === 'BUTTON')) {
      return
    }

    const focusableElements = getFocusableElements(grid).filter((el) =>
      el.classList.contains(styles.question)
    )
    if (focusableElements.length === 0) return

    const currentIndex = focusableElements.findIndex((el) => el === document.activeElement)
    if (currentIndex === -1) return

    // Handle Home/End keys
    const homeEndIndex = handleHomeEndNavigation(event, focusableElements)
    if (homeEndIndex !== null) {
      event.preventDefault()
      focusableElements[homeEndIndex]?.focus()
      return
    }

    // Handle Arrow keys (vertical navigation for FAQ)
    const newIndex = handleArrowNavigation(event, focusableElements, currentIndex, 'vertical')
    if (newIndex !== null) {
      event.preventDefault()
      focusableElements[newIndex]?.focus()
    }
  }, [])

  // Set up keyboard navigation event listener
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    grid.addEventListener('keydown', handleKeyDown)

    return () => {
      grid.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <Section id="faq" background="default">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Questions? We've got answers.</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Everything you need to know. Can't find what you're looking for?{' '}
            <a href="#contact" className={styles.link}>
              Contact us
            </a>
            .
          </p>
        </AnimatedElement>
      </div>

      <div className={styles.grid} ref={gridRef}>
        {FAQ_ITEMS.map((item, index) => (
          <FAQItemComponent
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.has(item.id)}
            onToggle={() => toggleItem(item.id)}
            delay={150 + index * 50}
          />
        ))}
      </div>

      <AnimatedElement animation="fadeIn" delay={700}>
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Still have questions? Check out our{' '}
            <a href="#help" className={styles.link}>
              Help Center
            </a>{' '}
            or{' '}
            <a href="#community" className={styles.link}>
              Community Forum
            </a>
            .
          </p>
        </div>
      </AnimatedElement>

      {/* Screen reader announcement for FAQ state changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </Section>
  )
}
