import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
        command: 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort',
        url: 'http://127.0.0.1:4175',
        reuseExistingServer: true,
        timeout: 120 * 1000,
      },
})
