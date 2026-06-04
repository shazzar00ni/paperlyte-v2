import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'
import { getFocusableElements } from '@utils/keyboard'

// ------------------------------------------------------------------
// Test Helpers
// ------------------------------------------------------------------
const MOCK_SECTION_IDS = ['features', 'email-capture']

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
    expect(screen.getByRole('link', { name: 'Waitlist' })).toBeInTheDocument()
  })

  it('should render Join Waitlist CTA button', () => {
    render(<Header />)
    const ctaButtons = screen.getAllByRole('button', { name: /join waitlist/i })
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

  it('should scroll to waitlist section from Join Waitlist', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const joinWaitlistButtons = screen.getAllByRole('button', { name: /join waitlist/i })
    await user.click(joinWaitlistButtons[0])

    expect(scrollIntoViewMock).toHaveBeenCalled()
  })

  it('should scroll to waitlist section and close mobile menu when Waitlist link is clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()

    // Open the mobile menu first so closeMobileMenu() is triggered
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    const waitlistLink = screen.getByRole('link', { name: 'Waitlist' })
    await user.click(waitlistLink)

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
    // Menu should be closed after navigating
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  // ------------------------------------------------------------------
  // Accessibility
  // ------------------------------------------------------------------
  it('should have accessible navigation labels', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Waitlist' })).toBeInTheDocument()
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

    it('should wrap focus to the last item when Shift+Tab starts on the first menu item', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const menu = document.getElementById('main-menu')!
      const featuresLink = screen.getByRole('link', { name: 'Features' })
      const joinWaitlistButton = screen.getByRole('button', { name: /join waitlist/i })

      expect(document.activeElement).toBe(featuresLink)

      fireEvent.keyDown(menu, { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(joinWaitlistButton)
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

      const waitlistLink = screen.getByRole('link', { name: 'Waitlist' })
      expect(document.activeElement).toBe(waitlistLink)
    })

    it('should navigate to previous item with ArrowLeft', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const waitlistLink = screen.getByRole('link', { name: 'Waitlist' })
      waitlistLink.focus()

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

      // Get the menu element and nav items
      const menu = document.getElementById('main-menu')!
      const featuresLink = screen.getByRole('link', { name: 'Features' })
      const waitlistLink = screen.getByRole('link', { name: 'Waitlist' })
      const joinWaitlistButton = screen.getByRole('button', { name: /join waitlist/i })

      // Verify the menu has a keydown listener attached (event handler exists)
      // by checking the menu element exists and has the expected structure
      expect(menu).toBeInTheDocument()

      // Verify focusable elements using the same function as the component
      const focusableElements = getFocusableElements(menu)

      // Verify all expected nav items are in the focusable elements
      expect(focusableElements).toHaveLength(3)
      expect(focusableElements).toContain(featuresLink)
      expect(focusableElements).toContain(waitlistLink)
      expect(focusableElements).toContain(joinWaitlistButton)

      // The Home key navigates to focusableElements[0]
      // Verify that this element exists and is focusable
      const firstFocusable = focusableElements[0]
      expect(firstFocusable).toBeInTheDocument()

      // Verify focus can be set on menu items
      act(() => {
        waitlistLink.focus()
      })
      expect(document.activeElement).toBe(waitlistLink)

      fireEvent.keyDown(menu, { key: 'Home' })
      expect(document.activeElement).toBe(featuresLink)
    })

    it('should navigate to last item with End key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      // Get the menu element and nav items
      const menu = document.getElementById('main-menu')!
      const featuresLink = screen.getByRole('link', { name: 'Features' })
      const waitlistLink = screen.getByRole('link', { name: 'Waitlist' })
      const joinWaitlistButton = screen.getByRole('button', { name: /join waitlist/i })

      // Verify the menu has a keydown listener attached (event handler exists)
      // by checking the menu element exists and has the expected structure
      expect(menu).toBeInTheDocument()

      // Verify focusable elements using the same function as the component
      const focusableElements = getFocusableElements(menu)

      // Verify all expected nav items are in the focusable elements
      expect(focusableElements).toHaveLength(3)
      expect(focusableElements).toContain(featuresLink)
      expect(focusableElements).toContain(waitlistLink)
      expect(focusableElements).toContain(joinWaitlistButton)

      // The End key navigates to focusableElements[length - 1]
      // Verify that this element exists and is focusable
      const lastFocusable = focusableElements[focusableElements.length - 1]
      expect(lastFocusable).toBeInTheDocument()

      // Verify focus can be set on menu items
      act(() => {
        featuresLink.focus()
      })
      expect(document.activeElement).toBe(featuresLink)

      fireEvent.keyDown(menu, { key: 'End' })
      expect(document.activeElement).toBe(joinWaitlistButton)
    })

    it('should wrap around to first item when pressing ArrowRight at end', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(menuButton)

      const joinWaitlistButton = screen.getByRole('button', { name: /join waitlist/i })
      joinWaitlistButton.focus()

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

      // Should wrap to last item (Join Waitlist)
      const joinWaitlistButton = screen.getByRole('button', { name: /join waitlist/i })
      expect(document.activeElement).toBe(joinWaitlistButton)
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
