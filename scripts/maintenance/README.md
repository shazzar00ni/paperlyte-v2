# Maintenance Scripts

This directory contains scripts used for automated repository maintenance and PR auditing.

## Scripts

### `audit_branches.py`
Performs a repository-wide audit of all remote unmerged branches.
- **Checks for:**
    - Shared history with `main` (detects orphan branches).
    - Presence of critical files: `.npmrc`, `docs/ROADMAP.md`, `gitVersionControl.md`, `review.md`.
    - Presence of essential security helpers in `src/utils/navigation.ts`: `hasDangerousProtocol`, `isRelativeUrl`.
- **Output:** JSON object containing totals and lists of blocked/ready branches.

### `generate_audit_summary.py`
Consumes the output of `audit_branches.py` to generate a human-readable Markdown summary.
- **Features:**
    - Generates a statistics table for different regression types.
    - (If `gh` CLI is available) Comments on open PRs with specific feedback about missing files/helpers.
    - Includes anti-spam logic to avoid duplicate comments on the same PR.
- **Output:** `daily_summary.txt` (Markdown snippet).

## Automation

These scripts are designed to be run daily via GitHub Actions. See `.github/workflows/daily-pr-audit.yml`.
