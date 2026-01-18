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

// Shared test setup
const setupScrollMock = () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoViewMock
  return { originalScrollIntoView, scrollIntoViewMock }
}

const teardownScrollMock = (originalScrollIntoView: typeof Element.prototype.scrollIntoView) => {
  Element.prototype.scrollIntoView = originalScrollIntoView
  vi.clearAllMocks()
}

describe('Hero - Rendering', () => {
  it('should render the hero section with all content', () => {
    const { container } = render(<Hero />)

    expect(container.querySelector('#hero')).toBeInTheDocument()

    const headings = screen.getAllByRole('heading', { name: /thoughts/i })
    expect(headings.length).toBeGreaterThan(0)
    expect(screen.getByText(/organized/i)).toBeInTheDocument()
    expect(screen.getByText(/The minimal workspace for busy professionals/i)).toBeInTheDocument()
  })

  it('should render CTA buttons', () => {
    render(<Hero />)

    expect(screen.getByRole('button', { name: /start writing for free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view the demo/i })).toBeInTheDocument()
  })

  it('should render trusted by section with companies', () => {
    render(<Hero />)

    expect(screen.getByText(/TRUSTED BY TEAMS AT/i)).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByText('Nebula')).toBeInTheDocument()
  })
})

describe('Hero - CTA Buttons', () => {
  it('should render buttons with correct variants and decorative icon', () => {
    render(<Hero />)

    const primaryButton = screen.getByRole('button', { name: /start writing for free/i })
    expect(hasClassContaining(primaryButton, 'primary')).toBe(true)
    expect(primaryButton.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

    const secondaryButton = screen.getByRole('button', { name: /view the demo/i })
    expect(hasClassContaining(secondaryButton, 'secondary')).toBe(true)
  })
})

describe('Hero - Scroll Tests', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView
  let mockSections: HTMLElement[] = []

  beforeEach(() => {
    const setup = setupScrollMock()
    originalScrollIntoView = setup.originalScrollIntoView
    scrollIntoViewMock = setup.scrollIntoViewMock
    mockSections = []
  })

  afterEach(() => {
    teardownScrollMock(originalScrollIntoView)
    mockSections.forEach((section) => {
      if (document.body.contains(section)) {
        removeMockSection(section)
      }
    })
    mockSections = []
  })

  describe('Scroll Behavior', () => {
    it('should scroll to target sections when CTA buttons are clicked', async () => {
      const user = userEvent.setup()
      const downloadSection = createMockSection('download')
      const featuresSection = createMockSection('features')
      mockSections.push(downloadSection, featuresSection)

      render(<Hero />)

      await user.click(screen.getByRole('button', { name: /start writing for free/i }))
      expect(scrollIntoViewMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))

      scrollIntoViewMock.mockClear()
      await user.click(screen.getByRole('button', { name: /view the demo/i }))
      expect(scrollIntoViewMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    })

    it('should handle missing target section gracefully', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const button = screen.getByRole('button', { name: /start writing for free/i })
      await expect(user.click(button)).resolves.not.toThrow()
      expect(scrollIntoViewMock).not.toHaveBeenCalled()
    })
  })

  describe('Button Interactions', () => {
    it('should support keyboard navigation and multiple clicks', async () => {
      const user = userEvent.setup()
      const section = createMockSection('download')
      mockSections.push(section)

      render(<Hero />)
      const button = screen.getByRole('button', { name: /start writing for free/i })

      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

      await user.click(button)
      await user.click(button)
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(3)
    })
  })
})

describe('Hero - Content Structure', () => {
  it('should have proper semantic HTML structure', () => {
    render(<Hero />)

    const headings = screen.getAllByRole('heading', { name: /thoughts/i })
    expect(headings[0].tagName).toBe('H1')
    expect(screen.getByText('organized.').tagName).toBe('EM')
    expect(screen.getByText(/The minimal workspace for busy professionals/i).tagName).toBe('P')
  })
})

describe('Hero - App Mockup', () => {
  it('should hide mockup container from screen readers', () => {
    const { container } = render(<Hero />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('should render primary mockup with descriptive alt text', () => {
    render(<Hero />)

    const primaryImage = screen.getByAltText(/Paperlyte notes list showing Today's Notes/i)
    expect(primaryImage).toBeInTheDocument()
    expect(primaryImage).toHaveAttribute('src', '/mockups/notes-list.svg')
  })

  it('should render secondary mockup with descriptive alt text', () => {
    render(<Hero />)

    const secondaryImage = screen.getByAltText(/Paperlyte note editor with bullet points/i)
    expect(secondaryImage).toBeInTheDocument()
    expect(secondaryImage).toHaveAttribute('src', '/mockups/note-detail.svg')
  })
})

describe('Hero - Section Props', () => {
  it('should render Section with correct id and padding', () => {
    const { container } = render(<Hero />)
    const section = container.querySelector('#hero')

    expect(section).toBeInTheDocument()
    expect(section).not.toBeNull()
    expect(hasClassContaining(section, 'padding-large')).toBe(true)
  })
})

describe('Hero - Accessibility', () => {
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

describe('Hero - Layout', () => {
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
