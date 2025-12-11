import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OfflinePage } from './OfflinePage'

describe('OfflinePage', () => {
  beforeEach(() => {
    // Reset online status before each test
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render the offline page', () => {
      render(<OfflinePage />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
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
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

      render(<OfflinePage />)

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  describe('Connection Status', () => {
    it('should detect when user comes online', async () => {
      const { rerender } = render(<OfflinePage />)

      expect(screen.getByText('Disconnected')).toBeInTheDocument()

      // Simulate going online
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      window.dispatchEvent(new Event('online'))

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })
    })

    it('should detect when user goes offline', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      render(<OfflinePage />)

      expect(screen.getByText('Connected')).toBeInTheDocument()

      // Simulate going offline
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      window.dispatchEvent(new Event('offline'))

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })
    })

    it('should call onConnectionRestored when connection is restored', async () => {
      const onConnectionRestored = vi.fn()
      render(<OfflinePage onConnectionRestored={onConnectionRestored} />)

      // Simulate going online
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
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
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      await user.click(retryButton)

      expect(screen.getByText('Checking...')).toBeInTheDocument()
      expect(retryButton).toBeDisabled()
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

    it('should show reload button when online', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

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
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

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
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

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
    it('should have role="alert" with aria-live', () => {
      render(<OfflinePage />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
      expect(alert).toHaveAttribute('aria-labelledby', 'offline-title')
    })

    it('should have accessible heading', () => {
      render(<OfflinePage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAttribute('id', 'offline-title')
    })

    it('should have aria-hidden on decorative illustration', () => {
      render(<OfflinePage />)

      const illustration = screen.getByRole('alert').querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
    })

    it('should have aria-label on status indicator', () => {
      render(<OfflinePage />)

      const statusIndicator = screen.getByLabelText('Offline')
      expect(statusIndicator).toBeInTheDocument()
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

      const wifiIcon = screen.getByRole('alert').querySelector('i.fa-wifi')
      expect(wifiIcon).toBeInTheDocument()
    })

    it('should render retry icon in button', () => {
      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      const icon = retryButton.querySelector('i.fa-rotate-right')
      expect(icon).toBeInTheDocument()
    })

    it('should show spinner icon when checking connection', async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      render(<OfflinePage />)

      const retryButton = screen.getByRole('button', { name: /check connection and retry/i })
      await user.click(retryButton)

      const spinnerIcon = retryButton.querySelector('i.fa-spinner.fa-spin')
      expect(spinnerIcon).toBeInTheDocument()
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
