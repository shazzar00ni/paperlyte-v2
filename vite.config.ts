import { defineConfig } from 'vite'
import type { Plugin, IndexHtmlTransformContext, HtmlTagDescriptor } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { codecovRollupPlugin } from '@codecov/rollup-plugin'

/**
 * Regular expression that matches only the Inter latin static font files
 * explicitly imported in main.tsx:
 *   @fontsource/inter/latin-400.css → inter-latin-400-normal-[hash].woff2
 *   @fontsource/inter/latin-500.css → inter-latin-500-normal-[hash].woff2
 *   @fontsource/inter/latin-600.css → inter-latin-600-normal-[hash].woff2
 *   @fontsource/inter/latin-700.css → inter-latin-700-normal-[hash].woff2
 */
const INTER_FONT_PATTERN = /inter-latin-\d+-normal-[^/]+\.woff2$/

/**
 * Vite plugin that injects `<link rel="preload">` tags for bundled Inter latin
 * woff2 fonts into the production HTML.
 *
 * Fonts discovered via CSS `@font-face` create a depth-2 critical-request chain
 * (HTML → CSS → fonts) that fails the `network-dependency-tree-insight` Lighthouse
 * assertion. Preloading moves the fonts to depth 1 so they load in parallel with CSS.
 *
 * Only the four Inter latin weights imported in `main.tsx` are preloaded (matched by
 * {@link INTER_FONT_PATTERN}). Preloading every `.woff2` in the bundle would
 * unnecessarily prioritise fonts not needed for the initial render.
 *
 * @returns A Vite {@link Plugin} that runs during the `build` phase only.
 */
function fontPreloadPlugin(): Plugin {
  return {
    name: 'font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html: string, ctx: IndexHtmlTransformContext): HtmlTagDescriptor[] | void {
        const bundle = ctx.bundle
        if (!bundle) return
        return Object.keys(bundle)
          .filter((key) => INTER_FONT_PATTERN.test(key))
          .sort()
          .map((key) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              href: `/${key}`,
              as: 'font',
              type: 'font/woff2',
              crossorigin: 'anonymous',
            },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

/**
 * Plugin to inject development-only Content Security Policy
 *
 * Development: Relaxed CSP meta tag to allow Vite HMR (WebSockets + unsafe-eval)
 * Production (Netlify): CSP set dynamically by the WAF edge function with a per-request
 * nonce + 'strict-dynamic'. This eliminates host-allowlist bypass vectors.
 * Production (Vercel fallback): Static CSP header in vercel.json (host-allowlist only;
 * nonce injection requires an edge function not yet wired for Vercel).
 * HTTP headers support frame-ancestors; meta tags do not.
 *
 * Note: Meta tag CSP cannot enforce frame-ancestors and lacks initial-response protection.
 * Production uses proper HTTP headers configured in netlify.toml.
 *
 * SECURITY NOTICE - Development unsafe-eval:
 * The development CSP includes 'unsafe-eval' which permits eval() execution. This is
 * required for Vite's Hot Module Replacement (HMR) and React Fast Refresh to function.
 *
 * Risk: If malicious code is introduced during development (e.g., compromised npm package,
 * malicious browser extension), unsafe-eval could be exploited for code execution.
 *
 * Mitigation:
 * - Production CSP (netlify.toml) does NOT include unsafe-eval (strict policy)
 * - Only run trusted code in development environment
 * - Regularly audit dependencies with `npm audit`
 * - Use lock files (package-lock.json) to prevent supply chain attacks
 * - Consider using browser profiles dedicated to development (no untrusted extensions)
 *
 * Note: Production (Netlify) uses nonce-based CSP via the WAF edge function.
 * Dev still uses 'unsafe-eval'/'unsafe-inline' — nonces aren't feasible here
 * because there is no server to generate them on each HMR request.
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
      // Production CSP is delivered via HTTP headers in netlify.toml
      if (!isDev) {
        return html
      }

      // Development CSP: Allow WebSockets for HMR and unsafe-eval for fast refresh
      // - 'unsafe-eval' is required for Vite's HMR and React Fast Refresh (development only)
      // - 'unsafe-inline' is required for Vite's dev server CSS injection during HMR
      // - ws: wss: enables WebSocket connections for Vite dev server HMR
      // - All fonts and icons are self-hosted (no external CDN dependencies)
      // - Fonts: @fontsource/inter, Icons: bundled custom SVG paths
      const devCSP = `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss:; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

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
  // Codecov Rollup plugin for bundle analysis (Vite 8 compatible)
  // Note: Using @codecov/rollup-plugin instead of @codecov/vite-plugin
  // because the Vite plugin only supports Vite 4.x-6.x (project uses Vite 8.0.10)
  // Rollup plugin works with Vite 8 since Vite uses Rollup ^4.43.0 internally
  plugins: [
    react(),
    cspPlugin(),
    fontPreloadPlugin(),
    // Only instantiate Codecov plugin when token is present (CI environment)
    ...(process.env.CODECOV_TOKEN
      ? [
          codecovRollupPlugin({
            enableBundleAnalysis: true,
            bundleName: 'paperlyte-v2',
            uploadToken: process.env.CODECOV_TOKEN,
          }),
        ]
      : []),
  ],

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
    // Use esbuild for minification (explicit devDependency, supported by Vite 8)
    minify: 'esbuild',
    // Target modern browsers for smaller bundle sizes
    target: 'es2020',
    // Enable CSS minification
    cssMinify: true,
    // Rollup-specific options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and load performance
        // Strategy: Only split large vendor libraries that change infrequently
        manualChunks(id) {
          // React vendor bundle (~190KB) - changes rarely, good cache hit rate
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          // Keep app code together for better tree-shaking and compression
          // Small chunks (constants, utils, UI components) stay in main bundle
          // This reduces HTTP requests and improves compression ratio
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Keep default warning limit (500kb) to catch performance issues early
    // If warnings appear, investigate and optimize rather than suppressing
  },

  // Development server configuration
  server: {
    // Run dev server on port 3000
    port: 3000,
    // Automatically open browser when dev server starts
    open: true,
  },
})
