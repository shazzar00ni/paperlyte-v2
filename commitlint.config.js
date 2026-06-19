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
  // Mirror @commitlint/config-conventional's parser (conventional-changelog-conventionalcommits)
  // inline so Conventional Commits breaking-change shorthand (`feat!:`, `feat(scope)!:`) parses
  // correctly. Without this, commitlint falls back to the angular preset, whose header pattern has
  // no `!`, so those valid commits are wrongly rejected as empty type/subject.
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
      breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
      noteKeywords: ['BREAKING CHANGE', 'BREAKING-CHANGE'],
      revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
      revertCorrespondence: ['header', 'hash'],
      issuePrefixes: ['#'],
    },
  },
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
