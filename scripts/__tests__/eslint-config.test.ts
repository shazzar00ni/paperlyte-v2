/**
 * Test suite for eslint.config.js
 *
 * Validates that the ESLint flat configuration:
 * - Targets TypeScript/TSX source files (browser block)
 * - Includes a Node.js globals block for *.config.ts, scripts/**, netlify/functions/**
 * - Properly ignores the dist directory
 * - Includes the expected plugin extensions
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read the raw file to validate structure without executing it in a complex environment
const eslintConfigPath = resolve(__dirname, '../../eslint.config.js')
const eslintConfigContent = readFileSync(eslintConfigPath, 'utf-8')

describe('eslint.config.js — file content validation', () => {
  it('should exist and be readable', () => {
    expect(eslintConfigContent).toBeTruthy()
    expect(eslintConfigContent.length).toBeGreaterThan(0)
  })

  it('should use ESLint 9 flat config format (defineConfig)', () => {
    expect(eslintConfigContent).toContain('defineConfig')
  })

  it('should use globalIgnores to exclude dist', () => {
    expect(eslintConfigContent).toContain("globalIgnores(['dist'])")
  })

  it('should target TypeScript and TSX files', () => {
    expect(eslintConfigContent).toContain("files: ['**/*.{ts,tsx}']")
  })

  it('should include browser globals', () => {
    expect(eslintConfigContent).toContain('globals.browser')
  })

  it('should include Node.js globals for build-tool configs and scripts', () => {
    expect(eslintConfigContent).toContain('globals.node')
  })

  it('should have a separate block for *.config.ts files', () => {
    expect(eslintConfigContent).toContain("'*.config.ts'")
  })

  it('should have a separate block for scripts/**/*.ts', () => {
    expect(eslintConfigContent).toContain("'scripts/**/*.ts'")
  })

  it('should have a separate block for netlify/functions/**/*.ts', () => {
    expect(eslintConfigContent).toContain("'netlify/functions/**/*.ts'")
  })

  it('should include @eslint/js recommended rules', () => {
    expect(eslintConfigContent).toContain('js.configs.recommended')
  })

  it('should include TypeScript ESLint recommended rules', () => {
    expect(eslintConfigContent).toContain('tseslint.configs.recommended')
  })

  it('should include React Hooks rules', () => {
    expect(eslintConfigContent).toContain('reactHooks.configs.flat.recommended')
  })

  it('should include React Refresh rules for Vite', () => {
    expect(eslintConfigContent).toContain('reactRefresh.configs.vite')
  })

  it('should include Prettier config to disable conflicting rules', () => {
    expect(eslintConfigContent).toContain('prettierConfig')
  })

  it('should import globals package', () => {
    expect(eslintConfigContent).toMatch(/import globals from ['"]globals['"]/)
  })

  it('should set ecmaVersion to 2020', () => {
    expect(eslintConfigContent).toContain('ecmaVersion: 2020')
  })

  it('should have exactly two non-ignore config blocks', () => {
    // The config has three top-level items in defineConfig:
    // 1. globalIgnores block
    // 2. Browser block for ts/tsx files
    // 3. Node.js block for config/scripts/functions
    // Count occurrences of 'files:' as a proxy for config blocks
    const filesCount = (eslintConfigContent.match(/files:\s*\[/g) || []).length
    expect(filesCount).toBe(2)
  })
})

describe('eslint.config.js — NOT using legacy config format', () => {
  it('should NOT use module.exports (CommonJS legacy format)', () => {
    expect(eslintConfigContent).not.toContain('module.exports')
  })

  it('should NOT reference .eslintrc format (root: true)', () => {
    expect(eslintConfigContent).not.toContain('root: true')
  })

  it('should NOT use overrides (legacy format pattern)', () => {
    expect(eslintConfigContent).not.toContain('overrides:')
  })

  it('should use ES module export (export default)', () => {
    expect(eslintConfigContent).toContain('export default')
  })
})

describe('eslint.config.js — Node.js globals block', () => {
  it('should contain a languageOptions block with globals.node', () => {
    expect(eslintConfigContent).toContain('globals.node')
  })

  it('should have two languageOptions blocks (browser + node)', () => {
    const count = (eslintConfigContent.match(/languageOptions:/g) || []).length
    expect(count).toBe(2)
  })

  it('should have the first languageOptions include globals.browser', () => {
    // The first languageOptions block should reference globals.browser
    const langOptsIndex = eslintConfigContent.indexOf('languageOptions:')
    const snippet = eslintConfigContent.slice(langOptsIndex, langOptsIndex + 200)
    expect(snippet).toContain('globals.browser')
  })
})