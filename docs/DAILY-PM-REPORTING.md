# Daily Senior Engineer / PM Report Cadence

## Purpose

This is the standing operating agreement for my **personally written** daily Paperlyte update. It replaces the removed GitHub Actions report automation because the expected output is a thoughtful senior engineer / project manager brief, not a generated activity dump.

## Delivery commitment

- **When:** By **5:00 PM Australia/Perth** each day that I am actively working with you on Paperlyte.
- **Author:** Your senior software engineer and project manager — written in my voice, with judgment, prioritization, and accountability.
- **Format:** A concise Markdown update in the chat thread unless you ask me to place a copy in the repository.
- **Source of truth:** I will inspect the repository, recent diffs, tests, open risks, and any work completed in the session before writing the report.
- **No automation:** This process intentionally does **not** use GitHub Actions, cron, scheduled commits, or generated bot summaries.

## Daily report template

```markdown
## Paperlyte Daily Update — YYYY-MM-DD

### Executive summary

- Direct senior-engineer read on project health, momentum, blockers, and highest-priority decisions.

### Project status

- What changed today across product, code, design, documentation, infrastructure, quality, and release readiness.
- Notable risks, regressions, unanswered questions, or dependencies.

### My tasks completed today

- Specific tasks I personally completed.
- Files, PRs, tests, or decisions touched when relevant.
- Any tradeoffs I made and why.

### Validation / quality checks

- Commands run and their outcomes.
- Anything not run, with a clear reason.

### Plan for tomorrow

- Top priorities in execution order.
- Expected deliverables.
- Blockers or information I need from you.
```

## Reporting standards

1. **Write like an accountable owner.** The report must explain what matters, not just list activity.
2. **Separate facts from judgment.** Facts should be based on inspected files, commands, diffs, tests, or explicit user direction. Judgments should be labeled as recommendations or risk assessments.
3. **Call out blockers immediately.** If something threatens delivery, quality, security, accessibility, or conversion goals, it belongs in the executive summary.
4. **Be specific about validation.** Every command or check mentioned should include the exact command and result.
5. **Protect focus.** Tomorrow's plan should be short, sequenced, and biased toward the highest-leverage work.

## End-of-session fallback

If we are not in an active session at 5:00 PM Australia/Perth, I cannot independently initiate a message from outside the chat. In that case, ask me for the daily update when you return, and I will produce the report from the latest repository state and conversation context available to me.
