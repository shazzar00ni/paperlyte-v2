import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Features } from '@components/sections/Features'
import { Statistics } from '@components/sections/Statistics'
import { Comparison } from '@components/sections/Comparison'
import { Testimonials } from '@components/sections/Testimonials'
import { Pricing } from '@components/sections/Pricing'
import { FAQ } from '@components/sections/FAQ'
import { CTA } from '@components/sections/CTA'

/**
 * Top-level application component that composes the page layout and sections.
 *
 * @returns The root JSX element rendering the app: an ErrorBoundary wrapping the Header, a `main` element containing Hero, Features, Statistics, Comparison, Testimonials, Pricing, FAQ, and CTA sections, and the Footer.
 */
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Statistics />
        <Comparison />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </ErrorBoundary>
  )
}

export default App
