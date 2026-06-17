import { defineConfig, devices } from '@playwright/test'

// ---------------------------------------------------------------------------
// Browser-scoping via tags (keeps the HTML report clean). Scoped tests are not
// COLLECTED for the projects they don't apply to, so they never appear as
// "skipped" — unlike in-body test.skip(), which still lists the test as skipped
// for every project where the guard fired.
//
// Tags are declared on individual tests via the `tag` option:
//   @chromium-only — runs only on the Chromium desktop project
//   @mobile-only   — runs only on the mobile projects (Pixel 5 / iPhone 12)
//   @no-ci         — never runs in CI (variable CLS/metric delivery on CI runners;
//                    Lighthouse CI is the authoritative Core Web Vitals gate)
//
// Each project excludes the tags that don't belong to it via grepInvert; in CI,
// @no-ci is additionally excluded everywhere. Untagged tests run on all projects.
// ---------------------------------------------------------------------------
const grepInvert = (...tags: string[]): RegExp | undefined => {
  const excluded = process.env.CI ? [...tags, '@no-ci'] : tags
  return excluded.length > 0 ? new RegExp(excluded.join('|')) : undefined
}

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
      // Runs @chromium-only tests; excludes mobile-scoped tests.
      grepInvert: grepInvert('@mobile-only'),
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grepInvert: grepInvert('@chromium-only', '@mobile-only'),
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grepInvert: grepInvert('@chromium-only', '@mobile-only'),
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      // Runs @mobile-only tests; excludes Chromium-desktop-scoped tests.
      grepInvert: grepInvert('@chromium-only'),
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      grepInvert: grepInvert('@chromium-only'),
    },
  ],

  // Local development: Start preview server automatically
  // CI: Server is started separately in the workflow
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
      },
})
