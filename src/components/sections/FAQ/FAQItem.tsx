import { memo, useCallback, useMemo } from 'react'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import styles from './FAQ.module.css'

export interface FAQItemProps {
  id: string
  question: string
  answer: string
  isOpen: boolean
  onToggle: (_itemId: string) => void
  delay: number
}

/**
 * Individual FAQ item component with accordion functionality
 * Supports keyboard navigation and animated expand/collapse
 *
 * @param props - FAQ item props
 * @returns An animated accordion item for FAQ
 */
export const FAQItemComponent = memo(
  ({
    id,
    question,
    answer,
    isOpen,
    onToggle,
    delay,
  }: FAQItemProps): React.ReactElement => {
    const sanitizedQuestion = useMemo(
      () =>
        question
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase(),
      [question]
    )
    const answerId = `answer-${sanitizedQuestion}`
    const questionId = `question-${sanitizedQuestion}`

    const handleToggle = useCallback(() => { onToggle(id) }, [id, onToggle])

    return (
      <AnimatedElement animation="slideUp" delay={delay}>
        <article className={styles.item}>
          <h3>
            <button
              id={questionId}
              type="button"
              className={styles.question}
              onClick={handleToggle}
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
)

FAQItemComponent.displayName = 'FAQItemComponent'
