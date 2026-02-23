import { useState, useEffect, useCallback, useRef } from 'react'
import type { Note } from '../types/note'
import { createEmptyNote } from '../types/note'
import { getAllNotes, saveNote, deleteNoteFromDB } from '../store/noteStore'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

const AUTOSAVE_DELAY = 500

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load all notes on mount
  useEffect(() => {
    let cancelled = false
    getAllNotes()
      .then((loaded) => {
        if (cancelled) return
        setNotes(loaded)
        // Auto-select the most recent note
        if (loaded.length > 0) {
          setActiveNoteId(loaded[0].id)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null

  const createNote = useCallback(() => {
    const note = createEmptyNote()
    setNotes((prev) => [note, ...prev])
    setActiveNoteId(note.id)
    saveNote(note)
    return note
  }, [])

  const updateNote = useCallback(
    (id: string, content: string) => {
      const now = Date.now()
      setSaveStatus('unsaved')

      setNotes((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, content, updatedAt: now } : n))
          .sort((a, b) => b.updatedAt - a.updatedAt)
      )

      // Debounced save to IndexedDB
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('saving')
        const noteToSave = { id, content, updatedAt: now, createdAt: 0 }
        // Find the actual createdAt from current state
        setNotes((prev) => {
          const existing = prev.find((n) => n.id === id)
          if (existing) {
            noteToSave.createdAt = existing.createdAt
          }
          return prev
        })

        saveNote(noteToSave).then(() => {
          setSaveStatus('saved')
        })
      }, AUTOSAVE_DELAY)
    },
    []
  )

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (activeNoteId === id) {
        setNotes((prev) => {
          setActiveNoteId(prev.length > 0 ? prev[0].id : null)
          return prev
        })
      }
      deleteNoteFromDB(id)
    },
    [activeNoteId]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return {
    notes,
    activeNote,
    activeNoteId,
    isLoading,
    saveStatus,
    createNote,
    updateNote,
    deleteNote,
    setActiveNoteId,
  }
}
