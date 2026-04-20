#!/usr/bin/env python3
import json
import subprocess
import os
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
    """Reads audit_results.json and generates a Markdown daily summary in daily_summary.txt.

    Also posts a warning comment to each blocked PR's GitHub thread (when the GitHub CLI
    is available and the branch is associated with an open, non-cross-repository PR).
    Aggregates regression counts by type and writes a formatted summary table.

    Exits with status 1 if audit_results.json is not found.
    """
    if not os.path.exists('audit_results.json'):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    with open('audit_results.json', 'r') as f:
        data = json.load(f)

    # Get PR mappings from GitHub CLI (if available)
    pr_map = {}
    gh_cli = run_command(['which', 'gh'])
    if gh_cli:
        pr_list_json = run_command([
            'gh', 'pr', 'list', '--state', 'open', '--limit', '1000',
            '--json', 'number,headRefName,isCrossRepository'
        ])
        if pr_list_json:
            try:
                prs = json.loads(pr_list_json)
                for pr in prs:
                    if not pr.get('isCrossRepository', False):
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

        # Comment on the PR if it exists and GH CLI is available.
        # Uses a stable HTML marker to make comments idempotent: if a prior
        # audit comment exists it is updated in-place instead of posting a duplicate.
        branch = item['branch']
        if branch in pr_map and gh_cli:
            pr_num = pr_map[branch]
            marker = '<!-- daily-audit-regressions -->'
            body = f'{marker}\n### ⚠️ Systemic Regressions Detected\n\n'
            body += 'This branch is currently blocked by the following regressions:\n\n'
            for issue in issues:
                body += f'- {issue}\n'
            body += '\nPlease restore these critical files or security helpers before merging.'

            # Look for an existing comment with the marker
            comments_json = run_command([
                'gh', 'api',
                f'repos/{{owner}}/{{repo}}/issues/{pr_num}/comments',
                '--paginate', '--jq',
                f'[.[] | select(.body | contains("{marker}")) | .id] | first'
            ])

            if comments_json and comments_json not in ('null', ''):
                # Update existing comment in-place
                run_command([
                    'gh', 'api', '--method', 'PATCH',
                    f'repos/{{owner}}/{{repo}}/issues/comments/{comments_json}',
                    '-f', f'body={body}'
                ])
            else:
                # First time — create the comment
                run_command(['gh', 'pr', 'comment', str(pr_num), '--body', body])

    # Generate Markdown Summary
    # Use explicit UTC to match the workflow's midnight-UTC schedule
    date_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    total = data.get('total_branches', 0)

    summary = f'## {date_str}\n\n'
    summary += '### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n'
    summary += '- **Status:** Critical — Action Required\n'
    summary += f'- **Summary:** An automated repository-wide audit of {total} unmerged branches confirms the following systemic regressions.\n\n'
    summary += '| Regression Type                | Count | Severity    | Notes                                                                    |\n'
    summary += '| :----------------------------- | :---- | :---------- | :----------------------------------------------------------------------- |\n'
    summary += f'| Orphan Branches                | {str(stats["Orphan"]).ljust(5)} | 🔴 Critical | No common ancestor with `main`.                                          |\n'
    summary += f'| Missing `.npmrc`               | {str(stats["NPMRC"]).ljust(5)} | 🔴 Critical | Breaks dependency resolution.                                            |\n'
    summary += f'| Missing `docs/ROADMAP.md`      | {str(stats["ROADMAP"]).ljust(5)} | 🟠 High     | Core project documentation.                                              |\n'
    summary += f'| Missing `gitVersionControl.md` | {str(stats["GVC"]).ljust(5)} | 🟠 High     | Core Git workflow documentation.                                         |\n'
    summary += f'| Missing `review.md`            | {str(stats["REVIEW"]).ljust(5)} | 🟡 Medium   | AI PR reviewer instructions.                                             |\n'
    summary += f'| Reverted Security Helpers      | {str(stats["HELPERS"]).ljust(5)} | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers.                      |\n'
    summary += f'| Unreadable navigation.ts       | {str(stats["UNREADABLE"]).ljust(5)} | 🔴 Critical | File missing or unreadable.                                              |\n\n'
    summary += '- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n\n'

    with open('daily_summary.txt', 'w') as f:
        f.write(summary)

if __name__ == "__main__":
    main()
