import styles from './EmptyState.module.css'

interface EmptyStateProps {
  onCreateNote: () => void
  hasNotes: boolean
}

export function EmptyState({ onCreateNote, hasNotes }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyInner}>
        <div className={styles.icon} aria-hidden="true">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </div>

        <h2 className={styles.title}>
          {hasNotes ? 'Select a note' : 'Your thoughts, unchained'}
        </h2>
        <p className={styles.description}>
          {hasNotes
            ? 'Pick a note from the sidebar or create a new one.'
            : 'Start writing — fast, focused, and free from distractions.'}
        </p>

        <button className={styles.createBtn} onClick={onCreateNote}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {hasNotes ? 'New note' : 'Start writing'}
        </button>

        <div className={styles.shortcuts}>
          <span className={styles.shortcut}>
            <kbd>Ctrl</kbd>+<kbd>N</kbd> new note
          </span>
          <span className={styles.shortcut}>
            <kbd>Ctrl</kbd>+<kbd>B</kbd> bold
          </span>
          <span className={styles.shortcut}>
            <kbd>Ctrl</kbd>+<kbd>I</kbd> italic
          </span>
        </div>
      </div>
    </div>
  )
}
