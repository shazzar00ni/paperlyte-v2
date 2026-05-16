import { Section } from '@components/layout/Section'
import styles from './Changelog.module.css'

interface ReleaseNote {
  version: string
  date: string
  highlights: string[]
}

const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: 'v0.2.0',
    date: 'May 13, 2026',
    highlights: [
      'Added a dedicated changelog page with a permanent route at /changelog.',
      'Updated footer product navigation so users can find release updates.',
      'Laid groundwork for displaying versioned release notes in one place.',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'March 7, 2026',
    highlights: [
      'Launched the Paperlyte landing page with hero, features, FAQ, and waitlist sections.',
      'Published privacy and terms pages for legal transparency.',
      'Shipped baseline analytics and accessibility enhancements.',
    ],
  },
]

/** Changelog page component with versioned release notes. */
export function Changelog(): React.ReactElement {
  return (
    <>
      <Section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Changelog</h1>
          <p className={styles.subtitle}>Product updates, release notes, and what&apos;s new in Paperlyte.</p>
        </div>
      </Section>

      <Section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.timeline}>
            {RELEASE_NOTES.map((release) => (
              <article key={release.version} className={styles.releaseCard}>
                <header className={styles.releaseHeader}>
                  <h2>{release.version}</h2>
                  <time dateTime={new Date(release.date).toISOString().split('T')[0]}>
                    {release.date}
                  </time>
                </header>
                <ul>
                  {release.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
