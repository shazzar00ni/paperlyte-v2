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
        result = subprocess.run(
            args,
            shell=False,
            check=False,  # We handle errors based on returncode or empty output
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error executing command {' '.join(args)}: {e}", file=sys.stderr)
        return None

def main():
    # Get all remote unmerged branches relative to origin/main
    branches_raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not branches_raw:
        print(json.dumps({"error": "No unmerged branches found or error during git branch command."}))
        return

    # Filter out empty lines and the symbolic HEAD ref
    branches = [b.strip() for b in branches_raw.split('\n') if b.strip() and "origin/HEAD" not in b]

    audit_data = {
        "total_branches": len(branches),
        "blocked": [],
        "ready": []
    }

    for branch in branches:
        issues = []

        # 0. Check for shared history (merge-base) with origin/main
        base = run_command(["git", "merge-base", "origin/main", branch])
        if not base:
            issues.append("Orphan branch (no shared history with main)")

        # 1. Check for missing critical files using git ls-tree
        branch_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
        if branch_files_raw:
            branch_files = set(branch_files_raw.split('\n'))
            for path in CRITICAL_FILES:
                if path not in branch_files:
                    issues.append(f"Missing {path}")
        else:
            issues.append("Could not list branch files")

        # 2. Check for security helpers in src/utils/navigation.ts
        nav_content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
        if nav_content:
            for helper in SECURITY_HELPERS:
                # Robust pattern to match both 'export function helperName' and 'export const helperName ='
                pattern = rf"export\s+(?:function|const)\s+{re.escape(helper)}\b"
                if not re.search(pattern, nav_content):
                    issues.append(f"Missing security helper definition: {helper}")
        else:
            issues.append("Could not read src/utils/navigation.ts")

        branch_name = branch.replace("origin/", "")
        if issues:
            audit_data["blocked"].append({
                "branch": branch_name,
                "issues": issues
            })
        else:
            audit_data["ready"].append(branch_name)

    # Output the audit data as JSON for the workflow to consume
    print(json.dumps(audit_data, indent=2))

if __name__ == "__main__":
    main()
