import { Routes, Route } from 'react-router-dom'
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
import { Privacy } from '@components/pages/Privacy'
import { Terms } from '@components/pages/Terms'
import { FeedbackWidget } from '@components/ui/FeedbackWidget'
import { useAnalytics } from '@hooks/useAnalytics'

/**
 * Root application component that renders the app layout.
 * Initializes analytics tracking including scroll depth tracking.
 *
 * @returns The root JSX element rendering the app: an ErrorBoundary wrapping
 * the Header, and a main element containing Hero, Problem, Solution, Features,
 * Mobile, Statistics, Comparison, Testimonials, EmailCapture, FAQ, and CTA sections,
 * then the Footer and FeedbackWidget.
 */
function App() {
  // Initialize analytics with scroll depth tracking
  useAnalytics()

  return (
    <ErrorBoundary>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
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
              </>
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      <Footer />
      <FeedbackWidget />
    </ErrorBoundary>
  )
}

export default App
