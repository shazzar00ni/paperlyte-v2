import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hero } from './Hero'

describe('Hero', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    // Capture original scrollIntoView before replacing it
    originalScrollIntoView = Element.prototype.scrollIntoView

    // Mock scrollIntoView
    scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
  })

  afterEach(() => {
    // Restore original scrollIntoView
    Element.prototype.scrollIntoView = originalScrollIntoView

    // Clear mock call history
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

      // Check for the new headline
      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/unchained/i)).toBeInTheDocument()
    })

    it('should render the subheadline', () => {
      render(<Hero />)

      expect(screen.getByText(/Lightning-fast note-taking without the bloat/i)).toBeInTheDocument()
    })

    it('should render email capture form', () => {
      render(<Hero />)

      const emailInput = screen.getByPlaceholderText(/your@email.com/i)
      expect(emailInput).toBeInTheDocument()

      const submitButton = screen.getByRole('button', { name: /join waitlist/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render secondary CTA button', () => {
      render(<Hero />)

      expect(screen.getByRole('button', { name: /see how.*works/i })).toBeInTheDocument()
    })

    it('should render trust badges', () => {
      render(<Hero />)

      expect(screen.getByText(/Join 1,234 early adopters/i)).toBeInTheDocument()
      expect(screen.getByText(/Free forever for early users/i)).toBeInTheDocument()
      expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('should have See How It Works button with ghost variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      const classList = Array.from(button.classList)
      expect(classList.some((cls) => cls.includes('ghost'))).toBe(true)
    })

    it('should render play icon on See How It Works button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      const icon = button.querySelector('.fa-play-circle')

      expect(icon).toBeInTheDocument()
    })

    it('should have Join Waitlist button with primary variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join waitlist/i })
      const classList = Array.from(button.classList)
      expect(classList.some((cls) => cls.includes('primary'))).toBe(true)
    })
  })

  describe('Scroll Behavior', () => {
    it('should scroll to features section when See How It Works is clicked', async () => {
      const user = userEvent.setup()

      // Create mock features section
      const featuresSection = document.createElement('div')
      featuresSection.id = 'features'
      document.body.appendChild(featuresSection)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      })

      // Cleanup
      document.body.removeChild(featuresSection)
    })

    it('should handle missing section gracefully', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })

      // Should not throw error when section doesn't exist
      await expect(user.click(button)).resolves.not.toThrow()
    })

    it('should not scroll if target element is null', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      await user.click(button)

      // scrollIntoView should not be called if element doesn't exist
      expect(scrollIntoViewMock).not.toHaveBeenCalled()
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

      const subheadline = screen.getByText(/Lightning-fast note-taking without the bloat/i)
      expect(subheadline.tagName).toBe('P')
    })

    it('should render headline with italic emphasis', () => {
      render(<Hero />)

      const italicText = screen.getByText('unchained')
      expect(italicText.tagName).toBe('EM')
    })
  })

  describe('App Mockup', () => {
    it('should render app mockup as decorative (aria-hidden)', () => {
      const { container } = render(<Hero />)

      const mockup = container.querySelector('[aria-hidden="true"]')
      expect(mockup).toBeInTheDocument()
    })

    it('should render primary mockup with correct alt text', () => {
      render(<Hero />)

      const mockup = screen.getByAltText(/Paperlyte notes list showing Today's Notes/i)
      expect(mockup).toBeInTheDocument()
    })

    it('should render secondary mockup with correct alt text', () => {
      render(<Hero />)

      const mockup = screen.getByAltText(/Paperlyte note editor with bullet points/i)
      expect(mockup).toBeInTheDocument()
    })

    it('should set primary image to eager loading', () => {
      render(<Hero />)

      const mockup = screen.getByAltText(/Paperlyte notes list showing Today's Notes/i)
      expect(mockup).toHaveAttribute('loading', 'eager')
    })

    it('should set primary image with high fetch priority', () => {
      render(<Hero />)

      const mockup = screen.getByAltText(/Paperlyte notes list showing Today's Notes/i)
      expect(mockup).toHaveAttribute('fetchpriority', 'high')
    })
  })

  describe('Email Capture', () => {
    it('should render email input with placeholder', () => {
      render(<Hero />)

      const input = screen.getByPlaceholderText(/your@email.com/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render submit button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join waitlist/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Trust Badges', () => {
    it('should render all trust badges', () => {
      render(<Hero />)

      const badges = [
        'Join thousands of early adopters',
        'Free forever for early users',
        'No credit card required',
      ]

      badges.forEach((badge) => {
        expect(screen.getByText(badge)).toBeInTheDocument()
      })
    })

    it('should render trust badge icons', () => {
      const { container } = render(<Hero />)

      const usersIcon = container.querySelector('.fa-users')
      const starIcon = container.querySelector('.fa-star')
      const shieldIcon = container.querySelector('.fa-shield-check')

      expect(usersIcon).toBeInTheDocument()
      expect(starIcon).toBeInTheDocument()
      expect(shieldIcon).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()

      // Create mock section
      const section = document.createElement('div')
      section.id = 'features'
      document.body.appendChild(section)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })

      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(scrollIntoViewMock).toHaveBeenCalled()

      // Cleanup
      document.body.removeChild(section)
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup()

      // Create mock section
      const section = document.createElement('div')
      section.id = 'features'
      document.body.appendChild(section)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(3)

      // Cleanup
      document.body.removeChild(section)
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

      expect(screen.getByRole('button', { name: /see how.*works/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /join waitlist/i })).toHaveAccessibleName()
    })

    it('should have main heading visible to screen readers', () => {
      render(<Hero />)

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(headings[0]).toBeVisible()
    })

    it('should have descriptive text visible to screen readers', () => {
      render(<Hero />)

      const description = screen.getByText(/Lightning-fast note-taking without the bloat/i)
      expect(description).toBeVisible()
    })

    it('should hide decorative mockup from screen readers', () => {
      const { container } = render(<Hero />)

      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })

    it('should have proper ARIA label for See How It Works button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', {
        name: /See how Paperlyte works - scroll to features section/i,
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render email capture before secondary CTA', () => {
      const { container } = render(<Hero />)

      const emailWrapper = container.querySelector('form')
      const secondaryCta = screen.getByRole('button', { name: /see how.*works/i })

      const emailPosition = emailWrapper?.compareDocumentPosition(secondaryCta)
      // DOCUMENT_POSITION_FOLLOWING = 4, means secondaryCta comes after emailWrapper
      expect(emailPosition).toBe(4)
    })

    it('should render trust badges after CTAs', () => {
      render(<Hero />)

      const secondaryCta = screen.getByRole('button', { name: /see how.*works/i })
      const trustBadgeText = screen.getByText('Join 1,234 early adopters')
      const trustBadgesContainer = trustBadgeText.closest('div')?.parentElement

      const position = secondaryCta.compareDocumentPosition(trustBadgesContainer!)
      // DOCUMENT_POSITION_FOLLOWING = 4, means trustBadges comes after button
      expect(position).toBe(4)
    })
  })
})
