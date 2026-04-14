/**
 * Application entry point.
 *
 * Responsibilities at startup (in order):
 * 1. Conditionally initialises Sentry error monitoring and session replay in
 *    production when `VITE_SENTRY_DSN` is set. Query parameters are stripped
 *    from request URLs in `beforeSend` to avoid leaking sensitive data.
 * 2. Calls `updateMetaTags()` to make Open Graph / Twitter Card URLs and the
 *    robots meta tag environment-aware (e.g. `noindex` in development).
 * 3. Mounts the `<App />` component inside React `StrictMode` on the `#root`
 *    DOM node.
 *
 * Font loading: Inter (Latin subset, weights 400–700) is imported as
 * self-hosted CSS to avoid external Google Fonts requests, improving both
 * security (no third-party DNS lookups) and performance (~800 KB bundle savings
 * via the Latin-only subset).
 *
 * Icon loading: `iconLibrary` is imported as a side-effect to register the
 * tree-shaken Font Awesome icon subset used by the application (~150–180 KB
 * savings vs. importing the full library).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
// Self-hosted Google Fonts (Inter) for better security and performance
// Using Latin-only subset to reduce bundle size (~800 KB savings)
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
// Font Awesome icon library (tree-shaken, ~150-180 KB savings)
// Only icons actually used in the app are imported
import './utils/iconLibrary'
import './index.css'
import App from './App.tsx'
import { updateMetaTags } from './utils/env'

// Initialize Sentry error monitoring in production
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance monitoring
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '0.1'),
    // Session replay
    replaysSessionSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'
    ),
    replaysOnErrorSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'
    ),
    // Additional configuration
    beforeSend(event) {
      // Filter out sensitive information
      if (event.request?.url) {
        // Remove query parameters that might contain sensitive data
        event.request.url = event.request.url.split('?')[0]
      }
      return event
    },
  })
}

// Initialize environment-aware meta tags
updateMetaTags()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
