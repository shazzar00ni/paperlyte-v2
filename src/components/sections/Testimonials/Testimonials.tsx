import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './Testimonials.module.css'

interface Testimonial {
  quote: string
  authorName: string
  authorRole: string
}

const FEATURED_TESTIMONIAL: Testimonial = {
  quote:
    "I've tried every note-taking app out there. This is the only one that actually helps me think clearer, not just store information.",
  authorName: 'Sarah Jenkins',
  authorRole: 'Creative Director at Studio M',
}

export const Testimonials = (): React.ReactElement => {
  const { quote, authorName, authorRole } = FEATURED_TESTIMONIAL

  return (
    <Section id="testimonials" background="default">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <div className={styles.content}>
            <div className={styles.quoteIcon} aria-hidden="true">
              "
            </div>
            <blockquote className={styles.quote}>{quote}</blockquote>
            <div className={styles.author}>
              <cite className={styles.authorName}>{authorName}</cite>
              <span className={styles.authorRole}>{authorRole}</span>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
