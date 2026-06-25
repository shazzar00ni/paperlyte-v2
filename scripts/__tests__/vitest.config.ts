import { defineConfig } from 'vitest/config'
import path from 'path'

// Vitest config specifically for scripts tests
// These tests need Node environment, not jsdom
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Don't use the src/test/setup.ts file which is for jsdom
    setupFiles: [],
    include: ['scripts/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
    },
  },
})
