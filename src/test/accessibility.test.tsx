import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'

// Extend expect with axe matchers
expect.extend(matchers)

// Import landing page sections
import { EmailCapture as EmailCaptureSection } from '@components/sections/EmailCapture/EmailCapture'
import { Testimonials } from '@components/sections/Testimonials/Testimonials'
import { EmailCapture as EmailCaptureUI } from '@components/ui/EmailCapture/EmailCapture'

/**
 * Automated accessibility audits using axe-core
 *
 * These tests run axe-core analysis against rendered components
 * to catch WCAG 2.1 AA violations automatically.
 */
describe('Accessibility Audits (axe-core)', () => {
  // Increase timeout for axe analysis which can take longer
  const AXE_TIMEOUT = 10000

  describe('EmailCapture Section', () => {
    it(
      'should have no accessibility violations',
      async () => {
        const { container } = render(<EmailCaptureSection />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      },
      AXE_TIMEOUT
    )
  })

  describe('Testimonials Section', () => {
    it(
      'should have no accessibility violations',
      async () => {
        const { container } = render(<Testimonials />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      },
      AXE_TIMEOUT
    )
  })

  describe('EmailCapture UI Component', () => {
    it(
      'should have no accessibility violations in inline variant',
      async () => {
        const { container } = render(<EmailCaptureUI variant="inline" />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      },
      AXE_TIMEOUT
    )

    it(
      'should have no accessibility violations in centered variant',
      async () => {
        const { container } = render(<EmailCaptureUI variant="centered" />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      },
      AXE_TIMEOUT
    )
  })
})
