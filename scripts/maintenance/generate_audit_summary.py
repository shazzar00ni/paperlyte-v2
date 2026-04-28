#!/usr/bin/env python3
import json
import subprocess
import os
import shutil
import sys
from datetime import datetime, timezone

def run_command(args):
    """Executes a command securely using list-based arguments and shell=False."""
    try:
        result = subprocess.run(args, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        # Don't log errors for 'which' checks
        if args[0] != 'which':
            print(f"Error: {e.stderr}", file=sys.stderr)
        return None

def main():
    if not os.path.exists('audit_results.json'):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with open('audit_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Error: invalid audit_results.json: {exc}", file=sys.stderr)
        sys.exit(1)

    # Get PR mappings from GitHub CLI (if available)
    pr_map = {}
    gh_cli = shutil.which('gh')
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
        'Orphan': 0,
        'NPMRC': 0,
        'ROADMAP': 0,
        'GVC': 0,
        'REVIEW': 0,
        'HELPERS': 0,
        'UNREADABLE': 0
    }
    issue_prefix_map = {
        'Orphan branch': 'Orphan',
        'Missing .npmrc': 'NPMRC',
        'Missing docs/ROADMAP.md': 'ROADMAP',
        'Missing gitVersionControl.md': 'GVC',
        'Missing review.md': 'REVIEW',
        'security helper': 'HELPERS',
    }

    for item in data.get('blocked', []):
        issues = item['issues']
        for issue in issues:
            for issue_prefix, stat_key in issue_prefix_map.items():
                if issue.startswith(issue_prefix):
                    stats[stat_key] += 1
                    break
            if issue == 'Could not read src/utils/navigation.ts':
                stats['UNREADABLE'] += 1

        # Comment on the PR if it exists and GH CLI is available
        branch = item['branch']
        if branch in pr_map:
            pr_num = pr_map[branch]

            # Check for existing comments to prevent spam
            existing_comments_json = run_command(['gh', 'pr', 'view', str(pr_num), '--json', 'comments'])
            if existing_comments_json:
                try:
                    comments_data = json.loads(existing_comments_json)
                    has_audit_comment = any('### ⚠️ Systemic Regressions Detected' in c['body'] for c in comments_data.get('comments', []))
                    if has_audit_comment:
                        # Already commented on this PR, skip to avoid spam
                        continue
                except json.JSONDecodeError:
                    pass

            comment = '### ⚠️ Systemic Regressions Detected\n\nThis branch is currently blocked by the following regressions:\n\n'
            for issue in issues:
                comment += f'- {issue}\n'
            comment += '\nPlease restore these critical files or security helpers before merging.'
            run_command(['gh', 'pr', 'comment', str(pr_num), '--body', comment])

    # Generate Markdown Summary
    date_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    total = data.get('total_branches', 0)
    blocked_count = len(data.get('blocked', []))
    has_issues = blocked_count > 0
    status_line = (
        '- **Status:** Critical — Action Required\n'
        if has_issues
        else '- **Status:** ✅ Clean — No Systemic Regressions Detected\n'
    )
    summary_line = (
        f'- **Summary:** An automated repository-wide audit of {total} unmerged branches '
        f'{"confirms the following systemic regressions" if has_issues else "found no systemic regressions"}.\n\n'
    )

    summary = f'## {date_str}\n\n'
    summary += '### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n'
    summary += status_line
    summary += summary_line
    summary += '| Regression Type                | Count | Severity    | Notes                                                                    |\n'
    summary += '| :----------------------------- | :---- | :---------- | :----------------------------------------------------------------------- |\n'
    summary += f'| Orphan Branches                | {stats["Orphan"]}   | 🔴 Critical | No common ancestor with `main`.                                          |\n'
    summary += f'| Missing `.npmrc`               | {stats["NPMRC"]}    | 🔴 Critical | Breaks dependency resolution.                                            |\n'
    summary += f'| Missing `docs/ROADMAP.md`      | {stats["ROADMAP"]}    | 🟠 High     | Core project documentation.                                              |\n'
    summary += f'| Missing `gitVersionControl.md` | {stats["GVC"]}   | 🟠 High     | Core Git workflow documentation.                                         |\n'
    summary += f'| Missing `review.md`            | {stats["REVIEW"]}   | 🟡 Medium   | AI PR reviewer instructions.                                             |\n'
    summary += f'| Reverted Security Helpers      | {stats["HELPERS"]}   | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers.                      |\n'
    summary += f'| Unreadable navigation.ts       | {stats["UNREADABLE"]}     | 🔴 Critical | File missing or unreadable.                                              |\n\n'
    if has_issues:
        summary += '- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n\n'
    summary += '---\n\n'

    with open('daily_summary.txt', 'w') as f:
        f.write(summary)

if __name__ == "__main__":
    main()
