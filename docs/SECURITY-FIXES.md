# Security Fixes Summary

This document summarizes the security improvements made to address Semgrep and Codacy findings.

## Overview

All 18 security findings have been addressed with comprehensive defense-in-depth measures:
- ✅ 5 non-literal RegExp issues (Medium severity)
- ✅ 6 path traversal issues (Medium severity)
- ✅ 7 unsafe format string issues (Low severity)

## Changes Made

### 1. Regular Expression Security

**Problem**: Dynamic strings used in RegExp constructor without sanitization (ReDoS risk)

**Solution**:
- Created shared utility: `src/utils/test/regexHelpers.ts`
- Implements `escapeRegExp()` function that escapes all regex metacharacters
- Updated all test files to use shared helper
- Added nosemgrep suppressions with security justifications

**Files Updated**:
- `src/utils/test/regexHelpers.ts` (new shared utility)
- `src/constants/features.test.ts`
- `src/components/sections/FAQ/FAQ.test.tsx`
- `src/components/sections/Comparison/Comparison.test.tsx`
- `src/components/sections/Pricing/Pricing.test.tsx`

### 2. Path Traversal Protection

**Problem**: User-controlled paths could escape project directory

**Solution**:
- Created shared utility: `scripts/utils/filenameValidation.js`
- Implements two validation functions:
  - `isFilenameSafe()`: Validates individual filenames
  - `isPathSafe()`: Validates full file paths with comprehensive checks

**Security Measures**:
- Checks for `..`, `/`, `\` patterns
- Detects URL-encoded patterns (`%2e%2e`, `%2f`, `%5c`)
- Blocks null bytes (`\0`, `%00`)
- Normalizes paths before validation
- Ensures resolved paths stay within project directory
- Uses `path.sep` to prevent false positives

**Files Updated**:
- `scripts/utils/filenameValidation.js` (new shared utility)
- `scripts/check-legal-placeholders.ts`
- `scripts/generate-icons.js`
- `scripts/generate-mockups.js`
- `scripts/inject-dates.js`

### 3. Format String Safety

**Problem**: Template literals with dynamic content in console statements

**Solution**:
- Refactored console.error and console.log to use separate arguments
- Prevents format string confusion

**Files Updated**:
- `src/utils/monitoring.ts`

### 4. Build Fix

**Problem**: `faRouter` icon doesn't exist in Font Awesome library

**Solution**:
- Replaced with `faNetworkWired` which exists and serves the same purpose

**Files Updated**:
- `src/utils/iconLibrary.ts`

## Code Quality Improvements

### Eliminated Code Duplication

**Before**:
- `escapeRegExp` duplicated in 4 test files
- `isFilenameSafe` duplicated in 3 script files
- `isPathSafe` only in 1 file

**After**:
- All utilities consolidated into shared modules
- Single source of truth for security functions
- Comprehensive JSDoc documentation

### Reduced Complexity

- Extracted helper functions to module level
- Improved maintainability
- Added comprehensive documentation
- All functions have detailed security notes

## Testing

All security-related tests pass:
- `src/constants/features.test.ts`: ✅ 36/36 tests passing
- `src/components/sections/FAQ/FAQ.test.tsx`: ✅ escapeRegExp tests passing
- `src/components/sections/Comparison/Comparison.test.tsx`: ✅ escapeRegExp tests passing
- `src/components/sections/Pricing/Pricing.test.tsx`: ✅ escapeRegExp tests passing

## Security Scanner Suppressions

Added nosemgrep comments for false positives:
- RegExp usage is safe because inputs are escaped via `escapeRegExp()`
- Path validation code itself triggers scanner (it uses path.resolve to validate)
- All suppressions include detailed explanations

### Security Scanner Suppressions Strategy

**Targeted inline suppression approach (avoids security blind spots):**

Instead of blanket file exclusions (which would disable ALL security rules for test files),
we use **surgical inline suppression comments** on specific lines that need them:

1. **Inline nosemgrep comments**: Per-line Semgrep suppression
   - `// nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp, javascript_dos_rule-non-literal-regexp`
   - Applied only to lines with RegExp constructors
   - Patterns suppressed: `javascript.lang.security.audit.detect-non-literal-regexp`, `javascript_dos_rule-non-literal-regexp`
   - Located in 4 files at specific lines (FAQ helper, Comparison, Pricing, features tests)
   - Documents why RegExp usage is safe (inputs are escaped)
   - Provides context for future maintainers

2. **Safety comments**: Explanatory comments above each RegExp usage
   - Examples: "Safe: question is escaped via escapeRegExp() before RegExp construction"
   - Self-documenting code that explains the security context
   - Makes code review easier

3. **`.codacy.yml`**: Minimal configuration
   - Only excludes build artifacts (dist, node_modules, coverage)
   - NO blanket test file exclusions (avoids disabling other important security checks)
   - Keeps all other security rules active for test files

**Note on ESLint security rules:**
- The `eslint-plugin-security` and `eslint-plugin-security-node` plugins are not installed in this project
- ESLint9 (our version) uses different rule IDs than ESLint8: `ESLint9_security_detect-non-literal-regexp`, `ESLint9_security-node_non-literal-reg-expr`
- Since these plugins aren't configured, we rely on Semgrep for RegExp security scanning instead

**Why this approach is better:**
- **No security blind spots**: Other security rules still run on test files
- **Surgical suppression**: Only the specific RegExp lines are excluded
- **Self-documenting**: Inline comments explain why each line is safe
- **Maintainable**: Easy to see which lines have suppressions when reading code

**Why these RegExp patterns are safe:**
- All RegExp inputs are sanitized via `escapeRegExp()` before construction
- Test data comes from constants (`FAQ_ITEMS`, `PRICING_PLANS`), not user input
- RegExp patterns are necessary for flexible test assertions (case-insensitive matching)
- The `escapeRegExp()` function escapes all regex metacharacters

## Files Changed

**New Files**:
- `src/utils/test/regexHelpers.ts` - Shared RegExp escaping utility
- `scripts/utils/filenameValidation.js` - Enhanced path validation with `isPathSafe`
- `scripts/path-utils.js` - Path safety utilities for build scripts
- `public/README.md` - Documentation for generated vs source files
- `docs/SECURITY-FIXES.md` (this file)

**Modified Files**:
- Test files: 4 files updated with inline ESLint disable comments (FAQ, Pricing, Comparison, features)
- Script files: 4 files updated (with path validation)
- Application files: 2 files updated (Icon component, iconLibrary)
- Configuration files: 2 files updated (`.codacy.yml`, `.gitignore`)

## Verification

To verify the fixes:

```bash
# Run tests
npm test

# Run build
npm run build

# Check for remaining security issues
# (All Semgrep findings should be resolved or have valid suppressions)
```

## Maintainability Benefits

1. **Single Source of Truth**: All security utilities in dedicated modules
2. **Comprehensive Documentation**: Every function has JSDoc with security notes
3. **Consistent Behavior**: Same validation logic across entire codebase
4. **Easy Updates**: Changes only needed in one place
5. **Clear Security Model**: Well-documented defense-in-depth approach

## Notes

- All regex usage properly sanitizes input via `escapeRegExp()`
- Path validation implements defense-in-depth with multiple checks
- Format strings separated from dynamic data
- Build error (faRouter) fixed as part of this PR
- All changes maintain backward compatibility
- No breaking changes to public APIs
