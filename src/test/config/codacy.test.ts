import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

describe('.codacy.yml configuration', () => {
  let content: string
  let lines: string[]

  beforeAll(() => {
    const filePath = join(process.cwd(), '.codacy.yml')
    content = readFileSync(filePath, 'utf-8')
    lines = content.split('\n')
  })

  describe('analysis CLI integration', () => {
    it('keeps the configuration at the repository root', () => {
      expect(existsSync(join(process.cwd(), '.codacy.yml'))).toBe(true)
    })

    it('does not retain an unconsumed Cloud CLI import file', () => {
      expect(existsSync(join(process.cwd(), '.codacy/codacy.config.json'))).toBe(false)
    })

    it('does not claim that .codacy.yml controls tool enablement', () => {
      expect(content).not.toMatch(/^\s*enabled:\s*(?:true|false)\s*$/m)
    })
  })

  describe('eslint-9 engine', () => {
    it('should configure eslint-9 exactly once', () => {
      const eslintEngineMatches = lines.filter((line) => line.match(/^\s*eslint-9:\s*$/))
      expect(eslintEngineMatches.length).toBe(1)
    })

    it('should have a comment indicating ESLint 9 flat config usage', () => {
      expect(content).toMatch(/eslint-9 only|flat config|eslint\.config\.js/)
    })
  })

  describe('tool-specific exclusions', () => {
    it('should configure lizard and shellcheck', () => {
      expect(content).toMatch(/^\s*lizard:\s*$/m)
      expect(content).toMatch(/^\s*shellcheck:\s*$/m)
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
