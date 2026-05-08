#!/usr/bin/env python3
import subprocess
import os
import sys
import re
import signal
import json

# Handle SIGPIPE for tools like 'head'
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

# Critical files that must be present in all branches
CRITICAL_FILES = [
    ".npmrc",
    "docs/ROADMAP.md",
    "gitVersionControl.md",
    "review.md"
]

# Essential security helpers that should not be reverted
SECURITY_HELPERS = [
    "hasDangerousProtocol",
    "isRelativeUrl"
]

def run_command(args):
    """Executes a git command securely using list-based arguments and shell=False."""
    try:
        # Use literal list to satisfy Codacy security requirements
        result = subprocess.run(
            args,
            shell=False,
            check=False,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error executing command: {e}", file=sys.stderr)
        return None

def check_critical_files(branch, issues):
    branch_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
    if branch_files_raw:
        branch_files = set(branch_files_raw.split('\n'))
        for path in CRITICAL_FILES:
            if path not in branch_files:
                issues.append(f"Missing {path}")
    else:
        issues.append("Could not list branch files")

def check_security_helpers(branch, issues):
    nav_content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
    if nav_content:
        for helper in SECURITY_HELPERS:
            pattern = rf"export\s+(?:function|const)\s+{re.escape(helper)}\b"
            if not re.search(pattern, nav_content):
                issues.append(f"Missing security helper definition: {helper}")
    else:
        issues.append("Could not read src/utils/navigation.ts")

def audit_branch(branch, audit_data):
    issues = []
    base = run_command(["git", "merge-base", "origin/main", branch])
    if not base:
        issues.append("Orphan branch (no shared history with main)")

    check_critical_files(branch, issues)
    check_security_helpers(branch, issues)

    branch_name = branch.replace("origin/", "")
    if issues:
        audit_data["blocked"].append({"branch": branch_name, "issues": issues})
    else:
        audit_data["ready"].append(branch_name)

def main():
    branches_raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not branches_raw:
        print(json.dumps({"error": "No unmerged branches found or error during git branch command."}))
        return

    branches = [b.strip() for b in branches_raw.split('\n') if b.strip() and "origin/HEAD" not in b]
    audit_data = {"total_branches": len(branches), "blocked": [], "ready": []}

    for branch in branches:
        audit_branch(branch, audit_data)

    print(json.dumps(audit_data, indent=2))

if __name__ == "__main__":
    main()
