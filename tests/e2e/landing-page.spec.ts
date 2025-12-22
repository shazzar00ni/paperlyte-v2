import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');

    // Check hero heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Check CTA button exists
    const ctaButton = page.getByRole('button', { name: /get started|download/i });
    await expect(ctaButton).toBeVisible();

    // Check page is accessible
    await expect(page).toHaveTitle(/Paperlyte/i);
  });

  test('should navigate to features section on click', async ({ page }) => {
    await page.goto('/');

    const featuresLink = page.getByRole('link', { name: /features/i });
    await featuresLink.click();

    // Should scroll to features section
    await expect(page.locator('#features')).toBeInViewport();
  });

  // Only run performance test on chromium desktop to avoid flakiness
  // Lighthouse CI already provides comprehensive Core Web Vitals monitoring
  test('should pass Core Web Vitals', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance test runs on chromium only');

    await page.goto('/');
    await page.waitForLoadState('load');

    // Measure Core Web Vitals using Performance Timeline
    const metrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === 'first-contentful-paint'
      );

      // Get LCP using PerformanceObserver
      return new Promise((resolve) => {
        let lcp = 0;
        let cls = 0;

        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.renderTime || lastEntry.loadTime;
        });

        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        });

        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Wait a bit for metrics to be collected
        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({
            fcp: fcpEntry ? fcpEntry.startTime : null,
            lcp,
            cls,
          });
        }, 1000);
      });
    });

    // Validate Core Web Vitals thresholds
    expect(metrics.fcp).not.toBeNull();
    expect(metrics.fcp).toBeLessThan(2000); // FCP < 2s
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s (good threshold)
    expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1 (good threshold)
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu should be accessible
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    await expect(mobileMenu).toBeVisible();
  });

  test('should have accessible keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Verify theme toggle is keyboard accessible
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Verify navigation links are keyboard accessible
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Ensure focused element has visible focus indicator
    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    // Check that some focus indicator is present
    const hasFocusIndicator =
      outline.outline !== 'none' ||
      parseInt(outline.outlineWidth) > 0 ||
      outline.boxShadow !== 'none';

    expect(hasFocusIndicator).toBeTruthy();
  });
});
