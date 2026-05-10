import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('eslint.config.js', () => {
  let content: string

  beforeAll(() => {
    const filePath = join(process.cwd(), 'eslint.config.js')
    content = readFileSync(filePath, 'utf-8')
  })

  describe('removed Node.js globals block (PR change)', () => {
    it('should NOT contain Node.js globals configuration', () => {
      expect(content).not.toContain('globals.node')
    })

    it('should NOT contain file pattern for *.config.ts', () => {
      // The removed block targeted '*.config.ts' files for Node.js globals
      expect(content).not.toMatch(/'?\*\.config\.ts'?/)
    })

    it('should NOT contain file pattern for scripts/**/*.ts in a separate block', () => {
      // The removed block included scripts/**/*.ts as a separate Node.js globals pattern
      expect(content).not.toContain("'scripts/**/*.ts'")
    })

    it('should NOT contain file pattern for netlify/functions/**/*.ts', () => {
      // The removed block included netlify/functions/**/*.ts for Node.js globals
      expect(content).not.toContain("'netlify/functions/**/*.ts'")
    })

    it('should NOT have multiple config array entries beyond the global ignore and main TS block', () => {
      // After removal, the config should only have 2 entries: globalIgnores and the TS/TSX block
      // Count the opening object braces at the top level of the array
      // A simple heuristic: count defineConfig array entries
      const arrayEntryPattern = /^\s*\{$/gm
      const entries = content.match(arrayEntryPattern)
      // Should have at most 2 entries (the main TS config and potentially globalIgnores)
      expect(entries?.length ?? 0).toBeLessThanOrEqual(2)
    })
  })

  describe('main TypeScript configuration block (retained)', () => {
    it('should apply configuration to TypeScript and TSX files', () => {
      expect(content).toContain("files: ['**/*.{ts,tsx}']")
    })

    it('should use browser globals', () => {
      expect(content).toContain('globals.browser')
    })

    it('should set ecmaVersion to 2020', () => {
      expect(content).toContain('ecmaVersion: 2020')
    })

    it('should extend TypeScript ESLint recommended rules', () => {
      expect(content).toContain('tseslint.configs.recommended')
    })

    it('should include React Hooks rules', () => {
      expect(content).toContain('reactHooks.configs.flat.recommended')
    })

    it('should include Prettier config to disable conflicting rules', () => {
      expect(content).toContain('prettierConfig')
    })
  })

  describe('flat config format', () => {
    it('should use defineConfig from eslint/config', () => {
      expect(content).toContain("from 'eslint/config'")
      expect(content).toContain('defineConfig')
    })

    it('should use globalIgnores to exclude dist directory', () => {
      expect(content).toContain("globalIgnores(['dist'])")
    })

    it('should export default configuration', () => {
      expect(content).toContain('export default defineConfig')
    })

    it('should be an ES module (no require/module.exports)', () => {
      expect(content).not.toContain('module.exports')
      expect(content).not.toContain('require(')
    })
  })

  describe('imports', () => {
    it('should import from @eslint/js', () => {
      expect(content).toContain("from '@eslint/js'")
    })

    it('should import globals', () => {
      expect(content).toContain("from 'globals'")
    })

    it('should import typescript-eslint', () => {
      expect(content).toContain("from 'typescript-eslint'")
    })

    it('should import eslint-config-prettier', () => {
      expect(content).toContain("from 'eslint-config-prettier'")
    })
  })
})