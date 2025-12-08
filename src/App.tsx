import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { Testimonials } from '@components/sections/Testimonials'
import { CTA } from '@components/sections/CTA'

/**
 * Root application component that composes the page layout and main sections.
 *
 * Renders the Header, a main content area (Hero, Features, Mobile, Testimonials, CTA), and Footer wrapped in an ErrorBoundary to isolate rendering/runtime errors.
 *
 * @returns The root React element for the application layout
 */
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Mobile />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </ErrorBoundary>
  )
}

export default App