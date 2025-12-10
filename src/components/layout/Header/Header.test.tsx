import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Ensure scrollIntoView exists in jsdom
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {}
    }

    scrollIntoViewMock = vi.fn()
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoViewMock)

    // Mock key sections that header scrolls to
    const featuresSection = document.createElement('div')
    featuresSection.id = 'features'
    document.body.appendChild(featuresSection)

    const downloadSection = document.createElement('div')
    downloadSection.id = 'download'
    document.body.appendChild(downloadSection)

    const mobileSection = document.createElement('div')
    mobileSection.id = 'mobile'
    document.body.appendChild(mobileSection)

    const testimonialsSection = document.createElement('div')
    testimonialsSection.id = 'testimonials'
    document.body.appendChild(testimonialsSection)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.getElementById('features')?.remove()
    document.getElementById('download')?.remove()
    document.getElementById('mobile')?.remove()
    document.getElementById('testimonials')?.remove()
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
})
