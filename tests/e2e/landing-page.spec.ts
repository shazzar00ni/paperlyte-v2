import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');

    // Check hero heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Check primary CTA button exists
    const ctaButton = page.getByRole('button', { name: /start writing for free/i });
    await expect(ctaButton).toBeVisible();

    // Check page is accessible
    await expect(page).toHaveTitle(/Paperlyte/i);
  });

  test('should navigate to features section on click', async ({ page }) => {
    await page.goto('/');

    // Target specifically the header navigation's features link
    const featuresLink = page.getByRole('navigation', { name: /main navigation/i }).getByRole('link', { name: /^features$/i });
    await featuresLink.click();

    // Wait for smooth scroll animation to complete by ensuring #features is fully in the viewport
    await page.waitForFunction(() => {
      const el = document.querySelector<HTMLElement>('#features');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight;
    });
    // Should scroll to features section
    await expect(page.locator('#features')).toBeInViewport();
  });

  // Only run performance test on chromium desktop to avoid flakiness
  // Lighthouse CI already provides comprehensive Core Web Vitals monitoring
  test('should pass Core Web Vitals', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance test runs on chromium only');

    await page.goto('/');
    await page.waitForLoadState('load');

    // Measure Core Web Vitals using Performance Timeline and PerformanceObserver
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp = 0;
        let lcp = 0;
        let cls = 0;

        // Check if FCP already exists in paint entries
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(
          (entry) => entry.name === 'first-contentful-paint'
        );
        if (fcpEntry) {
          fcp = fcpEntry.startTime;
        }

        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcpEntry = lastEntry as PerformanceEntry & { renderTime?: number; loadTime?: number };
          lcp = lcpEntry.renderTime || lcpEntry.loadTime || 0;
        });

        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number };
            if (!layoutShift.hadRecentInput) {
              cls += layoutShift.value;
            }
          }
        });

        // Observe FCP if not yet available
        if (!fcp) {
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              fcp = entries[0].startTime;
              fcpObserver.disconnect();
            }
          });
          fcpObserver.observe({ type: 'paint', buffered: true });
        }

        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Wait for metrics to be collected
        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({
            fcp,
            lcp,
            cls,
          });
        }, 2500);
      });
    });

    // Validate Core Web Vitals thresholds
    expect(metrics.fcp).toBeGreaterThan(0); // FCP should be recorded
    expect(metrics.fcp).toBeLessThan(2000); // FCP < 2s
    expect(metrics.lcp).toBeGreaterThan(0); // LCP should be recorded
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s (good threshold)
    expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1 (good threshold)
  });

  test('should show mobile-specific UI on small screens', async ({ page, isMobile }) => {
    // Skip on desktop browsers since mobile projects already test mobile viewports
    test.skip(!isMobile, 'Mobile UI test runs on mobile projects only');

    await page.goto('/');

    // Verify mobile menu button is present (desktop has regular nav)
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    await expect(mobileMenu).toBeVisible();

    // Test mobile menu interaction
    await mobileMenu.click();
    // Verify menu opens - check that aria-expanded is true after clicking
    await expect(mobileMenu).toHaveAttribute('aria-expanded', 'true');

    // Verify the menu list becomes visible
    const menuList = page.getByRole('navigation').locator('#main-menu');
    await expect(menuList).toBeVisible();
  });

  test('should have accessible keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test complete keyboard navigation flow
    const interactiveElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const count = await interactiveElements.count();

    // Ensure first tab goes to a visible element
    await page.keyboard.press('Tab');
    let focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // Verify focus indicator is visible on first element
    const outline = await focused.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    // Check that some focus indicator is present
    const hasOutline =
      outline.outlineStyle !== 'none' &&
      isFinite(parseFloat(outline.outlineWidth.trim())) &&
      parseFloat(outline.outlineWidth.trim()) > 0;

    const hasBoxShadow =
      outline.boxShadow.trim() !== '' && outline.boxShadow.trim() !== 'none';

    const hasFocusIndicator = hasOutline || hasBoxShadow;

    expect(hasFocusIndicator).toBeTruthy();

    // Verify focus order through navigation
    for (let i = 1; i < Math.min(count, 5); i++) {
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }

    // Test reverse navigation
    await page.keyboard.press('Shift+Tab');
    focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
