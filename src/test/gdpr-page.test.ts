/**
 * Tests for public/gdpr.html
 *
 * Validates the structure, content, and required GDPR-related sections of the
 * static GDPR Statement page introduced in this PR.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('public/gdpr.html', () => {
  let html: string

  beforeAll(() => {
    const filePath = join(process.cwd(), 'public', 'gdpr.html')
    html = readFileSync(filePath, 'utf-8')
  })

  describe('Document structure', () => {
    it('should be a valid HTML5 document with doctype declaration', () => {
      expect(html.trim().toLowerCase()).toMatch(/^<!doctype html>/)
    })

    it('should declare lang="en" on the html element', () => {
      expect(html).toContain('<html lang="en">')
    })

    it('should declare UTF-8 charset', () => {
      expect(html).toContain('charset="UTF-8"')
    })

    it('should include a viewport meta tag', () => {
      expect(html).toContain('name="viewport"')
      expect(html).toContain('width=device-width')
    })
  })

  describe('Page title and metadata', () => {
    it('should have the correct page title', () => {
      expect(html).toContain('<title>GDPR Statement - Paperlyte</title>')
    })

    it('should have a meta description tag', () => {
      expect(html).toContain('name="description"')
    })

    it('meta description should mention GDPR and Paperlyte', () => {
      expect(html).toContain('GDPR')
      expect(html).toContain('Paperlyte')
    })

    it('meta description should reference data subject rights', () => {
      expect(html).toContain('rights')
    })
  })

  describe('Page heading', () => {
    it('should have a single h1 element with "GDPR Statement"', () => {
      const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gs)
      expect(h1Matches).not.toBeNull()
      expect(h1Matches!.length).toBe(1)
      expect(h1Matches![0]).toContain('GDPR Statement')
    })

    it('should include a "Last Updated" marker with a build-time placeholder', () => {
      // {{BUILD_DATE}} is replaced at build time; the source template must contain it
      expect(html).toContain('Last Updated')
      expect(html).toContain('{{BUILD_DATE}}')
    })
  })

  describe('Required GDPR sections', () => {
    const requiredSections = [
      'Our Commitment to GDPR',
      'Lawful Basis for Processing',
      'Your Data Subject Rights',
      'International Transfers',
      'Data Retention and Security',
      'How to Exercise Your Rights',
      'Supervisory Authority Complaints',
    ]

    requiredSections.forEach((section) => {
      it(`should contain the "${section}" section`, () => {
        expect(html).toContain(section)
      })
    })
  })

  describe('Data subject rights list', () => {
    const requiredRights = [
      'Right of Access',
      'Right to Rectification',
      'Right to Erasure',
      'Right to Restrict Processing',
      'Right to Data Portability',
      'Right to Object',
      'Rights Related to Automated Decision-Making',
    ]

    requiredRights.forEach((right) => {
      it(`should list the "${right}" right`, () => {
        expect(html).toContain(right)
      })
    })
  })

  describe('Contact information', () => {
    it('should include a DPO email link', () => {
      expect(html).toContain('mailto:dpo@paperlyte.com')
    })

    it('should include a privacy email link', () => {
      expect(html).toContain('mailto:privacy@paperlyte.com')
    })

    it('both contact emails should use the paperlyte.com domain', () => {
      const emailLinks = html.match(/mailto:[^\s"<>]+/g) ?? []
      expect(emailLinks.length).toBeGreaterThanOrEqual(2)
      emailLinks.forEach((link) => {
        expect(link).toContain('@paperlyte.com')
      })
    })
  })

  describe('Navigation links', () => {
    it('should have a back link pointing to the home page (/)', () => {
      expect(html).toMatch(/href="\/"/)
      expect(html).toContain('back-link')
    })

    it('should link to the Privacy Policy page', () => {
      expect(html).toContain('href="/privacy.html"')
      expect(html).toContain('Privacy Policy')
    })

    it('should link to the Terms of Service page', () => {
      expect(html).toContain('href="/terms.html"')
      expect(html).toContain('Terms of Service')
    })
  })

  describe('Footer', () => {
    it('should contain a footer element', () => {
      expect(html).toContain('<footer')
      expect(html).toContain('</footer>')
    })

    it('should include a copyright notice with the {{YEAR}} placeholder', () => {
      // {{YEAR}} is replaced at build time; the template must contain it
      expect(html).toContain('{{YEAR}}')
      expect(html).toContain('Paperlyte')
      expect(html).toContain('All rights reserved')
    })
  })

  describe('Font preloading', () => {
    it('should preload the Inter variable font', () => {
      expect(html).toContain('/fonts/Inter-Variable.woff2')
      expect(html).toContain('rel="preload"')
    })

    it('should preload the Playfair Display variable font', () => {
      expect(html).toContain('/fonts/PlayfairDisplay-Variable.woff2')
    })

    it('preload links should include crossorigin attribute', () => {
      expect(html).toContain('crossorigin')
    })
  })

  describe('CSS custom properties', () => {
    it('should define --color-primary CSS variable', () => {
      expect(html).toContain('--color-primary')
    })

    it('should define --color-background CSS variable', () => {
      expect(html).toContain('--color-background')
    })
  })

  describe('Build-time template placeholders', () => {
    it('should have exactly two template placeholders: {{BUILD_DATE}} and {{YEAR}}', () => {
      const placeholders = html.match(/\{\{[A-Z_]+\}\}/g) ?? []
      const unique = [...new Set(placeholders)].sort()
      expect(unique).toEqual(['{{BUILD_DATE}}', '{{YEAR}}'])
    })
  })
})
