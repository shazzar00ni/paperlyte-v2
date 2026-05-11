import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('eslint.config.js', () => {
  let content: string

  beforeAll(() => {
    const filePath = join(process.cwd(), 'eslint.config.js')
    content = readFileSync(filePath, 'utf-8')
  })

  describe('Node.js globals configuration', () => {
    it('should contain Node.js globals configuration', () => {
      expect(content).toContain('globals.node')
    })

    it('should contain file pattern for *.config.ts', () => {
      expect(content).toMatch(/['"]\*\.config\.ts['"]/)
    })

    it('should contain file pattern for scripts/**/*.ts', () => {
      expect(content).toContain("'scripts/**/*.ts'")
    })

    it('should contain file pattern for netlify/functions/**/*.ts', () => {
      expect(content).toContain("'netlify/functions/**/*.ts'")
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
