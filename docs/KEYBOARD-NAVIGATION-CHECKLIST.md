# Keyboard Navigation Regression Checklist

**Version:** 1.0
**Created:** March 11, 2026
**Owner:** Accessibility Team
**Related Report:** `docs/AUDIT-REPORT.md`

Use this checklist before every release and after any changes to interactive components. Test in Chrome (primary) and Firefox (secondary) without a mouse.

---

## Setup

- [ ] Disconnect or ignore mouse/trackpad
- [ ] Enable browser developer tools for focus inspection
- [ ] Set viewport to 1280px (desktop) for section A–C, then 375px (mobile) for section D
- [ ] Disable any browser extensions that add keyboard shortcuts

---

## A — Page-Level Navigation

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| A1 | Press Tab once on page load | Skip link "Skip to main content" becomes visible | |
| A2 | Press Enter on skip link | Focus jumps to `<main id="main">` — visual scroll to top of Hero section | |
| A3 | Tab through entire page | Every interactive element receives visible focus in logical top-to-bottom, left-to-right order | |
| A4 | Tab to any `<a>` link | Focus outline is visible (2px solid dark outline) | |
| A5 | Tab to any `<button>` | Focus outline is visible | |
| A6 | Tab to any `<input>` | Focus outline is visible | |
| A7 | Shift+Tab from first interactive element | Focus does not leave the page | |
| A8 | Shift+Tab anywhere | Focus moves in reverse order | |

---

## B — Header Navigation

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| B1 | Tab to "Features" nav link | Focus visible on link | |
| B2 | Press Enter on "Features" nav link | Page scrolls smoothly to Features section | |
| B3 | Tab to "Download" nav link | Focus visible | |
| B4 | Press Enter on "Download" nav link | Page scrolls to download/waitlist section | |
| B5 | Tab to "Get Started" button | Focus visible on pill button | |
| B6 | Press Enter or Space on "Get Started" | Page scrolls to download section | |
| B7 | Tab to ThemeToggle button | Focus visible | |
| B8 | Press Enter or Space on ThemeToggle | Dark/light mode toggles | |
| B9 | (Desktop) Arrow Left/Right inside nav `<ul>` | Focus moves between nav links | |
| B10 | (Desktop) Home key inside nav | Focus moves to first nav item | |
| B11 | (Desktop) End key inside nav | Focus moves to last nav item | |

---

## C — Header Mobile Menu (resize to 375px)

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| C1 | Tab to hamburger menu button | Focus visible; `aria-expanded="false"` | |
| C2 | Press Enter or Space | Menu opens; `aria-expanded="true"`; focus moves inside menu | |
| C3 | Tab through menu items | Focus cycles through all nav links and close button | |
| C4 | Shift+Tab to wrap | Focus wraps from first to last item | |
| C5 | Press Escape | Menu closes; focus returns to hamburger button; `aria-expanded="false"` | |
| C6 | Press Enter on a nav link | Page scrolls to section; menu closes | |
| C7 | Click outside menu (backdrop) | N/A — no backdrop close; verify Tab still works after menu closes | |

---

## D — FeedbackWidget Modal

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| D1 | Tab to floating feedback button | Focus visible on circular button; `aria-label="Open feedback form"` | |
| D2 | Press Enter or Space on feedback button | Modal opens; focus moves to first element inside modal | |
| D3 | Tab through modal | Focus cycles: Close button → Bug button → Feature button → Textarea → Send button | |
| D4 | Shift+Tab from close button | Focus wraps to last element in modal (Send button) | |
| D5 | Tab from last element (Send button) | Focus wraps to first element (Close button) | |
| D6 | Press Escape | Modal closes; focus returns to floating feedback button | |
| D7 | Press Space on "Report a Bug" button | Button selected (`aria-pressed="true"`); visual state updates | |
| D8 | Press Space on "Request a Feature" button | Button selected; Bug button unselected | |
| D9 | Arrow Left/Right on type buttons | Focus moves between Bug/Feature buttons | |
| D10 | Tab to textarea | Focus visible; type text with keyboard | |
| D11 | Submit empty form (Tab to Send, Enter) | Error announced; screen reader reads error message | |
| D12 | Submit valid form (Tab to Send, Enter) | Success confirmation shown; modal auto-closes after 2s | |
| D13 | Verify body scroll lock while modal open | Page does not scroll behind modal | |

---

## E — EmailCapture Form (UI Component)

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| E1 | Tab to email input | Focus visible; `aria-label="Email address"` | |
| E2 | Tab to submit button | Focus visible | |
| E3 | Enter invalid email, Tab to button, Enter | Validation error shown; `aria-invalid="true"` on input; error text announced | |
| E4 | Tab to GDPR checkbox | Focus visible on checkbox | |
| E5 | Press Space on checkbox | Checkbox toggles; `checked` state updates | |
| E6 | Submit valid email without GDPR consent | Error shown: "Please agree to receive emails" | |
| E7 | Submit valid email with consent | Loading state; then success message with `role="alert"` | |

---

## F — EmailCapture Section (Landing Page Form)

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| F1 | Tab to email input in waitlist form | Focus visible | |
| F2 | Tab to "Join the Waitlist" button | Focus visible | |
| F3 | Submit empty | Button disabled or error shown | |
| F4 | Submit valid email | Success state renders | |

---

## G — FAQ Accordion

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| G1 | Tab to first FAQ question button | Focus visible; `aria-expanded="false"` | |
| G2 | Press Enter or Space | Answer panel expands; `aria-expanded="true"`; screen reader announces expansion | |
| G3 | Press Enter or Space again | Answer collapses; `aria-expanded="false"` | |
| G4 | Arrow Down on FAQ button | Focus moves to next FAQ question | |
| G5 | Arrow Up on FAQ button | Focus moves to previous FAQ question | |
| G6 | Home key on any FAQ button | Focus moves to first FAQ question | |
| G7 | End key on any FAQ button | Focus moves to last FAQ question | |
| G8 | Tab away from FAQ | Focus leaves FAQ section entirely | |

---

## H — Testimonials Carousel

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| H1 | Tab to Previous arrow button | Focus visible; `aria-label="Previous testimonial"` | |
| H2 | Press Enter on Previous | Previous slide shown; live region announces new slide number | |
| H3 | Tab to Next arrow button | Focus visible | |
| H4 | Press Enter on Next | Next slide shown | |
| H5 | Tab to first navigation dot | Focus visible; `role="tab"`, `aria-selected` state correct | |
| H6 | Press Enter on a dot | Carousel navigates to corresponding slide | |
| H7 | Tab to Play/Pause button | Focus visible | |
| H8 | Press Enter on Play/Pause | Auto-rotation pauses/resumes; `aria-label` updates | |
| H9 | Arrow Left on carousel wrapper | Previous slide | |
| H10 | Arrow Right on carousel wrapper | Next slide | |

---

## I — Comparison Table

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| I1 | Tab to table area | Focus enters table | |
| I2 | Screen reader reads table | Caption announced first, then headers, then cell data | |
| I3 | Navigate cells with Tab | Logical left-to-right, top-to-bottom | |

---

## J — Footer

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| J1 | Tab to Footer navigation links | Focus visible on each link | |
| J2 | Press Enter on "Privacy Policy" | Opens privacy.html in new tab | |
| J3 | Press Enter on "Terms of Service" | Opens terms.html in new tab | |
| J4 | Tab to social media icons | Each has visible focus and descriptive `aria-label` | |
| J5 | Press Enter on GitHub icon | Opens GitHub page in new tab | |

---

## K — Error States (requires triggering JS error)

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| K1 | Trigger ErrorBoundary (dev tools) | Error UI renders; focus not lost | |
| K2 | Tab to "Try Again" button | Focus visible; `aria-label` includes attempt count | |
| K3 | Tab to "Reload Page" button | Focus visible | |
| K4 | Press Enter on "Try Again" | Error state clears; page re-renders | |

---

## L — Dark Mode

| # | Test | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| L1 | Enable dark mode via ThemeToggle | All focus outlines remain visible (white on dark background) | |
| L2 | Repeat tests A1, B1, D1, E1 in dark mode | Focus indicators visible and meeting 3:1 contrast | |

---

## Regression Sign-off

| Reviewer | Date | Version | All Pass? | Notes |
|----------|------|---------|-----------|-------|
| | | | | |
| | | | | |

---

**Document History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 11, 2026 | Initial checklist created from accessibility audit findings |
