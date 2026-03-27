import { Button } from '@components/ui/Button'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Section } from '@components/layout/Section'
import { scrollToSection } from '@/utils/navigation'
import styles from './Hero.module.css'

/**
 * Hero section component - the main landing section of the application
 * Features animated headline, subheadline, CTA buttons, and trusted by logos
 * Uses AnimatedElement for staggered entrance animations
 *
 * @returns A hero section with animated content and call-to-action buttons
 *
 * @example
 * ```tsx
 * <Hero />
 * ```
 */
export const Hero = (): React.ReactElement => {
  return (
    <Section id="hero" className={styles.hero} padding="large">
      <div className={styles.content}>
        <AnimatedElement animation="fadeIn">
          <h1 className={styles.headline}>
            Your thoughts, <em>organized.</em>
          </h1>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subheadline}>The minimal workspace for busy professionals.</p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.ctas}>
            <Button
              variant="primary"
              size="large"
              icon="fa-arrow-right"
              iconAriaLabel="Arrow icon"
              onClick={() => scrollToSection('download')}
            >
              Start Writing for Free
            </Button>
            <Button variant="secondary" size="large" onClick={() => scrollToSection('features')}>
              View the Demo
            </Button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={450}>
          <div className={styles.trustedBy}>
            <p className={styles.trustedByLabel}>TRUSTED BY TEAMS AT</p>
            <ul className={styles.companies}>
              <li className={styles.company}>Acme Corp</li>
              <li className={styles.company}>Global</li>
              <li className={styles.company}>Nebula</li>
              <li className={styles.company}>Vertex</li>
              <li className={styles.company}>Horizon</li>
            </ul>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement animation="fadeIn" delay={400}>
        <div className={styles.mockupContainer} aria-hidden="true">
          {/* Productivity stat badge */}
          <div className={styles.statBadge}>
            <span className={styles.statValue}>+120%</span>
            <span className={styles.statLabel}>PRODUCTIVITY</span>
          </div>

          {/* Primary mockup - Notes list view */}
          <div className={styles.mockupPrimary}>
            <picture>
              <source
                srcSet="/mockups/notes-list-400w.avif 400w, /mockups/notes-list-800w.avif 800w, /mockups/notes-list.avif 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/avif"
              />
              <source
                srcSet="/mockups/notes-list-400w.webp 400w, /mockups/notes-list-800w.webp 800w, /mockups/notes-list.webp 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/webp"
              />
              <source
                srcSet="/mockups/notes-list-400w.png 400w, /mockups/notes-list-800w.png 800w, /mockups/notes-list.png 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/png"
              />
              <img
                src="/mockups/notes-list.avif"
                alt="Paperlyte notes list showing Today's Notes with three items: Project Ideas for brainstorming, Meeting Notes with key takeaways, and Quick Thoughts being written"
                width={1100}
                height={800}
                loading="eager"
                decoding="async"
                className={styles.mockupImage}
              />
            </picture>
          </div>

          {/* Secondary mockup - Note detail view (floating) */}
          <div className={styles.mockupSecondary}>
            <picture>
              <source
                srcSet="/mockups/note-detail-400w.avif 400w, /mockups/note-detail-800w.avif 800w, /mockups/note-detail.avif 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/avif"
              />
              <source
                srcSet="/mockups/note-detail-400w.webp 400w, /mockups/note-detail-800w.webp 800w, /mockups/note-detail.webp 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/webp"
              />
              <source
                srcSet="/mockups/note-detail-400w.png 400w, /mockups/note-detail-800w.png 800w, /mockups/note-detail.png 1200w"
                sizes="(max-width: 480px) 400px, (max-width: 960px) 800px, 1200px"
                type="image/png"
              />
              <img
                src="/mockups/note-detail.avif"
                alt="Paperlyte note editor with bullet points including quick project ideas, meeting reminders, and presentation notes"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className={styles.mockupImage}
              />
            </picture>
          </div>
        </div>
      </AnimatedElement>
    </Section>
  )
}
