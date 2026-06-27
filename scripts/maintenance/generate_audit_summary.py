#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime
from scripts.maintenance.utils import run_command

MAPPING = {
    'Orphan branch': 'Orphan', 'Missing .npmrc': 'NPMRC', 'Missing docs/ROADMAP.md': 'ROADMAP',
    'Missing docs/gitVersionControl.md': 'GVC', 'Missing docs/review.md': 'REVIEW',
    'security helper': 'HELPERS', 'Could not read src/utils/navigation.ts': 'UNREADABLE'
}

def get_pr_map():
    """Maps branch names to open PR numbers using GitHub CLI."""
    pr_map = {}
    gh_cli = run_command(['which', 'gh'])
    if not gh_cli:
        return pr_map

    pr_list_json = run_command(['gh', 'pr', 'list', '--state', 'open', '--limit', '1000', '--json', 'number,headRefName'])
    if pr_list_json:
        try:
            prs = json.loads(pr_list_json)
            for pr in prs:
                pr_map[pr['headRefName']] = pr['number']
        except json.JSONDecodeError:
            pass
    return pr_map

def comment_on_pr(pr_num, issues):
    """Posts a regression comment on a PR if not already present."""
    existing_comments = run_command(['gh', 'pr', 'view', str(pr_num), '--json', 'comments'])
    if existing_comments and '### ⚠️ Systemic Regressions Detected' in existing_comments:
        return

    comment = '### ⚠️ Systemic Regressions Detected\n\nThis branch is currently blocked by the following regressions:\n\n'
    for issue in issues:
        comment += f'- {issue}\n'
    comment += '\nPlease restore these critical files or security helpers before merging.'
    run_command(['gh', 'pr', 'comment', str(pr_num), '--body', comment])

def process_blocked_branches(blocked_items, pr_map):
    """Processes blocked branches and returns aggregated stats."""
    stats = {k: 0 for k in ['Orphan', 'NPMRC', 'ROADMAP', 'GVC', 'REVIEW', 'HELPERS', 'UNREADABLE']}
    for item in blocked_items:
        issues = item['issues']
        issues_str = str(issues)
        for key, stat in MAPPING.items():
            if key in issues_str:
                stats[stat] += 1

        branch = item['branch']
        if branch in pr_map:
            comment_on_pr(pr_map[branch], issues)
    return stats

def generate_markdown_summary(total, stats):
    """Generates the Markdown daily summary string."""
    date_str = datetime.now().strftime('%Y-%m-%d')
    summary = f'## {date_str}\n\n'
    summary += '### Analysis: Systemic Regressions in Open Branches (Automated Daily Audit)\n\n'
    summary += '- **Status:** Critical — Action Required\n'
    summary += f'- **Summary:** An automated repository-wide audit of {total} unmerged branches confirms the following systemic regressions.\n\n'
    summary += '| Regression Type                | Count | Severity    | Notes                                                                    |\n'
    summary += '| :----------------------------- | :---- | :---------- | :----------------------------------------------------------------------- |\n'
    summary += f'| Orphan Branches                | {stats["Orphan"]}   | 🔴 Critical | No common ancestor with `main`.                                          |\n'
    summary += f'| Missing `.npmrc`               | {stats["NPMRC"]}    | 🔴 Critical | Breaks dependency resolution.                                            |\n'
    summary += f'| Missing `docs/ROADMAP.md`      | {stats["ROADMAP"]}    | 🟠 High     | Core project documentation.                                              |\n'
    summary += f'| Missing `docs/gitVersionControl.md` | {stats["GVC"]}   | 🟠 High     | Core Git workflow documentation.                                         |\n'
    summary += f'| Missing `docs/review.md`            | {stats["REVIEW"]}   | 🟡 Medium   | AI PR reviewer instructions.                                             |\n'
    summary += f'| Reverted Security Helpers      | {stats["HELPERS"]}   | 🔴 Critical | `hasDangerousProtocol` and `isRelativeUrl` helpers.                      |\n'
    summary += f'| Unreadable navigation.ts       | {stats["UNREADABLE"]}     | 🔴 Critical | File missing or unreadable.                                              |\n\n'
    summary += '- **Action Required:** ALL affected branches MUST restore these critical files and security helpers.\n\n'
    return summary

def main():
    if not os.path.exists('audit_results.json'):
        print("Error: audit_results.json not found.", file=sys.stderr)
        sys.exit(1)

    with open('audit_results.json', 'r') as f:
        data = json.load(f)

    pr_map = get_pr_map()
    stats = process_blocked_branches(data.get('blocked', []), pr_map)
    summary = generate_markdown_summary(data.get('total_branches', 0), stats)

    with open('daily_summary.txt', 'w') as f:
        f.write(summary)

if __name__ == "__main__":
    main()
