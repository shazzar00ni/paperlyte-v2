import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
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

      const illustration = screen.getByText('4').parentElement
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

    it('should scroll to top when "Back to Home" is clicked by default', async () => {
      const user = userEvent.setup()
      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy

      render(<NotFoundPage />)

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      await user.click(homeButton)

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
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
      const backSpy = vi.fn()
      window.history.back = backSpy

      render(<NotFoundPage />)

      const backButton = screen.getByRole('button', { name: /go to previous page/i })
      await user.click(backButton)

      expect(backSpy).toHaveBeenCalledTimes(1)
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

      const illustration = screen.getByText('4').parentElement
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

      const homeButton = screen.getByRole('button', { name: /return to homepage/i })
      const icon = homeButton.querySelector('i.fa-home')
      expect(icon).toBeInTheDocument()
    })

    it('should render arrow-left icon in secondary button', () => {
      render(<NotFoundPage />)

      const backButton = screen.getByRole('button', { name: /go to previous page/i })
      const icon = backButton.querySelector('i.fa-arrow-left')
      expect(icon).toBeInTheDocument()
    })

    it('should render icons in suggestions list', () => {
      render(<NotFoundPage />)

      const suggestionsList = screen.getByRole('list')
      const icons = suggestionsList.querySelectorAll('i')
      expect(icons.length).toBeGreaterThan(0)
    })
  })
})
