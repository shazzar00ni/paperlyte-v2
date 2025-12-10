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
  })

  afterEach(() => {
    // Restore mocks
    vi.restoreAllMocks()
  })

  it('should render the header with logo', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
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
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not close menu when Escape is pressed if menu is already closed', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{Escape}')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should scroll to section when menu item clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()

    // Create a mock element for scrollToSection to find
    const mockSection = document.createElement('section')
    mockSection.id = 'features'
    mockSection.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(mockSection)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    const menuItem = screen.getByRole('button', { name: /features/i })
    await user.click(menuItem)

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

    // Cleanup
    document.body.removeChild(mockSection)
  })
})