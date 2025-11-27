import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite configuration for Paperlyte
 *
 * This configuration sets up:
 * - React Fast Refresh for instant HMR
 * - Path aliases for cleaner imports
 * - Production build optimizations
 * - Development server settings
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // React plugin with Fast Refresh for instant Hot Module Replacement
  plugins: [react()],

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
