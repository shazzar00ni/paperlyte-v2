import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component that resets scroll position on route changes.
 *
 * This component listens to route changes via React Router's useLocation hook
 * and scrolls the window to the top whenever the pathname changes. This ensures
 * users always see the top of a new page when navigating between routes.
 *
 * Should be placed inside BrowserRouter but outside Routes.
 *
 * @example
 * ```tsx
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </BrowserRouter>
 * ```
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0)
  }, [pathname])

  // This component doesn't render anything
  return null
}
