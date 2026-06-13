import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? process.env.GITHUB_ACTIONS
      ? [['html'], ['github'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
      : [['html'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
    : 'list',

  // CI runners are slower: lazy-chunk loading + IntersectionObserver callbacks
  // can consume 2-3s of the default 5s budget. 10s prevents flaky timeouts
  // without hiding real failures (retries:2 still catches genuine regressions).
  expect: {
    timeout: process.env.CI ? 10000 : 5000,
  },

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Force light color scheme so useTheme and theme-init.js start in a known
    // state across all CI environments and headless browsers.
    colorScheme: 'light',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Local development: Start preview server automatically
  // CI: Server is started separately in the workflow
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 180 * 1000,
      },
})
