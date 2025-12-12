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

  beforeEach(() => {
    // Suppress console.error in tests to keep output clean
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
    // Restore all environment stubs
    vi.unstubAllEnvs()
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

    it('should call console.error with error details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('should use custom fallback if provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
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

      expect(screen.getByRole('button', { name: /retry loading the page/i })).toBeInTheDocument()
    })

    it('should render "Go to Homepage" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /return to homepage/i })).toBeInTheDocument()
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
      const tryAgainButton = screen.getByRole('button', { name: /retry loading the page/i })
      await user.click(tryAgainButton)

      // Should show recovered component
      expect(screen.getByText('Component recovered')).toBeInTheDocument()
    })

    it('should navigate to homepage when "Go to Homepage" is clicked', async () => {
      const user = userEvent.setup()
      const originalLocation = window.location

      // Replace entire location object with a mock
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, href: '' },
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      await user.click(homeButton)

      expect(window.location.href).toBe('/')

      // Restore original location
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
      })
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

    it('should have aria-hidden on error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /retry loading the page/i })
      const homeButton = screen.getByRole('button', { name: /return to homepage/i })

      expect(tryAgainButton).toHaveAttribute('type', 'button')
      expect(homeButton).toHaveAttribute('type', 'button')
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
      const tryAgainButton = screen.getByRole('button', { name: /retry loading the page/i })
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
