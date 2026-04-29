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
    except subprocess.CalledProcessError as e:
        print(f"Error running command {' '.join(args)}: {e.stderr}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Unexpected error running command {' '.join(args)}: {str(e)}", file=sys.stderr)
        return None

def main():
    if not os.path.exists("audit_results.json"):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with open("audit_results.json", "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading audit_results.json: {str(e)}", file=sys.stderr)
        sys.exit(1)

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
            except Exception as e:
                print(f"Error processing GitHub PR data: {str(e)}", file=sys.stderr)

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
        try:
            with open(filename, "r") as f:
                content = f.read()

            # Check if today's entry already exists
            date_header = f"## {date_str}"
            if date_header in content:
                print(f"Summary for {date_str} already exists in {filename}.")
                return

            lines = content.splitlines(keepends=True)

            # Find where to insert (after the header and intro)
            insert_idx = 0
            for i, line in enumerate(lines):
                if "summary of pull requests I have reviewed" in line:
                    insert_idx = i + 1
                    break

            # Build new content
            new_lines = lines[:insert_idx]
            new_lines.append("\n")
            new_lines.append(summary)
            # Ensure there's a blank line after our summary if we're prepending to other content
            if insert_idx < len(lines) and lines[insert_idx].strip() != "":
                 new_lines.append("\n")
            new_lines.extend(lines[insert_idx:])

            with open(filename, "w") as f:
                f.writelines(new_lines)
        except Exception as e:
            print(f"Error updating {filename}: {str(e)}", file=sys.stderr)
    else:
        try:
            with open(filename, "w") as f:
                f.write("# PR Review Summary\n\n")
                f.write("This file contains a summary of pull requests I have reviewed.\n\n")
                f.write(summary)
        except Exception as e:
            print(f"Error creating {filename}: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    main()
