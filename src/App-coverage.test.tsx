import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

// Mock Analytics component
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}))

describe('App Analytics Coverage', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('should NOT render Analytics in development mode', () => {
    // Stub PROD to false
    vi.stubEnv('PROD', false)
    vi.stubGlobal('location', { hostname: 'paperlyte.com' })

    const { queryByTestId } = render(<App />)
    expect(queryByTestId('vercel-analytics')).not.toBeInTheDocument()
  })

  it('should NOT render Analytics on localhost even in production mode', () => {
    // Stub PROD to true
    vi.stubEnv('PROD', true)
    vi.stubGlobal('location', { hostname: 'localhost' })

    const { queryByTestId } = render(<App />)
    expect(queryByTestId('vercel-analytics')).not.toBeInTheDocument()
  })

  it('should NOT render Analytics on 127.0.0.1 in production mode', () => {
    // Stub PROD to true
    vi.stubEnv('PROD', true)
    vi.stubGlobal('location', { hostname: '127.0.0.1' })

    const { queryByTestId } = render(<App />)
    expect(queryByTestId('vercel-analytics')).not.toBeInTheDocument()
  })

  it('should render Analytics in production mode on a remote host', () => {
    // Stub PROD to true
    vi.stubEnv('PROD', true)
    vi.stubGlobal('location', { hostname: 'paperlyte.com' })

    const { getByTestId } = render(<App />)
    expect(getByTestId('vercel-analytics')).toBeInTheDocument()
  })
})
