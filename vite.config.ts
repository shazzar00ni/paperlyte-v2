import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Plugin to inject development-only Content Security Policy
 *
 * Development: Relaxed CSP meta tag to allow Vite HMR (WebSockets + unsafe-eval)
 * Production: CSP delivered via HTTP headers in vercel.json (supports frame-ancestors)
 *
 * Note: Meta tag CSP cannot enforce frame-ancestors and lacks initial-response protection.
 * Production uses proper HTTP headers configured in vercel.json.
 *
 * SECURITY NOTICE - Development unsafe-eval:
 * The development CSP includes 'unsafe-eval' which permits eval() execution. This is
 * required for Vite's Hot Module Replacement (HMR) and React Fast Refresh to function.
 *
 * Risk: If malicious code is introduced during development (e.g., compromised npm package,
 * malicious browser extension), unsafe-eval could be exploited for code execution.
 *
 * Mitigation:
 * - Production CSP (vercel.json) does NOT include unsafe-eval (strict policy)
 * - Only run trusted code in development environment
 * - Regularly audit dependencies with `npm audit`
 * - Use lock files (package-lock.json) to prevent supply chain attacks
 * - Consider using browser profiles dedicated to development (no untrusted extensions)
 *
 * Alternative approaches (not currently implemented):
 * - Nonce-based CSP: Would require server-side nonce generation for each dev request
 * - Disable CSP in dev: Would lose all CSP protection during development
 * Current approach balances security with developer experience (standard Vite practice).
 */
function cspPlugin(): Plugin {
  let isDev = false

  return {
    name: 'csp-plugin',
    configResolved(config) {
      isDev = config.mode === 'development'
    },
    transformIndexHtml(html) {
      // Only inject CSP meta tag in development mode
      // Production CSP is delivered via HTTP headers in vercel.json
      if (!isDev) {
        return html
      }

      // Development CSP: Allow WebSockets for HMR and unsafe-eval for fast refresh
      // - 'unsafe-eval' is required for Vite's HMR and React Fast Refresh (development only)
      // - ws:/wss: enables WebSocket connections for Vite dev server HMR
      // - Font Awesome icons loaded from CDN require cdnjs in style-src
      // - Fonts are self-hosted via @fontsource/inter (no external font CDN)
      // - No unsafe-inline needed - all styles use external CSS or CSS modules
      const devCSP = `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' https://cdnjs.cloudflare.com; font-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

      // Inject CSP meta tag before closing </head> tag (dev only)
      const cspMetaTag = `    <!-- Content Security Policy (development only) -->
    <meta http-equiv="Content-Security-Policy" content="${devCSP}" />
  </head>`

      const modifiedHtml = html.replace('</head>', cspMetaTag)

      // Warn if injection failed (no </head> tag found)
      if (modifiedHtml === html) {
        console.warn('[csp-plugin] Warning: Could not inject CSP meta tag - </head> tag not found in HTML')
      }

      return modifiedHtml
    }
  }
}

/**
 * Vite configuration for Paperlyte
 *
 * This configuration sets up:
 * - React Fast Refresh for instant HMR
 * - Path aliases for cleaner imports
 * - Production build optimizations
 * - Development server settings
 * - Environment-aware Content Security Policy
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // React plugin with Fast Refresh for instant Hot Module Replacement
  // CSP plugin for environment-aware security headers
  plugins: [react(), cspPlugin()],

  // Path resolution configuration
  resolve: {
    alias: {
      // Base alias for src directory
      '@': path.resolve(__dirname, './src'),
      // Component-specific aliases for better import paths
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Production build configuration
  build: {
    // Split CSS into separate files for better caching
    cssCodeSplit: true,
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Rollup-specific options for advanced bundling
    rollupOptions: {
      output: {
        // Separate React libraries into their own chunk for better caching
        // This ensures React/ReactDOM don't get re-downloaded when app code changes
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },

  // Development server configuration
  server: {
    // Run dev server on port 3000
    port: 3000,
    // Automatically open browser when dev server starts
    open: true,
  },
})
