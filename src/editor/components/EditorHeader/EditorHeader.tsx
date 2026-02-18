import type { SaveStatus } from '../../hooks/useNotes'
import styles from './EditorHeader.module.css'

interface EditorHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onCreateNote: () => void
  saveStatus: SaveStatus
  noteCount: number
}

export function EditorHeader({
  sidebarOpen,
  onToggleSidebar,
  onCreateNote,
  saveStatus,
  noteCount,
}: EditorHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={`${styles.menuBtn} ${sidebarOpen ? styles.menuBtnActive : ''}`}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={sidebarOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {sidebarOpen ? (
              <>
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <a href="#/" className={styles.logo} aria-label="Back to Paperlyte home">
          <span className={styles.logoText}>Paperlyte</span>
        </a>
      </div>

      <div className={styles.headerCenter}>
        <span className={styles.saveIndicator}>
          {saveStatus === 'saving' && (
            <span className={styles.saveDot} aria-hidden="true" />
          )}
          {saveStatus === 'saving'
            ? 'Saving...'
            : saveStatus === 'saved'
              ? ''
              : ''}
        </span>
      </div>

      <div className={styles.headerRight}>
        <span className={styles.noteCount}>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </span>
        <button
          className={styles.actionBtn}
          onClick={onCreateNote}
          aria-label="Create new note"
          title="New note (Ctrl+N)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </button>
      </div>
    </header>
  )
}
