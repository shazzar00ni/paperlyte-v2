# [HIGH] Complete accessibility testing and add keyboard handlers

**Labels**: `priority:high`, `area:accessibility`, `area:a11y`

## Description
Comprehensive accessibility testing is required to ensure WCAG 2.1 AA compliance. Current implementation has strong foundations (ARIA, semantic HTML) but requires manual testing and keyboard handler verification.

## Impact
- **Severity**: 🟠 HIGH PRIORITY
- **Risk**: WCAG 2.1 AA non-compliance, accessibility violations, legal exposure
- **Owner**: Frontend Team
- **Timeline**: Sprint 2
- **Target Completion**: March 31, 2026 (per ACCESSIBILITY.md)

## Current Status

### Strengths ✅
- Extensive aria-label usage throughout codebase
- Semantic HTML structure
- Landmark regions properly defined
- Focus management implemented
- prefers-reduced-motion support with useReducedMotion hook
- Strong foundation in place

### Known Limitations ⚠️
From `docs/ACCESSIBILITY.md`:
1. Third-party widgets may not be fully accessible
2. Occasional missing or incorrect ARIA labels
3. Incomplete alt text for decorative images
4. PDF/downloadable documents may not be fully tagged

## Testing Requirements

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Full keyboard navigation audit (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Focus indicators visible on all interactive elements
- [ ] Focus order follows logical reading order
- [ ] Skip links work correctly
- [ ] No keyboard traps (except intentional modal behavior)
- [ ] Modal keyboard trap behavior (FeedbackWidget Escape key, focus return)
- [ ] Mobile menu keyboard accessibility (Header component)
- [ ] All interactive elements reachable via keyboard

#### Screen Reader Testing
- [ ] VoiceOver testing (macOS/iOS)
- [ ] NVDA testing (Windows)
- [ ] JAWS testing (Windows)
- [ ] Proper heading hierarchy announced
- [ ] Form labels and error messages announced
- [ ] Button purposes clearly announced
- [ ] Link purposes clearly announced
- [ ] Dynamic content changes announced (live regions)

#### Visual Testing
- [ ] Touch target sizes ≥44x44px on mobile breakpoints
- [ ] Color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Content readable at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Focus indicators meet contrast requirements

### Automated Testing

#### Tools to Run
- [ ] Lighthouse accessibility audit (target: ≥95/100)
- [ ] axe DevTools for WCAG rule coverage
- [ ] WAVE browser extension
- [ ] Pa11y CI integration

#### Components Requiring Testing
```
High Priority:
- FeedbackWidget.tsx (344 lines) - Modal behavior, keyboard traps
- Header.tsx - Mobile menu, navigation
- EmailCapture.tsx - Form accessibility
- Hero section - Heading hierarchy
- Feature grid - Icon accessibility

Medium Priority:
- Privacy.tsx (338 lines)
- Terms.tsx (338 lines)
- Footer - Link navigation
- All animation components (reduced motion)
```

## Implementation Tasks

### Phase 1: Audit & Documentation (Week 1)
- [ ] Complete full keyboard navigation audit
- [ ] Run automated accessibility scanners
- [ ] Document all accessibility violations
- [ ] Prioritize issues by severity
- [ ] Create detailed remediation plan

### Phase 2: Critical Fixes (Week 2-3)
- [ ] Fix keyboard navigation blockers
- [ ] Add missing keyboard handlers
- [ ] Verify focus management in modals
- [ ] Fix focus indicator visibility issues
- [ ] Add missing ARIA labels
- [ ] Fix heading hierarchy issues
- [ ] Ensure proper alt text for all images

### Phase 3: Comprehensive Testing (Week 4)
- [ ] Conduct screen reader testing across platforms
- [ ] Verify touch target sizes on mobile
- [ ] Test with magnification/zoom
- [ ] Verify color contrast ratios
- [ ] Test with keyboard-only navigation
- [ ] Test with high contrast mode

### Phase 4: Documentation & Maintenance (Week 5+)
- [ ] Create accessibility statement (required by legal)
- [ ] Document keyboard shortcuts
- [ ] Add accessibility testing to CI/CD
- [ ] Create accessibility testing guide for developers
- [ ] Schedule quarterly accessibility audits

## WCAG 2.1 AA Success Criteria

### Level A (Must Pass)
- [ ] 1.1.1 Non-text Content
- [ ] 1.3.1 Info and Relationships
- [ ] 2.1.1 Keyboard
- [ ] 2.4.1 Bypass Blocks
- [ ] 3.1.1 Language of Page
- [ ] 4.1.2 Name, Role, Value

### Level AA (Must Pass)
- [ ] 1.4.3 Contrast (Minimum)
- [ ] 1.4.5 Images of Text
- [ ] 2.4.6 Headings and Labels
- [ ] 2.4.7 Focus Visible
- [ ] 3.2.3 Consistent Navigation
- [ ] 3.3.3 Error Suggestion

## Keyboard Handlers to Verify

### FeedbackWidget Component
```typescript
// Required keyboard handlers:
- Escape key closes modal
- Tab/Shift+Tab cycles through form fields
- Focus trapped within modal when open
- Focus returns to trigger element on close
- Enter submits form
- Clicking outside closes modal
```

### Header Component
```typescript
// Required keyboard handlers:
- Tab navigates through menu items
- Enter/Space activates links
- Escape closes mobile menu
- Arrow keys navigate menu (optional)
- Focus visible on all menu items
```

## Acceptance Criteria
- [ ] All keyboard navigation working correctly
- [ ] No keyboard accessibility blockers
- [ ] Lighthouse accessibility score ≥95/100
- [ ] Screen reader testing complete (3 platforms)
- [ ] Touch targets ≥44x44px verified
- [ ] All WCAG 2.1 AA criteria passing
- [ ] Accessibility statement created and published
- [ ] Testing documentation completed
- [ ] CI/CD includes accessibility regression tests

## Related Issues
- Issue #1: Create accessibility statement (legal blocker)
- Low Priority: Add accessibility regression tests to CI

## Resources
- `docs/ACCESSIBILITY.md` - Current accessibility documentation
- `.lighthouserc.json` - Accessibility threshold: ≥95/100
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 224-273, 334-339)
