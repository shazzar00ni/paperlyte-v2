import { useState, useEffect, useCallback } from 'react'
import { useNotes } from './hooks/useNotes'
import { EditorHeader } from './components/EditorHeader/EditorHeader'
import { NotesList } from './components/NotesList/NotesList'
import { Editor } from './components/Editor/Editor'
import { EmptyState } from './components/EmptyState/EmptyState'
import './editor-fonts.css'
import styles from './EditorApp.module.css'

export function EditorApp() {
  const {
    notes,
    activeNote,
    activeNoteId,
    isLoading,
    saveStatus,
    createNote,
    updateNote,
    deleteNote,
    setActiveNoteId,
  } = useNotes()

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768
  )

  // Close sidebar on mobile after selecting a note
  const handleSelectNote = useCallback(
    (id: string) => {
      setActiveNoteId(id)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    },
    [setActiveNoteId]
  )

  const handleCreateNote = useCallback(() => {
    createNote()
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [createNote])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        setSidebarOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreateNote])

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingDot} />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <EditorHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onCreateNote={handleCreateNote}
        saveStatus={saveStatus}
        noteCount={notes.length}
      />

      <div className={styles.body}>
        {sidebarOpen && (
          <div className={styles.sidebarContainer}>
            <NotesList
              notes={notes}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onDeleteNote={deleteNote}
              onCreateNote={handleCreateNote}
            />
          </div>
        )}

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className={styles.editorContainer}>
          {activeNote ? (
            <Editor
              note={activeNote}
              saveStatus={saveStatus}
              onContentChange={updateNote}
            />
          ) : (
            <EmptyState
              onCreateNote={handleCreateNote}
              hasNotes={notes.length > 0}
            />
          )}
        </div>
      </div>
    </div>
  )
}
