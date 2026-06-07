import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// When CIRCLECI_COVERAGE is set, the @circleci/vitest-circleci-coverage plugin
// replaces the default runner and reporter so CircleCI Smarter Testing can
// build the test-impact coverage map.  Install the plugin first:
//   npx jsr@latest add @circleci/vitest-circleci-coverage
// Then uncomment the `analysis` command in .circleci/test-suites.yml, which
// sets CIRCLECI_COVERAGE to the output path before invoking vitest.
const circleCICoverage = process.env.CIRCLECI_COVERAGE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // CircleCI Smarter Testing: use coverage runner/reporter when collecting
    // the test-impact map; fall back to the standard reporters otherwise.
    // The two configurations are mutually exclusive — circleCICoverage takes
    // over completely so the coverage map is built without conflicting output.
    ...(circleCICoverage
      ? {
          runner: '@circleci/vitest-circleci-coverage/runner',
          reporters: ['@circleci/vitest-circleci-coverage/reporter'],
        }
      : {
          // JUnit report lets CircleCI store_test_results ingest pass/fail
          // history and feed timing data back to dynamic_batching.
          reporters: ['default', 'junit'],
          outputFile: { junit: 'test-results/junit.xml' },
        }),

    // Setup files to run before each test file
    setupFiles: ['./src/test/setup.ts'],

    // In CI, increase timeouts so component-rendering and hook/teardown work
    // doesn't trip limits on slower runners (especially with v8 coverage
    // instrumentation, which adds significant per-test overhead).
    // Locally, keep testTimeout at 5 s for fast feedback; leave hookTimeout
    // and teardownTimeout undefined so Vitest's higher defaults apply and
    // avoid flakiness on slower developer machines.
    testTimeout: process.env.CI ? 30000 : 5000,
    hookTimeout: process.env.CI ? 30000 : undefined,
    teardownTimeout: process.env.CI ? 30000 : undefined,

    // Global test utilities
    globals: true,


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

    // Serialise test execution in CI to stay within CircleCI's 4 GB memory budget
    // (multiple jsdom forks spike RAM even without v8 coverage instrumentation).
    // fileParallelism: false is the Vitest 4 equivalent of the removed singleFork
    // option (poolOptions was removed in Vitest 4); it sets maxWorkers to 1 so
    // only one test file runs at a time.
    ...(process.env.CI ? { fileParallelism: false } : {}),

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
