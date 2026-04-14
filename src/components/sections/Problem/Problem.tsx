import { Section } from '@components/layout/Section'
import { AnimatedElement } from '@components/ui/AnimatedElement'
import styles from './Problem.module.css'

/** Represents one column in the problem comparison grid */
interface ComparisonItem {
  /** Display name of the competitor app or user persona (e.g. 'Notion', 'You') */
  competitor: string
  /** Short pain-point bullet strings for this competitor/persona */
  issues: string[]
}

const COMPARISON_DATA: ComparisonItem[] = [
  {
    competitor: 'Notion',
    issues: ['3-second lag on startup', "Features you'll never use", 'Database queries for notes'],
  },
  {
    competitor: 'Obsidian',
    issues: ['Complex plugin configuration', 'Markdown learning curve', 'Graph views you ignore'],
  },
  {
    competitor: 'Evernote',
    issues: ['Cluttered interface', 'Sync that breaks', 'Ads in your face'],
  },
  {
    competitor: 'You',
    issues: ['Just want to write', 'Ideas that are vanishing', 'Simplicity that works'],
  },
]

/**
 * Problem section component that frames the pain points of existing note-taking tools.
 *
 * Presents a comparison grid contrasting Notion, Obsidian, Evernote, and the user's
 * current frustrations, followed by an impact statement that quantifies the time lost
 * to poor tooling. Uses staggered `AnimatedElement` entrance animations.
 *
 * @returns A `<Section>` element containing the problem framing content.
 */
export const Problem = (): React.ReactElement => {
  return (
    <Section id="problem" background="surface">
      <div className={styles.container}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Why note-taking apps suck right now</h2>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.description}>
            You just want to capture a thought before it disappears. But instead, you're waiting for
            Notion to load. Navigating through nested folders in Obsidian. Watching Evernote stutter
            as you type.
          </p>
          <p className={styles.descriptionEmphasis}>
            Your tools should be invisible. Instead, they're in your way.
          </p>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={200}>
          <div className={styles.comparisonGrid}>
            {COMPARISON_DATA.map((item) => (
              <div
                key={item.competitor}
                className={`${styles.comparisonCard} ${
                  item.competitor === 'You' ? styles.comparisonCardHighlight : ''
                }`}
              >
                <h3 className={styles.comparisonTitle}>{item.competitor}</h3>
                <ul className={styles.comparisonList}>
                  {item.issues.map((issue, issueIndex) => (
                    <li key={issueIndex} className={styles.comparisonItem}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeIn" delay={300}>
          <div className={styles.impact}>
            <p className={styles.impactStatement}>
              You waste <strong>5 minutes every day</strong> fighting with your note-taking app.
              That's <strong>30 hours a year</strong>—an entire work week—lost to friction that
              shouldn't exist.
            </p>
            <p className={styles.emotionalHook}>You deserve better.</p>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  )
}
