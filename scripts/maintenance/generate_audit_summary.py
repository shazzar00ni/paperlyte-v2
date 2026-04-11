#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime

# Stable HTML marker used to identify our bot comment for deduplication.
AUDIT_MARKER = "<!-- paperlyte-audit-bot -->"

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

def get_repo_info():
    """Return (owner, repo) for the current repository via gh CLI."""
    result = run_command(['gh', 'repo', 'view', '--json', 'owner,name'])
    if result:
        try:
            info = json.loads(result)
            return info['owner']['login'], info['name']
        except (json.JSONDecodeError, KeyError):
            pass
    return None, None

def find_existing_audit_comment(owner, repo, pr_num):
    """Return the comment ID of an existing audit-bot comment, or None."""
    result = run_command([
        'gh', 'api',
        f'repos/{owner}/{repo}/issues/{pr_num}/comments',
        '--jq', f'[.[] | select(.body | contains("{AUDIT_MARKER}"))][0].id',
    ])
    if result and result.strip() not in ('', 'null'):
        try:
            return int(result.strip())
        except ValueError:
            pass
    return None

def upsert_pr_comment(owner, repo, pr_num, body):
    """Create or update (upsert) the single audit-bot comment on a PR."""
    comment_id = find_existing_audit_comment(owner, repo, pr_num)
    payload = json.dumps({"body": body})
    if comment_id:
        # Update the existing comment instead of posting a new one.
        subprocess.run(
            ['gh', 'api', '--method', 'PATCH',
             f'repos/{owner}/{repo}/issues/comments/{comment_id}',
             '--input', '-'],
            input=payload, text=True, capture_output=True,
        )
    else:
        subprocess.run(
            ['gh', 'pr', 'comment', str(pr_num), '--body', body],
            capture_output=True, text=True,
        )

def main():
    if not os.path.exists('audit_results.json'):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    with open('audit_results.json', 'r') as f:
        data = json.load(f)

    # Get PR mappings and repo info from GitHub CLI (if available)
    pr_map = {}
    owner, repo = None, None
    gh_cli = run_command(['which', 'gh'])
    if gh_cli:
        owner, repo = get_repo_info()
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

        # Upsert (create-or-update) the audit comment on the matching open PR.
        # Using a stable marker ensures only one bot comment exists per PR regardless
        # of how many times the daily workflow runs.
        branch = item['branch']
        if branch in pr_map and owner and repo:
            pr_num = pr_map[branch]
            comment = f'{AUDIT_MARKER}\n### ⚠️ Systemic Regressions Detected\n\nThis branch is currently blocked by the following regressions:\n\n'
            for issue in issues:
                comment += f'- {issue}\n'
            comment += '\nPlease restore these critical files or security helpers before merging.'
            upsert_pr_comment(owner, repo, pr_num, comment)

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

    with open('daily_summary.txt', 'w') as f:
        f.write(summary)

if __name__ == "__main__":
    main()
