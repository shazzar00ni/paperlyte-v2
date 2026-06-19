/**
 * Commitlint configuration for Paperlyte.
 *
 * Extends @commitlint/config-conventional (the Conventional Commits ruleset and
 * parser, which handles breaking-change shorthand like `feat!:`). Both
 * @commitlint/cli and @commitlint/config-conventional are devDependencies, so the
 * documented workflow runs from the local install on a clean checkout (no network
 * fetch required):
 *
 *   Validate a message:  printf '%s' "<message>" | npx commitlint
 *   Inspect the rules:    npx commitlint --print-config json
 */
export default {
  extends: ['@commitlint/config-conventional'],
}
