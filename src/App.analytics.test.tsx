import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: vi.fn(() => <div data-testid="vercel-analytics" />),
}))

import { Analytics } from '@vercel/analytics/react'

describe('App Analytics Conditional Rendering', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    // Define window.location if it's not writable
    // In JSDOM it might be, but let's be safe
    vi.stubGlobal('location', {
      ...originalLocation,
      hostname: 'localhost',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should NOT render Analytics on localhost', () => {
    vi.stubGlobal('location', { ...window.location, hostname: 'localhost' })
    render(<App />)
    expect(Analytics).not.toHaveBeenCalled()
  })

  it('should NOT render Analytics on 127.0.0.1', () => {
    vi.stubGlobal('location', { ...window.location, hostname: '127.0.0.1' })
    render(<App />)
    expect(Analytics).not.toHaveBeenCalled()
  })

  it('should render Analytics on production hostname', () => {
    vi.stubGlobal('location', { ...window.location, hostname: 'paperlyte.app' })
    render(<App />)
    expect(Analytics).toHaveBeenCalled()
  })
})
