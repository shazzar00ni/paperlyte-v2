import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hero } from './Hero'

// Test helpers
const createMockSection = (id: string): HTMLDivElement => {
  const section = document.createElement('div')
  section.id = id
  document.body.appendChild(section)
  return section
}

const removeMockSection = (section: HTMLElement): void => {
  document.body.removeChild(section)
}

const hasClassContaining = (element: Element, searchText: string): boolean => {
  return Array.from(element.classList).some((cls) => cls.includes(searchText))
}

describe('Hero', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    originalScrollIntoView = Element.prototype.scrollIntoView
    scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
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

      // There are multiple headings with "thoughts", use getAllByRole
      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/organized/i)).toBeInTheDocument()
    })

    it('should render the subheadline', () => {
      render(<Hero />)

      expect(screen.getByText(/The minimal workspace for busy professionals/i)).toBeInTheDocument()
    })

    it('should render CTA buttons', () => {
      render(<Hero />)

      expect(screen.getByRole('button', { name: /start writing for free/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view the demo/i })).toBeInTheDocument()
    })

    it('should render trusted by section', () => {
      render(<Hero />)

      expect(screen.getByText(/TRUSTED BY TEAMS AT/i)).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Global')).toBeInTheDocument()
      expect(screen.getByText('Nebula')).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('should render buttons with correct variants and decorative icon', () => {
      render(<Hero />)

      const primaryButton = screen.getByRole('button', { name: /start writing for free/i })
      expect(hasClassContaining(primaryButton, 'primary')).toBe(true)
      expect(primaryButton.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

      const secondaryButton = screen.getByRole('button', { name: /view the demo/i })
      expect(hasClassContaining(secondaryButton, 'secondary')).toBe(true)
    })
  })

  describe('Scroll Behavior', () => {
    it('should scroll to target sections when CTA buttons are clicked', async () => {
      const user = userEvent.setup()
      const downloadSection = createMockSection('download')
      const featuresSection = createMockSection('features')

      render(<Hero />)

      await user.click(screen.getByRole('button', { name: /start writing for free/i }))
      expect(scrollIntoViewMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))

      scrollIntoViewMock.mockClear()
      await user.click(screen.getByRole('button', { name: /view the demo/i }))
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      removeMockSection(downloadSection)
      removeMockSection(featuresSection)
    })

    it('should handle missing target section gracefully', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const button = screen.getByRole('button', { name: /start writing for free/i })
      await expect(user.click(button)).resolves.not.toThrow()
      expect(scrollIntoViewMock).not.toHaveBeenCalled()
    })
  })

  describe('Content Structure', () => {
    it('should have proper semantic HTML structure', () => {
      render(<Hero />)

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings[0].tagName).toBe('H1')
      expect(screen.getByText('organized.').tagName).toBe('EM')
      expect(screen.getByText(/The minimal workspace for busy professionals/i).tagName).toBe('P')
    })
  })

  describe('App Mockup', () => {
    it('should render mockup images with proper accessibility', () => {
      const { container } = render(<Hero />)

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

      const primaryImage = screen.getByAltText(/Paperlyte notes list showing Today's Notes/i)
      expect(primaryImage).toHaveAttribute('src', '/mockups/notes-list.svg')

      const secondaryImage = screen.getByAltText(/Paperlyte note editor with bullet points/i)
      expect(secondaryImage).toHaveAttribute('src', '/mockups/note-detail.svg')
    })
  })

  describe('Button Interactions', () => {
    it('should support keyboard navigation and multiple clicks', async () => {
      const user = userEvent.setup()
      const section = createMockSection('download')

      render(<Hero />)
      const button = screen.getByRole('button', { name: /start writing for free/i })

      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

      await user.click(button)
      await user.click(button)
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(3)

      removeMockSection(section)
    })
  })

  describe('Section Props', () => {
    it('should render Section with correct id and padding', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#hero')

      expect(section).toBeInTheDocument()
      expect(hasClassContaining(section!, 'padding-large')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should meet accessibility requirements', () => {
      const { container } = render(<Hero />)

      expect(screen.getByRole('button', { name: /start writing for free/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /view the demo/i })).toHaveAccessibleName()

      const headings = screen.getAllByRole('heading', { name: /thoughts/i })
      expect(headings[0]).toBeVisible()
      expect(screen.getByText(/The minimal workspace for busy professionals/i)).toBeVisible()

      expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should render elements in correct order with all content', () => {
      render(<Hero />)

      const buttons = screen.getAllByRole('button')
      const buttonTexts = buttons.map((btn) => btn.textContent)
      const startIndex = buttonTexts.findIndex((text) => text?.includes('Start Writing'))
      const demoIndex = buttonTexts.findIndex((text) => text?.includes('View the Demo'))

      expect(startIndex).toBeLessThan(demoIndex)

      const companies = ['Acme Corp', 'Global', 'Nebula', 'Vertex', 'Horizon']
      companies.forEach((company) => expect(screen.getByText(company)).toBeInTheDocument())
    })
  })
})
