#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def run_gh(args):
    """Execute a GitHub CLI command securely."""
    try:
        # Literal "gh" to satisfy security scanners
        res = subprocess.run(["gh"] + args, shell=False, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except Exception:
        return None

def get_prs():
    """Get open PRs using GitHub CLI."""
    raw = run_gh(["pr", "list", "--state", "open", "--json", "number,headRefName"])
    if not raw:
        return {}
    try:
        return {p["headRefName"]: p["number"] for p in json.loads(raw)}
    except Exception:
        return {}

def update_s(txt, s):
    """Increment stats based on mappings."""
    m = { "Orphan": "Orphan", ".npmrc": "NPMRC", "ROADMAP": "ROADMAP",
          "gitVersion": "GVC", "review.md": "REVIEW", "security": "HELPERS",
          "navigation.ts": "UNREAD" }
    for k, v in m.items():
        if k in txt: s[v] += 1

def get_stats(items):
    """Calculate statistics."""
    s = {k: 0 for k in ["Orphan", "NPMRC", "ROADMAP", "GVC", "REVIEW", "HELPERS", "UNREAD"]}
    for it in items:
        update_s(str(it["issues"]), s)
    return s

def post_comment(prs, branch, issues):
    """Post comment if PR exists."""
    if branch in prs:
        msg = "### ⚠️ Regressions Detected\n\nBlocked by:\n"
        for iss in issues: msg += f"- {iss}\n"
        run_gh(["pr", "comment", str(prs[branch]), "--body", msg])

def main():
    """Main execution."""
    if not os.path.exists("audit_results.json"): sys.exit(1)
    with open("audit_results.json") as f: data = json.load(f)

    prs = get_prs()
    blocked = data.get("blocked", [])
    for it in blocked:
        post_comment(prs, it["branch"], it["issues"])

    total = data.get("total_branches", 0)
    st = get_stats(blocked)
    dt = datetime.now().strftime("%Y-%m-%d")
    out = f"## {dt}\n\n### Daily Audit Summary\n\nAudited {total} branches.\n\n"
    out += "| Type | Count | Severity |\n| :--- | :--- | :--- |\n"
    out += f"| Orphan | {st['Orphan']} | 🔴 |\n| Missing .npmrc | {st['NPMRC']} | 🔴 |\n"
    out += f"| Missing Roadmap | {st['ROADMAP']} | 🟠 |\n| Missing GVC | {st['GVC']} | 🟠 |\n"
    out += f"| Missing Review | {st['REVIEW']} | 🟡 |\n| Reverted Helpers | {st['HELPERS']} | 🔴 |\n"
    out += f"| Unreadable Nav | {st['UNREAD']} | 🔴 |\n\n"
    with open("daily_summary.txt", "w") as f: f.write(out)

if __name__ == "__main__":
    main()
