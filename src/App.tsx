import { useEffect } from 'react'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { Statistics } from '@components/sections/Statistics'
import { Comparison } from '@components/sections/Comparison'
import { Testimonials } from '@components/sections/Testimonials'
import { CTA } from '@components/sections/CTA'
import { analytics } from '@/analytics'
import { getAnalyticsConfig } from '@/analytics/config'

/**
 * Root application component.
 *
 * Initializes privacy-first analytics on mount and renders the full landing page
 * with all sections wrapped in an ErrorBoundary for resilience.
 *
 * @returns The root JSX element rendering the app: an ErrorBoundary wrapping
 * the Header, and a main element containing Hero, Features, Mobile, Statistics,
 * Comparison, Testimonials, and CTA sections, then the Footer.
 */
function App() {
  // Initialize analytics on app mount
  useEffect(() => {
    const config = getAnalyticsConfig()

    if (config) {
      analytics.init(config)

      // Only log in development or debug mode to avoid console pollution in production
      if (config.debug || import.meta.env.DEV) {
        console.log('[App] Analytics initialized successfully')
      }
    } else if (import.meta.env.DEV) {
      // Only log this message in development to avoid leaking configuration details
      console.log('[App] Analytics disabled (no configuration found)')
    }
  }, [])

  return (
    <ErrorBoundary>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Mobile />
        <Statistics />
        <Comparison />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </ErrorBoundary>
  )
}

export default App
