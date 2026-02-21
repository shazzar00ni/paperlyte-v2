# Test Coverage Analysis

## Current State

**Overall coverage** (1,312 tests across 63 test files):

| Metric     | Value  |
|------------|--------|
| Statements | 89.55% |
| Branches   | 84.77% |
| Functions  | 86.46% |
| Lines      | 90.92% |

The configured thresholds are 70% across the board — comfortably exceeded in aggregate. However, several files and categories fall well below the project average, and certain types of testing are absent entirely.

---

## 1. Files With Low Statement Coverage

These source files have the weakest unit-test coverage:

| File | Stmts | Branches | Functions | Lines |
|------|-------|----------|-----------|-------|
| `components/sections/CTA/CTA.tsx` | 50% | 100% | 33% | 50% |
| `components/sections/Testimonials/Testimonials.tsx` | 52% | 47% | 42% | 56% |
| `hooks/useAnalytics.ts` | 58% | 67% | 17% | 60% |
| `utils/monitoring.ts` | 72% | 65% | 80% | 72% |
| `analytics/webVitals.ts` | 77% | 59% | 77% | 78% |
| `components/ui/FeedbackWidget/FeedbackWidget.tsx` | 82% | 72% | 95% | 83% |

### Recommendations

**CTA.tsx (50% statements, 33% functions):** The tests verify rendering and text content but never click either button. The `scrollToSection('email-capture')` and `scrollToSection('hero')` calls are completely untested. Add interaction tests that mock `scrollToSection` and verify the correct target is passed on click.

**Testimonials.tsx (52% statements, 42% functions):** This is a carousel with auto-rotation, keyboard navigation, touch/swipe gestures, play/pause, and dot navigation — none of which is tested. The existing tests only check that static content renders. This component needs:
- Tests for next/previous navigation via arrow buttons
- Tests for keyboard arrow-key navigation
- Tests for dot indicator clicks
- Tests for auto-rotation start/stop (play/pause button)
- Tests for touch swipe gesture handling
- Tests for `prefers-reduced-motion` disabling auto-play

**useAnalytics.ts (58% statements, 17% functions):** Only 2 of 12 returned functions are exercised. The hook has no dedicated test file. Add tests that verify:
- `trackCTA`, `trackExternal`, `trackSocial`, `trackNavigation` call the underlying utils with correct arguments
- `trackWaitlistJoin/Submit/Success/Error` pass proper event names and params
- `trackFAQExpand` sends the correct question index
- Scroll depth tracking initializes on mount and cleans up on unmount
- The `enableScrollTracking=false` parameter skips initialization

**monitoring.ts (72% statements):** Uncovered lines cluster around error-handling branches and edge cases in the monitoring utility. Add tests for the failure paths.

**webVitals.ts (77% statements, 59% branches):** Many conditional branches around metric collection fallbacks are untested. Add tests simulating environments where certain Performance APIs are unavailable.

**FeedbackWidget.tsx (82% statements):** Untested paths include submission error handling, the loading state, and the success/closed states after form submission.

---

## 2. Source Files With No Test File At All

| File | Rationale for Testing |
|------|-----------------------|
| `hooks/useAnalytics.ts` | Contains 12 memoized tracking functions, scroll-depth lifecycle management, and conditional initialization. High-value target. |
| `components/ui/EmailCapture/EmailCapture.tsx` | Complex form with email validation, honeypot spam protection, GDPR consent, loading/success/error states, and a `fetch` call to a Netlify function. This is the primary conversion component — critical to test. |
| `components/sections/Statistics/Statistics.tsx` | Renders animated counter cards. While it gets 100% coverage indirectly (rendered by other tests), it has no dedicated test verifying its specific behavior: stat values, suffixes/prefixes, SVG animations, and staggered delays. |
| `components/pages/Privacy/Privacy.tsx` | Static content page. Low priority, but a smoke test or snapshot test would catch accidental content deletion. |
| `components/pages/Terms/Terms.tsx` | Same as Privacy — a smoke/snapshot test would suffice. |
| `main.tsx` | Entry point with Sentry initialization logic, conditional on `import.meta.env.PROD`. The `beforeSend` filter that strips query params from error reports is completely untested security-relevant logic. |

---

## 3. Interaction & Behavior Testing Gaps

Many component tests focus exclusively on **render verification** (checking that text/elements appear) without testing **user interactions**. Specific gaps:

### Button click handlers
- **CTA.tsx**: Two buttons with `onClick` handlers — never clicked in tests
- **Header.tsx**: Mobile menu toggle, scroll-to-section links — partially tested
- **Solution.tsx**: 75% function coverage suggests untested callbacks

### Form behavior
- **EmailCapture (UI component)**: No test file at all. Needs tests for:
  - Valid email submission (mock `fetch`)
  - Invalid email rejection
  - Empty email rejection
  - Honeypot field triggering silent rejection
  - GDPR consent required before submission
  - Loading state disabling inputs
  - Success state rendering confirmation message
  - Network error handling
  - `trackEvent` called on successful signup

### Carousel/slider behavior
- **Testimonials.tsx**: Auto-rotation, keyboard nav, swipe gestures, dot navigation — all untested (see section 1)

### Animation lifecycle
- **CounterAnimation**: 97% branch coverage but the uncovered branch (line 45) likely involves the easing function edge case
- **SVGPathAnimation**: 75% function coverage — animation start/stop lifecycle partially untested
- **useParallax**: 73% function coverage — some scroll handler callbacks untested

---

## 4. E2E Test Coverage Gaps

The single E2E file (`tests/e2e/landing-page.spec.ts`) contains 5 tests covering:
- Hero section loads
- Features navigation scroll
- Core Web Vitals (chromium-only, skipped in CI)
- Mobile menu UI
- Keyboard navigation flow

### Missing E2E scenarios

**Critical user journeys not covered:**
- **Email waitlist signup flow**: Fill form, submit, verify success message (the primary conversion funnel)
- **FAQ accordion**: Expand/collapse questions
- **Testimonial carousel**: Navigate between testimonials
- **Theme toggle**: Switch light/dark mode, verify persistence
- **Footer links**: Navigate to Privacy and Terms pages
- **Comparison section**: Verify competitor comparison table renders
- **Scroll animations**: Verify sections animate into view (at least on chromium)
- **Error pages**: Navigate to 404, verify error page renders

**Cross-browser gaps:**
- The Core Web Vitals test only runs on Chromium and is skipped in CI, so it effectively never runs in the automated pipeline

---

## 5. Missing Test Categories

### Integration tests
There is one integration test (`App.test.tsx`) that verifies section order and landmark structure. This is good but limited. Missing:
- Testing that the Header "Features" link actually scrolls to the Features section (integration between Header and scroll utility)
- Testing that the EmailCapture form in the EmailCapture section works end-to-end with the CTA buttons that scroll to it
- Theme toggle propagation — toggling theme in Header updates all themed components

### Accessibility testing
The existing tests include some accessibility checks (ARIA attributes, keyboard focus, screen reader text). Missing:
- Automated axe-core audit (e.g., `vitest-axe` or `@axe-core/playwright`) to catch WCAG violations programmatically
- Color contrast validation in both light and dark themes
- Focus trap testing in the mobile menu overlay
- `aria-live` region assertions for dynamic content changes (email form status, carousel updates)

### Visual regression testing
No visual regression tests exist. Playwright has built-in screenshot comparison that could catch:
- Layout shifts across breakpoints
- Dark mode styling regressions
- Animation state captures
- Font loading issues (FOUT/FOIT)

### Error boundary testing
`ErrorBoundary.test.tsx` exists at 90% coverage. The uncovered lines (63-64) are likely the error rendering fallback. Worth covering to ensure the error UI renders correctly when a child component throws.

---

## 6. Configuration & Infrastructure Issues

### Missing `@testing-library/dom` dependency
Running `npm install` does not install `@testing-library/dom`, which is a peer dependency of `@testing-library/react`. Tests fail until it's manually installed with `--legacy-peer-deps`. This should be added as an explicit `devDependency`.

### Coverage threshold could be higher
The 70% threshold is lenient given the project already sits at ~90%. Consider raising to 80% to prevent coverage regression, or use Codecov's patch coverage (already configured at 80%) as the primary gate and raise the global threshold to 85%.

### No mutation testing
Code coverage measures which lines execute but not whether the tests would catch bugs in those lines. A tool like Stryker could identify tests that pass regardless of code mutations — "weak" tests that provide false coverage confidence.

---

## Priority Summary

Ranked by impact on product quality and reliability:

1. **Add tests for `EmailCapture` UI component** — untested conversion-critical form with validation, API calls, and multiple states
2. **Add interaction tests for `Testimonials` carousel** — complex interactive component at 52% coverage
3. **Add `useAnalytics` hook tests** — 12 untested functions at 17% function coverage
4. **Add E2E test for the waitlist signup flow** — the primary conversion funnel has zero E2E coverage
5. **Add interaction tests for `CTA` buttons** — 50% coverage, click handlers untested
6. **Integrate axe-core for automated WCAG auditing** — accessibility is a stated project requirement
7. **Add E2E tests for FAQ, theme toggle, and error pages** — complete critical user journey coverage
8. **Improve `monitoring.ts` and `webVitals.ts` branch coverage** — error paths and API fallbacks
9. **Fix `@testing-library/dom` peer dependency** — tests break on fresh install
10. **Consider raising coverage thresholds** — current 70% is well below actual ~90%
