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

/**
 * Root application component.
 *
 * @returns The root JSX element rendering the app: an ErrorBoundary wrapping
 * the Header, and a main element containing Hero, Features, Mobile, Statistics,
 * Comparison, Testimonials, and CTA sections, then the Footer.
 */
function App() {
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
