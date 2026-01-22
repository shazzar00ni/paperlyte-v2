/**
 * Legacy ESLint configuration file (.eslintrc.cjs)
 *
 * IMPORTANT: This file is used to satisfy Codacy's legacy ESLint engine
 * and prevent "ConfigurationNotFoundError" failures.
 *
 * Local development, modern IDEs, and GitHub Actions CI use the modern
 * flat configuration format defined in 'eslint.config.js' (ESLint 9+).
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-deprecated
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '.eslintrc.cjs',
    'eslint.config.js',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
