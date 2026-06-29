# Palette's Journal 🎨

Critical UX/accessibility learnings only — not a work log.

## 2026-06-13 - Success states must announce themselves (WCAG 4.1.3)

**Learning:** This codebase is very a11y-mature (focus traps, live regions, arrow-key
nav everywhere), but post-submit success views that *replace* a form are an easy blind
spot. The rendered `sections/EmailCapture` swapped its form for a success view with no
live region and no focus move — screen-reader and keyboard users got no confirmation and
focus was orphaned on the unmounted submit button. The sibling `ui/EmailCapture` already
used `role="alert"` for the same thing, so the gap was an inconsistency, not an unknown.

**Action:** When a form submission swaps in a "success" branch, move focus to the success
heading (`ref` + `tabIndex={-1}` + `useEffect` on the submitted flag) — the codebase's
established pattern (Header, FeedbackWidget). The global focus style is `:focus-visible`
only, so programmatic focus announces to SRs without painting a lingering outline ring.
Check every form's success/confirmation branch for this same gap.
