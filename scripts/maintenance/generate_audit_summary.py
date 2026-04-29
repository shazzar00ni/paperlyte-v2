#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def run_command(args):
    try:
        result = subprocess.run(args, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except:
        return None

def main():
    if not os.path.exists("audit_results.json"):
        sys.exit(1)
    with open("audit_results.json", "r") as f:
        data = json.load(f)

    pr_map = {}
    pr_comments_cache = {}
    gh_cli = run_command(["which", "gh"])
    if gh_cli:
        pr_list_json = run_command(["gh", "pr", "list", "--state", "open", "--limit", "1000", "--json", "number,headRefName"])
        if pr_list_json:
            try:
                prs = json.loads(pr_list_json)
                for pr in prs:
                    pr_map[pr["headRefName"]] = pr["number"]
                    comments_json = run_command(["gh", "pr", "view", str(pr["number"]), "--json", "comments"])
                    if comments_json:
                        c_data = json.loads(comments_json)
                        pr_comments_cache[pr["number"]] = [c["body"] for c in c_data.get("comments", [])]
            except:
                pass

    stats = {"Orphan": 0, "NPMRC": 0, "ROADMAP": 0, "GVC": 0, "REVIEW": 0, "HELPERS": 0, "UNREADABLE": 0}
    for item in data.get("blocked", []):
        issues = item["issues"]
        issues_str = str(issues)
        if "Orphan branch" in issues_str: stats["Orphan"] += 1
        if "Missing .npmrc" in issues_str: stats["NPMRC"] += 1
        if "Missing docs/ROADMAP.md" in issues_str: stats["ROADMAP"] += 1
        if "Missing gitVersionControl.md" in issues_str: stats["GVC"] += 1
        if "Missing review.md" in issues_str: stats["REVIEW"] += 1
        if "security helper" in issues_str: stats["HELPERS"] += 1
        if "Could not read src/utils/navigation.ts" in issues_str: stats["UNREADABLE"] += 1

        branch = item["branch"]
        if branch in pr_map:
            pr_num = pr_map[branch]
            marker = "### ⚠️ Systemic Regressions Detected"
            if not any(marker in c for c in pr_comments_cache.get(pr_num, [])):
                comment = f"{marker}\n\nThis branch is currently blocked by regressions:\n\n"
                for issue in issues:
                    comment += f"- {issue}\n"
                comment += "\nPlease restore these critical files or security helpers before merging."
                run_command(["gh", "pr", "comment", str(pr_num), "--body", comment])

    date_str = datetime.now().strftime("%Y-%m-%d")
    total = data.get("total_branches", 0)
    summary = f"## {date_str}\n\n"
    summary += "### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n"
    summary += "- **Status:** Critical — Action Required\n"
    summary += f"- **Summary:** An automated repository-wide audit confirms regressions in {total} unmerged branches.\n\n"
    summary += "| Regression Type | Count | Severity | Notes |\n"
    summary += "| :--- | :--- | :--- | :--- |\n"
    summary += f"| Orphan Branches | {stats['Orphan']} | 🔴 Critical | No shared history. |\n"
    summary += f"| Missing .npmrc | {stats['NPMRC']} | 🔴 Critical | Breaks dependencies. |\n"
    summary += f"| Missing ROADMAP | {stats['ROADMAP']} | 🟠 High | Core documentation. |\n"
    summary += f"| Missing Git Workflow | {stats['GVC']} | 🟠 High | Workflow docs. |\n"
    summary += f"| Missing review.md | {stats['REVIEW']} | 🟡 Medium | AI instructions. |\n"
    summary += f"| Reverted Helpers | {stats['HELPERS']} | 🔴 Critical | Security utilities. |\n"
    summary += f"| Unreadable nav.ts | {stats['UNREADABLE']} | 🔴 Critical | File missing/broken. |\n\n"
    summary += "- **Action Required:** ALL affected branches MUST restore these critical files.\n\n"
    summary += "---\n"

    filename = "PR_REVIEW_SUMMARY.md"
    if os.path.exists(filename):
        with open(filename, "r") as f:
            lines = f.readlines()

        # Keep the main header and insert after it
        if lines and lines[0].startswith("# "):
            new_content = [lines[0], "\n", summary]
            start_index = 1
        else:
            new_content = ["# PR Review Summary\n", "\n", summary]
            start_index = 0

        if start_index < len(lines):
            # Skip any immediate whitespace
            while start_index < len(lines) and lines[start_index].strip() == "":
                start_index += 1
            if start_index < len(lines):
                new_content.append("\n")
                new_content.extend(lines[start_index:])

        with open(filename, "w") as f:
            f.writelines(new_content)
    else:
        with open(filename, "w") as f:
            f.write("# PR Review Summary\n\n")
            f.write(summary)

if __name__ == "__main__":
    main()
