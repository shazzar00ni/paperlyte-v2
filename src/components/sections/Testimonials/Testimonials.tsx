import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './Testimonials.module.css'

export const Testimonials = (): React.ReactElement => {
  return (
    <Section id="testimonials" background="default">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <div className={styles.content}>
            <div className={styles.quoteIcon} aria-hidden="true">
              "
            </div>
            <blockquote className={styles.quote}>
              I've tried every note-taking app out there. This is the only one that actually helps me
              think clearer, not just store information.
            </blockquote>
            <div className={styles.author}>
              <cite className={styles.authorName}>Sarah Jenkins</cite>
              <span className={styles.authorRole}>Creative Director at Studio M</span>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
