import { test, expect, type Page } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load and display hero section', async ({ page }: { page: Page }): Promise<void> => {
    await page.goto('/')

    // Check hero heading exists
    await expect(page.locator('h1')).toBeVisible()

    // Check primary CTA button exists
    await expect(page.getByRole('button', { name: /start writing for free/i })).toBeVisible()

    // Check secondary CTA button exists separately (prevents a missing button being masked by .first())
    await expect(page.getByRole('button', { name: /see how it works/i })).toBeVisible()

    // Check page is accessible
    await expect(page).toHaveTitle(/Paperlyte/i)
  })

  test('should navigate to features section on click', async ({
    page,
    isMobile,
  }: {
    page: Page
    isMobile: boolean
  }): Promise<void> => {
    await page.goto('/')

    // Disable smooth scrolling so the scroll is instant and position detection is reliable
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })

    if (isMobile) {
      // Open mobile menu first
      const menuButton = page.getByRole('button', { name: /menu/i })
      await menuButton.click()
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    }

    // Target specifically the header's features link to avoid strict mode violation
    const featuresLink = page.locator('header').getByRole('link', { name: /^features$/i })
    await featuresLink.click()

    // Wait until any part of #features is visible in the viewport.
    // A broad check (top < innerHeight && bottom > 0) handles sticky headers and
    // varying section heights across all browsers including Mobile Safari.
    await page.waitForFunction(() => {
      const el = document.querySelector<HTMLElement>('#features')
      if (!el) return false
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    })
    // Should scroll to features section
    await expect(page.locator('#features')).toBeInViewport()
  })

  // Load-performance smoke check — only runs on chromium desktop to avoid flakiness.
  // This is NOT a full Core Web Vitals gate: it measures FCP/LCP/CLS only (no INP/FID,
  // since those require real user interaction). Lighthouse CI is the authoritative
  // Core Web Vitals monitor for this project.
  test('load-performance smoke check (FCP/LCP/CLS)', async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== 'chromium', 'Performance test runs on chromium only')
    test.skip(isMobile, 'Performance budgets target desktop viewport')

    await page.goto('/')
    // Wait for h1 to be visible to ensure initial render is complete
    await page.waitForSelector('h1', { state: 'visible' })

    interface CoreWebVitalsMetrics {
      fcp: number | null
      lcp: number | null
      cls: number
    }

    // Measure Core Web Vitals using PerformanceObserver with buffered:true for all three
    // metrics so headless Chromium can register entries that fired before evaluate() runs.
    const metrics = await page.evaluate<CoreWebVitalsMetrics>((): Promise<CoreWebVitalsMetrics> => {
      return new Promise<CoreWebVitalsMetrics>((resolve) => {
        // null means the observer never fired — distinguishes "not observed" from a genuine 0.
        // CLS starts at 0: a page with no layout shifts correctly scores 0 (best case).
        let fcp: number | null = null
        let lcp: number | null = null
        let cls = 0

        const fcpObserver = new PerformanceObserver((list) => {
          const entry = list.getEntries().find((e) => e.name === 'first-contentful-paint')
          if (entry) {
            fcp = entry.startTime
          }
        })

        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (!lastEntry) {
            return
          }
          const lcpEntry = lastEntry as PerformanceEntry & {
            renderTime?: number
            loadTime?: number
          }
          lcp = lcpEntry.renderTime || lcpEntry.loadTime || lastEntry.startTime
        })

        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & {
              hadRecentInput?: boolean
              value: number
            }
            if (!layoutShift.hadRecentInput) {
              cls += layoutShift.value
            }
          }
        })

        fcpObserver.observe({ type: 'paint', buffered: true })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        clsObserver.observe({ type: 'layout-shift', buffered: true })

        // Wait a bit for metrics to be collected
        setTimeout(() => {
          fcpObserver.disconnect()
          lcpObserver.disconnect()
          clsObserver.disconnect()
          resolve({ fcp, lcp, cls })
        }, 2500)
      })
    })

    // Validate Core Web Vitals thresholds
    const { fcp, lcp, cls } = metrics

    expect(fcp).not.toBeNull()
    expect(lcp).not.toBeNull() // fail if LCP was never observed

    if (fcp === null || lcp === null) {
      return
    }

    expect(fcp).toBeLessThan(2000) // FCP < 2s
    expect(lcp).toBeLessThan(2500) // LCP < 2.5s (good threshold)
    expect(cls).toBeLessThan(0.1) // CLS < 0.1 (good threshold)
  })

  test('should show mobile-specific UI on small screens', async ({
    page,
    isMobile,
  }: {
    page: Page
    isMobile: boolean
  }): Promise<void> => {
    // Skip on desktop browsers since mobile projects already test mobile viewports
    test.skip(!isMobile, 'Mobile UI test runs on mobile projects only')

    await page.goto('/')

    // Verify mobile menu button is present (desktop has regular nav)
    const mobileMenu = page.getByRole('button', { name: /menu/i })
    await expect(mobileMenu).toBeVisible()

    // Test mobile menu interaction
    await mobileMenu.click()
    // Verify menu opens - check that aria-expanded is true after clicking
    await expect(mobileMenu).toHaveAttribute('aria-expanded', 'true')

    // Verify the menu list becomes visible
    const menuList = page.getByRole('navigation').locator('#main-menu')
    await expect(menuList).toBeVisible()
  })

  test('should toggle dark mode and update data-theme attribute', async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
    // Force light color scheme so useTheme starts in light mode regardless of CI/system settings
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    // The theme toggle button label is "Switch to dark mode" in the initial (light) state
    const toggleButton = page.getByRole('button', { name: /switch to dark mode/i })
    await expect(toggleButton).toBeVisible()

    await toggleButton.click()

    // After toggling, the <html> element should carry data-theme="dark"
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // The button label should now offer to switch back to light mode
    await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible()
  })

  test('should expand and collapse a FAQ item', async ({ page }: { page: Page }): Promise<void> => {
    await page.goto('/')

    // Grab the first question button inside the FAQ section
    const firstQuestion = page.locator('#faq').getByRole('button').first()

    // Initially collapsed
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')

    await firstQuestion.click()

    // Should be expanded after click
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')

    // Click again to collapse
    await firstQuestion.click()
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
  })

  test('should submit waitlist email and show success state', async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
    // Mock the Netlify subscribe endpoint so this test does not depend on
    // `netlify dev` being running. The Vite preview server used in CI does not
    // serve `/.netlify/functions/*`, which would otherwise return a 404 and
    // surface as the error state instead of the success state.
    let capturedPostBody: string | null = null
    await page.route('**/.netlify/functions/subscribe', async (route) => {
      capturedPostBody = route.request().postData()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/')

    const emailInput = page.locator('#email-capture input[type="email"]')
    const submitButton = page
      .locator('#email-capture')
      .getByRole('button', { name: /join the waitlist/i })

    // Use mixed-case to verify the component normalises (trim + lowercase) before POSTing.
    // Use a unique timestamp to avoid duplicate-rejection flakiness if pointed at a real backend.
    const timestamp = Date.now()
    const rawEmail = `E2E-Test-${timestamp}@EXAMPLE.COM`
    const expectedEmail = `e2e-test-${timestamp}@example.com`
    await emailInput.fill(rawEmail)
    // Wait for the mocked subscribe response alongside the click so the test
    // doesn't race the route interception in WebKit/Mobile Safari.
    const responsePromise = page.waitForResponse('**/.netlify/functions/subscribe')
    await submitButton.click()
    await responsePromise

    // Accept both straight (U+0027) and typographic (U+2019) apostrophes for cross-environment robustness
    await expect(page.getByText(/You['\u2019]re on the list!/i)).toBeVisible({ timeout: 5000 })

    // Assert the component sent the normalised (trimmed + lowercased) email
    expect(capturedPostBody).not.toBeNull()
    expect(JSON.parse(capturedPostBody!)).toEqual({ email: expectedEmail })
  })

  test('should have accessible keyboard navigation', async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
    await page.goto('/')

    // Test complete keyboard navigation flow
    const interactiveElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const count = await interactiveElements.count()

    // Ensure first tab goes to a visible element
    await page.keyboard.press('Tab')
    let focused = page.locator(':focus')
    await expect(focused).toBeVisible()

    // Verify focus indicator is visible on first element
    const outline = await focused.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      }
    })

    // Check that some focus indicator is present
    const hasOutline =
      outline.outlineStyle !== 'none' &&
      isFinite(parseFloat(outline.outlineWidth.trim())) &&
      parseFloat(outline.outlineWidth.trim()) > 0

    const hasBoxShadow = outline.boxShadow.trim() !== '' && outline.boxShadow.trim() !== 'none'

    const hasFocusIndicator = hasOutline || hasBoxShadow

    expect(hasFocusIndicator).toBeTruthy()

    // Verify focus order through navigation
    for (let i = 1; i < Math.min(count, 5); i++) {
      await page.keyboard.press('Tab')
      focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    }

    // Test reverse navigation
    await page.keyboard.press('Shift+Tab')
    focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})
