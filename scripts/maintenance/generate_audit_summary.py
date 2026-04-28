#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

def run_command(args):
    """Executes a command securely using list-based arguments and shell=False."""
    try:
        result = subprocess.run(args, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        if args[0] != 'which':
            print(f"Error executing {' '.join(args)}: {e.stderr}", file=sys.stderr)
        return None

def update_summary_file(new_content):
    """Prepends new content to PR_REVIEW_SUMMARY.md while maintaining structure."""
    filepath = 'PR_REVIEW_SUMMARY.md'
    header = "# PR Review Summary\n\nThis file contains a summary of pull requests I have reviewed.\n\n"

    existing_content = ""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            existing_content = f.read()

    # Remove existing title/header if present to avoid duplication
    cleaned_existing = existing_content.replace("# PR Review Summary\n\nThis file contains a summary of pull requests I have reviewed.\n\n", "")
    cleaned_existing = cleaned_existing.replace("# PR Review Summary\n", "").replace("This file contains a summary of pull requests I have reviewed.\n", "")
    cleaned_existing = cleaned_existing.lstrip()

    # Look for current date entry to avoid duplicates if run multiple times same day
    date_str = datetime.now().strftime('%Y-%m-%d')
    if f"## {date_str}" in cleaned_existing:
        # Split at the next entry and discard the first one (today's previous run)
        parts = cleaned_existing.split("---", 1)
        if len(parts) > 1:
            cleaned_existing = parts[1].lstrip()

    final_content = header + new_content + "\n---\n\n" + cleaned_existing

    with open(filepath, 'w') as f:
        f.write(final_content)

def main():
    if not os.path.exists('audit_results.json'):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    with open('audit_results.json', 'r') as f:
        data = json.load(f)

    gh_cli = run_command(['which', 'gh'])
    pr_map = {}
    if gh_cli:
        pr_list_json = run_command(['gh', 'pr', 'list', '--state', 'open', '--limit', '1000', '--json', 'number,headRefName'])
        if pr_list_json:
            try:
                prs = json.loads(pr_list_json)
                for pr in prs:
                    pr_map[pr['headRefName']] = pr['number']
            except json.JSONDecodeError:
                pass

    stats = {
        'Orphan': 0, 'NPMRC': 0, 'ROADMAP': 0, 'GVC': 0, 'REVIEW': 0, 'HELPERS': 0, 'UNREADABLE': 0
    }

    for item in data.get('blocked', []):
        issues = item['issues']
        issues_str = str(issues)
        if 'Orphan branch' in issues_str: stats['Orphan'] += 1
        if 'Missing .npmrc' in issues_str: stats['NPMRC'] += 1
        if 'Missing docs/ROADMAP.md' in issues_str: stats['ROADMAP'] += 1
        if 'Missing gitVersionControl.md' in issues_str: stats['GVC'] += 1
        if 'Missing review.md' in issues_str: stats['REVIEW'] += 1
        if 'security helper' in issues_str: stats['HELPERS'] += 1
        if 'Could not read src/utils/navigation.ts' in issues_str: stats['UNREADABLE'] += 1

        branch = item['branch']
        if branch in pr_map:
            pr_num = pr_map[branch]

            # Idempotency check: Don't comment if we already commented on this PR with these specific issues
            existing_comments = run_command(['gh', 'pr', 'view', str(pr_num), '--json', 'comments'])
            already_commented = False
            if existing_comments:
                try:
                    comments = json.loads(existing_comments).get('comments', [])
                    for c in comments:
                        if '### ⚠️ Systemic Regressions Detected' in c['body']:
                            already_commented = True
                            break
                except json.JSONDecodeError:
                    pass

            if not already_commented:
                comment = '### ⚠️ Systemic Regressions Detected\n\nThis branch is currently blocked by the following regressions:\n\n'
                for issue in issues:
                    comment += f'- {issue}\n'
                comment += '\nPlease restore these critical files or security helpers before merging.'
                run_command(['gh', 'pr', 'comment', str(pr_num), '--body', comment])

    # Generate Markdown Summary
    date_str = datetime.now().strftime('%Y-%m-%d')
    total = data.get('total_branches', 0)

    summary = f'## {date_str}\n\n'
    summary += '### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n'
    summary += '- **Status:** Critical — Action Required\n'
    summary += f'- **Summary:** An automated repository-wide audit of {total} unmerged branches confirms the following systemic regressions.\n\n'
    summary += '| Regression Type                | Count | Severity    | Notes                                                                    |\n'
    summary += '| :----------------------------- | :---- | :---------- | :----------------------------------------------------------------------- |\n'
    summary += f'| Orphan Branches                | {stats["Orphan"]}   | 🔴 Critical | No common ancestor with `main`.                                          |\n'
    summary += f'| Missing `.npmrc`               | {stats["NPMRC"]}    | 🔴 Critical | Breaks dependency resolution.                                            |\n'
    summary += f'| Missing `docs/ROADMAP.md`      | {stats["ROADMAP"]}    | 🟠 High     | Core project documentation.                                              |\n'
    summary += f'| Missing `gitVersionControl.md` | {stats["GVC"]}   | 🟠 High     | Core Git workflow documentation.                                         |\n'
    summary += f'| Missing `review.md`            | {stats["REVIEW"]}   | 🟡 Medium   | AI PR reviewer instructions.                                             |\n'
    summary += f'| Reverted Security Helpers      | {stats["HELPERS"]}   | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers.                      |\n'
    summary += f'| Unreadable navigation.ts       | {stats["UNREADABLE"]}     | 🔴 Critical | File missing or unreadable.                                              |\n\n'
    summary += '- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n'

    # Append qualitative reviews if file exists
    if os.path.exists('qualitative_reviews.md'):
        with open('qualitative_reviews.md', 'r') as f:
            summary += '\n' + f.read()

    update_summary_file(summary)

if __name__ == "__main__":
    main()
