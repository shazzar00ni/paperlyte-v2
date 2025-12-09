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
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument()
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
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    await user.click(menuButton)
    expect(screen.getByRole('navigation')).not.toBeVisible()
  })

  it('should not close menu when Escape is pressed if menu is already closed', async () => {
    render(<Header />)
    const user = userEvent.setup()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('navigation')).not.toBeVisible()
  })

  it('should scroll to section when menu item clicked', async () => {
    render(<Header />)
    const user = userEvent.setup()
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    const menuItem = screen.getByRole('link', { name: /about/i })
    await user.click(menuItem)
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })
})