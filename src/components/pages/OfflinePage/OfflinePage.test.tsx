import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OfflinePage } from './OfflinePage'

describe('OfflinePage', () => {
  let onLineSpy: ReturnType<typeof vi.spyOn>
  const originalFetch = global.fetch
  const originalLocation = window.location

  beforeEach(() => {
    // Reset online status before each test
    onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
  })

  afterEach(() => {
    // Restore all mocks and globals
    vi.restoreAllMocks()
    vi.useRealTimers() // Ensure fake timers are always cleaned up
    global.fetch = originalFetch
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    })
  })

  describe('Rendering', () => {
    it('should render the offline page', () => {
      render(<OfflinePage />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/You're offline/i)).toBeInTheDocument()
    })

    it('should display default offline message', () => {
      render(<OfflinePage />)

      expect(
        screen.getByText(/It looks like you've lost your internet connection/i)
      ).toBeInTheDocument()
    })

    it('should display custom message when provided', () => {
      const customMessage = 'Custom offline message'
      render(<OfflinePage message={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('should show offline status indicator', () => {
      render(<OfflinePage />)

      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('should show online status when connection is restored', () => {
      onLineSpy.mockReturnValue(true)

      render(<OfflinePage />)

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  describe('Connection Status', () => {
    it('should detect when user comes online', async () => {
      render(<OfflinePage />)

      expect(screen.getByText('Disconnected')).toBeInTheDocument()

      // Simulate going online
      onLineSpy.mockReturnValue(true)
      window.dispatchEvent(new Event('online'))

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })
    })

    it('should detect when user goes offline', async () => {
      onLineSpy.mockReturnValue(true)
      render(<OfflinePage />)

      expect(screen.getByText('Connected')).toBeInTheDocument()

      // Simulate going offline
      onLineSpy.mockReturnValue(false)
      window.dispatchEvent(new Event('offline'))

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })
    })

    it('should call onConnectionRestored when connection is restored', async () => {
      const onConnectionRestored = vi.fn()
      render(<OfflinePage onConnectionRestored={onConnectionRestored} />)

      // Simulate going online
      onLineSpy.mockReturnValue(true)
      window.dispatchEvent(new Event('online'))

      await waitFor(() => {
        expect(onConnectionRestored).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render "Try Again" button', () => {
      render(<OfflinePage />)

      expect(
        screen.getByRole('button', { name: /check connection and retry/i })
      ).toBeInTheDocument()
    })

    it('should show checking state when retry is clicked', async () => {
      const user = userEvent.setup()

      // Use a pending promise to check loading state
      let resolveFetch: () => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(new Response())
      })
      global.fetch = vi.fn(() => fetchPromise)

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      const clickPromise = user.click(retryButton)

      // Check the loading state is active (without awaiting click to complete)
      await waitFor(() => {
        expect(screen.getByText('Checking...')).toBeInTheDocument()
        expect(retryButton).toBeDisabled()
      })

      // Clean up: resolve the fetch to allow the click handler to complete
      resolveFetch!()
      await clickPromise
    })

    it('should attempt to reload page when connection check succeeds', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.fn()

      global.fetch = vi.fn(() => Promise.resolve(new Response()))
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { reload: reloadSpy },
      })

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(reloadSpy).toHaveBeenCalledTimes(1)
      })
    })

    it('should not reload when fetch fails', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.fn()

      // Mock fetch to reject (network error)
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { reload: reloadSpy },
      })

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      await user.click(retryButton)

      // Wait for button to be re-enabled after error
      await waitFor(() => {
        expect(retryButton).not.toBeDisabled()
      })

      // Reload should not have been called
      expect(reloadSpy).not.toHaveBeenCalled()
    })

    it('should not reload when fetch is aborted', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.fn()

      // Mock fetch to reject with abort error
      global.fetch = vi.fn(() => Promise.reject(new DOMException('Aborted', 'AbortError')))

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { reload: reloadSpy },
      })

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      await user.click(retryButton)

      // Wait for button to be re-enabled after abort
      await waitFor(() => {
        expect(retryButton).not.toBeDisabled()
      })

      // Reload should not have been called
      expect(reloadSpy).not.toHaveBeenCalled()
    })

    it('should show reload button when online', () => {
      onLineSpy.mockReturnValue(true)

      render(<OfflinePage />)

      expect(screen.getByRole('button', { name: /reload the page/i })).toBeInTheDocument()
    })

    it('should not show reload button when offline', () => {
      render(<OfflinePage />)

      expect(screen.queryByRole('button', { name: /reload the page/i })).not.toBeInTheDocument()
    })
  })

  describe('Offline Features', () => {
    it('should show cached info section by default', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/What you can still do:/i)).toBeInTheDocument()
    })

    it('should hide cached info when showCachedInfo is false', () => {
      render(<OfflinePage showCachedInfo={false} />)

      expect(screen.queryByText(/What you can still do:/i)).not.toBeInTheDocument()
    })

    it('should not show offline features when online', () => {
      onLineSpy.mockReturnValue(true)

      render(<OfflinePage />)

      expect(screen.queryByText(/What you can still do:/i)).not.toBeInTheDocument()
    })

    it('should list available offline features', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Create and edit notes/i)).toBeInTheDocument()
      expect(screen.getByText(/View all your previously loaded content/i)).toBeInTheDocument()
      expect(screen.getByText(/Search through your existing notes/i)).toBeInTheDocument()
    })
  })

  describe('Connection Tips', () => {
    it('should show connection tips when offline', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Connection troubleshooting:/i)).toBeInTheDocument()
    })

    it('should not show connection tips when online', () => {
      onLineSpy.mockReturnValue(true)

      render(<OfflinePage />)

      expect(screen.queryByText(/Connection troubleshooting:/i)).not.toBeInTheDocument()
    })

    it('should display WiFi troubleshooting tip', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Check your WiFi or mobile data is enabled/i)).toBeInTheDocument()
    })

    it('should display airplane mode tip', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Make sure airplane mode is turned off/i)).toBeInTheDocument()
    })

    it('should display router proximity tip', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Try moving closer to your router/i)).toBeInTheDocument()
    })

    it('should display device restart tip', () => {
      render(<OfflinePage />)

      expect(screen.getByText(/Restart your device if the issue persists/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="status" with proper labeling', () => {
      render(<OfflinePage />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-labelledby', 'offline-title')
    })

    it('should have accessible heading', () => {
      render(<OfflinePage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAttribute('id', 'offline-title')
    })

    it('should have aria-hidden on decorative illustration', () => {
      render(<OfflinePage />)

      const illustration = screen.getByRole('status').querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
    })

    it('should display connection status text', () => {
      render(<OfflinePage />)

      // Status text should be visible and provide the connection state
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      expect(retryButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Icon Integration', () => {
    it('should render wifi icon in illustration', () => {
      render(<OfflinePage />)

      const wifiIcon =
        screen.getByRole('status').querySelector('svg') ??
        screen.getByRole('status').querySelector('.icon-fallback')
      expect(wifiIcon).toBeInTheDocument()

    it('should render retry icon in button', () => {
      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
       const icon = retryButton.querySelector('svg') ?? retryButton.querySelector('.icon-fallback')
      expect(icon).toBeInTheDocument()
    })

    it('should show spinner icon when checking connection', async () => {
      const user = userEvent.setup()

      // Use a controlled promise for proper cleanup
      let resolveFetch: () => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(new Response())
      })
      global.fetch = vi.fn(() => fetchPromise)

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      const clickPromise = user.click(retryButton)

      // Check spinner is shown while checking (without awaiting click to complete)
      await waitFor(() => {
        const spinnerIcon =
          retryButton.querySelector('svg[data-icon="fa-spinner"]') ??
          retryButton.querySelector('.icon-fallback')
          retryButton.querySelector('.icon-fallback')
        expect(spinnerIcon).toBeInTheDocument()
      })

      // Clean up: resolve promise to allow click handler to complete
      resolveFetch!()
      await clickPromise
    })
  })

  describe('Event Listener Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<OfflinePage />)
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })
})
