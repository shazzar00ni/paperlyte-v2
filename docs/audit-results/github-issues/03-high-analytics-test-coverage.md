# [HIGH] Add test coverage for analytics module (0% coverage)

**Labels**: `priority:high`, `area:testing`, `area:analytics`

## Description
The analytics module has 0% test coverage across 6 files. This creates high risk of tracking failures, data loss, and debugging difficulty.

## Impact
- **Severity**: 🟠 HIGH PRIORITY
- **Risk**: Business intelligence gaps, tracking failures, revenue impact
- **Owner**: Engineering Team
- **Timeline**: Sprint 1

## Files Requiring Tests

### Zero Coverage (6 files)
1. `src/analytics/index.ts` - Main analytics orchestration
2. `src/analytics/config.ts` - Analytics configuration
3. `src/analytics/types.ts` - Type definitions (may not need direct tests)
4. `src/analytics/scrollDepth.ts` - Scroll tracking functionality
5. `src/analytics/webVitals.ts` - Core Web Vitals tracking
6. `src/analytics/providers/plausible.ts` - Plausible Analytics integration

## Testing Requirements

### Test Coverage Goals
- **Overall coverage**: Minimum 80% for analytics module
- **Critical paths**: 100% coverage for event tracking and Web Vitals
- **Edge cases**: Error handling, network failures, disabled analytics

### Test Scenarios
- [ ] Analytics initialization with valid/invalid config
- [ ] Event tracking (pageviews, custom events)
- [ ] Scroll depth tracking at different thresholds
- [ ] Web Vitals collection and reporting
- [ ] Plausible provider integration
- [ ] Error handling and fallback behavior
- [ ] Analytics opt-out / user consent handling
- [ ] Network failure scenarios
- [ ] Multiple provider coordination (if applicable)

## Implementation Plan

1. **Create test files**:
   - `src/analytics/__tests__/index.test.ts`
   - `src/analytics/__tests__/scrollDepth.test.ts`
   - `src/analytics/__tests__/webVitals.test.ts`
   - `src/analytics/providers/__tests__/plausible.test.ts`

2. **Add test utilities**:
   - Mock Plausible API
   - Mock performance observers
   - Mock scroll events
   - Test data fixtures

3. **Configure coverage thresholds**:
   ```typescript
   // vitest.config.ts
   coverage: {
     include: ['src/analytics/**/*.ts'],
     exclude: ['src/analytics/**/*.test.ts', 'src/analytics/types.ts'],
     thresholds: {
       'src/analytics': {
         lines: 80,
         functions: 80,
         branches: 75,
         statements: 80
       }
     }
   }
   ```

## Acceptance Criteria
- [ ] All 6 analytics files have test coverage
- [ ] Overall module coverage ≥80%
- [ ] Critical path coverage = 100%
- [ ] Coverage thresholds added to vitest.config.ts
- [ ] CI enforces coverage requirements
- [ ] Tests pass consistently in CI/CD

## Related Issues
- Missing coverage thresholds in vitest.config.ts (Low Priority)
- Analytics TODO at `src/analytics/index.ts:94` (additional providers)

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 161-167, 316-321)
