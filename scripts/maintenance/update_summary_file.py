import sys
import os

def main():
    try:
        summary_file = 'PR_REVIEW_SUMMARY.md'
        daily_file = 'daily_summary.txt'

        if not os.path.exists(daily_file):
            print(f"Error: {daily_file} not found.")
            return

        with open(summary_file, 'r') as f:
            original_lines = f.readlines()

        with open(daily_file, 'r') as f:
            daily_summary = f.read().strip()

        # Manual feedback section
        manual_feedback = """
### Manual Review Feedback (2026-05-04)

#### PR Review: Implement Service Worker for PWA Support
- **Branch:** `origin/claude/implement-service-worker-YLeLZ`
- **Status:** Ready
- **Feedback:**
  - Excellent implementation of a robust PWA service worker (`sw.js`).
  - The `offline.html` page is well-designed with a "Try again" feature.
  - Correct integration into `main.tsx` with production-only registration.
  - CSP update in `vercel.json` to allow `worker-src 'self'` is correct and necessary.

#### PR Review: Tree-shake Font Awesome Icons
- **Branch:** `origin/claude/tree-shake-font-awesome-cK85j`
- **Status:** Ready
- **Feedback:**
  - Significant performance improvement by replacing CDN/full-library Font Awesome with a curated map of SVG paths.
  - The normalization of icon names (removing `fa-` prefix internally) simplifies the `Icon` component logic.
  - Good use of `safePropertyAccess` to prevent prototype pollution.
  - Cleaning up unused analytics methods in `PlausibleProvider` reduces bundle size further.

#### PR Review: Fix Open Redirect in safeNavigate
- **Branch:** `origin/claude/fix-open-redirect-TX551`
- **Status:** Ready
- **Feedback:**
  - Crucial security hardening for `isSafeUrl` and `safeNavigate`.
  - Restricting `safeNavigate` to same-origin URLs by default effectively mitigates open redirect vulnerabilities.
  - The inclusion of `allowExternal` options for `isSafeUrl` provides necessary flexibility for <a> tags while keeping navigation safe.
  - Integration with the `monitoring` utility for logging blocked attempts is a best practice.
""".strip()

        insertion_point = 0
        header_found = False
        for i, line in enumerate(original_lines):
            if '# PR Review Summary' in line:
                header_found = True
                insertion_point = i + 1
                # Move past the description line if it exists
                if i + 2 < len(original_lines) and 'This file contains' in original_lines[i + 2]:
                     insertion_point = i + 3
                elif i + 1 < len(original_lines) and 'This file contains' in original_lines[i + 1]:
                     insertion_point = i + 2
                break

        if not header_found:
            insertion_point = 0

        new_entry = f"\n{daily_summary}\n\n{manual_feedback}\n\n---\n"

        final_lines = original_lines[:insertion_point] + [new_entry] + original_lines[insertion_point:]

        with open(summary_file, 'w') as f:
            f.writelines(final_lines)
        print("Summary updated successfully.")
    except Exception as e:
        print(f"Error updating summary: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
