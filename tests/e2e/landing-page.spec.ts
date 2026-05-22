import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helper: apply reduced-motion overrides so entrance animations don't hide
// elements before IntersectionObserver fires in CI headless viewports.
//
// Two-layer fix:
// 1. emulateMedia — activates the CSS @media(prefers-reduced-motion:reduce) override
//    that sets opacity:1!important on all animation classes.
// 2. addInitScript — patches window.matchMedia before React mounts so the
//    useReducedMotion() hook returns true on first render, meaning AnimatedElement
//    never applies the opacity:0 animation class at all. emulateMedia alone is
//    unreliable in Firefox/WebKit where CDP media emulation behaves differently.
//
// IMPORTANT: Must be called BEFORE page.goto() because addInitScript only takes
// effect on pages navigated after it is registered.
//
// NOT applied to the load-performance smoke check: forcing reduced motion
// disables entrance animations/transforms, which can produce artificially better
// FCP/LCP/CLS values and allow real performance regressions to go undetected.
// ---------------------------------------------------------------------------
async function applyReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    // Layer 1: patch window.matchMedia via Proxy so useReducedMotion() returns
    // true on first render → AnimatedElement never applies the opacity:0 class.
    // Proxy is used instead of Object.defineProperty because MediaQueryList.matches
    // is non-configurable in Firefox/WebKit, causing defineProperty to throw.
    const orig = window.matchMedia.bind(window)
    window.matchMedia = (query) => {
      const mql = orig(query)
      if (query === '(prefers-reduced-motion: reduce)') {
        return new Proxy(mql, {
          get(target, prop) {
            if (prop === 'matches') return true
            const val = Reflect.get(target, prop, target)
            return typeof val === 'function' ? val.bind(target) : val
          },
        })
      }
      return mql
    }

    // Layer 2: inject a CSS rule that forces all AnimatedElement wrappers
    // (identified by data-reduced-motion attribute) to be fully visible.
    // DOMContentLoaded fires before <script type="module"> executes in all
    // browsers, so the style is already in <head> when React mounts and sets
    // the data-reduced-motion attribute — the rule then applies immediately.
    const injectStyle = (): void => {
      const s = document.createElement('style')
      s.textContent =
        '[data-reduced-motion]{opacity:1!important;transform:none!important;transition:none!important}'
      document.head.appendChild(s)
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyle)
    } else {
      injectStyle()
    }
  })
}

test.describe('Landing Page', () => {

  test('should load and display hero section', async ({ page }: { page: Page }): Promise<void> => {
    await applyReducedMotion(page)
    await page.goto('/')

    // Check hero heading exists
    await expect(page.locator('h1')).toBeVisible()

    // Check CTA button exists (matches actual Hero component buttons)
    const ctaButton = page.getByRole('button', { name: /start writing for free|view the demo/i })
    await expect(ctaButton.first()).toBeVisible()

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
    await applyReducedMotion(page)
    await page.goto('/')

    // Disable smooth scrolling so the scroll is instant and position detection is reliable.
    // CSS scroll-behavior only affects CSS-initiated scrolls; scrollIntoView({behavior:'smooth'})
    // ignores it. Override Element.prototype.scrollIntoView to force instant scrolls too.
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
    await page.evaluate(() => {
      const orig = Element.prototype.scrollIntoView
      Element.prototype.scrollIntoView = function (options?: boolean | ScrollIntoViewOptions) {
        if (options && typeof options === 'object') {
          orig.call(this, { ...options, behavior: 'instant' })
        } else {
          orig.call(this, options)
        }
      }
    })

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
  //
  // Reduced-motion is intentionally NOT applied here. Forcing prefers-reduced-motion
  // disables entrance animations/transforms, producing artificially better FCP/LCP/CLS
  // readings that can mask genuine regressions. This test must reflect the default
  // user experience.
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

    // Headless Chromium does not always dispatch FCP/LCP entries even with
    // buffered:true. Skip rather than hard-failing: Lighthouse CI is the
    // authoritative performance gate; this test is a best-effort smoke check.
    if (fcp === null || lcp === null) {
      test.skip(true, 'FCP/LCP metrics not observed in headless environment; Lighthouse CI is authoritative')
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

    await applyReducedMotion(page)
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
    await applyReducedMotion(page)
    // Force light color scheme so useTheme starts in light mode regardless of CI/system settings
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    // useTheme sets data-theme in a useEffect, which runs after the first paint.
    // page.goto() resolves on the 'load' event, which fires before useEffects run,
    // so we must wait for the attribute to appear before reading it.
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-theme'))

    // Determine the actual initial theme — emulateMedia is unreliable in Firefox/WebKit headless
    // so we read the DOM directly rather than assuming light mode.
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') ?? 'light'
    })

    const isInitiallyDark = initialTheme === 'dark'
    const toggleButton = page.getByRole('button', {
      name: isInitiallyDark ? /switch to light mode/i : /switch to dark mode/i,
    })
    await expect(toggleButton).toBeVisible()

    await toggleButton.click()

    // After toggling, data-theme should have flipped
    const expectedTheme = isInitiallyDark ? 'light' : 'dark'
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme)

    // The button label should now offer to switch back to the original mode
    const afterToggleLabel = isInitiallyDark ? /switch to dark mode/i : /switch to light mode/i
    await expect(page.getByRole('button', { name: afterToggleLabel })).toBeVisible()
  })

  test('should expand and collapse a FAQ item', async ({ page }: { page: Page }): Promise<void> => {
    await applyReducedMotion(page)
    await page.goto('/')

    // Grab the first question button inside the FAQ section
    const firstQuestion = page.locator('#faq').getByRole('button').first()

    // Initially collapsed
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')

    // force:true bypasses the opacity:0 actionability check. AnimatedElement keeps
    // below-fold sections invisible until IntersectionObserver fires, which doesn't
    // happen in CI headless viewports. React's event delegation handles the event correctly.
    await firstQuestion.click({ force: true })

    // Should be expanded after click
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')

    // Click again to collapse
    await firstQuestion.click({ force: true })
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
  })

  test('should submit waitlist email and show success state', async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
    await applyReducedMotion(page)

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

    // Scroll the section into view before interacting. This (a) fires IntersectionObserver
    // so AnimatedElement wrappers become visible and actionable \u2014 no force:true needed,
    // and (b) mirrors the real user path (scroll to see form, then fill it).
    await page.locator('#email-capture').scrollIntoViewIfNeeded()
    await expect(emailInput).toBeVisible()

    // Use mixed-case to verify the component normalises (trim + lowercase) before POSTing.
    // Use a unique timestamp to avoid duplicate-rejection flakiness if pointed at a real backend.
    const timestamp = Date.now()
    const rawEmail = `E2E-Test-${timestamp}@EXAMPLE.COM`
    const expectedEmail = `e2e-test-${timestamp}@example.com`
    await emailInput.fill(rawEmail)
    await submitButton.click()

    // Success banner replaces the form inside the same #email-capture section, which is
    // already in the viewport from the scroll above, so IntersectionObserver fires on the
    // new AnimatedElement immediately when it mounts.
    // Accept both straight (U+0027) and typographic (U+2019) apostrophes for cross-environment robustness
    await expect(page.getByText(/You['\u2019]re on the list!/i)).toBeVisible({ timeout: 10000 })

    // Assert the component sent the normalised (trimmed + lowercased) email
    expect(capturedPostBody).not.toBeNull()
    expect(JSON.parse(capturedPostBody!)).toEqual({ email: expectedEmail })
  })

  test('should have accessible keyboard navigation', async ({
    page,
    browserName,
    isMobile,
  }: {
    page: Page
    browserName: string
    isMobile: boolean
  }): Promise<void> => {
    // Firefox and WebKit headless do not reliably dispatch Tab-key focus events
    // without prior pointer interaction (user-activation requirement). Limit to
    // Chromium where keyboard focus handling is consistent in headless mode —
    // the same scope restriction used by the performance smoke check above.
    test.skip(browserName !== 'chromium', 'Keyboard navigation test runs on chromium only')
    test.skip(isMobile, 'Keyboard navigation test runs on desktop only')

    await applyReducedMotion(page)
    await page.goto('/')
    // Wait for initial render so all interactive elements are present in the DOM.
    await page.waitForSelector('h1', { state: 'visible' })

    // Validate the initial Tab path from an unfocused document. In Chromium,
    // CDP-level keyboard dispatch works without prior pointer activation, so the
    // first Tab lands on the first focusable element (the skip-link).
    await page.keyboard.press('Tab')
    const firstTabTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
    expect(['a', 'button', 'input', 'select', 'textarea'].includes(firstTabTag ?? '')).toBe(true)

    // Programmatically focus a known nav link for the focus-indicator check.
    // locator.focus() is used here (rather than tabbing from the skip-link) because
    // the number of Tab presses to reach the Features link could change if the DOM
    // order changes — programmatic focus keeps this assertion stable.
    const featuresLink = page.locator('header').getByRole('link', { name: /^features$/i })
    await featuresLink.focus()

    // Verify focus indicator on the focused nav link.
    // reset.css: :focus-visible { outline: 2px solid var(--color-primary) }
    // Programmatic focus triggers :focus-visible when no recent pointer event
    // has occurred (the browser is in keyboard-navigation mode).
    const outline = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return { outlineStyle: 'none', outlineWidth: '0px', boxShadow: 'none' }
      const s = window.getComputedStyle(el)
      return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow }
    })

    // Accept any non-'none' outlineStyle (includes 'solid', 'auto', etc.)
    const hasOutline = outline.outlineStyle !== 'none'
    const hasBoxShadow = outline.boxShadow.trim() !== '' && outline.boxShadow.trim() !== 'none'
    expect(hasOutline || hasBoxShadow).toBeTruthy()

    // Verify Tab moves focus forward to the next interactive element (not body/html).
    await page.keyboard.press('Tab')
    const afterTabTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
    expect(['a', 'button', 'input', 'select', 'textarea'].includes(afterTabTag ?? '')).toBe(true)

    // Verify Shift+Tab moves focus backward to an interactive element.
    await page.keyboard.press('Shift+Tab')
    const afterShiftTabTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
    expect(['a', 'button', 'input', 'select', 'textarea'].includes(afterShiftTabTag ?? '')).toBe(
      true
    )
  })
})
