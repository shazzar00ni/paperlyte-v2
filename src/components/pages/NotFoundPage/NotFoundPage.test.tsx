import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

// Mock the Icon component to avoid testing Font Awesome implementation details
vi.mock('@/components/ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

describe('NotFoundPage', () => {
  let originalLocation: Location
  let historyBackSpy: ReturnType<typeof vi.spyOn>

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
    // Restore all spies including historyBackSpy
    vi.restoreAllMocks()
  })
  describe('Rendering', () => {
    it('should render the 404 error page', () => {
      render(<NotFoundPage />)

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText(/Hmm, we can't find that page/i)).toBeInTheDocument()
    })

    it('should display default error message', () => {
      render(<NotFoundPage />)

      expect(
        screen.getByText(/The page you're looking for doesn't exist or may have been moved/i)
      ).toBeInTheDocument()
    })

    it('should display custom message when provided', () => {
      const customMessage = 'Custom 404 message'
      render(<NotFoundPage message={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('should render the 404 illustration', () => {
      render(<NotFoundPage />)

      const main = screen.getByRole('main')
      const illustration = main.querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
      expect(illustration).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Navigation Actions', () => {
    it('should render "Back to Home" button', () => {
      render(<NotFoundPage />)

      expect(screen.getByRole('button', { name: /return to homepage/i })).toBeInTheDocument()
    })

    it('should render "Go Back" button', () => {
      render(<NotFoundPage />)

      expect(screen.getByRole('button', { name: /go to previous page/i })).toBeInTheDocument()
    })

    it('should navigate to homepage when "Back to Home" is clicked by default', async () => {
      const user = userEvent.setup()

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, href: '' },
      })

      render(<NotFoundPage />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      await user.click(homeButton)

      expect(window.location.href).toBe('/')
    })

    it('should call custom onGoHome callback when provided', async () => {
      const user = userEvent.setup()
      const onGoHome = vi.fn()

      render(<NotFoundPage onGoHome={onGoHome} />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      await user.click(homeButton)

      expect(onGoHome).toHaveBeenCalledTimes(1)
    })

    it('should navigate back when "Go Back" is clicked', async () => {
      const user = userEvent.setup()
      historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})

      render(<NotFoundPage />)

      const backButton = screen.getByRole('button', { name: /go to previous page/i })
      await user.click(backButton)

      expect(historyBackSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Suggestions', () => {
    it('should render helpful suggestions section', () => {
      render(<NotFoundPage />)

      expect(screen.getByText(/helpful suggestions/i)).toBeInTheDocument()
    })

    it('should display suggestion to check URL', () => {
      render(<NotFoundPage />)

      expect(screen.getByText(/Double-check the URL for typos/i)).toBeInTheDocument()
    })

    it('should display suggestion to visit homepage', () => {
      render(<NotFoundPage />)

      expect(screen.getByText(/Visit our homepage to start fresh/i)).toBeInTheDocument()
    })

    it('should display suggestion to use back button', () => {
      render(<NotFoundPage />)

      expect(screen.getByText(/Use your browser's back button/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper main landmark', () => {
      render(<NotFoundPage />)

      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('aria-labelledby', 'not-found-title')
    })

    it('should have accessible heading', () => {
      render(<NotFoundPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAttribute('id', 'not-found-title')
    })

    it('should have aria-hidden on decorative illustration', () => {
      render(<NotFoundPage />)

      const main = screen.getByRole('main')
      const illustration = main.querySelector('[aria-hidden="true"]')
      expect(illustration).toBeInTheDocument()
      expect(illustration).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper button types', () => {
      render(<NotFoundPage />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      const backButton = screen.getByRole('button', { name: /go to previous page/i })

      expect(homeButton).toHaveAttribute('type', 'button')
      expect(backButton).toHaveAttribute('type', 'button')
    })

    it('should have aria-labels on action buttons', () => {
      render(<NotFoundPage />)

      expect(screen.getByLabelText(/return to homepage/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/go to previous page/i)).toBeInTheDocument()
    })
  })

  describe('Icon Integration', () => {
    it('should render home icon in primary button', () => {
      render(<NotFoundPage />)

      expect(screen.getByTestId('icon-fa-home')).toBeInTheDocument()
    })

    it('should render arrow-left icon in secondary button', () => {
      render(<NotFoundPage />)

      expect(screen.getByTestId('icon-fa-arrow-left')).toBeInTheDocument()
    })

    it('should render icons in suggestions list', () => {
      render(<NotFoundPage />)

      // Verify the suggestion icons are present
      expect(screen.getByTestId('icon-fa-magnifying-glass')).toBeInTheDocument()
      expect(screen.getByTestId('icon-fa-house')).toBeInTheDocument()
      expect(screen.getByTestId('icon-fa-arrow-rotate-left')).toBeInTheDocument()
    })
  })
})
