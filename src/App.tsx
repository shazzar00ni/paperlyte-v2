import { useEffect } from 'react'
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
import { analytics } from '@utils/analytics'

/**
 * Root application component that renders the app layout and initializes analytics on mount.
 *
 * @returns The root JSX element rendering the app: an ErrorBoundary wrapping
 * the Header, and a main element containing Hero, Problem, Solution, Features,
 * Mobile, Statistics, Comparison, Testimonials, EmailCapture, FAQ, and CTA sections,
 * then the Footer.
 */
function App() {
  // Initialize analytics on mount
  useEffect(() => {
    analytics.init()
  }, [])

  return (
    <ErrorBoundary>
      <Header />
      <main id="main">
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
    </ErrorBoundary>
  )
}

export default App
