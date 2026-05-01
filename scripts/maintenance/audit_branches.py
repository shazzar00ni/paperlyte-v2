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
    """Executes a command securely."""
    try:
        # Use a list of arguments to prevent shell injection
        result = subprocess.run(
            args,
            shell=False,
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def get_active_critical_files(main_files):
    """Filter critical files to those currently on main."""
    return [f for f in CRITICAL_FILES if f in main_files]

def audit_branch(branch, main_files, active_critical_files):
    """Check a specific branch for regressions."""
    issues = []
    # 0. Check for shared history
    base = run_command(["git", "merge-base", "origin/main", branch])
    if not base:
        issues.append("Orphan branch (no shared history with main)")

    # 1. Check for missing critical files
    branch_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
    branch_files = set(branch_files_raw.split('\n')) if branch_files_raw else set()
    if not branch_files:
        issues.append("Could not list branch files")

    for path in active_critical_files:
        if path not in branch_files:
            issues.append(f"Missing {path}")

    # 2. Check for security helpers in src/utils/navigation.ts (if it exists on main)
    if "src/utils/navigation.ts" in main_files:
        nav_content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
        if nav_content:
            for helper in SECURITY_HELPERS:
                pattern = rf"export\s+(?:function|const)\s+{re.escape(helper)}\b"
                if not re.search(pattern, nav_content):
                    issues.append(f"Missing security helper definition: {helper}")
        elif "src/utils/navigation.ts" not in branch_files:
            issues.append("Missing src/utils/navigation.ts (critical file)")
        else:
            issues.append("Could not read src/utils/navigation.ts")
    return issues

def main():
    """Run repository-wide audit."""
    branches_raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not branches_raw:
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in branches_raw.split('\n') if b.strip() and "origin/HEAD" not in b]
    main_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", "origin/main"])
    main_files = set(main_files_raw.split('\n')) if main_files_raw else set()
    active_critical_files = get_active_critical_files(main_files)

    audit_data = {
        "total_branches": len(branches),
        "blocked": [],
        "ready": []
    }

    for branch in branches:
        issues = audit_branch(branch, main_files, active_critical_files)
        branch_name = branch.replace("origin/", "")
        if issues:
            audit_data["blocked"].append({"branch": branch_name, "issues": issues})
        else:
            audit_data["ready"].append(branch_name)

    print(json.dumps(audit_data, indent=2))

if __name__ == "__main__":
    main()
