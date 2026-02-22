/**
 * ESLint configuration for Paperlyte
 *
 * Uses the new flat config format (ESLint 9+) with:
 * - JavaScript recommended rules
 * - TypeScript strict type checking
 * - React Hooks rules for proper hook usage
 * - React Refresh rules for HMR compatibility
 * - Prettier integration for code formatting
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output and coverage directories
  globalIgnores(['dist', 'coverage']),
  {
    // Apply to all TypeScript and TSX files
    files: ['**/*.{ts,tsx}'],

    // Extend recommended configurations
    extends: [
      // ESLint JavaScript recommended rules
      js.configs.recommended,
      // TypeScript ESLint recommended rules (includes type checking)
      tseslint.configs.recommended,
      // React Hooks rules (prevents common mistakes with hooks)
      reactHooks.configs.flat.recommended,
      // React Refresh rules (ensures components can be hot-reloaded)
      reactRefresh.configs.vite,
      // Prettier config (disables conflicting ESLint rules)
      prettierConfig,
    ],

    languageOptions: {
      // Use ES2020 features
      ecmaVersion: 2020,
      // Browser globals (window, document, etc.)
      globals: globals.browser,
    },
  },
  {
    // Netlify functions intentionally sanitize caught errors to strip
    // subscriber PII before attaching as cause, so the original error
    // object cannot be preserved directly.
    files: ['netlify/**/*.ts'],
    rules: {
      'preserve-caught-error': 'off',
    },
  },
])
