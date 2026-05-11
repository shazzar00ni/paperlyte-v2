import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('.codacy.yml configuration', () => {
  let content: string
  let lines: string[]

  beforeAll(() => {
    const filePath = join(process.cwd(), '.codacy.yml')
    content = readFileSync(filePath, 'utf-8')
    lines = content.split('\n')
  })

  describe('legacy eslint engine compatibility', () => {
    it('should keep the legacy eslint engine entry', () => {
      const legacyEslintPattern = /^\s*eslint:\s*$/m
      expect(content).toMatch(legacyEslintPattern)
    })

    it('should keep legacy eslint disabled to avoid duplicate analysis', () => {
      expect(content).toMatch(/eslint:\s*\n\s*enabled:\s*false/)
    })

    it('should define the legacy eslint engine only once', () => {
      const eslintEngineMatches = lines.filter((line) => line.match(/^\s*eslint:\s*$/))
      expect(eslintEngineMatches.length).toBe(1)
    })
  })

  describe('eslint-9 engine (retained)', () => {
    it('should have eslint-9 engine enabled', () => {
      expect(content).toMatch(/eslint-9:\s*\n\s*enabled:\s*true/)
    })

    it('should have a comment indicating eslint-9 flat config usage', () => {
      expect(content).toMatch(/eslint-9 only|flat config|eslint\.config\.js/)
    })
  })

  describe('other enabled engines', () => {
    it('should have semgrep enabled', () => {
      expect(content).toMatch(/semgrep:\s*\n\s*enabled:\s*true/)
    })

    it('should have lizard enabled', () => {
      expect(content).toMatch(/lizard:\s*\n\s*enabled:\s*true/)
    })

    it('should have shellcheck enabled', () => {
      expect(content).toMatch(/shellcheck:\s*\n\s*enabled:\s*true/)
    })
  })

  describe('disabled engines', () => {
    it('should have csslint disabled', () => {
      expect(content).toMatch(/csslint:\s*\n\s*enabled:\s*false/)
    })

    it('should have stylelint disabled', () => {
      expect(content).toMatch(/stylelint:\s*\n\s*enabled:\s*false/)
    })

    it('should have tslint disabled', () => {
      expect(content).toMatch(/tslint:\s*\n\s*enabled:\s*false/)
    })
  })

  describe('coverage configuration', () => {
    it('should reference lcov.info coverage report', () => {
      expect(content).toContain('coverage/lcov.info')
    })

    it('should have overall coverage threshold of 70', () => {
      expect(content).toMatch(/overall:\s*70/)
    })

    it('should have per-file coverage threshold of 70', () => {
      expect(content).toMatch(/file:\s*70/)
    })
  })

  describe('exclude paths', () => {
    it('should exclude node_modules', () => {
      expect(content).toContain('node_modules/**')
    })

    it('should exclude dist directory', () => {
      expect(content).toContain('dist/**')
    })

    it('should exclude test files from analysis', () => {
      expect(content).toContain('**/*.test.ts')
      expect(content).toContain('**/*.test.tsx')
    })
  })
})
