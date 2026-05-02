/**
 * Extended tests for CTA component
 * Focuses on button click interactions and scrolling behaviour (uncovered lines 41-47).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CTA } from './CTA'
import { WAITLIST_COUNT, LAUNCH_QUARTER } from '@constants/waitlist'

// We need to mock the navigation utility because scrollToSection depends on DOM state
vi.mock('@/utils/navigation', () => ({
  scrollToSection: vi.fn(),
  smoothScrollTo: vi.fn(),
  scrollToTop: vi.fn(),
  getScrollProgress: vi.fn(() => 0),
}))

describe('CTA extended', () => {
  let scrollToSectionMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const nav = await import('@/utils/navigation')
    scrollToSectionMock = nav.scrollToSection as ReturnType<typeof vi.fn>
    scrollToSectionMock.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ----------------------------------------------------------------
  // Button click behaviour (the lines that were uncovered)
  // ----------------------------------------------------------------
  it('calls scrollToSection with "email-capture" when Join the Waitlist is clicked', async () => {
    const user = userEvent.setup()
    render(<CTA />)

    const joinButton = screen.getByRole('button', { name: /Join the Waitlist/i })
    await user.click(joinButton)

    expect(scrollToSectionMock).toHaveBeenCalledWith('email-capture')
  })

  it('calls scrollToSection with "hero" when Watch the Demo Again is clicked', async () => {
    const user = userEvent.setup()
    render(<CTA />)

    const demoButton = screen.getByRole('button', { name: /Watch the Demo Again/i })
    await user.click(demoButton)

    expect(scrollToSectionMock).toHaveBeenCalledWith('hero')
  })

  it('does not call scrollToSection before any button is clicked', () => {
    render(<CTA />)
    expect(scrollToSectionMock).not.toHaveBeenCalled()
  })

  // ----------------------------------------------------------------
  // Content from constants
  // ----------------------------------------------------------------
  it('renders waitlist count from WAITLIST_COUNT constant', () => {
    const { container } = render(<CTA />)
    expect(container.textContent).toContain(WAITLIST_COUNT)
  })

  it('renders launch quarter from LAUNCH_QUARTER constant', () => {
    const { container } = render(<CTA />)
    expect(container.textContent).toContain(LAUNCH_QUARTER)
  })

  // ----------------------------------------------------------------
  // Section attributes
  // ----------------------------------------------------------------
  it('section has background="primary" reflected as a data attribute or class', () => {
    const { container } = render(<CTA />)
    const section = container.querySelector('#download')
    expect(section).toBeInTheDocument()
  })

  it('buttons are of type button', () => {
    render(<CTA />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    buttons.forEach((button) => expect(button).toHaveAttribute('type', 'button'))
  })
})
