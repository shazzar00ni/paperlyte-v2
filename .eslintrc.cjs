/**
 * Legacy ESLint configuration for Paperlyte
 *
 * This file exists for backward compatibility with tools that don't support
 * ESLint 9's flat config format (e.g., Codacy's legacy ESLint tool).
 *
 * The primary configuration is in eslint.config.js (flat config).
 * This legacy config mirrors those rules for older ESLint runners.
 *
 * @see eslint.config.js for the main configuration
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
