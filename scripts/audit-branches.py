import subprocess
import sys

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode

def main():
    branches_out, _ = run_command("git branch -r --sort=-committerdate")
    branches = [b.strip() for b in branches_out.split('\n') if '->' not in b]

    critical_files = [
        ".npmrc",
        "docs/ROADMAP.md",
        "gitVersionControl.md",
        "review.md"
    ]

    print(f"{'Date':<12} | {'Branch':<60} | {'Files'} | {'Nav'}")
    print("-" * 110)

    for branch in branches:
        if branch == "origin/main":
            continue

        # Filter out summary/review branches unless they are recent
        if "daily-pr-review" in branch or "pr-review-summary" in branch:
            continue

        # Get last commit date
        date, _ = run_command(f"git log -1 --format=%cs {branch}")

        # Check files
        files_status = []
        for f in critical_files:
            _, code = run_command(f"git ls-tree -r {branch} --name-only | grep -q '^{f}$'")
            files_status.append('✓' if code == 0 else '✗')

        # Check navigation.ts helpers
        nav_content, code = run_command(f"git show {branch}:src/utils/navigation.ts")
        if code == 0:
            has_dangerous = '✓' if 'hasDangerousProtocol' in nav_content else '✗'
            has_relative = '✓' if 'isRelativeUrl' in nav_content else '✗'
            nav_status = f"{has_dangerous}{has_relative}"
        else:
            nav_status = "N/A"

        files_str = "".join(files_status)
        print(f"{date:<12} | {branch:<60} | {files_str:<5} | {nav_status}")

if __name__ == "__main__":
    main()
