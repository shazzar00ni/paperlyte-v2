import { useState, useEffect } from 'react'
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
import { EditorApp } from '@/editor/EditorApp'

function LandingPage() {
  useAnalytics()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
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
      <FeedbackWidget />
    </>
  )
}

function App() {
  const [route, setRoute] = useState(() =>
    window.location.hash === '#/app' ? 'editor' : 'landing'
  )

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash === '#/app' ? 'editor' : 'landing')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <ErrorBoundary>
      {route === 'editor' ? <EditorApp /> : <LandingPage />}
      <Analytics />
    </ErrorBoundary>
  )
}

export default App
