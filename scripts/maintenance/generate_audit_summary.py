#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def get_prs():
    """Get PRs."""
    try:
        cmd = ["gh", "pr", "list", "--state", "open", "--json", "number,headRefName"]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return {p["headRefName"]: p["number"] for p in json.loads(res.stdout)}
    except Exception:
        return {}

def main():
    """Main."""
    if not os.path.exists("audit_results.json"): sys.exit(1)
    with open("audit_results.json") as f: data = json.load(f)
    prs = get_prs()
    blocked = data.get("blocked", [])

    for it in blocked:
        b = it["branch"]
        if b in prs:
            msg = "### ⚠️ Regressions Detected\n\nBlocked by:\n"
            for iss in it["issues"]: msg += f"- {iss}\n"
            subprocess.run(["gh", "pr", "comment", str(prs[b]), "--body", msg], check=False)

    dt = datetime.now().strftime("%Y-%m-%d")
    out = f"## {dt}\n\n### Daily Audit Summary\n\nAudited {data.get('total_branches', 0)} branches.\n\n"
    out += "| Type | Count |\n| :--- | :--- |\n"

    mapping = {"Orphan": "Orphan", ".npmrc": "NPMRC", "ROADMAP": "ROAD", "gitVersion": "GVC", "review.md": "REV", "security": "SEC", "navigation.ts": "NAV"}
    stats = {v: 0 for v in mapping.values()}
    for it in blocked:
        txt = str(it["issues"])
        for k, v in mapping.items():
            if k in txt: stats[v] += 1

    for k, v in stats.items(): out += f"| {k} | {v} |\n"
    with open("daily_summary.txt", "w") as f: f.write(out)

if __name__ == "__main__":
    main()
