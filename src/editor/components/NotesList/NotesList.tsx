import { useState, useMemo } from 'react'
import type { Note } from '../../types/note'
import { extractTitle, extractPreview } from '../../types/note'
import styles from './NotesList.module.css'

interface NotesListProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onDeleteNote: (id: string) => void
  onCreateNote: () => void
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function NotesList({
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
}: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        extractTitle(n.content).toLowerCase().includes(q)
    )
  }, [notes, searchQuery])

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (deletingId === id) {
      onDeleteNote(id)
      setDeletingId(null)
    } else {
      setDeletingId(id)
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <button
          className={styles.newNoteBtn}
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
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className={styles.notesList} role="listbox" aria-label="Notes list">
        {filteredNotes.length === 0 && (
          <div className={styles.emptyList}>
            {searchQuery ? 'No matching notes' : 'No notes yet'}
          </div>
        )}

        {filteredNotes.map((note) => {
          const title = extractTitle(note.content)
          const preview = extractPreview(note.content)
          const isActive = note.id === activeNoteId

          return (
            <button
              key={note.id}
              className={`${styles.noteItem} ${isActive ? styles.noteItemActive : ''}`}
              onClick={() => onSelectNote(note.id)}
              role="option"
              aria-selected={isActive}
            >
              <div className={styles.noteContent}>
                <span className={styles.noteTitle}>{title}</span>
                {preview && (
                  <span className={styles.notePreview}>{preview}</span>
                )}
                <span className={styles.noteTime}>
                  {formatRelativeTime(note.updatedAt)}
                </span>
              </div>
              <button
                className={`${styles.deleteBtn} ${deletingId === note.id ? styles.deleteBtnConfirm : ''}`}
                onClick={(e) => handleDelete(e, note.id)}
                aria-label={
                  deletingId === note.id
                    ? 'Confirm delete'
                    : `Delete "${title}"`
                }
                title={
                  deletingId === note.id ? 'Click again to delete' : 'Delete'
                }
              >
                {deletingId === note.id ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            </button>
          )
        })}
      </div>
    </div>
  )
}
