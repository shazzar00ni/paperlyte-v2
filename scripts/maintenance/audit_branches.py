#!/usr/bin/env python3
import subprocess
import os
import sys
import re
import signal
import json

# Handle SIGPIPE for tools like 'head'
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

CRITICAL_FILES = [".npmrc", "docs/ROADMAP.md", "gitVersionControl.md", "review.md"]
SECURITY_HELPERS = ["hasDangerousProtocol", "isRelativeUrl"]

def run_git(args):
    """Executes a git command securely."""
    try:
        # Using a list with 'git' as a literal to satisfy security scans
        result = subprocess.run(["git"] + args, shell=False, check=False, capture_output=True, text=True) # nosec
        return result.stdout.strip() if result.returncode == 0 else None
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def check_branch_health(branch):
    issues = []
    if not run_git(["merge-base", "origin/main", branch]):
        issues.append("Orphan branch (no shared history with main)")

    files_raw = run_git(["ls-tree", "-r", "--name-only", branch])
    if files_raw:
        files = set(files_raw.split('\n'))
        for f in CRITICAL_FILES:
            if f not in files:
                issues.append(f"Missing {f}")
    else:
        issues.append("Could not list branch files")

    nav = run_git(["show", f"{branch}:src/utils/navigation.ts"])
    if nav:
        for h in SECURITY_HELPERS:
            if not re.search(rf"export\s+(?:function|const)\s+{re.escape(h)}\b", nav):
                issues.append(f"Missing security helper: {h}")
    else:
        issues.append("Could not read src/utils/navigation.ts")
    return issues

def main():
    raw = run_git(["branch", "-r", "--no-merged", "origin/main"])
    if not raw:
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in raw.split('\n') if b.strip() and "origin/HEAD" not in b]
    data = {"total_branches": len(branches), "blocked": [], "ready": []}

    for b in branches:
        issues = check_branch_health(b)
        name = b.replace("origin/", "")
        if issues:
            data["blocked"].append({"branch": name, "issues": issues})
        else:
            data["ready"].append(name)
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
