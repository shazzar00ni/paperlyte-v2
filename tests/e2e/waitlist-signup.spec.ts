import { test, expect } from '@playwright/test'

test.describe('Email Waitlist Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display email capture section with form', async ({ page }) => {
    // Scroll to the email capture section
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Verify the form elements are present
    await expect(emailSection.getByPlaceholder(/email/i)).toBeVisible()
    await expect(emailSection.getByRole('button', { name: /join|waitlist/i })).toBeVisible()
  })

  test('should require email before submission', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Try to submit without entering email - browser validation should prevent it
    const submitButton = emailSection.getByRole('button', { name: /join|waitlist/i })
    await submitButton.click()

    // The form should still be visible (not in success state)
    await expect(emailSection.getByPlaceholder(/email/i)).toBeVisible()
  })

  test('should show validation for invalid email format', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Enter an invalid email
    const emailInput = emailSection.getByPlaceholder(/email/i)
    await emailInput.fill('not-an-email')

    // Submit - browser or custom validation should intervene
    const submitButton = emailSection.getByRole('button', { name: /join|waitlist/i })
    await submitButton.click()

    // Should still show the form (not success state)
    await expect(emailInput).toBeVisible()
  })

  test('should have accessible email input with label', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // The email input should have an accessible label
    const emailInput = emailSection.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // Should have either aria-label or associated label
    const hasAriaLabel = await emailInput.getAttribute('aria-label')
    const id = await emailInput.getAttribute('id')
    const associatedLabel = id ? emailSection.locator(`label[for="${id}"]`) : null

    const isAccessible = hasAriaLabel || (associatedLabel && (await associatedLabel.count()) > 0)
    expect(isAccessible).toBeTruthy()
  })

  test('should show loading state during submission', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Intercept the API call to delay the response
    await page.route('**/.netlify/functions/subscribe', async (route) => {
      // Delay response to observe loading state
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, subscriptionId: 1 }),
      })
    })

    // Fill in email
    const emailInput = emailSection.getByPlaceholder(/email/i)
    await emailInput.fill('test@example.com')

    // Check GDPR consent if present
    const gdprCheckbox = emailSection.locator('input[type="checkbox"]')
    if ((await gdprCheckbox.count()) > 0) {
      await gdprCheckbox.check()
    }

    // Submit form
    const submitButton = emailSection.getByRole('button', { name: /join|waitlist/i })
    await submitButton.click()

    // Should show loading indicator (button text changes or spinner appears)
    await expect(
      emailSection.getByRole('button', { name: /joining|loading|submitting/i })
    ).toBeVisible({ timeout: 3000 })
  })

  test('should show success message after successful signup', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Mock the subscribe endpoint for success
    await page.route('**/.netlify/functions/subscribe', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed!',
          subscriptionId: 42,
        }),
      })
    })

    // Fill in email
    const emailInput = emailSection.getByPlaceholder(/email/i)
    await emailInput.fill('test@example.com')

    // Check GDPR consent if present
    const gdprCheckbox = emailSection.locator('input[type="checkbox"]')
    if ((await gdprCheckbox.count()) > 0) {
      await gdprCheckbox.check()
    }

    // Submit
    const submitButton = emailSection.getByRole('button', { name: /join|waitlist/i })
    await submitButton.click()

    // Should show success state
    await expect(emailSection.getByText(/on the list|success|thank you|confirm/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should handle API error gracefully', async ({ page }) => {
    const emailSection = page.locator('#email-capture')
    await emailSection.scrollIntoViewIfNeeded()

    // Mock the subscribe endpoint for failure
    await page.route('**/.netlify/functions/subscribe', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Too many requests. Please try again in a minute.',
        }),
      })
    })

    // Fill in email
    const emailInput = emailSection.getByPlaceholder(/email/i)
    await emailInput.fill('test@example.com')

    // Check GDPR consent if present
    const gdprCheckbox = emailSection.locator('input[type="checkbox"]')
    if ((await gdprCheckbox.count()) > 0) {
      await gdprCheckbox.check()
    }

    // Submit
    const submitButton = emailSection.getByRole('button', { name: /join|waitlist/i })
    await submitButton.click()

    // Should show an error message, not a success state
    await expect(emailSection.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 5000 })
  })

  test('should be keyboard accessible through the signup flow', async ({ page }) => {
    // Tab through the page to reach the email section
    const emailInput = page.locator('#email-capture input[type="email"]')
    await emailInput.scrollIntoViewIfNeeded()

    // Focus the email input directly
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    // Type an email
    await page.keyboard.type('keyboard-user@example.com')

    // Tab to next focusable element (should be submit button or checkbox)
    await page.keyboard.press('Tab')

    // Verify focus moved to an interactive element within the form
    const focused = page.locator('#email-capture :focus')
    await expect(focused).toBeVisible()
  })
})
