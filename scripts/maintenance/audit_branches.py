#!/usr/bin/env python3
import re
import signal
import json
from scripts.maintenance.utils import run_command

# Handle SIGPIPE for tools like 'head'
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

# Critical files that must be present in all branches
CRITICAL_FILES = [".npmrc", "docs/ROADMAP.md", "gitVersionControl.md", "review.md"]

# Essential security helpers that should not be reverted
SECURITY_HELPERS = ["hasDangerousProtocol", "isRelativeUrl"]

def audit_branch(branch):
    """Audits a single branch for issues."""
    issues = []
    base = run_command(["git", "merge-base", "origin/main", branch])
    if not base:
        issues.append("Orphan branch (no shared history with main)")

    branch_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
    if branch_files_raw:
        branch_files = set(branch_files_raw.split('\n'))
        for path in CRITICAL_FILES:
            if path not in branch_files:
                issues.append(f"Missing {path}")
    else:
        issues.append("Could not list branch files")

    nav_content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
    if nav_content:
        for helper in SECURITY_HELPERS:
            pattern = rf"export\s+(?:function|const)\s+{re.escape(helper)}\b"
            if not re.search(pattern, nav_content):
                issues.append(f"Missing security helper definition: {helper}")
    else:
        issues.append("Could not read src/utils/navigation.ts")
    return issues

def main():
    branches_raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not branches_raw:
        print(json.dumps({"error": "No unmerged branches found."}))
        return

    branches = [b.strip() for b in branches_raw.split('\n') if b.strip() and "origin/HEAD" not in b]
    audit_data = {"total_branches": len(branches), "blocked": [], "ready": []}

    for branch in branches:
        issues = audit_branch(branch)
        branch_name = branch.replace("origin/", "")
        if issues:
            audit_data["blocked"].append({"branch": branch_name, "issues": issues})
        else:
            audit_data["ready"].append(branch_name)

    print(json.dumps(audit_data, indent=2))

if __name__ == "__main__":
    main()
