#!/usr/bin/env python3
import subprocess
import os
import sys
import re
import signal
import json

signal.signal(signal.SIGPIPE, signal.SIG_DFL)

def main():
    # Use literal list to satisfy Whiny Codacy
    res = subprocess.run(["git", "branch", "-r", "--no-merged", "origin/main"], capture_output=True, text=True, check=False) # nosec
    if res.returncode != 0 or not res.stdout.strip():
        print(json.dumps({"total_branches": 0, "blocked": [], "ready": []}))
        return

    branches = [b.strip() for b in res.stdout.strip().split('\n') if b.strip() and "origin/HEAD" not in b]
    data = {"total_branches": len(branches), "blocked": [], "ready": []}

    for b in branches:
        issues = []
        # Check merge base
        if subprocess.run(["git", "merge-base", "origin/main", b], capture_output=True, check=False).returncode != 0: # nosec
            issues.append("Orphan branch (no shared history with main)")

        # Check files
        ls = subprocess.run(["git", "ls-tree", "-r", "--name-only", b], capture_output=True, text=True, check=False) # nosec
        if ls.returncode == 0:
            files = set(ls.stdout.strip().split('\n'))
            for f in [".npmrc", "docs/ROADMAP.md", "gitVersionControl.md", "review.md"]:
                if f not in files: issues.append(f"Missing {f}")

        # Check navigation.ts
        show = subprocess.run(["git", "show", f"{b}:src/utils/navigation.ts"], capture_output=True, text=True, check=False) # nosec
        if show.returncode == 0:
            for h in ["hasDangerousProtocol", "isRelativeUrl"]:
                if not re.search(rf"export\s+(?:function|const)\s+{re.escape(h)}\b", show.stdout):
                    issues.append(f"Missing security helper: {h}")

        name = b.replace("origin/", "")
        if issues:
            data["blocked"].append({"branch": name, "issues": issues})
        else:
            data["ready"].append(name)
    print(json.dumps(data, indent=2))

if __name__ == "__main__": main()
