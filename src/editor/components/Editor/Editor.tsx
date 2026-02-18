import { useCallback, useEffect, useRef } from 'react'
import type { Note } from '../../types/note'
import type { SaveStatus } from '../../hooks/useNotes'
import styles from './Editor.module.css'

interface EditorProps {
  note: Note
  saveStatus: SaveStatus
  onContentChange: (id: string, content: string) => void
}

export function Editor({ note, saveStatus, onContentChange }: EditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const prevNoteIdRef = useRef<string | null>(null)

  // Derive title and body from content
  const lines = note.content.split('\n')
  const title = lines[0] ?? ''
  const body = lines.slice(1).join('\n')

  // Auto-resize textareas
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoResize(titleRef.current)
    autoResize(bodyRef.current)
  }, [note.content, autoResize])

  // Focus title when switching to a new empty note
  useEffect(() => {
    if (note.id !== prevNoteIdRef.current) {
      prevNoteIdRef.current = note.id
      if (!note.content) {
        titleRef.current?.focus()
      }
    }
  }, [note.id, note.content])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newTitle = e.target.value.replace(/\n/g, '') // No newlines in title
      const newContent = newTitle + '\n' + body
      onContentChange(note.id, newContent)
      autoResize(e.target)
    },
    [note.id, body, onContentChange, autoResize]
  )

  const handleBodyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = title + '\n' + e.target.value
      onContentChange(note.id, newContent)
      autoResize(e.target)
    },
    [note.id, title, onContentChange, autoResize]
  )

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        bodyRef.current?.focus()
      }
    },
    []
  )

  // Markdown keyboard shortcuts in body
  const handleBodyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget
      const { selectionStart, selectionEnd } = el

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        let wrapper = ''
        if (e.key === 'b') {
          wrapper = '**'
        } else if (e.key === 'i') {
          wrapper = '_'
        }

        if (wrapper) {
          e.preventDefault()
          const selected = el.value.substring(selectionStart, selectionEnd)
          const before = el.value.substring(0, selectionStart)
          const after = el.value.substring(selectionEnd)
          const wrapped = `${wrapper}${selected}${wrapper}`
          const newValue = before + wrapped + after
          const newContent = title + '\n' + newValue
          onContentChange(note.id, newContent)

          // Restore cursor position
          requestAnimationFrame(() => {
            if (selected) {
              el.setSelectionRange(
                selectionStart,
                selectionEnd + wrapper.length * 2
              )
            } else {
              const cursorPos = selectionStart + wrapper.length
              el.setSelectionRange(cursorPos, cursorPos)
            }
          })
        }
      }

      // Tab to indent
      if (e.key === 'Tab') {
        e.preventDefault()
        const before = el.value.substring(0, selectionStart)
        const after = el.value.substring(selectionEnd)
        const indent = e.shiftKey ? '' : '  '

        if (e.shiftKey) {
          // Remove indent
          const lineStart = before.lastIndexOf('\n') + 1
          const line = el.value.substring(lineStart, selectionStart)
          if (line.startsWith('  ')) {
            const newValue =
              el.value.substring(0, lineStart) +
              line.substring(2) +
              el.value.substring(selectionStart)
            const newContent = title + '\n' + newValue
            onContentChange(note.id, newContent)
            requestAnimationFrame(() => {
              el.setSelectionRange(selectionStart - 2, selectionStart - 2)
            })
          }
        } else {
          const newValue = before + indent + after
          const newContent = title + '\n' + newValue
          onContentChange(note.id, newContent)
          requestAnimationFrame(() => {
            el.setSelectionRange(
              selectionStart + indent.length,
              selectionStart + indent.length
            )
          })
        }
      }
    },
    [note.id, title, onContentChange]
  )

  const statusText =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : ''

  return (
    <div className={styles.editor}>
      <div className={styles.editorInner}>
        <textarea
          ref={titleRef}
          className={styles.titleInput}
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          rows={1}
          aria-label="Note title"
        />
        <textarea
          ref={bodyRef}
          className={styles.bodyInput}
          value={body}
          onChange={handleBodyChange}
          onKeyDown={handleBodyKeyDown}
          placeholder="Start writing..."
          aria-label="Note content"
        />
      </div>
      <div className={styles.statusBar} aria-live="polite">
        <span className={styles.statusText}>{statusText}</span>
        <span className={styles.wordCount}>
          {note.content.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  )
}
