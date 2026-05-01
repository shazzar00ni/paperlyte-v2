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

def run_git(args):
    """Execute a git command securely."""
    try:
        # Use literal "git" to satisfy security scanners
        res = subprocess.run(["git"] + args, shell=False, capture_output=True, text=True, check=False)
        return res.stdout.strip() if res.returncode == 0 else None
    except Exception:
        return None

def check_history(branch):
    """Check for shared history with main."""
    if not run_git(["merge-base", "origin/main", branch]):
        return ["Orphan branch (no shared history with main)"]
    return []

def get_branch_files(branch):
    """List files in branch."""
    raw = run_git(["ls-tree", "-r", "--name-only", branch])
    return set(raw.split("\n")) if raw else set()

def check_missing_files(files, active_files):
    """Check for missing critical files."""
    return [f"Missing {p}" for p in active_files if p not in files]

def check_helper_content(content):
    """Check for specific helpers in file content."""
    res = []
    for h in SECURITY_HELPERS:
        if not re.search(rf"export\s+(?:function|const)\s+{re.escape(h)}\b", content):
            res.append(f"Missing security helper: {h}")
    return res

def check_security(branch, files, main_files):
    """Check security helpers in navigation.ts."""
    if "src/utils/navigation.ts" not in main_files:
        return []

    content = run_git(["show", f"{branch}:src/utils/navigation.ts"])
    if content:
        return check_helper_content(content)

    if "src/utils/navigation.ts" not in files:
        return ["Missing src/utils/navigation.ts"]
    return ["Could not read src/utils/navigation.ts"]

def audit_one(branch, main_files, active_files):
    """Audit a single branch."""
    issues = check_history(branch)
    files = get_branch_files(branch)
    if not files:
        issues.append("Could not list branch files")

    issues.extend(check_missing_files(files, active_files))
    issues.extend(check_security(branch, files, main_files))
    return issues

def get_config():
    """Identify active critical files on main."""
    m_raw = run_git(["ls-tree", "-r", "--name-only", "origin/main"])
    m_files = set(m_raw.split("\n")) if m_raw else set()
    active = [f for f in CRITICAL_FILES if f in m_files]
    return m_files, active

def main():
    """Main entry point."""
    raw = run_git(["branch", "-r", "--no-merged", "origin/main"])
    if not raw:
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in raw.split("\n") if b.strip() and "origin/HEAD" not in b]
    m_files, active = get_config()

    res = {"total_branches": len(branches), "blocked": [], "ready": []}
    for b in branches:
        issues = audit_one(b, m_files, active)
        name = b.replace("origin/", "")
        if issues:
            res["blocked"].append({"branch": name, "issues": issues})
        else:
            res["ready"].append(name)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
