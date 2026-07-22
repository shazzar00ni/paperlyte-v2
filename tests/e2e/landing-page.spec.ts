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
  // Scoped with tags (see playwright.config.ts) instead of in-body test.skip(), so the
  // test is simply not collected for non-Chromium/mobile projects or in CI — it never
  // appears as "skipped" in the report:
  //   @chromium-only — Chromium desktop only (browser + viewport scope)
  //   @no-ci         — excluded in CI: runners produce variable CLS from lazy-loaded
  //                    sections and slower metric delivery; Lighthouse CI gates CWV there
  //
  // Reduced-motion is intentionally NOT applied here. Forcing prefers-reduced-motion
  // disables entrance animations/transforms, producing artificially better FCP/LCP/CLS
  // readings that can mask genuine regressions. This test must reflect the default
  // user experience.
  test('load-performance smoke check (FCP/LCP/CLS)', { tag: ['@chromium-only', '@no-ci'] }, async ({ page }) => {
    // Inject observers before navigation so every paint/LCP/CLS event is captured.
    // Setting them up post-load with buffered:true is unreliable in fast headless CI
    // because the LCP observation window may close before evaluate() runs.
    await page.addInitScript((): void => {
      const cwv = { fcp: null as number | null, lcp: null as number | null, cls: 0 }
      ;(window as Window & { __cwv: typeof cwv }).__cwv = cwv

      new PerformanceObserver((list: PerformanceObserverEntryList): void => {
        for (const entry of list.getEntries())
          if (entry.name === 'first-contentful-paint') cwv.fcp = entry.startTime
      }).observe({ type: 'paint', buffered: true })

      new PerformanceObserver((list: PerformanceObserverEntryList): void => {
        for (const entry of list.getEntries()) {
          const e = entry as PerformanceEntry & { renderTime?: number; loadTime?: number }
          cwv.lcp = e.renderTime || e.loadTime || entry.startTime
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      new PerformanceObserver((list: PerformanceObserverEntryList): void => {
        for (const entry of list.getEntries()) {
          const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number }
          if (!e.hadRecentInput) cwv.cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })

    await page.goto('/')
    // page.goto waits for the load event; give the LCP observer time to fire.
    // Polling __cwv.lcp is more reliable than waitForLoadState('networkidle'),
    // which can time out when the app makes background requests (analytics, etc.).
    await page.waitForFunction(
      () => {
        const cwv = (window as Window & { __cwv?: { lcp: number | null } }).__cwv
        return cwv !== undefined && cwv.lcp !== null
      },
      { timeout: 8000 }
    ).catch(() => {
      // If LCP never fires (e.g. observer missed it), fall through —
      // the null-guard below will skip the assertions gracefully.
    })

    interface CoreWebVitalsMetrics {
      fcp: number | null
      lcp: number | null
      cls: number
    }

    // __cwv is populated by the addInitScript injected before page.goto() above;
    // waitForFunction already polled until lcp is non-null (or timed out).
    const metrics = await page.evaluate<CoreWebVitalsMetrics>(
      (): CoreWebVitalsMetrics => (window as Window & { __cwv: CoreWebVitalsMetrics }).__cwv
    )
    const { fcp, lcp, cls } = metrics
    expect(fcp, 'FCP metric was not collected — PerformanceObserver/timeline pipeline may be broken').not.toBeNull()
    expect(lcp, 'LCP metric was not collected — PerformanceObserver/timeline pipeline may be broken').not.toBeNull()

    expect(fcp!).toBeLessThan(2000) // FCP < 2s
    expect(lcp!).toBeLessThan(2500) // LCP < 2.5s (good threshold)
    expect(cls).toBeLessThan(0.1)   // CLS < 0.1 (good threshold)
  })

  // Scoped to the mobile projects via the @mobile-only tag (see playwright.config.ts):
  // desktop browsers render the regular nav, not the mobile menu, so this test is not
  // collected for them — keeping it out of the "skipped" list on desktop projects.
  test('should show mobile-specific UI on small screens', { tag: '@mobile-only' }, async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
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

    // Scroll the FAQ section into view before interacting. This (a) fires the
    // IntersectionObserver so any remaining AnimatedElement wrappers become visible,
    // and (b) mirrors the real user path — applyReducedMotion's CSS override already
    // ensures opacity:1 on [data-reduced-motion] elements, so no force:true is needed.
    await page.locator('#faq').scrollIntoViewIfNeeded()

    const firstQuestion = page.locator('#faq').getByRole('button').first()
    await expect(firstQuestion).toBeVisible()

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
    await applyReducedMotion(page)

    // Inject a browser-level fetch mock before navigation. This approach is more
    // reliable than page.route() for WebKit/Mobile Safari, where Playwright's
    // network-layer interception can miss dynamically-triggered POST requests.
    // The Vite preview server in CI does not serve /.netlify/functions/*, so
    // without this mock the component would receive a 404 and show an error.
    await page.addInitScript(() => {
      const orig = window.fetch
      ;(window as unknown as Record<string, unknown>)['__subscribeMockBody'] = null
      window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
        const input = args[0]
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : (input as Request).url
        if (url.includes('/.netlify/functions/subscribe')) {
          const init = args[1]
          let body: string | null = null

          // Capture body from init.body (common case: fetch(url, {body: '...'}))
          // or from the Request object itself (fetch(new Request(url, {body: '...'})))
          if (typeof init?.body === 'string') {
            body = init.body
          } else if (input instanceof Request) {
            body = await input.clone().text()
          }

          ;(window as unknown as Record<string, unknown>)['__subscribeMockBody'] = body
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return orig(...args)
      }
    })

    await page.goto('/')

    const emailInput = page.locator('#email-capture input[type="email"]')
    const gdprConsentCheckbox = page.locator('#email-capture #gdpr-consent')
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
    await gdprConsentCheckbox.check()
    await submitButton.click()

    // Success banner replaces the form inside the same #email-capture section, which is
    // already in the viewport from the scroll above, so IntersectionObserver fires on the
    // new AnimatedElement immediately when it mounts.
    // Accept both straight (U+0027) and typographic (U+2019) apostrophes for cross-environment robustness
    await expect(page.getByText(/You['\u2019]re on the list!/i)).toBeVisible({ timeout: 10000 })

    // Assert the component sent the normalised (trimmed + lowercased) email
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => (window as unknown as Record<string, unknown>)['__subscribeMockBody'] as string | null
          ),
        { message: 'Expected waitlist submit payload to be captured by fetch mock' }
      )
      .not.toBeNull()

    const capturedPostBody = await page.evaluate(
      () => (window as unknown as Record<string, unknown>)['__subscribeMockBody'] as string
    )
    expect(JSON.parse(capturedPostBody)).toEqual({ email: expectedEmail })
  })

  // Scoped to Chromium desktop via the @chromium-only tag (see playwright.config.ts).
  // Firefox and WebKit headless do not reliably dispatch Tab-key focus events without
  // prior pointer interaction (user-activation requirement), and keyboard nav is a
  // desktop concern. Tag-based scoping keeps it from showing as "skipped" elsewhere.
  test('should have accessible keyboard navigation', { tag: '@chromium-only' }, async ({
    page,
  }: {
    page: Page
  }): Promise<void> => {
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

    // Verify Tab moves focus forward to the next interactive element.
    // Snapshot the element's identity before pressing Tab — checking only the
    // tag after the keypress would pass even if focus got stuck (e.g. the
    // already-focused Features link is already an <a> tag).
    const beforeTabHtml = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 200) ?? null
    )
    await page.keyboard.press('Tab')
    const afterTab = await page.evaluate(() => ({
      tag: document.activeElement?.tagName.toLowerCase() ?? '',
      html: (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 200) ?? null,
    }))
    expect(afterTab.html, 'Tab should move focus to a new element').not.toBe(beforeTabHtml)
    expect(['a', 'button', 'input', 'select', 'textarea'].includes(afterTab.tag)).toBe(true)

    // Verify Shift+Tab moves focus backward (to a different element than current).
    await page.keyboard.press('Shift+Tab')
    const afterShiftTab = await page.evaluate(() => ({
      tag: document.activeElement?.tagName.toLowerCase() ?? '',
      html: (document.activeElement as HTMLElement | null)?.outerHTML.slice(0, 200) ?? null,
    }))
    expect(afterShiftTab.html, 'Shift+Tab should move focus to a new element').not.toBe(afterTab.html)
    expect(['a', 'button', 'input', 'select', 'textarea'].includes(afterShiftTab.tag)).toBe(true)
  })
})
