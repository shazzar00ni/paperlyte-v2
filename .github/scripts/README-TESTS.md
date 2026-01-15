# Branch Protection Validation Tests

This directory contains tests for the branch name validation logic used in the branch protection workflow.

## Test Files

### `test-branch-validation.sh`

Comprehensive test suite for validating branch name security and format validation.

**Purpose**: Ensures that malicious branch names are rejected while valid Git branch names are accepted.

**What it tests**:

1. **Command Injection Attempts**: Tests various attack vectors including:
   - Command substitution with `$()` and backticks
   - Command separators (`;`, `&&`, `|`)
   - Redirection operators (`<`, `>`)
   - Subshells and expansions

2. **Security Checks**: Tests additional security concerns:
   - Path traversal attempts (`../../../`)
   - Special characters that could break parsing
   - Whitespace characters (spaces, tabs, newlines)

3. **Valid Branch Names**: Ensures standard Git branch names work:
   - Simple names (`main`, `develop`, `master`)
   - Feature branches (`feature/test-branch`)
   - Release branches (`release/v1.0.0`)
   - Various naming conventions with hyphens, underscores, and dots

4. **Edge Cases**: Tests boundary conditions:
   - Very long branch names
   - Single character names
   - All numeric names
   - Multiple nested slashes

**Running the tests**:

```bash
# Run from repository root
./.github/scripts/test-branch-validation.sh
```

**Expected output**:
- All 50 tests should pass
- Green checkmarks for each passing test
- Summary showing 50/50 passed

## Validation Logic

The tests verify two validation strategies:

### Workflow Validation (`.github/workflows/setup-branch-protection.yml`)

1. **Whitelist approach**: Only allows `[a-zA-Z0-9/_.-]`
2. **Git format validation**: Uses `git check-ref-format --branch`

### Script Validation (`.github/scripts/setup-branch-protection.sh`)

1. **Blacklist approach**: Rejects dangerous characters `[\$\`;|&<>(){}[:space:]]`
2. **Git format validation**: Uses `git check-ref-format --branch`

Both approaches provide defense-in-depth protection against command injection vulnerabilities.

## Security Principles

- **Defense in Depth**: Multiple validation layers
- **Fail Secure**: Reject invalid input immediately
- **Input Validation**: Explicit character validation before use
- **Comprehensive Testing**: 50+ test cases covering attack vectors and valid inputs

## Continuous Integration

These tests should be run as part of the CI pipeline to ensure validation logic remains secure.

## Adding New Tests

To add a new test case:

```bash
test_workflow_validation 'your-branch-name' "accepted|rejected" "Description of test"
test_script_validation 'your-branch-name' "accepted|rejected" "Description of test"
```

## References

- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
- [Git Reference Format](https://git-scm.com/docs/git-check-ref-format)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
