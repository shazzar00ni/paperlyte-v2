import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

// Each test dynamically imports FeedbackWidget after vi.resetModules() so
// legacyFeedbackMigrationRun resets to false between cases.
describe('FeedbackWidget — migrateLegacyFeedback', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('migrates legacy feedback key to versioned key on first mount', async () => {
    const legacy = JSON.stringify([
      { type: 'bug', message: 'test', timestamp: '2026-01-01T00:00:00.000Z' },
    ])
    localStorage.setItem('paperlyte_feedback', legacy)

    const { FeedbackWidget } = await import('./FeedbackWidget')
    render(<FeedbackWidget />)

    await waitFor(() => {
      expect(localStorage.getItem('paperlyte:v1:feedback')).toBe(legacy)
      expect(localStorage.getItem('paperlyte_feedback')).toBeNull()
    })
  })

  it('does not overwrite existing versioned key when both keys coexist', async () => {
    const legacyData = JSON.stringify([{ type: 'bug', message: 'legacy' }])
    const versionedData = JSON.stringify([{ type: 'feature', message: 'versioned' }])
    localStorage.setItem('paperlyte_feedback', legacyData)
    localStorage.setItem('paperlyte:v1:feedback', versionedData)

    const { FeedbackWidget } = await import('./FeedbackWidget')
    render(<FeedbackWidget />)

    await waitFor(() => {
      expect(localStorage.getItem('paperlyte:v1:feedback')).toBe(versionedData)
      expect(localStorage.getItem('paperlyte_feedback')).toBeNull()
    })
  })

  it('does nothing when no legacy key exists', async () => {
    localStorage.setItem(
      'paperlyte:v1:feedback',
      JSON.stringify([{ type: 'bug', message: 'existing' }])
    )

    const { FeedbackWidget } = await import('./FeedbackWidget')
    render(<FeedbackWidget />)

    await waitFor(() => {
      expect(localStorage.getItem('paperlyte_feedback')).toBeNull()
      expect(localStorage.getItem('paperlyte:v1:feedback')).not.toBeNull()
    })
  })

  it('silently handles storage errors during migration without crashing', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('SecurityError: storage is blocked')
    })

    const { FeedbackWidget } = await import('./FeedbackWidget')
    expect(() => render(<FeedbackWidget />)).not.toThrow()
  })
})
