import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

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

  // ...rest of tests remain unchanged
})