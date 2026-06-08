import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // Setup files to run before each test file
    setupFiles: ['./src/test/setup.ts'],

    // Increase timeouts so component-rendering tests don't trip the default
    // 5s limit on slower CI runners, especially when v8 coverage instrumentation
    // is enabled (adds significant per-test overhead).
    testTimeout: process.env.CI ? 30000 : 5000,
    hookTimeout: process.env.CI ? 30000 : undefined,
    teardownTimeout: process.env.CI ? 30000 : undefined,

    // Global test utilities
    globals: true,

    // Add JUnit reporter — write to test-results/ so CircleCI's
    // store_test_results can ingest it alongside coverage artifacts.
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/junit.xml',
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Explicitly include all source files so files with zero test coverage
      // appear in the report (Vitest v4+ no longer includes them by default
      // after removing coverage.all).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/**',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        'scripts/**',
      ],
      // Ensure coverage artifacts are written even when tests fail so CI can
      // upload them for diagnosis (mirrors --coverage.reportOnFailure CLI flag).
      reportOnFailure: true,
      // Coverage thresholds (optional but recommended)
      // Note: These won't block coverage report generation
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        autoUpdate: false,
      },
    },

    // Limit CI to one fork worker to stay within CircleCI's 4 GB medium-class
    // limit. Keep per-file isolation enabled so mocks and browser globals cannot
    // leak between test files in the long-lived worker.
    ...(process.env.CI
      ? {
          pool: 'forks',
          maxWorkers: 1,
        }
      : {}),

    // Test file patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
