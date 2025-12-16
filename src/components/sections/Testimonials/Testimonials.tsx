import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './Testimonials.module.css'

interface Testimonial {
  quote: string
  authorName: string
  authorRole: string
}

const PLACEHOLDER_TESTIMONIAL: Testimonial = {
  quote:
    'Finally, a note-taking app that doesn\'t get in my way. Paperlyte is what Notion should have been.',
  authorName: '[Beta User]',
  authorRole: '[Role/Title]',
}

export const Testimonials = (): React.ReactElement => {
  const { quote, authorName, authorRole } = PLACEHOLDER_TESTIMONIAL

  return (
    <Section id="testimonials" background="default">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Built for people who think fast</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
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
        <AnimatedElement animation="fadeIn" delay={200}>
          <p className={styles.note}>
            Real testimonials coming soon from beta users. Want to be featured? Join the waitlist.
          </p>
        </AnimatedElement>
      </div>
    </Section>
  )
}
