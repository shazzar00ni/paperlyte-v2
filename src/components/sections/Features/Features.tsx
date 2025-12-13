import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import { Icon } from '@components/ui/Icon'
import styles from './Features.module.css'

interface Feature {
  id: string
  icon: string
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    id: 'zero-lag',
    icon: 'fa-bolt',
    title: 'Zero-Lag Typing',
    description:
      '8ms keystroke response—25x faster than Notion. No lag, no waiting, just pure speed.',
  },
  {
    id: 'tags',
    icon: 'fa-tags',
    title: 'Tag-Based Organization',
    description:
      'Organize with inline #tags, not rigid folders. Find anything instantly with smart search.',
  },
  {
    id: 'cross-platform',
    icon: 'fa-arrows-rotate',
    title: 'Cross-Platform Sync',
    description:
      'Mac, Windows, Linux, iOS, Android, web. One app, everywhere you work.',
  },
  {
    id: 'distraction-free',
    icon: 'fa-feather-pointed',
    title: 'Distraction-Free Writing',
    description:
      'An interface that disappears when you start typing. Just you and your thoughts.',
  },
  {
    id: 'private',
    icon: 'fa-lock',
    title: 'Private by Design',
    description:
      'Local-first architecture with optional end-to-end encrypted sync. Your data is yours.',
  },
  {
    id: 'offline',
    icon: 'fa-wifi-slash',
    title: 'Offline-First',
    description:
      'Full functionality without internet. Work anywhere, sync when connected.',
  },
]

export const Features = (): React.ReactElement => {
  return (
    <Section id="features" background="default">
      <div className={styles.container}>
        <div className={styles.grid}>
          {FEATURES.map((feature, index) => (
            <AnimatedElement key={feature.id} animation="fadeIn" delay={100 + index * 100}>
              <article className={styles.feature}>
                <div className={styles.iconWrapper}>
                  <Icon name={feature.icon} size="lg" ariaLabel={`${feature.title} icon`} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </article>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </Section>
  )
}
