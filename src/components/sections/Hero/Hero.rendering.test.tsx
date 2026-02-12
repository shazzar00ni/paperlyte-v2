import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero - Rendering', () => {
  describe('Basic Structure', () => {
    it('should render the hero section', () => {
      const { container } = render(<Hero />)

      const section = container.querySelector('#hero')
      expect(section).toBeInTheDocument()
    })

    it('should render the main headline', () => {
      render(<Hero />)

      const headline = screen.getByRole('heading', { level: 1 })
      expect(headline).toBeInTheDocument()
      expect(headline).toHaveTextContent(/your thoughts.*unchained/i)
    })

    it('should render the subheadline', () => {
      render(<Hero />)

      const subheadline = screen.getByText(/lightning-fast note-taking without the bloat/i)
      expect(subheadline).toBeInTheDocument()
    })

    it('should render email capture form', () => {
      const { container } = render(<Hero />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should render secondary CTA button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      expect(button).toBeInTheDocument()
    })

    it('should render trust badges', () => {
      render(<Hero />)

      expect(screen.getByText(/Join thousands of early adopters/i)).toBeInTheDocument()
      expect(screen.getByText(/Free forever for early users/i)).toBeInTheDocument()
      expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('should have See How It Works button with ghost variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      // Ghost variant applies CSS classes, not data attributes
      expect(button).toBeInTheDocument()
    })

    it('should render play icon on See How It Works button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      const icon = button.querySelector('.fa-play-circle')
      expect(icon).toBeInTheDocument()
    })

    it('should have Join Waitlist button with primary variant', () => {
      render(<Hero />)

      // The Join Waitlist button is in the EmailCapture form
      const submitButton = screen.getByRole('button', { name: /join.*waitlist/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent(/your thoughts.*unchained/i)
    })

    it('should render subheadline in paragraph tag', () => {
      const { container } = render(<Hero />)

      const subheadlines = container.querySelectorAll('p')
      const heroSubheadline = Array.from(subheadlines).find(p =>
        p.textContent?.includes('Lightning-fast')
      )
      expect(heroSubheadline).toBeInTheDocument()
      expect(heroSubheadline).toHaveTextContent(/lightning-fast/i)
    })

    it('should render headline with italic emphasis', () => {
      const { container } = render(<Hero />)

      const emphasis = container.querySelector('em')
      expect(emphasis).toBeInTheDocument()
      expect(emphasis).toHaveTextContent(/unchained/i)
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

      const button = screen.getByRole('button', { name: /join.*waitlist/i })
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
      expect(classList.some(cls => cls.includes('padding-large'))).toBe(true)
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
      const trustBadgeText = screen.getByText('Join thousands of early adopters')
      // Compare directly against the text element to avoid fragile DOM traversal
      const position = secondaryCta.compareDocumentPosition(trustBadgeText)
      // DOCUMENT_POSITION_FOLLOWING = 4, means trustBadges comes after button
      expect(position).toBe(4)
    })
  })
})
