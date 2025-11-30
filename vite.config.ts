import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Plugin to inject environment-aware Content Security Policy
 *
 * Development: Relaxed CSP to allow Vite HMR (WebSockets + unsafe-eval)
 * Production: Strict CSP for maximum security
 */
function cspPlugin(): Plugin {
  let isDev = false

  return {
    name: 'csp-plugin',
    configResolved(config) {
      isDev = config.mode === 'development'
    },
    transformIndexHtml(html) {
      // Development CSP: Allow WebSockets for HMR and unsafe-eval for fast refresh
      const devCSP = `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

      // Production CSP: Strict policy without unsafe-eval or WebSocket access
      const prodCSP = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

      const csp = isDev ? devCSP : prodCSP

      // Inject CSP meta tag after the viewport meta tag
      return html.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `<meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Content Security Policy (environment-aware) -->
    <meta http-equiv="Content-Security-Policy" content="${csp}" />`
      )
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
