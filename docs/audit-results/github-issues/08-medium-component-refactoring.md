# [MEDIUM] Refactor large components for maintainability

**Labels**: `priority:medium`, `area:refactoring`, `area:code-quality`

## Description
Four components exceed recommended size limits (178-344 lines), creating maintainability issues and making them harder to test. Breaking these into smaller, focused components will improve code quality and testability.

## Impact
- **Severity**: 🟡 MEDIUM PRIORITY
- **Risk**: Technical debt accumulation, slower development, testing difficulty
- **Owner**: Frontend Team
- **Timeline**: Sprint 3

## Components Requiring Refactoring

### 1. FeedbackWidget.tsx (344 lines) - HIGHEST PRIORITY
**Current Issues**:
- Multiple concerns: form handling, modal behavior, API integration
- Complex state management
- Difficult to test in isolation

**Refactoring Plan**:
```
FeedbackWidget/
├── FeedbackWidget.tsx (main orchestration, ~80 lines)
├── FeedbackForm.tsx (form fields and validation, ~80 lines)
├── FeedbackModal.tsx (modal behavior and overlay, ~60 lines)
├── useFeedbackSubmit.ts (API integration hook, ~40 lines)
├── FeedbackSuccess.tsx (success state, ~30 lines)
└── __tests__/
    ├── FeedbackWidget.test.tsx
    ├── FeedbackForm.test.tsx
    └── useFeedbackSubmit.test.ts
```

**Benefits**:
- Each component has single responsibility
- Easier to test individual pieces
- Reusable form and modal components
- Better code organization

### 2. Terms.tsx (338 lines) - HIGH PRIORITY
**Current Issues**:
- Single monolithic component with all terms content
- Difficult to maintain legal content
- Hard to update individual sections

**Refactoring Plan**:
```
Terms/
├── Terms.tsx (main layout, ~50 lines)
├── sections/
│   ├── AcceptanceOfTerms.tsx (~40 lines)
│   ├── UserAccounts.tsx (~40 lines)
│   ├── IntellectualProperty.tsx (~40 lines)
│   ├── UserContent.tsx (~40 lines)
│   ├── ProhibitedActivities.tsx (~40 lines)
│   ├── Termination.tsx (~30 lines)
│   └── DisputeResolution.tsx (~40 lines)
└── __tests__/
    └── Terms.test.tsx
```

**Benefits**:
- Legal sections independently maintainable
- Easier to review specific terms sections
- Better code splitting opportunities
- Clearer content structure

### 3. Privacy.tsx (338 lines) - HIGH PRIORITY
**Current Issues**:
- Similar to Terms.tsx - monolithic privacy policy
- Difficult to maintain privacy content
- Hard to update individual sections

**Refactoring Plan**:
```
Privacy/
├── Privacy.tsx (main layout, ~50 lines)
├── sections/
│   ├── InformationCollection.tsx (~40 lines)
│   ├── InformationUsage.tsx (~40 lines)
│   ├── DataSharing.tsx (~40 lines)
│   ├── DataSecurity.tsx (~40 lines)
│   ├── UserRights.tsx (~40 lines)
│   ├── Cookies.tsx (~30 lines)
│   └── PolicyChanges.tsx (~30 lines)
└── __tests__/
    └── Privacy.test.tsx
```

**Benefits**:
- Privacy sections independently maintainable
- Easier GDPR/CCPA compliance updates
- Better organization for legal review
- Clearer privacy policy structure

### 4. SVGPathAnimation.tsx (242 lines) - MEDIUM PRIORITY
**Current Issues**:
- Complex animation logic mixed with SVG rendering
- Limited reusability
- Performance optimization opportunities missed

**Refactoring Plan**:
```
SVGPathAnimation/
├── SVGPathAnimation.tsx (main component, ~60 lines)
├── useSVGPathAnimation.ts (animation hook, ~80 lines)
├── SVGPath.tsx (path rendering, ~40 lines)
├── AnimationControls.tsx (optional controls, ~30 lines)
└── __tests__/
    ├── SVGPathAnimation.test.tsx
    └── useSVGPathAnimation.test.ts
```

**Benefits**:
- Reusable animation hook
- Easier to add React.memo for performance
- Testable animation logic in isolation
- Clearer separation of concerns

## Component Size Guidelines

**Target Sizes** (from industry best practices):
- **Components**: 100-150 lines maximum
- **Hooks**: 50-80 lines maximum
- **Utilities**: 30-50 lines maximum

**When to Split**:
- Component exceeds 150 lines
- Multiple concerns/responsibilities
- Complex state management
- Difficult to test
- Hard to understand at a glance

## Implementation Plan

### Phase 1: Planning (Week 1)
- [ ] Review each component and identify logical boundaries
- [ ] Create detailed refactoring specs for each
- [ ] Identify shared components/patterns
- [ ] Plan test coverage approach

### Phase 2: Refactoring (Week 2-4)
- [ ] Refactor FeedbackWidget.tsx (Week 2)
  - [ ] Extract form component
  - [ ] Extract modal component
  - [ ] Extract API hook
  - [ ] Add tests for each piece
  - [ ] Verify functionality unchanged

- [ ] Refactor Terms.tsx (Week 3)
  - [ ] Split into section components
  - [ ] Maintain legal content accuracy
  - [ ] Add section navigation (optional)
  - [ ] Update tests

- [ ] Refactor Privacy.tsx (Week 3)
  - [ ] Split into section components
  - [ ] Maintain legal content accuracy
  - [ ] Add section navigation (optional)
  - [ ] Update tests

- [ ] Refactor SVGPathAnimation.tsx (Week 4)
  - [ ] Extract animation hook
  - [ ] Add React.memo for performance
  - [ ] Create reusable path component
  - [ ] Add comprehensive tests

### Phase 3: Performance Optimization (Week 5)
- [ ] Add React.memo to animation components
- [ ] Optimize re-renders with useMemo/useCallback
- [ ] Measure performance improvements
- [ ] Document performance gains

## Acceptance Criteria
- [ ] All 4 components refactored into smaller pieces
- [ ] No component exceeds 150 lines
- [ ] All functionality preserved (no regressions)
- [ ] Test coverage maintained or improved
- [ ] Performance metrics stable or improved
- [ ] Code review approved
- [ ] Documentation updated

## Testing Requirements
- [ ] All refactored components have unit tests
- [ ] Integration tests verify components work together
- [ ] Visual regression tests (Storybook/Chromatic)
- [ ] Accessibility tests still passing
- [ ] No performance regressions

## Risks & Mitigation
- **Risk**: Breaking existing functionality
  - **Mitigation**: Comprehensive test coverage, careful code review
- **Risk**: Introducing performance regressions
  - **Mitigation**: Performance benchmarks before/after
- **Risk**: Losing legal content accuracy
  - **Mitigation**: Legal team review of Privacy/Terms changes

## Related Issues
- Issue #10: React performance optimization (memo/lazy)
- Issue #3: Add test coverage for refactored components

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 198-203, 347-352)
