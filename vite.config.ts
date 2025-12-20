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
      // - 'unsafe-inline' is required for Vite's dev server CSS injection during HMR
      // - ws: wss: enables WebSocket connections for Vite dev server HMR
      // - All fonts and icons are self-hosted (no external CDN dependencies)
      // - Fonts: @fontsource/inter, Icons: @fortawesome/fontawesome-free
      const devCSP = `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

      // Inject CSP meta tag before closing </head> tag (dev only)
      const cspMetaTag = `    <!-- Content Security Policy (development only) -->
    <meta http-equiv="Content-Security-Policy" content="${devCSP}" />
  </head>`

      const modifiedHtml = html.replace('</head>', cspMetaTag)

      // Warn if injection failed (no </head> tag found)
      if (modifiedHtml === html) {
        console.warn(
          '[csp-plugin] Warning: Could not inject CSP meta tag - </head> tag not found in HTML'
        )
      }

      return modifiedHtml
    },
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
      '@': path.resolve(__dirname, './src'),
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
    minify: 'terser',
    sourcemap: 'hidden',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split React and React DOM into separate vendor chunk
          const reactRegex = /node_modules[\\/](react|react-dom)[\\/]/
          if (reactRegex.test(id)) {
            return 'react-vendor'
          }
          // Keep all other node_modules in a single vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 1000, // Intentionally raised to suppress warnings for large vendor chunks. TODO: Monitor bundle size and lower if needed.
  },

  // Development server configuration
  server: {
    // Run dev server on port 3000
    port: 3000,
    // Automatically open browser when dev server starts
    open: true,
  },
})
