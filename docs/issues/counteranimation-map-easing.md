# Convert CounterAnimation easing lookup to Map

## Summary

Implement the approved PR #424 hardening by replacing the plain-object easing function lookup in
`CounterAnimation` with a `Map` and a safe fallback.

## Background

`docs/ACTION_PLAN.md` identifies PR #424 as still pending on the current branch. The current
`CounterAnimation` implementation still defines `easingFunctions` as a plain object and invokes it
via bracket notation, which was the specific issue the approved PR intended to eliminate.

## Scope

- Update `src/components/ui/CounterAnimation/CounterAnimation.tsx`.
- Replace the plain object with `Map<string, (t: number) => number>`.
- Replace `easingFunctions[animEasing](progress)` with `easingFunctions.get(animEasing)` and a
  linear fallback.
- Add or update tests if existing coverage does not exercise the supported easing values.

## Acceptance Criteria

- [ ] `CounterAnimation` uses `new Map<string, (t: number) => number>(...)` for easing functions.
- [ ] Animation code uses `easingFunctions.get(animEasing) ?? ((t: number) => t)`.
- [ ] No bracket-notation lookup remains for easing function execution.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes, or any failures are documented with clear environment limitations.

## Suggested Verification

```bash
rg "new Map" src/components/ui/CounterAnimation/CounterAnimation.tsx
rg "easingFunctions\[" src/components/ui/CounterAnimation/CounterAnimation.tsx
npm run lint
npm test
```

## Suggested Labels

- `security`
- `frontend`
- `good first issue`
