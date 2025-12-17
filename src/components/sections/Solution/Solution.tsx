import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Button } from '@components/ui/Button'
import { Icon } from '@components/ui/Icon'
import { scrollToSection } from '@/utils/navigation'
import { WAITLIST_COUNT } from '@constants/waitlist'
import styles from './Solution.module.css'

interface ValueProp {
  icon: string
  emoji: string
  headline: string
  title: string
  body: string[]
  proof: string
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: 'fa-bolt',
    emoji: '⚡',
    headline: 'Zero-Lag Typing',
    title: 'Your thoughts move fast. So should your app.',
    body: [
      'Every keystroke responds instantly. No stuttering. No waiting. No watching the cursor lag behind your brain.',
      'We\'ve optimized Paperlyte to respond in under 10 milliseconds—faster than you can perceive. Paperlyte disappears into the background and lets you think.',
    ],
    proof: 'Sub-10ms keystroke response | Instant load time | Your ideas: Captured',
  },
  {
    icon: 'fa-tags',
    emoji: '🏷️',
    headline: 'Tag-Based Organization',
    title: 'Forget folders. Organize as you write.',
    body: [
      'Rigid folder hierarchies are a relic of the 1990s. Your thoughts don\'t fit in neat boxes, so why should your notes?',
      'Type #project, #urgent, or #ideas anywhere in your note. Paperlyte instantly recognizes it. Search by tag. Filter by multiple tags. Let your organization emerge naturally instead of forcing it upfront.',
    ],
    proof: 'No more "Where did I save that note?" panic. Tags are faster, more flexible, and actually match how your brain works.',
  },
  {
    icon: 'fa-globe',
    emoji: '📱',
    headline: 'Works Everywhere, Always',
    title: 'Plane mode? No problem.',
    body: [
      'Real-time sync across every device—Mac, Windows, Linux, iOS, Android, and web. But unlike cloud-dependent apps, Paperlyte works offline-first.',
      'On a plane? Underground subway? Spotty café WiFi? Keep writing. Everything syncs automatically when you\'re back online.',
    ],
    proof: 'Responsive web app (works on all devices). Native iOS & Android apps coming Q2 2026.',
  },
]

export const Solution = (): React.ReactElement => {
  return (
    <Section id="solution" background="default">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.sectionTitle}>Three promises. Zero compromises.</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.sectionSubtitle}>
            Paperlyte is built on three core principles that make note-taking feel effortless again.
          </p>
        </AnimatedElement>

        <div className={styles.valueProps}>
          {VALUE_PROPS.map((prop, index) => (
            <AnimatedElement key={prop.headline} animation="slideUp" delay={200 + index * 100}>
              <article className={styles.valueProp}>
                <div className={styles.valueHeader}>
                  <div className={styles.iconContainer}>
                    <Icon name={prop.icon} size="lg" color="var(--color-primary)" />
                  </div>
                  <h3 className={styles.valueHeadline}>
                    <span className={styles.emoji} aria-hidden="true">
                      {prop.emoji}
                    </span>{' '}
                    {prop.headline}
                  </h3>
                </div>

                <h4 className={styles.valueTitle}>{prop.title}</h4>

                <div className={styles.valueBody}>
                  {prop.body.map((paragraph, pIndex) => (
                    <p key={pIndex} className={styles.valueParagraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className={styles.valueProof}>
                  <Icon name="fa-check-circle" size="sm" color="var(--color-primary)" />
                  <span>{prop.proof}</span>
                </div>
              </article>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement animation="fadeIn" delay={600}>
          <div className={styles.cta}>
            <Button
              variant="primary"
              size="large"
              icon="fa-arrow-right"
              onClick={() => scrollToSection('email-capture')}
            >
              Join the Waitlist
            </Button>
            <p className={styles.ctaMicrocopy}>
              {WAITLIST_COUNT} people already ahead of you. Don't miss early access.
            </p>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
