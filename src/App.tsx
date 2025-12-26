import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Features } from '@components/sections/Features'
import { CTA } from '@components/sections/CTA'
import { FeedbackWidget } from '@components/ui/FeedbackWidget'

/**
 * Root application component that renders the app layout.
 *
 * Renders the Header, main content area (Hero, Features, and CTA sections), Footer, and FeedbackWidget, all wrapped in an ErrorBoundary.
 *
 * @returns The top-level React element for the application.
 */
function App() {
  return (
    <ErrorBoundary>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
      <FeedbackWidget />
    </ErrorBoundary>
  )
}

export default App
