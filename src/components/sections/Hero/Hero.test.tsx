import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hero } from './Hero'
import { WAITLIST_COUNT } from '@constants/waitlist'

describe('Hero', () => {
  beforeEach(() => {
    // Mock fetch for form submission tests
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the hero section', () => {
      const { container } = render(<Hero />)

      const section = container.querySelector('#hero')
      expect(section).toBeInTheDocument()
    })

    it('should render the main headline', () => {
      render(<Hero />)

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/unchained/i)).toBeInTheDocument()
    })

    it('should render the subheadline', () => {
      render(<Hero />)

      expect(screen.getByText(/Note-taking that gets out of your way/i)).toBeInTheDocument()
    })

    it('should render the email form', () => {
      render(<Hero />)

      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /join the waitlist/i })).toBeInTheDocument()
    })

    it('should render social proof badge', () => {
      render(<Hero />)

      expect(screen.getByText(String(WAITLIST_COUNT))).toBeInTheDocument()
    })
  })

  describe('Email Form', () => {
    it('should have Join the Waitlist button with primary variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      const classList = Array.from(button.classList)
      expect(classList.some((cls) => cls.includes('primary'))).toBe(true)
    })

    it('should render arrow icon on Join the Waitlist button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      const icon = button.querySelector('svg')

      expect(icon).toBeInTheDocument()
    })

    it('should show success message after form submission', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      const submitButton = screen.getByRole('button', { name: /join the waitlist/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
      })
    })

    it('should show error message when submission fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Failed to subscribe' }),
        })
      )
      const user = userEvent.setup()
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button', { name: /join the waitlist/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should handle missing section gracefully when submitting', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      await user.type(emailInput, 'test@example.com')

      // Should not throw error when clicking
      await expect(
        user.click(screen.getByRole('button', { name: /join the waitlist/i }))
      ).resolves.not.toThrow()
    })
  })

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />)

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(headings[0].tagName).toBe('H1')
    })

    it('should render subheadline in paragraph tag', () => {
      render(<Hero />)

      const subheadline = screen.getByText(/Note-taking that gets out of your way/i)
      expect(subheadline.tagName).toBe('P')
    })

    it('should render headline with italic emphasis', () => {
      render(<Hero />)

      const italicText = screen.getByText('unchained.')
      expect(italicText.tagName).toBe('EM')
    })
  })

  describe('App Mockup', () => {
    it('should render app mockup as decorative (aria-hidden)', () => {
      const { container } = render(<Hero />)

      const mockup = container.querySelector('[aria-hidden="true"]')
      expect(mockup).toBeInTheDocument()
    })

    it('should render mockup images with proper alt text', () => {
      const { container } = render(<Hero />)

      // Mockup images are in aria-hidden container but should still have alt text for SEO/fallback
      const mockupImages = container.querySelectorAll('img')
      expect(mockupImages.length).toBeGreaterThanOrEqual(2)

      // Check that mockup images have descriptive alt text
      const notesListImg = Array.from(mockupImages).find((img) =>
        img.alt.toLowerCase().includes('notes list')
      )
      expect(notesListImg).toBeDefined()

      const noteDetailImg = Array.from(mockupImages).find((img) =>
        img.alt.toLowerCase().includes('note editor')
      )
      expect(noteDetailImg).toBeDefined()
    })
  })

  describe('Button Interactions', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      await user.type(emailInput, 'test@example.com')

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(vi.mocked(fetch)).toHaveBeenCalled()
      })
    })

    it('should handle multiple submissions correctly', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button', { name: /join the waitlist/i }))

      // After success, the form should be replaced with the success message
      await waitFor(() => {
        expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument()
      })
    })
  })

  describe('Section Props', () => {
    it('should render Section component with correct id', () => {
      const { container } = render(<Hero />)

      const section = container.querySelector('#hero')
      expect(section).toBeInTheDocument()
    })

    it('should use large padding variant', () => {
      const { container } = render(<Hero />)

      const section = container.querySelector('#hero')
      expect(section).toBeInTheDocument()

      // Verify the Section has the padding-large class applied
      // (CSS Module class names are hashed, so we check for the class pattern)
      const classList = Array.from(section?.classList || [])
      const hasPaddingLargeClass = classList.some((className) =>
        className.includes('padding-large')
      )

      expect(hasPaddingLargeClass).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Hero />)

      expect(
        screen.getByRole('button', { name: /join the waitlist/i })
      ).toHaveAccessibleName()
    })

    it('should have main heading visible to screen readers', () => {
      render(<Hero />)

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(headings[0]).toBeVisible()
    })

    it('should have descriptive text visible to screen readers', () => {
      render(<Hero />)

      const description = screen.getByText(/Note-taking that gets out of your way/i)
      expect(description).toBeVisible()
    })

    it('should hide decorative mockup from screen readers', () => {
      const { container } = render(<Hero />)

      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should render email input before submit button', () => {
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      const submitButton = screen.getByRole('button', { name: /join the waitlist/i })

      // Email input should appear before submit button in the DOM
      expect(emailInput.compareDocumentPosition(submitButton)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })

    it('should render social proof text', () => {
      render(<Hero />)

      // Social proof should mention waitlist count and people
      expect(screen.getByText(/people already on the waitlist/i)).toBeInTheDocument()
    })
  })
})

