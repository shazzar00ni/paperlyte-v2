import { useRef, useCallback, useEffect, lazy, Suspense } from 'react'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Problem } from '@components/sections/Problem'
import { Solution } from '@components/sections/Solution'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { FeedbackWidget } from '@components/ui/FeedbackWidget'
import { useAnalytics } from '@hooks/useAnalytics'
import { scrollToSection } from '@utils/navigation'

const Statistics = lazy(() =>
  import('@components/sections/Statistics').then((m) => ({ default: m.Statistics }))
)
const Comparison = lazy(() =>
  import('@components/sections/Comparison').then((m) => ({ default: m.Comparison }))
)
const Pricing = lazy(() =>
  import('@components/sections/Pricing').then((m) => ({ default: m.Pricing }))
)
const Testimonials = lazy(() =>
  import('@components/sections/Testimonials').then((m) => ({ default: m.Testimonials }))
)
const EmailCapture = lazy(() =>
  import('@components/sections/EmailCapture').then((m) => ({ default: m.EmailCapture }))
)
const FAQ = lazy(() => import('@components/sections/FAQ').then((m) => ({ default: m.FAQ })))
const CTA = lazy(() => import('@components/sections/CTA').then((m) => ({ default: m.CTA })))

/**
 * Application root component that composes the page layout and sections.
 *
 * Invokes analytics initialization (including scroll depth tracking) as a side effect.
 *
 * @returns The root JSX element rendering the application inside an ErrorBoundary.
 */
function App() {
  const mainRef = useRef<HTMLElement>(null)

  // Initialize analytics with scroll depth tracking
  useAnalytics()

  // Scroll to the section named in the URL hash on initial load. Native
  // browser hash-scrolling can't find sections that are still loading as
  // lazy chunks (e.g. a cross-page link to /#email-capture); scrollToSection
  // waits for the target to mount before scrolling.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      scrollToSection(hash)
    }
  }, [])

  const handleSkipToMain = useCallback(() => {
    mainRef.current?.focus()
  }, [])

  return (
    <ErrorBoundary>
      <a href="#main" className="skip-link" onClick={handleSkipToMain}>
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} ref={mainRef}>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Mobile />
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <Statistics />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <Comparison />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <Pricing />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <Testimonials />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <EmailCapture />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <FAQ />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={null}>
            <CTA />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <FeedbackWidget />
    </ErrorBoundary>
  )
}

export default App
