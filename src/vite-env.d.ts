/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * All client-side environment variables must be prefixed with VITE_
 */
interface ImportMetaEnv {
  /** Development mode flag */
  readonly DEV: boolean;
  /** Production mode flag */
  readonly PROD: boolean;
  /** Server-side rendering mode flag */
  readonly SSR: boolean;

  /** Enable/disable analytics */
  readonly VITE_ANALYTICS_ENABLED?: string;
  /** Analytics provider (plausible, fathom, umami, simple) */
  readonly VITE_ANALYTICS_PROVIDER?: string;
  /** Domain/site ID for analytics service */
  readonly VITE_ANALYTICS_DOMAIN?: string;
  /** Custom script URL for analytics provider */
  readonly VITE_ANALYTICS_SCRIPT_URL?: string;
  /** Enable debug mode for analytics */
  readonly VITE_ANALYTICS_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
