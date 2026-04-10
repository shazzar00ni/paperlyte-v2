import { useRef, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Problem } from '@components/sections/Problem'
import { Solution } from '@components/sections/Solution'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { Statistics } from '@components/sections/Statistics'
import { Comparison } from '@components/sections/Comparison'
import { Testimonials } from '@components/sections/Testimonials'
import { EmailCapture } from '@components/sections/EmailCapture'
import { FAQ } from '@components/sections/FAQ'
import { CTA } from '@components/sections/CTA'
import { FeedbackWidget } from '@components/ui/FeedbackWidget'
import { useAnalytics } from '@hooks/useAnalytics'

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
        <Statistics />
        <Comparison />
        <Testimonials />
        <EmailCapture />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <FeedbackWidget />
      {/*
          Only render Vercel Analytics in production environments where the domain is not localhost.
          This prevents redundant script injection and console errors during development/testing.
      */}
      {import.meta.env.PROD && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (
        <Analytics />
      )}
    </ErrorBoundary>
  )
}

export default App
