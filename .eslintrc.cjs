// Legacy ESLint configuration used by Codacy's codacy-eslint-legacy engine
// and other tools that do not yet support the ESLint 9+ flat config format.
// The authoritative ESLint config for local development and flat-config–aware
// tools/engines is eslint.config.js.
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
  rules: {
    // Production console statements should be routed through the `monitoring`
    // utility or guarded behind `import.meta.env.DEV`. `warn`/`error` are
    // allowed everywhere as genuine production diagnostics.
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
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
    // Build scripts, Node config files, and Netlify serverless functions — add Node globals
    {
      files: [
        '*.config.{js,cjs,mjs,ts,cts,mts}',
        '.*.cjs', // dotfile CJS configs (e.g. .eslintrc.cjs itself) — module/exports must be defined
        'scripts/**/*.{js,cjs,mjs,ts,cts,mts}',
        'netlify/functions/**/*.{js,cjs,mjs,ts,cts,mts}',
      ],
      env: {
        node: true,
        browser: false,
      },
      // CLI scripts and serverless functions legitimately log to stdout/stderr;
      // the no-console audit (HIGH-002) is scoped to browser-side production
      // source (src/**), not Node build tooling.
      rules: {
        'no-console': 'off',
      },
    },
    // Netlify Edge Functions run in an edge/Web runtime, not Node.js
    {
      files: ['netlify/edge-functions/**/*.{js,cjs,mjs,ts,cts,mts}'],
      env: {
        browser: true,
        node: false,
      },
    },
    // Sanctioned logging locations: `monitoring` and `analytics/**` are the
    // centralized, designated places where `console.log` is permitted.
    {
      files: ['src/utils/monitoring.ts', 'src/analytics/**'],
      rules: {
        'no-console': ['error', { allow: ['warn', 'error', 'log', 'group', 'groupEnd'] }],
      },
    },
  ],
}
