import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Helper function to assert and return regex matches with a custom error message
 */
function assertMatches(content: string, pattern: RegExp, message: string): RegExpMatchArray {
  const matches = content.match(pattern)
  if (!matches || matches.length === 0) {
    throw new Error(message)
  }
  return matches
}

describe('Marketing Plan Document Validation', () => {
  let content: string
  let lines: string[]
  let sections: Map<string, { line: number; content: string }>

  beforeAll(() => {
    const filePath = join(process.cwd(), 'docs', 'MARKETING-PLAN.md')
    content = readFileSync(filePath, 'utf-8')
    lines = content.split('\n')

    // Parse sections
    sections = new Map()
    let currentSection = ''
    let currentContent: string[] = []
    let sectionLine = 0

    lines.forEach((line, index) => {
      if (line.match(/^##\s+/)) {
        if (currentSection) {
          sections.set(currentSection, {
            line: sectionLine,
            content: currentContent.join('\n'),
          })
        }
        currentSection = line.replace(/^##\s+/, '').trim()
        currentContent = []
        sectionLine = index + 1
      } else if (currentSection) {
        currentContent.push(line)
      }
    })

    if (currentSection) {
      sections.set(currentSection, {
        line: sectionLine,
        content: currentContent.join('\n'),
      })
    }
  })

  describe('Content Strategy', () => {
    it('should define content pillars', () => {
      const sectionContent = sections.get('Content Strategy')?.content || ''
      expect(sectionContent).toMatch(/Content Pillars/i)
    })

    it('should include a content calendar', () => {
      const sectionContent = sections.get('Content Strategy')?.content || ''
      expect(sectionContent).toMatch(/Content Calendar/i)
      expect(sectionContent).toMatch(/Week \d+/)
    })

    it('should have SEO strategy', () => {
      const sectionContent = sections.get('Content Strategy')?.content || ''
      expect(sectionContent).toMatch(/SEO Strategy/i)
      expect(sectionContent).toMatch(/Target Keywords/i)
    })

    it('should define content types', () => {
      const sectionContent = sections.get('Content Strategy')?.content || ''
      expect(sectionContent).toMatch(/Blog.*Video.*Social/is)
    })
  })

  describe('Document Quality', () => {
    it('should not have broken markdown formatting', () => {
      const unbalancedBrackets = content.match(/\[[^\]]*\([^)]*$/gm)
      expect(unbalancedBrackets).toBeNull()
    })

    it('should have consistent list formatting', () => {
      const listItems = lines.filter((line) => line.match(/^\s*[-*]\s+/))
      listItems.forEach((item) => {
        expect(item).toMatch(/^\s*[-*]\s+\S/)
      })
    })

    it('should have proper table formatting', () => {
      let i = 0
      while (i < lines.length) {
        if (lines[i].match(/^\|.*\|$/)) {
          const tableStart = i
          let tableEnd = i
          while (tableEnd + 1 < lines.length && lines[tableEnd + 1].match(/^\|.*\|$/)) {
            tableEnd++
          }
          if (tableEnd - tableStart + 1 >= 3) {
            const tableLines = lines.slice(tableStart, tableEnd + 1)
            const separator = tableLines[1]
            const separatorPattern = /^\|([ \t]*:?-{3,}:?[ \t]*\|)+$/
            expect(separator).toMatch(separatorPattern)
          }
          i = tableEnd + 1
        } else {
          i++
        }
      }
    })

    it('should use consistent heading levels', () => {
      const headings = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.match(/^#{1,6}\s+/))

      headings.forEach(({ line }) => {
        const level = (line.match(/^#+/) || [''])[0].length
        expect(level).toBeGreaterThan(0)
        expect(level).toBeLessThanOrEqual(6)
      })
    })
  })

  describe('Completeness and Consistency', () => {
    it('should have a conclusion section', () => {
      expect(sections.has('Conclusion')).toBe(true)
    })

    it('should reference related documents', () => {
      const conclusion = sections.get('Conclusion')?.content || ''
      expect(conclusion).toMatch(/Related Documents/i)
    })

    it('should have document version history', () => {
      expect(content).toMatch(/Version History|Document Version/i)
    })

    it('should have consistent metric formatting', () => {
      // Numbers should use consistent thousand separators
      // The regex /\d{1,3}(,\d{3})+/g matches numbers where the first group is 1-3 digits,
      // followed by one or more groups of exactly 3 digits separated by commas (e.g., 1,000 or 12,345,678).
      // The code below further checks that all parts after the first are exactly 3 digits,
      // and (for clarity) that the first part is 1-3 digits.
      const numbers = content.match(/\d{1,3}(,\d{3})+/g)
      if (numbers) {
        numbers.forEach((num) => {
          // Verify format is correct (e.g., 10,000 not 10,00)
          const parts = num.split(',')
          // Explicitly check that the first part is 1-3 digits (for clarity, though regex already enforces this)
          expect(parts[0].length).toBeGreaterThanOrEqual(1)
          expect(parts[0].length).toBeLessThanOrEqual(3)
          parts.slice(1).forEach((part) => {
            expect(part.length).toBe(3)
          })
        })
      }
    })

    it('should have consistent terminology', () => {
      // Check for consistent use of key terms
      const hasConsistentWAU = content.match(/Weekly Active Users/gi)
      const hasConsistentDAU = content.match(/Daily Active Users/gi)

      if (hasConsistentWAU && hasConsistentWAU.length > 1) {
        // If term is used multiple times, check consistency
        const firstUse = hasConsistentWAU[0]
        hasConsistentWAU.forEach((use) => {
          // Allow for some variation but check general consistency
          expect(use.toLowerCase()).toBe(firstUse.toLowerCase())
        })
      }

      if (hasConsistentDAU && hasConsistentDAU.length > 1) {
        // If term is used multiple times, check consistency
        const firstUse = hasConsistentDAU[0]
        hasConsistentDAU.forEach((use) => {
          // Allow for some variation but check general consistency
          expect(use.toLowerCase()).toBe(firstUse.toLowerCase())
        })
      }
    })

    it('should maintain consistent date formatting', () => {
      const dates = content.match(/November \d{4}|Month [0-6-]+|Day \d+/g)
      expect(dates).toBeTruthy()

      // Dates should follow consistent format
      dates?.forEach((date) => {
        expect(date).toMatch(/^(November \d{4}|Month [-\d]+|Day \d+)$/)
      })
    })
  })

  describe('Actionability', () => {
    it('should have specific, measurable targets', () => {
      // Count quantified targets throughout the document
      const targets = assertMatches(
        content,
        /\d+[,\d]*\+?\s*(users|subscribers|%|downloads)/gi,
        "Expected document to contain specific, measurable targets (e.g., '10,000 users', '5,000+ subscribers', '40%')"
      )
      expect(targets.length).toBeGreaterThan(20)
    })

    it('should include specific action items', () => {
      const actionVerbs = assertMatches(
        content,
        /\b(Launch|Create|Build|Develop|Write|Run|Execute|Track|Monitor|Analyze|Review)\b/gi,
        'Expected document to contain action verbs (Launch, Create, Build, Develop, Write, Run, Execute, Track, Monitor, Analyze, Review)'
      )
      expect(actionVerbs.length).toBeGreaterThan(30)
    })

    it('should reference specific tools and platforms', () => {
      const tools = assertMatches(
        content,
        /\b(Product Hunt|Twitter|Reddit|Instagram|LinkedIn|Discord|Slack|ConvertKit|Mailchimp|Google Analytics|Mixpanel|Amplitude)\b/gi,
        'Expected document to reference specific tools and platforms (Product Hunt, Twitter, Reddit, etc.)'
      )
      expect(tools.length).toBeGreaterThan(10)
    })

    it('should provide concrete examples', () => {
      // Look for example indicators
      const examples = assertMatches(
        content,
        /Example:|For example|e\.g\.|such as|"[^"]+"/gi,
        'Expected document to provide concrete examples (Example:, For example, e.g., such as, quoted text)'
      )
      expect(examples.length).toBeGreaterThan(15)
    })
  })
})
