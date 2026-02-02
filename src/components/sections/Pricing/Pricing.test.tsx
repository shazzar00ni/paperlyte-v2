import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pricing } from './Pricing'
import { PRICING_PLANS } from '@constants/pricing'
import { escapeRegExp } from '@/utils/test/regexHelpers'

describe('Pricing', () => {
  it('should render as a section with correct id', () => {
    const { container } = render(<Pricing />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'pricing')
  })

  it('should render main heading', () => {
    render(<Pricing />)
    expect(screen.getByText('Simple pricing. No surprises.')).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    render(<Pricing />)
    expect(
      screen.getByText('Start free, upgrade whenever. No credit card needed to get started.')
    ).toBeInTheDocument()
  })

  it('should render all pricing plan cards', () => {
    const { container } = render(<Pricing />)

    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(PRICING_PLANS.length) // Should be 3: Free, Pro, Team
  })

  it('should render plan names', () => {
    render(<Pricing />)

    PRICING_PLANS.forEach((plan) => {
      const planHeadings = screen.getAllByText(plan.name)
      expect(planHeadings.length).toBeGreaterThan(0)
      // At least one should be a heading
      const isHeading = planHeadings.some((el) => el.tagName === 'H3')
      expect(isHeading).toBe(true)
    })
  })

  it('should render plan taglines', () => {
    render(<Pricing />)

    PRICING_PLANS.forEach((plan) => {
      expect(screen.getByText(plan.tagline)).toBeInTheDocument()
    })
  })

  it('should render Free plan with "Free" text', () => {
    render(<Pricing />)

    const freeTexts = screen.getAllByText('Free')
    expect(freeTexts.length).toBeGreaterThan(0)
    expect(screen.getByText('Perfect for personal use')).toBeInTheDocument()
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
  })

  it('should render Pro plan with price', () => {
    render(<Pricing />)

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('For power users')).toBeInTheDocument()
    expect(screen.getByText('4.99')).toBeInTheDocument()
    expect(screen.getAllByText('/month').length).toBeGreaterThan(0)
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
  })

  it('should render Team plan with price', () => {
    render(<Pricing />)

    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Built for collaboration')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('should render "Most Popular" badge for Pro plan', () => {
    render(<Pricing />)

    const popularBadge = screen.getByLabelText('Most popular')
    expect(popularBadge).toBeInTheDocument()
  })

  it('should render plan icons', () => {
    render(<Pricing />)

    PRICING_PLANS.forEach((plan) => {
      if (plan.icon) {
        const icon = screen.getByLabelText(`${plan.name} plan icon`)
        expect(icon).toBeInTheDocument()
      }
    })
  })

  describe.each(PRICING_PLANS)('$name plan features', (plan) => {
    it(`should render all features for ${plan.name} plan`, () => {
      render(<Pricing />)

      plan.features.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })
  })

  it('should render checkmark icons for all features', () => {
    render(<Pricing />)

    // Count total features across all plans
    const totalFeatures = PRICING_PLANS.reduce((sum, plan) => sum + plan.features.length, 0)

    // Find all checkmark icons by aria-label
    const checkmarks = screen.getAllByLabelText('Included')

    expect(checkmarks.length).toBe(totalFeatures)
  })

  it('should render CTA buttons for all plans', () => {
    render(<Pricing />)

    PRICING_PLANS.forEach((plan) => {
      // Safe: input is escaped via escapeRegExp() and comes from PRICING_PLANS constant, not user input
      const button = screen.getByRole('button', {
        name: new RegExp(escapeRegExp(plan.ctaText)), // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp, javascript_dos_rule-non-literal-regexp
      })
      expect(button).toBeInTheDocument()
    })
  })

  it('should render guarantee section', () => {
    render(<Pricing />)

    expect(
      screen.getByText('30-day money-back guarantee • Cancel anytime • No hidden fees')
    ).toBeInTheDocument()

    const shieldIcon = screen.getByLabelText('Guarantee')
    expect(shieldIcon).toBeInTheDocument()
  })

  it('should use semantic article elements for pricing cards', () => {
    const { container } = render(<Pricing />)

    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(PRICING_PLANS.length)
  })

  it('should have proper heading hierarchy', () => {
    render(<Pricing />)

    // Main heading should be h2
    const mainHeading = screen.getByText('Simple pricing. No surprises.')
    expect(mainHeading.tagName).toBe('H2')

    // Plan names should be h3
    PRICING_PLANS.forEach((plan) => {
      const planHeadings = screen.getAllByText(plan.name)
      // Find the one that is an H3
      const h3Heading = planHeadings.find((el) => el.tagName === 'H3')
      expect(h3Heading).toBeDefined()
    })
  })

  it('should have aria-label for CTA buttons', () => {
    render(<Pricing />)

    PRICING_PLANS.forEach((plan) => {
      const button = screen.getByRole('button', {
        name: `${plan.ctaText} for ${plan.name} plan`,
      })
      expect(button).toBeInTheDocument()
    })
  })

  it('should render currency symbol for paid plans', () => {
    render(<Pricing />)

    const dollarSigns = screen.getAllByText('$')
    // Should have 2 dollar signs (Pro and Team plans)
    expect(dollarSigns).toHaveLength(2)
  })

  it('should render features in list format', () => {
    const { container } = render(<Pricing />)

    const featureLists = container.querySelectorAll('ul')
    // Should have one list per plan
    expect(featureLists).toHaveLength(PRICING_PLANS.length)
  })
})
