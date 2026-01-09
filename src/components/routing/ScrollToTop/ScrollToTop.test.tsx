import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ScrollToTop } from './ScrollToTop'

describe('ScrollToTop', () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock window.scrollTo
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    scrollToSpy.mockRestore()
  })

  it('should scroll to top on mount', () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    )

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
  })

  it('should scroll to top when pathname changes', () => {
    // Component that triggers navigation
    function TestNavigator() {
      const navigate = useNavigate()
      return (
        <button onClick={() => navigate('/new-page')} data-testid="navigate-btn">
          Navigate
        </button>
      )
    }

    const { getByTestId, rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<TestNavigator />} />
          <Route path="/new-page" element={<div>New Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Initial mount should scroll
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    scrollToSpy.mockClear()

    // Trigger navigation
    getByTestId('navigate-btn').click()

    // Wait for re-render after navigation
    rerender(
      <MemoryRouter initialEntries={['/new-page']}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<TestNavigator />} />
          <Route path="/new-page" element={<div>New Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Should scroll to top after navigation
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
  })

  it('should not render any visible content', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    )

    // Component should not render anything
    expect(container.firstChild).toBeNull()
  })

  it('should not scroll when pathname stays the same', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/same-page']}>
        <ScrollToTop />
      </MemoryRouter>
    )

    // Initial mount
    expect(scrollToSpy).toHaveBeenCalledTimes(1)
    scrollToSpy.mockClear()

    // Re-render with same path
    rerender(
      <MemoryRouter initialEntries={['/same-page']}>
        <ScrollToTop />
      </MemoryRouter>
    )

    // Should not scroll again since pathname didn't change
    expect(scrollToSpy).not.toHaveBeenCalled()
  })

  it('should handle hash changes without scrolling to top', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/page']}>
        <ScrollToTop />
      </MemoryRouter>
    )

    scrollToSpy.mockClear()

    // Navigate to hash on same page
    rerender(
      <MemoryRouter initialEntries={['/page#section']}>
        <ScrollToTop />
      </MemoryRouter>
    )

    // Should not scroll for hash-only changes (pathname is the same)
    expect(scrollToSpy).not.toHaveBeenCalled()
  })
})
