#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def run_command(args):
    """Executes a command securely."""
    try:
        result = subprocess.run(
            args,
            shell=False,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.SubprocessError:
        return None

def get_pr_map():
    """Retrieve mapping of branches to open PR numbers."""
    pr_map = {}
    gh_cli = run_command(["which", "gh"])
    if gh_cli:
        pr_list_json = run_command(["gh", "pr", "list", "--state", "open", "--limit", "1000", "--json", "number,headRefName"])
        if pr_list_json:
            try:
                prs = json.loads(pr_list_json)
                for pr in prs:
                    pr_map[pr["headRefName"]] = pr["number"]
            except (json.JSONDecodeError, KeyError):
                pass
    return pr_map

def get_stats(blocked_items):
    """Calculate statistics for the audit summary."""
    stats = {"Orphan": 0, "NPMRC": 0, "ROADMAP": 0, "GVC": 0, "REVIEW": 0, "HELPERS": 0, "UNREADABLE": 0}
    for item in blocked_items:
        issues_str = str(item["issues"])
        if "Orphan branch" in issues_str: stats["Orphan"] += 1
        if "Missing .npmrc" in issues_str: stats["NPMRC"] += 1
        if "Missing docs/ROADMAP.md" in issues_str: stats["ROADMAP"] += 1
        if "Missing gitVersionControl.md" in issues_str: stats["GVC"] += 1
        if "Missing review.md" in issues_str: stats["REVIEW"] += 1
        if "security helper" in issues_str: stats["HELPERS"] += 1
        if "Could not read src/utils/navigation.ts" in issues_str: stats["UNREADABLE"] += 1
    return stats

def main():
    """Generate audit summary and comment on PRs."""
    if not os.path.exists("audit_results.json"):
        sys.exit(1)

    with open("audit_results.json", "r") as f:
        data = json.load(f)

    pr_map = get_pr_map()
    stats = get_stats(data.get("blocked", []))

    # Comment on PRs
    for item in data.get("blocked", []):
        branch = item["branch"]
        if branch in pr_map:
            pr_num = pr_map[branch]
            comment = "### ⚠️ Systemic Regressions Detected\n\nThis branch is currently blocked by the following regressions:\n\n"
            for issue in item["issues"]:
                comment += f"- {issue}\n"
            comment += "\nPlease restore these critical files or security helpers before merging."
            run_command(["gh", "pr", "comment", str(pr_num), "--body", comment])

    # Generate Summary Markdown
    date_str = datetime.now().strftime("%Y-%m-%d")
    total = data.get("total_branches", 0)
    summary = f"## {date_str}\n\n"
    summary += "### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n"
    summary += "- **Status:** Critical — Action Required\n"
    summary += f"- **Summary:** An automated repository-wide audit of {total} unmerged branches confirms the following systemic regressions.\n\n"
    summary += "| Regression Type                | Count | Severity    | Notes                                                                    |\n"
    summary += "| :----------------------------- | :---- | :---------- | :----------------------------------------------------------------------- |\n"
    summary += f"| Orphan Branches                | {stats['Orphan']}   | 🔴 Critical | No common ancestor with .                                          |\n"
    summary += f"| Missing                | {stats['NPMRC']}    | 🔴 Critical | Breaks dependency resolution.                                            |\n"
    summary += f"| Missing       | {stats['ROADMAP']}    | 🟠 High     | Core project documentation.                                              |\n"
    summary += f"| Missing  | {stats['GVC']}   | 🟠 High     | Core Git workflow documentation.                                         |\n"
    summary += f"| Missing             | {stats['REVIEW']}   | 🟡 Medium   | AI PR reviewer instructions.                                             |\n"
    summary += f"| Reverted Security Helpers      | {stats['HELPERS']}   | 🔴 Critical |  and  helpers.                      |\n"
    summary += f"| Unreadable navigation.ts       | {stats['UNREADABLE']}     | 🔴 Critical | File missing or unreadable.                                              |\n\n"
    summary += "- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n\n"

    with open("daily_summary.txt", "w") as f:
        f.write(summary)

if __name__ == "__main__":
    main()
