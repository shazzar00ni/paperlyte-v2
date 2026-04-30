import { lazy, Suspense, useRef, useCallback } from 'react'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { Hero } from '@components/sections/Hero'
import { Problem } from '@components/sections/Problem'
import { Solution } from '@components/sections/Solution'
import { Features } from '@components/sections/Features'
import { Mobile } from '@components/sections/Mobile'
import { useAnalytics } from '@hooks/useAnalytics'
import './App.css'

const Statistics = lazy(() => import('@components/sections/Statistics'))
const Comparison = lazy(() => import('@components/sections/Comparison'))
const Testimonials = lazy(() => import('@components/sections/Testimonials'))
const EmailCapture = lazy(() => import('@components/sections/EmailCapture'))
const FAQ = lazy(() => import('@components/sections/FAQ'))
const CTA = lazy(() => import('@components/sections/CTA'))
// TODO(perf/ux): FeedbackWidget is a floating button visible on every page,
// so lazy-loading it introduces a small visibility gap on slow connections.
// The zero-size Suspense fallback prevents CLS, but consider prefetching this
// chunk during idle time (e.g. via a useEffect(() => { import('...') }, []) in
// App) or reverting to an eager import if the bundle size is small.
const FeedbackWidget = lazy(() => import('@components/ui/FeedbackWidget'))

// Dynamic import keeps @vercel/analytics out of non-Vercel bundles entirely.
// On Netlify builds, the constant-folded `VITE_DEPLOY_TARGET !== 'vercel'`
// guard below means this import() call is never reached, and Rollup elides
// the module from the bundle.
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics }))
)

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
    <>
    <ErrorBoundary>
      {/* TODO(a11y): Duplicate skip-link — index.html:94 already renders one
          pre-hydration. Pick one (prefer the static HTML link) and remove the
          other to avoid two skip-to-main targets in the DOM. */}
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
        <Suspense fallback={<div className="suspense-statistics" role="status"><span className="sr-only">Loading statistics…</span></div>}>
          <Statistics />
        </Suspense>
        <Suspense fallback={<div className="suspense-comparison" role="status"><span className="sr-only">Loading comparison…</span></div>}>
          <Comparison />
        </Suspense>
        <Suspense fallback={<div className="suspense-testimonials" role="status"><span className="sr-only">Loading testimonials…</span></div>}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<div className="suspense-email-capture" role="status"><span className="sr-only">Loading sign-up form…</span></div>}>
          <EmailCapture />
        </Suspense>
        <Suspense fallback={<div className="suspense-faq" role="status"><span className="sr-only">Loading FAQ…</span></div>}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<div className="suspense-cta" role="status"><span className="sr-only">Loading call to action…</span></div>}>
          <CTA />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={<div className="suspense-feedback" role="status"><span className="sr-only">Loading feedback widget…</span></div>}>
        <FeedbackWidget />
      </Suspense>
    </ErrorBoundary>
    {/* Render @vercel/analytics outside the main ErrorBoundary so a render
        failure in the analytics library can never blank the entire page.
        Only render on Vercel deployments — on Netlify the beacons go nowhere
        useful and add unnecessary network requests; see memory/decisions.md.
        VITE_DEPLOY_TARGET is set to "vercel" via vercel.json's build env and
        is undefined on Netlify builds. */}
    {import.meta.env.VITE_DEPLOY_TARGET === 'vercel' && (
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </ErrorBoundary>
    )}
    </>
  )
}

export default App
