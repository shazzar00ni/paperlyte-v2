# Shell Script Coverage Configuration

This document describes the shell script coverage tracking setup for the branch protection validation tests.

## Overview

Shell script coverage is tracked using [kcov](https://github.com/SimonKagstrom/kcov), a code coverage tool that works with bash scripts without requiring instrumentation.

## CI Integration

The shell script tests are integrated into the CI pipeline as a dedicated job:

### Job: `shell-tests`

**Location**: `.github/workflows/ci.yml`

**Purpose**: Runs the branch validation test suite with coverage tracking

**Steps**:
1. **Install kcov**: Installs kcov for shell script coverage
2. **Run tests**: Executes the test suite without coverage (validation)
3. **Run with coverage**: Executes tests with kcov for coverage tracking
4. **Upload to Codecov**: Uploads coverage data with flag `shell-tests`
5. **Archive artifacts**: Saves coverage reports for 30 days

### Coverage Reporting

Coverage reports are sent to two destinations:

1. **Codecov**: Integrated with pull requests and main dashboard
   - Flag: `shell-tests`
   - Path: `.github/scripts/`
   - Configuration: `codecov.yml`

2. **GitHub Artifacts**: Available for download
   - Artifact name: `shell-coverage-report`
   - Retention: 30 days

## Codacy Integration

Shell script analysis is enabled in Codacy:

**File**: `.codacy.yml`

```yaml
engines:
  shellcheck:
    enabled: true
```

ShellCheck provides:
- Static analysis for shell scripts
- Best practice recommendations
- Common error detection
- Security issue identification

## Coverage Thresholds

Coverage data is tracked but does not fail the build. This allows:
- Visibility into test coverage
- Trend tracking over time
- Identification of untested code paths

## Local Testing

To run tests locally with coverage:

```bash
# Install kcov (Ubuntu/Debian)
sudo apt-get install kcov

# Run tests with coverage
mkdir -p coverage-shell
kcov \
  --exclude-pattern=/usr \
  --include-pattern=.github/scripts/ \
  coverage-shell \
  ./.github/scripts/test-branch-validation.sh

# View coverage report
open coverage-shell/index.html  # macOS
xdg-open coverage-shell/index.html  # Linux
```

## What is Covered

The coverage tracking includes:

1. **Test Suite**: `test-branch-validation.sh`
   - All test functions
   - Test execution logic
   - Result reporting

2. **Validation Logic**: Functions called during tests
   - Whitelist validation (workflow)
   - Blacklist validation (shell script)
   - Git format validation

## Interpreting Results

Coverage metrics available:

- **Line Coverage**: Percentage of lines executed
- **Function Coverage**: Percentage of functions called
- **Branch Coverage**: Percentage of conditional branches taken

## Continuous Improvement

To improve coverage:

1. Add tests for edge cases
2. Test error handling paths
3. Cover all validation branches
4. Test with various input types

## References

- [kcov Documentation](https://github.com/SimonKagstrom/kcov)
- [Codecov Shell Coverage](https://docs.codecov.com/docs/supported-languages#shell)
- [ShellCheck](https://www.shellcheck.net/)
- [Bash Testing Best Practices](https://github.com/bats-core/bats-core)

## Troubleshooting

### kcov Installation Issues

If kcov fails to install, ensure:
- System is updated: `sudo apt-get update`
- Build tools are installed: `sudo apt-get install build-essential`

### Coverage Not Generated

Check:
- Shell script has execute permissions: `chmod +x script.sh`
- Script uses `#!/bin/bash` shebang
- No syntax errors: `bash -n script.sh`

### Low Coverage

Consider:
- Are all functions being called?
- Are all branches being tested?
- Are error paths covered?
- Add more comprehensive test cases
