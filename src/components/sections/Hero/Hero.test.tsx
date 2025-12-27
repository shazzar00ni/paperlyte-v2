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

      expect(screen.getByRole('heading', { name: /your thoughts, unchained/i })).toBeInTheDocument()
    })

    it('should render the subheadline', () => {
      render(<Hero />)

      expect(screen.getByText(/The fastest, simplest way to capture ideas/i)).toBeInTheDocument()
    })

    it('should render CTA buttons', () => {
      render(<Hero />)

      expect(screen.getByRole('button', { name: /join the waitlist/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view the demo/i })).toBeInTheDocument()
    })

    it('should render feature tags', () => {
      render(<Hero />)

      expect(screen.getByText(/Lightning Fast/i)).toBeInTheDocument()
      expect(screen.getByText(/Privacy First/i)).toBeInTheDocument()
      expect(screen.getByText(/Offline Ready/i)).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('should have Join the Waitlist button with primary variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      // Verify primary variant by checking class contains 'primary' (CSS module hash)
      const classList = Array.from(button.classList)
      expect(classList.some((cls) => cls.includes('primary'))).toBe(true)
    })

    it('should have View the Demo button with secondary variant', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /view the demo/i })
      // Verify secondary variant by checking class contains 'secondary' (CSS module hash)
      const classList = Array.from(button.classList)
      expect(classList.some((cls) => cls.includes('secondary'))).toBe(true)
    })

    it('should render arrow icon on Join the Waitlist button', () => {
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      const icon = button.querySelector('.fa-arrow-right')

      expect(icon).toBeInTheDocument()
    })
  })

  describe('Scroll Behavior', () => {
    it('should scroll to download section when Join the Waitlist is clicked', async () => {
      const user = userEvent.setup()

      // Create mock download section
      const downloadSection = document.createElement('div')
      downloadSection.id = 'download'
      document.body.appendChild(downloadSection)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
        })
      )

      // Cleanup
      document.body.removeChild(downloadSection)
    })

    it('should scroll to features section when View the Demo is clicked', async () => {
      const user = userEvent.setup()

      // Create mock features section
      const featuresSection = document.createElement('div')
      featuresSection.id = 'features'
      document.body.appendChild(featuresSection)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /view the demo/i })
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

      const button = screen.getByRole('button', { name: /join the waitlist/i })

      // Should not throw error when section doesn't exist
      await expect(user.click(button)).resolves.not.toThrow()
    })

    it('should not scroll if target element is null', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })
      await user.click(button)

      // scrollIntoView should not be called if element doesn't exist
      expect(scrollIntoViewMock).not.toHaveBeenCalled()
    })
  })

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />)

      // There are multiple headings with "thoughts", use getAllByRole
      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(headings[0].tagName).toBe('H1')
    })

    it('should render subheadline in paragraph tag', () => {
      render(<Hero />)

      const subheadline = screen.getByText(/The fastest, simplest way to capture ideas/i)
      expect(subheadline.tagName).toBe('P')
    })

    it('should render microcopy with launch quarter', () => {
      render(<Hero />)

      expect(screen.getByText(/Be the first to try Paperlyte when we launch/i)).toBeInTheDocument()
    })
  })

  describe('App Mockup', () => {
    it('should render mockup images', () => {
      const { container } = render(<Hero />)

      const mockupImages = container.querySelectorAll('img')
      expect(mockupImages.length).toBeGreaterThanOrEqual(2)

      // Check for notes list mockup
      const notesListImg = Array.from(mockupImages).find((img) =>
        img.alt.includes('notes list')
      )
      expect(notesListImg).toBeInTheDocument()

      // Check for note detail mockup
      const noteDetailImg = Array.from(mockupImages).find((img) => img.alt.includes('note editor'))
      expect(noteDetailImg).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()

      // Create mock section
      const section = document.createElement('div')
      section.id = 'download'
      document.body.appendChild(section)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /join the waitlist/i })

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

      const button = screen.getByRole('button', { name: /view the demo/i })

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

      expect(screen.getByRole('button', { name: /join the waitlist/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /view the demo/i })).toHaveAccessibleName()
    })

    it('should have main heading visible to screen readers', () => {
      render(<Hero />)

      const heading = screen.getByRole('heading', { name: /your thoughts, unchained/i })
      expect(heading).toBeVisible()
    })

    it('should have descriptive text visible to screen readers', () => {
      render(<Hero />)

      const description = screen.getByText(/The fastest, simplest way to capture ideas/i)
      expect(description).toBeVisible()
    })

    it('should have accessible mockup images', () => {
      const { container } = render(<Hero />)

      const images = container.querySelectorAll('img')
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })
  })

  describe('Layout', () => {
    it('should render CTA buttons in correct order', () => {
      render(<Hero />)

      const buttons = screen.getAllByRole('button')
      const buttonTexts = buttons.map((btn) => btn.textContent)

      const waitlistIndex = buttonTexts.findIndex((text) => text?.includes('Join the Waitlist'))
      const demoIndex = buttonTexts.findIndex((text) => text?.includes('View the Demo'))

      // Join the Waitlist should come before View the Demo
      expect(waitlistIndex).toBeLessThan(demoIndex)
    })

    it('should render feature tags', () => {
      render(<Hero />)

      const tags = ['Lightning Fast', 'Privacy First', 'Offline Ready']
      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })
  })
})
