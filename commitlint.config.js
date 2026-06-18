/**
 * Commitlint configuration for Paperlyte.
 *
 * Enforces the Conventional Commits specification (https://www.conventionalcommits.org).
 * The rules are declared inline (rather than via `extends`) so that the documented
 * `npx commitlint` workflow works without any additional package being installed.
 *
 * Validate a message:  printf '%s' "<message>" | npx commitlint
 * Inspect the rules:    npx commitlint --print-config json
 */
export default {
  rules: {
    // Body / footer formatting
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    // Header
    'header-max-length': [2, 'always', 100],
    'header-trim': [2, 'always'],

    // Subject
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],

    // Type
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}
