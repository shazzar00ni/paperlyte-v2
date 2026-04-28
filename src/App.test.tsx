import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should render with proper semantic structure and section order', () => {
    const { container } = render(<App />)

    // Verify semantic landmark regions
    const header = container.querySelector('header')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')

    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main')
    expect(footer).toBeInTheDocument()
  })

  it('should have accessible landmark regions with proper roles', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render FeedbackWidget component', () => {
    render(<App />)
    const feedbackButton = screen.getByLabelText(/open feedback form/i)
    expect(feedbackButton).toBeInTheDocument()
  })
})

describe('App Analytics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should render Analytics component only in production and not on localhost', () => {
    // Mock window.location.hostname
    vi.stubGlobal('location', {
      ...window.location,
      hostname: 'paperlyte.app',
    })

    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
