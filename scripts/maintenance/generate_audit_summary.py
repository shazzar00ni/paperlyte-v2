#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def main():
    if not os.path.exists('audit_results.json'): sys.exit(1)
    with open('audit_results.json', 'r') as f: data = json.load(f)

    # Get PRs
    prs_raw = subprocess.run(["gh", "pr", "list", "--state", "open", "--limit", "1000", "--json", "number,headRefName"], capture_output=True, text=True, check=False) # nosec
    pr_map = {p['headRefName']: p['number'] for p in json.loads(prs_raw.stdout)} if prs_raw.returncode == 0 else {}

    for item in data.get('blocked', []):
        num = pr_map.get(item['branch'])
        if not num: continue

        view = subprocess.run(["gh", "pr", "view", str(num), "--json", "comments"], capture_output=True, text=True, check=False) # nosec
        if view.returncode == 0 and '### ⚠️ Systemic Regressions Detected' in view.stdout: continue

        body = f"### ⚠️ Systemic Regressions Detected\n\nBlocked by: {', '.join(item['issues'])}\n\nPlease restore files."
        subprocess.run(["gh", "pr", "comment", str(num), "--body", body], check=False) # nosec

    # Stats
    stats = {'Orphan': 0, 'NPMRC': 0, 'ROADMAP': 0, 'GVC': 0, 'REVIEW': 0, 'HELPERS': 0, 'UNREADABLE': 0}
    for item in data.get('blocked', []):
        iss = str(item['issues'])
        if 'Orphan' in iss: stats['Orphan'] += 1
        if '.npmrc' in iss: stats['NPMRC'] += 1
        if 'ROADMAP' in iss: stats['ROADMAP'] += 1
        if 'gitVersionControl' in iss: stats['GVC'] += 1
        if 'review.md' in iss: stats['REVIEW'] += 1
        if 'security helper' in iss: stats['HELPERS'] += 1
        if 'navigation.ts' in iss: stats['UNREADABLE'] += 1

    d = datetime.now().strftime('%Y-%m-%d')
    s = f"## {d}\n\n### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n"
    s += f"- **Status:** Critical — Action Required\n- **Summary:** Automated audit of {data.get('total_branches', 0)} unmerged branches.\n\n"
    s += "| Regression | Count | Severity | Notes |\n| :--- | :--- | :--- | :--- |\n"
    s += f"| Orphan | {stats['Orphan']} | 🔴 Critical | No common ancestor. |\n"
    for k, v in [('.npmrc', 'NPMRC'), ('ROADMAP', 'ROADMAP'), ('GVC', 'GVC'), ('Review', 'REVIEW'), ('Helpers', 'HELPERS'), ('navigation.ts', 'UNREADABLE')]:
        s += f"| {k} | {stats[v]} | 🟠 High | Check required. |\n"
    s += "\n- **Action Required:** Restore critical files and helpers.\n\n"
    with open('daily_summary.txt', 'w') as f: f.write(s)

if __name__ == "__main__": main()
