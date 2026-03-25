// Legacy ESLint configuration for compatibility with tools that do not yet
// support the ESLint 9+ flat config format (e.g. Codacy's codacy-eslint-legacy).
// The authoritative config for local development is eslint.config.js.
'use strict'

module.exports = {
  root: true,
  // Base rules for all files (JS, JSX, config scripts, etc.)
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  ignorePatterns: ['dist'],
  overrides: [
    // TypeScript source files — apply TS parser and rules
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
      ],
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
      },
    },
    // Plain JavaScript files — default parser, no TS rules
    {
      files: ['**/*.{js,jsx}'],
      plugins: ['react-hooks', 'react-refresh'],
      extends: ['plugin:react-hooks/recommended', 'prettier'],
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
      },
    },
    // Build scripts and Node config files — add Node globals, relax module rules
    {
      files: [
        '*.config.{js,cjs,mjs}',
        'scripts/**/*.{js,cjs,mjs}',
        'netlify/**/*.{js,cjs,mjs}',
      ],
      env: {
        node: true,
        browser: false,
      },
    },
  ],
}
