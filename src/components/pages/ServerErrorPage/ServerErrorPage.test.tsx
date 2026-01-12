import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServerErrorPage } from './ServerErrorPage'
import { CONTACT } from '@/constants/config'

describe('ServerErrorPage', () => {
  let originalLocation: Location

  beforeEach(() => {
    // Save original globals
    originalLocation = window.location
  })

  afterEach(() => {
    // Restore original globals
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    })
    // Restore environment stubs
    vi.unstubAllEnvs()
  })

  describe('Rendering', () => {
    it('should render the 500 error page', () => {
      render(<ServerErrorPage />)

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument()
    })

    it('should display default error message', () => {
      render(<ServerErrorPage />)

      expect(
        screen.getByText(/We're sorry, but something unexpected happened on our end/i)
      ).toBeInTheDocument()
    })

    it('should display custom message when provided', () => {
      const customMessage = 'Custom server error message'
      render(<ServerErrorPage message={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('should render the error illustration with icon', () => {
      render(<ServerErrorPage />)

      const illustration = screen.getByRole('main').querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
    })

    it('should display error code 500', () => {
      render(<ServerErrorPage />)

      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('Error Details', () => {
    it('should show error details in development mode', () => {
      vi.stubEnv('DEV', true)

      const errorDetails = 'Error: Test error\n  at Component.render'
      render(<ServerErrorPage errorDetails={errorDetails} />)

      expect(screen.getByText(/Error details \(development only\)/i)).toBeInTheDocument()
    })

    it('should display error stack trace in development mode', () => {
      vi.stubEnv('DEV', true)

      const errorDetails = 'Error: Test error\n  at Component.render'
      render(<ServerErrorPage errorDetails={errorDetails} />)

      const errorText = screen.getByText(/Error: Test error/)
      expect(errorText).toBeInTheDocument()
    })

    it('should hide error details in production mode', () => {
      vi.stubEnv('DEV', false)

      const errorDetails = 'Error: Test error\n  at Component.render'
      render(<ServerErrorPage errorDetails={errorDetails} />)

      expect(screen.queryByText(/Error details \(development only\)/i)).not.toBeInTheDocument()
    })

    it('should not render error details section when no error provided', () => {
      vi.stubEnv('DEV', true)

      render(<ServerErrorPage />)

      expect(screen.queryByText(/Error details \(development only\)/i)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render "Try Again" button', () => {
      render(<ServerErrorPage />)

      expect(screen.getByRole('button', { name: /retry loading the page/i })).toBeInTheDocument()
    })

    it('should render "Go to Homepage" button', () => {
      render(<ServerErrorPage />)

      expect(screen.getByRole('button', { name: /return to homepage/i })).toBeInTheDocument()
    })

    it('should call onRetry callback when provided', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()

      render(<ServerErrorPage onRetry={onRetry} />)

      const retryButton = screen.getByRole('button', { name: /retry loading the page/i })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should reload page when retry clicked without callback', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.fn()

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, reload: reloadSpy },
      })

      render(<ServerErrorPage />)

      const retryButton = screen.getByRole('button', { name: /retry loading the page/i })
      await user.click(retryButton)

      expect(reloadSpy).toHaveBeenCalledTimes(1)
    })

    it('should navigate to homepage when "Go to Homepage" is clicked', async () => {
      const user = userEvent.setup()

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, href: '' },
      })

      render(<ServerErrorPage />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      await user.click(homeButton)

      expect(window.location.href).toBe('/')
    })
  })

  describe('Support Information', () => {
    it('should display support information by default', () => {
      render(<ServerErrorPage />)

      expect(screen.getByText(/contact our support team/i)).toBeInTheDocument()
    })

    it('should hide support information when showSupport is false', () => {
      render(<ServerErrorPage showSupport={false} />)

      expect(screen.queryByText(/contact our support team/i)).not.toBeInTheDocument()
    })

    it('should render support email link', () => {
      render(<ServerErrorPage />)

      const supportLink = screen.getByRole('link', { name: /contact our support team/i })
      expect(supportLink).toHaveAttribute('href', `mailto:${CONTACT.supportEmail}`)
    })

    it('should display status notification', () => {
      render(<ServerErrorPage />)

      expect(
        screen.getByText(/Our team has been notified and is working to resolve this issue/i)
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="main" on container', () => {
      render(<ServerErrorPage />)

      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('aria-labelledby', 'error-title')
    })

    it('should have accessible heading', () => {
      render(<ServerErrorPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAttribute('id', 'error-title')
    })

    it('should have aria-hidden on decorative illustration', () => {
      render(<ServerErrorPage />)

      const illustration = screen.getByRole('main').querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(<ServerErrorPage />)

      const retryButton = screen.getByRole('button', { name: /retry loading the page/i })
      const homeButton = screen.getByRole('button', { name: /return to homepage/i })

      expect(retryButton).toHaveAttribute('type', 'button')
      expect(homeButton).toHaveAttribute('type', 'button')
    })

    it('should have aria-labels on action buttons', () => {
      render(<ServerErrorPage />)

      expect(screen.getByLabelText(/retry loading the page/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/return to homepage/i)).toBeInTheDocument()
    })
  })

  describe('Icon Integration', () => {
    it('should render server icon in illustration', () => {
      render(<ServerErrorPage />)

      const main = screen.getByRole('main')
      const serverIcon = main.querySelector('svg')
      expect(serverIcon).toBeInTheDocument()
    })

    it('should render warning icon in error badge', () => {
      const { container } = render(<ServerErrorPage />)

      // Find the illustration container which has both server and warning icons
      const illustration = container.querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()

      // Should have exactly 2 icons in illustration: server icon + warning icon
      const iconsInIllustration = illustration?.querySelectorAll('svg')
      expect(iconsInIllustration?.length).toBe(2)
    })

    it('should render retry icon in primary button', () => {
      render(<ServerErrorPage />)

      const retryButton = screen.getByRole('button', { name: /retry loading the page/i })
      const icon = retryButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should render home icon in secondary button', () => {
      render(<ServerErrorPage />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      const icon = homeButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })
})
