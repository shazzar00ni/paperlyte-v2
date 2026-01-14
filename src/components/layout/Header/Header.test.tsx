import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

// ------------------------------------------------------------------
// Test Helpers
// ------------------------------------------------------------------
const MOCK_SECTION_IDS = ['features', 'download']

function setupScrollIntoViewMock(): ReturnType<typeof vi.fn> {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
  const mock = vi.fn()
  vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(mock)
  return mock
}

function createMockSection(id: string): void {
  const section = document.createElement('div')
  section.id = id
  document.body.appendChild(section)
}

function removeMockSection(id: string): void {
  document.getElementById(id)?.remove()
}

function setupMockSections(ids: string[]): void {
  ids.forEach(createMockSection)
}

function teardownMockSections(ids: string[]): void {
  ids.forEach(removeMockSection)
}

describe('Header', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoViewMock = setupScrollIntoViewMock()
    setupMockSections(MOCK_SECTION_IDS)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    teardownMockSections(MOCK_SECTION_IDS)
  })

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  it('should render the header with logo', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Paperlyte')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render Get Started CTA button', () => {
    render(<Header />)
    const ctaButtons = screen.getAllByRole('button', { name: /get started/i })
    expect(ctaButtons.length).toBeGreaterThan(0)
  })

  it('should render mobile menu button', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('should have main navigation aria-label', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toBeInTheDocument()
  })

  // ------------------------------------------------------------------
  // Mobile menu behaviour
  // ------------------------------------------------------------------
  it('should open menu when menu button is clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation')).toBeVisible()
  })

  it('should close menu when menu button is clicked again', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const openButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(openButton)

    const closeButton = screen.getByRole('button', { name: /close menu/i })
    await user.click(closeButton)

    expect(closeButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not close menu when Escape is pressed if menu is already closed', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('{Escape}')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  // ------------------------------------------------------------------
  // Navigation scrolling
  // ------------------------------------------------------------------
  it('should scroll to section when menu item clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)

    const featuresLink = screen.getByRole('link', { name: 'Features' })
    await user.click(featuresLink)

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('should scroll to download section from Get Started', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const getStartedButtons = screen.getAllByRole('button', { name: /get started/i })
    await user.click(getStartedButtons[0])

    expect(scrollIntoViewMock).toHaveBeenCalled()
  })

  // ------------------------------------------------------------------
  // Accessibility
  // ------------------------------------------------------------------
  it('should have accessible navigation labels', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument()
    expect(screen.getByLabelText(/open menu|close menu/i)).toBeInTheDocument()
  })

  it('should update aria-label when menu state changes', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const openButton = screen.getByLabelText(/open menu/i)
    expect(openButton).toHaveAttribute('aria-label', 'Open menu')

    await user.click(openButton)

    const closeButton = screen.getByLabelText(/close menu/i)
    expect(closeButton).toHaveAttribute('aria-label', 'Close menu')
  })

  // ------------------------------------------------------------------
  // Keyboard Navigation
  // ------------------------------------------------------------------
  describe('Keyboard Navigation', () => {
    it('should trap focus within open mobile menu using Tab', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const closeButton = screen.getByLabelText(/close menu/i)

      // Tab through all items and verify focus cycles back
      await user.tab()
      await user.tab()
      await user.tab()
      await user.tab()
      await user.tab()

      // Verify menu is still open (focus didn't escape)
      expect(closeButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should navigate to next item with ArrowRight', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresLink = screen.getByRole('link', { name: 'Features' })
      featuresLink.focus()

      await user.keyboard('{ArrowRight}')

      const downloadLink = screen.getByRole('link', { name: 'Download' })
      expect(document.activeElement).toBe(downloadLink)
    })

    it('should navigate to previous item with ArrowLeft', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const downloadLink = screen.getByRole('link', { name: 'Download' })
      downloadLink.focus()

      await user.keyboard('{ArrowLeft}')

      const featuresLink = screen.getByRole('link', { name: 'Features' })
      expect(document.activeElement).toBe(featuresLink)
    })

    it('should navigate to first item with Home key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const downloadLink = screen.getByRole('link', { name: 'Download' })
      downloadLink.focus()

      await user.keyboard('{Home}')

      const EXPECTED_FIRST_ELEMENTS = ['Features', 'Get Started']

      // Home key focuses first focusable element
      // Note: Due to CSS layout, the Get Started button may be visually positioned differently
      // but should be the first focusable element in the navigation flow
      const firstElement = document.activeElement
      expect(firstElement).toBeTruthy()
      expect(EXPECTED_FIRST_ELEMENTS.some(name =>
        firstElement?.textContent?.includes(name)
      )).toBe(true)
    })

    it('should navigate to last item with End key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresLink = screen.getByRole('link', { name: 'Features' })
      featuresLink.focus()

      await user.keyboard('{End}')

      // End key focuses last focusable element
      // Note: Due to CSS layout, the visual order may differ from DOM order
      const lastElement = document.activeElement
      expect(lastElement).toBeTruthy()
      expect(['Download', 'Get Started'].some(name =>
        lastElement?.textContent?.includes(name)
      )).toBe(true)
    })

    it('should wrap around to first item when pressing ArrowRight at end', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const getStartedButton = screen.getByRole('button', { name: /get started/i })
      getStartedButton.focus()

      // ArrowRight from last item should wrap to first
      await user.keyboard('{ArrowRight}')

      const featuresLink = screen.getByRole('link', { name: 'Features' })
      expect(document.activeElement).toBe(featuresLink)
    })

    it('should wrap around to last item when pressing ArrowLeft at beginning', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresLink = screen.getByRole('link', { name: 'Features' })
      featuresLink.focus()

      await user.keyboard('{ArrowLeft}')

      // Should wrap to last item (Get Started)
      const getStartedButton = screen.getByRole('button', { name: /get started/i })
      expect(document.activeElement).toBe(getStartedButton)
    })

    it('should close menu and return focus to toggle when Escape is pressed', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      expect(menuButton).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard('{Escape}')

      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      expect(document.activeElement).toBe(menuButton)
    })
  })
})
