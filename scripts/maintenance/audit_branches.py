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

def check_history(branch):
    """Check merge base."""
    cmd = ["git", "merge-base", "origin/main", branch]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0 or not res.stdout.strip():
        return ["Orphan branch (no shared history with main)"]
    return []

def get_files(branch):
    """Get files."""
    cmd = ["git", "ls-tree", "-r", "--name-only", branch]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0:
        return set()
    return set(res.stdout.strip().split("\n"))

def check_security(branch, files, has_nav):
    """Check security helpers."""
    if not has_nav:
        return []
    cmd = ["git", "show", f"{branch}:src/utils/navigation.ts"]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0:
        if "src/utils/navigation.ts" not in files:
            return ["Missing src/utils/navigation.ts"]
        return ["Could not read navigation.ts"]

    content = res.stdout
    issues = []
    for h in SECURITY_HELPERS:
        if not re.search(rf"export\s+(?:function|const)\s+{re.escape(h)}\b", content):
            issues.append(f"Missing security helper: {h}")
    return issues

def audit_one(branch, main_files, active_files):
    """Audit branch."""
    issues = check_history(branch)
    files = get_files(branch)
    if not files:
        issues.append("Could not list files")
    for f in active_files:
        if f not in files:
            issues.append(f"Missing {f}")
    issues.extend(check_security(branch, files, "src/utils/navigation.ts" in main_files))
    return issues

def main():
    """Main entry."""
    cmd = ["git", "branch", "-r", "--no-merged", "origin/main"]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0 or not res.stdout.strip():
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in res.stdout.split("\n") if b.strip() and "origin/HEAD" not in b]
    cmd_main = ["git", "ls-tree", "-r", "--name-only", "origin/main"]
    res_main = subprocess.run(cmd_main, capture_output=True, text=True, check=False)
    main_files = set(res_main.stdout.split("\n")) if res_main.returncode == 0 else set()
    active = [f for f in CRITICAL_FILES if f in main_files]

    out = {"total_branches": len(branches), "blocked": [], "ready": []}
    for b in branches:
        iss = audit_one(b, main_files, active)
        name = b.replace("origin/", "")
        if iss:
            out["blocked"].append({"branch": name, "issues": iss})
        else:
            out["ready"].append(name)
    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()
