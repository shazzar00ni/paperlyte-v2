import subprocess
import os
import sys

# Critical files that must be present in all branches
CRITICAL_FILES = [
    ".npmrc",
    "docs/ROADMAP.md",
    "gitVersionControl.md",
    "review.md"
]

# Essential security helpers that should not be reverted
SECURITY_HELPERS = [
    "hasDangerousProtocol",
    "isRelativeUrl"
]

def run_command(args):
    """Executes a git command securely using list-based arguments and shell=False."""
    try:
        result = subprocess.run(
            args,
            shell=False,
            check=False,  # We handle errors based on returncode or empty output
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error executing command {' '.join(args)}: {e}", file=sys.stderr)
        return None

def main():
    print("Auditing unmerged branches for systemic regressions...")

    # Get all remote unmerged branches relative to origin/main
    branches_raw = run_command(["git", "branch", "-r", "--no-merged", "origin/main"])
    if not branches_raw:
        print("No unmerged branches found or error during git branch command.")
        return

    # Filter out empty lines and the symbolic HEAD ref
    branches = [b.strip() for b in branches_raw.split('\n') if b.strip() and "origin/HEAD" not in b]

    total_branches = len(branches)
    blocked_branches = []
    ready_branches = []

    for branch in branches:
        issues = []

        # 0. Check for shared history (merge-base) with origin/main
        # If no merge base exists, it's an orphan branch and very dangerous to merge.
        base = run_command(["git", "merge-base", "origin/main", branch])
        if not base:
            issues.append("Orphan branch (no shared history with main)")

        # 1. Check for missing critical files using git ls-tree
        # This lists all files in the branch and we check for our required list.
        branch_files_raw = run_command(["git", "ls-tree", "-r", "--name-only", branch])
        if branch_files_raw:
            branch_files = set(branch_files_raw.split('\n'))
            for file in CRITICAL_FILES:
                if file not in branch_files:
                    issues.append(f"Missing {file}")
        else:
            issues.append("Could not list branch files")

        # 2. Check for security helpers in src/utils/navigation.ts
        # We read the file content directly from the git object database.
        nav_content = run_command(["git", "show", f"{branch}:src/utils/navigation.ts"])
        if nav_content:
            for helper in SECURITY_HELPERS:
                if helper not in nav_content:
                    issues.append(f"Missing security helper: {helper}")
        else:
            # If the file itself is missing or cannot be read, it's a regression
            issues.append("Could not read src/utils/navigation.ts")

        if issues:
            blocked_branches.append((branch, issues))
        else:
            ready_branches.append(branch)

    # Output the audit summary
    print(f"\nAudit complete. Total unmerged branches: {total_branches}")
    print(f"Ready for review/merge: {len(ready_branches)}")
    print(f"Blocked by systemic regressions: {len(blocked_branches)}")

    if blocked_branches:
        print("\nBlocked Branches Details:")
        for branch, issues in blocked_branches:
            print(f"- {branch}: {', '.join(issues)}")

    if ready_branches:
        print("\nReady Branches (no systemic regressions found):")
        for branch in ready_branches:
            print(f"- {branch}")

if __name__ == "__main__":
    main()
