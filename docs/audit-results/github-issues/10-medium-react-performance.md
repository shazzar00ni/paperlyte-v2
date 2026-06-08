# [MEDIUM] Optimize React performance with memo and lazy loading

**Labels**: `priority:medium`, `area:performance`, `area:react`

## Description
Limited usage of React performance optimizations (React.memo, React.lazy, useMemo, useCallback) creates opportunities for unnecessary re-renders and larger initial bundles as the application grows.

## Impact
- **Severity**: 🟡 MEDIUM PRIORITY
- **Risk**: Performance degradation as app scales, unnecessary re-renders, larger bundle size
- **Owner**: Frontend Team
- **Timeline**: Sprint 3

## Current State

### What's Good ✅
- `Section` component uses React.memo
- Modern React 19.2.0 with concurrent features
- Clean component architecture

### What's Missing ❌
1. **Limited React.memo usage** - Only Section component memoized
2. **No React.lazy()** - No code splitting for route/feature components
3. **Large animation components not memoized** - SVGPathAnimation (242 lines), CounterAnimation (178 lines)
4. **useParallax hook lacks memoization** - Performance optimization opportunities
5. **No Suspense boundaries** - Missing loading states for async components

## Performance Opportunities

### 1. Animation Component Memoization

#### SVGPathAnimation.tsx (242 lines)
**Current**: Re-renders on every parent render
**Impact**: Expensive SVG calculations and animations
**Solution**: Wrap with React.memo and optimize internal hooks

```typescript
// Before
export function SVGPathAnimation({ path, duration, ...props }: Props) {
  // ... 242 lines of animation logic
}

// After
export const SVGPathAnimation = memo(function SVGPathAnimation({
  path,
  duration,
  ...props
}: Props) {
  // Memoize expensive calculations
  const pathData = useMemo(() => calculatePath(path), [path]);

  // Memoize animation frame callback
  const animate = useCallback(() => {
    // Animation logic
  }, [duration, pathData]);

  // ... optimized implementation
});
```

**Expected Improvement**: 50-70% reduction in animation re-renders

#### CounterAnimation.tsx (178 lines)
**Current**: Re-renders on every parent render
**Impact**: Expensive number formatting and animation frames
**Solution**: Memoize component and optimize internal calculations

```typescript
// Before
export function CounterAnimation({ target, duration, ...props }: Props) {
  // ... 178 lines of counter logic
}

// After
export const CounterAnimation = memo(function CounterAnimation({
  target,
  duration,
  format,
  ...props
}: Props) {
  // Memoize formatter function
  const formatter = useMemo(() => createFormatter(format), [format]);

  // Memoize animation callback
  const animateCounter = useCallback(() => {
    // Counter animation logic
  }, [target, duration, formatter]);

  // ... optimized implementation
});
```

**Expected Improvement**: 40-60% reduction in counter re-renders

### 2. useParallax Hook Optimization

**File**: `src/hooks/useParallax.ts`

**Current Issues**:
- Missing useMemo for scroll calculations
- Event listeners not optimally memoized
- No throttling/debouncing on scroll events

**Optimization**:
```typescript
// Before
export function useParallax(speed: number) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
}

// After
export function useParallax(speed: number) {
  const [offset, setOffset] = useState(0);

  // Throttle scroll handler for performance
  const handleScroll = useCallback(
    throttle(() => {
      setOffset(window.scrollY * speed);
    }, 16), // ~60fps
    [speed]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Memoize transform style
  const transform = useMemo(
    () => ({ transform: `translateY(${offset}px)` }),
    [offset]
  );

  return transform;
}
```

**Expected Improvement**: 30-50% reduction in scroll-triggered renders

### 3. Code Splitting with React.lazy()

**Current**: All components loaded in initial bundle
**Target**: Split large feature components and pages

```typescript
// Before
import { FeedbackWidget } from './components/ui/FeedbackWidget';
import { Privacy } from './components/pages/Privacy';
import { Terms } from './components/pages/Terms';

// After
const FeedbackWidget = lazy(() => import('./components/ui/FeedbackWidget'));
const Privacy = lazy(() => import('./components/pages/Privacy'));
const Terms = lazy(() => import('./components/pages/Terms'));

// With Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <FeedbackWidget />
</Suspense>
```

**Expected Improvement**: 20-30% reduction in initial bundle size

### 4. Add Suspense Boundaries

**Current**: No loading states for async operations
**Needed**: Strategic Suspense boundaries for better UX

```typescript
// App.tsx
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<ContentLoader />}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<ContentLoader />}>
                <Terms />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Implementation Plan

### Phase 1: Component Memoization (Week 1)
- [ ] Audit all components for memoization opportunities
- [ ] Add React.memo to animation components:
  - [ ] SVGPathAnimation.tsx
  - [ ] CounterAnimation.tsx
- [ ] Add React.memo to large components:
  - [ ] FeedbackWidget (after refactoring)
  - [ ] Header component
  - [ ] Footer component
- [ ] Measure render performance before/after

### Phase 2: Hook Optimization (Week 2)
- [ ] Optimize useParallax hook with useMemo/useCallback
- [ ] Add throttling to scroll handlers
- [ ] Audit other custom hooks for optimization
- [ ] Add performance comments documenting optimizations
- [ ] Write tests for optimized hooks

### Phase 3: Code Splitting (Week 3)
- [ ] Identify components for lazy loading:
  - [ ] Privacy page
  - [ ] Terms page
  - [ ] FeedbackWidget
  - [ ] Any other large features
- [ ] Implement React.lazy() for target components
- [ ] Add Suspense boundaries with loading states
- [ ] Create reusable loading components
- [ ] Test bundle size improvements

### Phase 4: Monitoring & Validation (Week 4)
- [ ] Add React DevTools Profiler measurements
- [ ] Document performance improvements
- [ ] Set up performance budgets
- [ ] Create performance testing guide
- [ ] Add performance regression tests

## Components to Memoize

### High Priority
- ✅ Section (already memoized)
- [ ] SVGPathAnimation (242 lines)
- [ ] CounterAnimation (178 lines)
- [ ] FeedbackWidget (344 lines, after refactoring)

### Medium Priority
- [ ] Header component
- [ ] Footer component
- [ ] Hero section
- [ ] Feature grid items
- [ ] Any component rendered in a list

### Low Priority (Profile First)
- [ ] Small utility components
- [ ] Components that rarely re-render
- [ ] Components with cheap render logic

## Hooks to Optimize

### High Priority
- [ ] useParallax (scroll performance critical)
- [ ] useIntersectionObserver (if exists)
- [ ] useFeedbackSubmit (after extraction from FeedbackWidget)

### Medium Priority
- [ ] useReducedMotion (already exists, check optimization)
- [ ] Custom analytics hooks
- [ ] Form handling hooks

## Expected Performance Gains

### Bundle Size
- **Before**: 97.13 KB (gzipped JS)
- **After code splitting**: ~70-75 KB (gzipped JS) for initial bundle
- **Improvement**: 20-30% reduction in initial bundle

### Runtime Performance
- **Animation re-renders**: 50-70% reduction
- **Scroll performance**: 30-50% smoother
- **Overall re-renders**: 30-40% reduction

### User Experience
- **Initial load**: Faster (smaller bundle)
- **Interaction responsiveness**: Improved (fewer re-renders)
- **Scroll performance**: Smoother (optimized parallax)
- **Memory usage**: Lower (better cleanup)

## Testing Requirements
- [ ] React DevTools Profiler before/after measurements
- [ ] Bundle size comparison (webpack-bundle-analyzer or Vite rollup-plugin-visualizer)
- [ ] Lighthouse performance score comparison
- [ ] Manual scroll performance testing
- [ ] Visual regression tests (ensure no visual changes)
- [ ] Unit tests for optimized hooks

## Pitfalls to Avoid

### Over-memoization
- Don't memo components that render once
- Don't memo components with cheap render logic
- Profile before optimizing

### Incorrect Dependencies
- Ensure memo/useMemo dependencies are correct
- Avoid stale closures
- Test edge cases

### Breaking Changes
- Ensure memoization doesn't break functionality
- Test all user interactions
- Verify animations still work correctly

## Acceptance Criteria
- [ ] React.memo applied to all large/expensive components
- [ ] Animation components (SVGPathAnimation, CounterAnimation) optimized
- [ ] useParallax hook optimized with useMemo/useCallback
- [ ] React.lazy() implemented for Privacy, Terms, FeedbackWidget
- [ ] Suspense boundaries added with loading states
- [ ] Performance improvements measured and documented
- [ ] Bundle size reduced by ≥20%
- [ ] Re-renders reduced by ≥30%
- [ ] No functionality regressions
- [ ] Tests passing for all optimized components

## Monitoring
- Track with React DevTools Profiler
- Monitor bundle size in CI (Lighthouse CI)
- Set up performance budgets
- Alert on performance regressions

## Related Issues
- Issue #8: Component refactoring (enables better memoization)
- Issue #5: Lighthouse CI (monitors performance improvements)

## Resources
- React.memo: https://react.dev/reference/react/memo
- React.lazy: https://react.dev/reference/react/lazy
- useMemo: https://react.dev/reference/react/useMemo
- useCallback: https://react.dev/reference/react/useCallback
- React Profiler: https://react.dev/reference/react/Profiler

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 85-88, 204-208, 359-364)
