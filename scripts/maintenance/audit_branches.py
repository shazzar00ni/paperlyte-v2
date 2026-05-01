#!/usr/bin/env python3
import subprocess
import os
import sys
import re
import signal
import json

# Handle SIGPIPE
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

CRITICAL_FILES = [".npmrc", "docs/ROADMAP.md", "gitVersionControl.md", "review.md"]
SECURITY_HELPERS = ["hasDangerousProtocol", "isRelativeUrl"]

def run_command(args):
    """Securely executes a command."""
    try:
        # Use constant list of args to avoid injection
        result = subprocess.run(args, shell=False, capture_output=True, text=True, check=False)
        return result.stdout.strip() if result.returncode == 0 else None
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def check_history(branch):
    """Check for shared history with main."""
    if not run_command(["git", "merge-base", "origin/main", branch]):
        return ["Orphan branch (no shared history with main)"]
    return []

def check_files(branch, active_files):
    """Check for missing critical files."""
    issues = []
    raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
    files = set(raw.split("\n")) if raw else set()
    if not files:
        issues.append("Could not list branch files")
    for path in active_files:
        if path not in files:
            issues.append(f"Missing {path}")
    return issues, files

def check_security(branch, files, main_files):
    """Check security helpers in navigation.ts."""
    issues = []
    if "src/utils/navigation.ts" not in main_files:
        return issues

    content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
    if content:
        for h in SECURITY_HELPERS:
            if not re.search(rf"export\s+(?:function|const)\s+{re.escape(h)}\b", content):
                issues.append(f"Missing security helper: {h}")
    elif "src/utils/navigation.ts" not in files:
        issues.append("Missing src/utils/navigation.ts")
    else:
        issues.append("Could not read src/utils/navigation.ts")
    return issues

def audit_branch(branch, main_files, active_files):
    """Audit a specific branch."""
    issues = check_history(branch)
    f_issues, files = check_files(branch, active_files)
    issues.extend(f_issues)
    issues.extend(check_security(branch, files, main_files))
    return issues

def main():
    """Run audit."""
    raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not raw:
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in raw.split("\n") if b.strip() and "origin/HEAD" not in b]
    m_raw = run_command(["git", "ls-tree", "-r", "--name-only", "origin/main"])
    main_files = set(m_raw.split("\n")) if m_raw else set()
    active_files = [f for f in CRITICAL_FILES if f in main_files]

    data = {"total_branches": len(branches), "blocked": [], "ready": []}
    for b in branches:
        issues = audit_branch(b, main_files, active_files)
        name = b.replace("origin/", "")
        if issues:
            data["blocked"].append({"branch": name, "issues": issues})
        else:
            data["ready"].append(name)
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
