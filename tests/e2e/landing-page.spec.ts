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

    // Wait for smooth scroll animation to complete by ensuring #features is fully in the viewport
    await page.waitForFunction(() => {
      const el = document.querySelector<HTMLElement>('#features');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    });
    // Should scroll to features section
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('should pass Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Measure FCP using Performance Timeline
    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === 'first-contentful-paint'
      );
      return fcpEntry ? fcpEntry.startTime : null;
    });

    expect(fcp).not.toBeNull();
    expect(fcp).toBeLessThan(2000); // FCP < 2s
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu should be accessible
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    await mobileMenu.waitFor({ state: 'visible' });
    await expect(mobileMenu).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
