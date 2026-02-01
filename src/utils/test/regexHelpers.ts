/**
 * Regular Expression Test Helpers
 *
 * Shared utilities for safely constructing regular expressions in tests.
 * This helper prevents Regular Expression Denial of Service (ReDoS) attacks
 * by properly escaping all regex metacharacters.
 */

/**
 * Escapes special regex characters in a string to make it safe for use in RegExp constructor.
 * Prevents ReDoS (Regular Expression Denial of Service) attacks by escaping all regex metacharacters.
 *
 * Security Note: This function sanitizes dynamic strings before passing them to the RegExp
 * constructor. All regex patterns using dynamic content should use this escaping function.
 *
 * @param str - String to escape
 * @returns Escaped string safe for regex construction
 *
 * @example
 * ```typescript
 * const userInput = "What is $100?"
 * const regex = new RegExp(escapeRegExp(userInput), 'i')
 * // Creates regex that matches literal string "What is $100?" instead of treating $ as special
 * ```
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
