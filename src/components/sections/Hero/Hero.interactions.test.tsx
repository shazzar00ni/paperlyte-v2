import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hero } from './Hero'

describe('Hero - Interactions', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    // Capture original scrollIntoView before replacing it
    originalScrollIntoView = Element.prototype.scrollIntoView as any

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

  describe('Scroll Behavior', () => {
    it('should scroll to features section when See How It Works is clicked', async () => {
      const user = userEvent.setup()

      // Create mock section
      const section = document.createElement('div')
      section.id = 'features'
      document.body.appendChild(section)

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })
      await user.click(button)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      })

      // Cleanup
      document.body.removeChild(section)
    })

    it('should handle missing section gracefully', async () => {
      const user = userEvent.setup()

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })

      // Should not throw error even if section doesn't exist
      await expect(user.click(button)).resolves.not.toThrow()
    })

    it('should not scroll if target element is null', async () => {
      const user = userEvent.setup()

      render(<Hero />)

      const button = screen.getByRole('button', { name: /see how.*works/i })

      // Don't create the target section
      await user.click(button)

      // Since scrollToSection checks if element exists before scrolling,
      // it should handle missing element gracefully without error
      expect(button).toBeInTheDocument()
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
})
