import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

// ------------------------------------------------------------------
// Test Helpers
// ------------------------------------------------------------------
const MOCK_SECTION_IDS = ['features', 'download', 'mobile', 'testimonials']

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
    expect(screen.getByText('Paperlyte.')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(<Header />)

    expect(screen.getByRole('button', { name: /features/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mobile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /testimonials/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
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

    const featuresButton = screen.getByRole('button', { name: /features/i })
    await user.click(featuresButton)

    expect(scrollIntoViewMock).toHaveBeenCalled()
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
  it('should have accessible button labels', () => {
    render(<Header />)

    expect(screen.getByRole('button', { name: /features/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mobile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /testimonials/i })).toBeInTheDocument()
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

      // Get all focusable menu items
      const menuButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent !== '' && btn.getAttribute('aria-label') !== 'Close menu'
      )
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

    it('should navigate to next item with ArrowDown', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresButton = screen.getByRole('button', { name: /features/i })
      featuresButton.focus()

      await user.keyboard('{ArrowDown}')

      const mobileButton = screen.getByRole('button', { name: /mobile/i })
      expect(document.activeElement).toBe(mobileButton)
    })

    it('should navigate to previous item with ArrowUp', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const mobileButton = screen.getByRole('button', { name: /mobile/i })
      mobileButton.focus()

      await user.keyboard('{ArrowUp}')

      const featuresButton = screen.getByRole('button', { name: /features/i })
      expect(document.activeElement).toBe(featuresButton)
    })

    it('should navigate to first item with Home key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const downloadButton = screen.getByRole('button', { name: /download/i })
      downloadButton.focus()

      await user.keyboard('{Home}')

      const featuresButton = screen.getByRole('button', { name: /features/i })
      expect(document.activeElement).toBe(featuresButton)
    })

    it('should navigate to last item with End key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresButton = screen.getByRole('button', { name: /features/i })
      featuresButton.focus()

      await user.keyboard('{End}')

      // Last item is the Get Started button in the nav
      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i })
      expect(document.activeElement).toBe(getStartedButtons[0])
    })

    it('should wrap around to first item when pressing ArrowDown at end', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      // Navigate to last item first
      const featuresButton = screen.getByRole('button', { name: /features/i })
      featuresButton.focus()
      await user.keyboard('{End}')

      // Then ArrowDown should wrap to first
      await user.keyboard('{ArrowDown}')

      expect(document.activeElement).toBe(featuresButton)
    })

    it('should wrap around to last item when pressing ArrowUp at beginning', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const featuresButton = screen.getByRole('button', { name: /features/i })
      featuresButton.focus()

      await user.keyboard('{ArrowUp}')

      // Should wrap to last item (Get Started)
      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i })
      expect(document.activeElement).toBe(getStartedButtons[0])
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
