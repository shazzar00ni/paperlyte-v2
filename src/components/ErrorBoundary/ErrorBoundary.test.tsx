import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Working component</div>
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error
  let originalLocation: Location

  beforeEach(() => {
    // Suppress console.error in tests to keep output clean
    console.error = vi.fn()
    // Save original location
    originalLocation = window.location
  })

  afterEach(() => {
    console.error = originalConsoleError
    // Restore all environment stubs
    vi.unstubAllEnvs()
    // Restore window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    })
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should render multiple children without errors', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should display default error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(
        screen.getByText(/We're sorry, but something unexpected happened/i)
      ).toBeInTheDocument()
    })

    it('should log error using monitoring utility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // React's error logging format includes the error and component stack
      expect(console.error).toHaveBeenCalled()
      const mockConsoleError = vi.mocked(console.error)
      const errorCalls = mockConsoleError.mock.calls
      const hasErrorLogged = errorCalls.some((call: unknown[]) =>
        call.some((arg: unknown) => arg instanceof Error && arg.message === 'Test error')
      )
      expect(hasErrorLogged).toBe(true)
    })

    it('should use custom fallback if provided', () => {
      const customFallback = <div role="alert">Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  describe('Development Mode', () => {
    it('should show error details in development mode', () => {
      // Set DEV mode
      vi.stubEnv('DEV', true)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const details = screen.getByText(/Error details \(development only\)/i)
      expect(details).toBeInTheDocument()
    })

    it('should display error stack trace in development mode', () => {
      vi.stubEnv('DEV', true)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorText = screen.getByText(/Error: Test error/i)
      expect(errorText).toBeInTheDocument()
    })

    it('should hide error details in production mode', () => {
      // Set production mode
      vi.stubEnv('DEV', false)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/Error details \(development only\)/i)).not.toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('should render "Try Again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Button has aria-label with retry count, but text is "Try Again"
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should render "Reload Page" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument()
    })

    it('should reset error state when "Try Again" is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Conditional error')
        }
        return <div>Component recovered</div>
      }

      render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      )

      // Error should be shown
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click Try Again
      const tryAgainButton = screen.getByText('Try Again')
      await user.click(tryAgainButton)

      // Should show recovered component
      expect(screen.getByText('Component recovered')).toBeInTheDocument()
    })

    it('should reload page when "Reload Page" is clicked', async () => {
      const user = userEvent.setup()
      const reloadMock = vi.fn()

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, reload: reloadMock },
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByRole('button', { name: 'Reload Page' })
      await user.click(reloadButton)

      expect(reloadMock).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert" on error container', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('should display error heading and action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Verify semantic elements are present and accessible
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByText('Try Again')
      const reloadButton = screen.getByRole('button', { name: 'Reload Page' })

      expect(tryAgainButton).toHaveAttribute('type', 'button')
      expect(reloadButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple consecutive errors', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // First error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Reset
      const tryAgainButton = screen.getByText('Try Again')
      await user.click(tryAgainButton)

      // Another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should handle errors with no stack trace', () => {
      const ErrorWithoutStack = () => {
        const error = new Error('No stack')
        delete error.stack
        throw error
      }

      render(
        <ErrorBoundary>
          <ErrorWithoutStack />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('getDerivedStateFromError', () => {
    it('should set hasError to true when error is thrown', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // If hasError is true, fallback UI should be shown
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should store the error in state', () => {
      vi.stubEnv('DEV', true)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error should be stored and displayed
      expect(screen.getByText(/Error: Test error/i)).toBeInTheDocument()
    })
  })
})
