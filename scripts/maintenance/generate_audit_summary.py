#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def run_cmd(args):
    """Executes command securely."""
    try:
        res = subprocess.run(args, shell=False, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except Exception:
        return None

def get_prs():
    """Map branches to PRs."""
    m = {}
    if run_cmd(["which", "gh"]):
        raw = run_cmd(["gh", "pr", "list", "--state", "open", "--json", "number,headRefName"])
        if raw:
            for p in json.loads(raw):
                m[p["headRefName"]] = p["number"]
    return m

def get_stats(items):
    """Get stats dictionary."""
    s = {k: 0 for k in ["Orphan", "NPMRC", "ROADMAP", "GVC", "REVIEW", "HELPERS", "UNREAD"]}
    for it in items:
        txt = str(it["issues"])
        if "Orphan" in txt: s["Orphan"] += 1
        if ".npmrc" in txt: s["NPMRC"] += 1
        if "ROADMAP" in txt: s["ROADMAP"] += 1
        if "gitVersion" in txt: s["GVC"] += 1
        if "review.md" in txt: s["REVIEW"] += 1
        if "security" in txt: s["HELPERS"] += 1
        if "navigation.ts" in txt: s["UNREAD"] += 1
    return s

def main():
    """Main entry."""
    if not os.path.exists("audit_results.json"): sys.exit(1)
    with open("audit_results.json") as f: data = json.load(f)
    prs = get_prs()
    blocked = data.get("blocked", [])
    stats = get_stats(blocked)

    for it in blocked:
        b = it["branch"]
        if b in prs:
            msg = "### ⚠️ Regressions Detected\n\nBlocked by:\n"
            for iss in it["issues"]: msg += f"- {iss}\n"
            run_cmd(["gh", "pr", "comment", str(prs[b]), "--body", msg])

    total = data.get("total_branches", 0)
    summary = f"## {datetime.now().strftime('%Y-%m-%d')}\n\n"
    summary += f"### Daily Audit Summary\n\nAudited {total} branches.\n\n"
    summary += "| Type | Count | Severity |\n| :--- | :--- | :--- |\n"
    summary += f"| Orphan | {stats['Orphan']} | 🔴 |\n| Missing .npmrc | {stats['NPMRC']} | 🔴 |\n"
    summary += f"| Missing Roadmap | {stats['ROADMAP']} | 🟠 |\n| Missing GVC | {stats['GVC']} | 🟠 |\n"
    summary += f"| Missing Review | {stats['REVIEW']} | 🟡 |\n| Reverted Helpers | {stats['HELPERS']} | 🔴 |\n"
    summary += f"| Unreadable Nav | {stats['UNREAD']} | 🔴 |\n\n"
    with open("daily_summary.txt", "w") as f: f.write(summary)

if __name__ == "__main__":
    main()
