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
        # Don't log errors for 'which' checks
        if args[0] != 'which':
            print(f"Error: {e.stderr}", file=sys.stderr)
        return None

def main():
    # Use the provided directory for audit results, defaulting to current directory
    audit_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    audit_file = os.path.join(audit_dir, 'audit_results.json')
    summary_file = os.path.join(audit_dir, 'daily_summary.txt')
    manual_feedback_file = os.path.join(audit_dir, 'manual_feedback.md')

    if not os.path.exists(audit_file):
        print(f"Error: {audit_file} not found.", file=sys.stderr)
        sys.exit(1)

    with open(audit_file, 'r') as f:
        data = json.load(f)

    # Get PR mappings from GitHub CLI (if available)
    pr_map = {}
    gh_cli = run_command(['which', 'gh'])
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

        # Comment on the PR if it exists and GH CLI is available
        branch = item['branch']
        if branch in pr_map:
            pr_num = pr_map[branch]
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
    summary += '- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n\n'

    # Append manual feedback if available
    if os.path.exists(manual_feedback_file):
        with open(manual_feedback_file, 'r') as f:
            summary += "\n### Manual Review Supplement\n\n"
            summary += f.read()
            summary += "\n"

    with open(summary_file, 'w') as f:
        f.write(summary)

if __name__ == "__main__":
    main()
