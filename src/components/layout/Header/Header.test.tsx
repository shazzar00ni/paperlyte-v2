import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Ensure scrollIntoView exists (jsdom doesn't define it by default)
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {}
    }

    // Mock the scrollIntoView method
    scrollIntoViewMock = vi.fn()
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoViewMock)

    // Create mock section elements that the header scrolls to
    const featuresSection = document.createElement('div')
    featuresSection.id = 'features'
    document.body.appendChild(featuresSection)

    const downloadSection = document.createElement('div')
    downloadSection.id = 'download'
    document.body.appendChild(downloadSection)
  })

  afterEach(() => {
    // Restore mocks
    vi.restoreAllMocks()

    // Clean up mock sections
    document.getElementById('features')?.remove()
    document.getElementById('download')?.remove()
  })

  it('should render the header with logo', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    // Logo is now text-based with icon
    expect(screen.getByText('Paperlyte')).toBeInTheDocument()
  })

  it('should open menu when menu button is clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    expect(screen.getByRole('navigation')).toBeVisible()
  })

  it('should close menu when menu button is clicked again', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    // Open menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    // Close menu - button now says "Close menu"
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    await user.click(closeButton)
    expect(closeButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not close menu when Escape is pressed if menu is already closed', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    // Menu starts closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    // Press Escape when menu is already closed
    await user.keyboard('{Escape}')
    // Menu should still be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should scroll to section when menu item clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)
    // Nav items are buttons, not links
    const menuItem = screen.getByRole('button', { name: /features/i })
    await user.click(menuItem)
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })
})
