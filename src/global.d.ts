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

  // Fathom Analytics
  fathom?: {
    trackPageview(options?: { url?: string; referrer?: string }): void
    trackGoal(code: string, cents?: number, props?: Record<string, string | number | boolean>): void
    enableTrackingForMe(): void
    blockTrackingForMe(): void
  }

  // Umami Analytics
  umami?: {
    track(eventName: string, props?: Record<string, string | number | boolean>): void
    track(data: { url?: string; referrer?: string; title?: string }): void
    track(callback: (props: Record<string, unknown>) => Record<string, unknown>): void
    identify(sessionData: Record<string, string | number | boolean>): void
  }

  // Simple Analytics
  sa_event?: (eventName: string, props?: Record<string, string | number | boolean>) => void
  sa_pageview?: (path: string) => void
}
