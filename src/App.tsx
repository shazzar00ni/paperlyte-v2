import { useRef, useCallback, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
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

// Below-the-fold sections are lazy-loaded to reduce initial bundle size
const Statistics = lazy(() =>
  import('@components/sections/Statistics').then((m) => ({ default: m.Statistics }))
)
const Comparison = lazy(() =>
  import('@components/sections/Comparison').then((m) => ({ default: m.Comparison }))
)
const Testimonials = lazy(() =>
  import('@components/sections/Testimonials').then((m) => ({ default: m.Testimonials }))
)
const EmailCapture = lazy(() =>
  import('@components/sections/EmailCapture').then((m) => ({ default: m.EmailCapture }))
)
const FAQ = lazy(() => import('@components/sections/FAQ').then((m) => ({ default: m.FAQ })))
const CTA = lazy(() => import('@components/sections/CTA').then((m) => ({ default: m.CTA })))

/** Lightweight fallback shown while lazy sections are loading */
function SectionFallback() {
  return <div style={{ minHeight: '200px' }} aria-hidden="true" />
}

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
        <Suspense fallback={<SectionFallback />}>
          <Statistics />
          <Comparison />
          <Testimonials />
          <EmailCapture />
          <FAQ />
          <CTA />
        </Suspense>
      </main>
      <Footer />
      <FeedbackWidget />
      <Analytics />
    </ErrorBoundary>
  )
}

export default App
