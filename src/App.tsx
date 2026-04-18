import { lazy, Suspense, useRef, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Problem } from '@components/sections/Problem'
import { Solution } from '@components/sections/Solution'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { useAnalytics } from '@hooks/useAnalytics'

const Statistics = lazy(() => import('@components/sections/Statistics/index'))
const Comparison = lazy(() => import('@components/sections/Comparison/index'))
const Testimonials = lazy(() => import('@components/sections/Testimonials/index'))
const EmailCapture = lazy(() => import('@components/sections/EmailCapture/index'))
const FAQ = lazy(() => import('@components/sections/FAQ/index'))
const CTA = lazy(() => import('@components/sections/CTA/index'))
const FeedbackWidget = lazy(() => import('@components/ui/FeedbackWidget/index'))

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
        <Suspense fallback={<div style={{ minHeight: '28rem' }} aria-hidden="true" />}>
          <Statistics />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '40rem' }} aria-hidden="true" />}>
          <Comparison />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '32rem' }} aria-hidden="true" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '20rem' }} aria-hidden="true" />}>
          <EmailCapture />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '36rem' }} aria-hidden="true" />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '20rem' }} aria-hidden="true" />}>
          <CTA />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={<div style={{ width: '3.5rem', height: '3.5rem' }} aria-hidden="true" />}>
        <FeedbackWidget />
      </Suspense>
      <Analytics />
    </ErrorBoundary>
  )
}

export default App
