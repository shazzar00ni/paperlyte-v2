// Global type declarations

interface Window {
  // Google Analytics 4
  dataLayer: unknown[]
  gtag?: (
    command: 'config' | 'event' | 'js' | 'set',
    targetIdOrEventName: string | Date,
    params?: Record<string, unknown>
  ) => void

  // Plausible Analytics
  plausible?: (
    eventName: string,
    options?: {
      props?: Record<string, string | number | boolean>
      callback?: () => void
    }
  ) => void
}
