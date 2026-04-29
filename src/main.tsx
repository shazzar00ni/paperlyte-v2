import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import * as monitoring from '@utils/monitoring'
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
    integrations: [Sentry.browserTracingIntegration()],
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

  const loadReplay = () => {
    import('@sentry/browser')
      .then(({ replayIntegration }) => {
        Sentry.addIntegration(replayIntegration({ maskAllText: true, blockAllMedia: true }))
      })
      .catch((error: unknown) => {
        monitoring.logError(
          error instanceof Error ? error : new Error(String(error)),
          { errorInfo: { component: 'loadReplay', action: 'import-replay' }, severity: 'medium' },
          'loadReplay'
        )
      })
  }

  if (typeof window.requestIdleCallback === 'function') {
    // Timeout ensures replay eventually loads even on a busy main thread
    window.requestIdleCallback(loadReplay, { timeout: 2000 })
  } else if (document.readyState === 'complete') {
    window.setTimeout(loadReplay, 0)
  } else {
    window.addEventListener('load', loadReplay, { once: true })
  }
}

// Initialize environment-aware meta tags
updateMetaTags()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
