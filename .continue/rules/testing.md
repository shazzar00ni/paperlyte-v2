# Testing

## Frameworks

- **Unit / component tests**: Vitest + React Testing Library. Config: `vitest.config.ts`. Setup: `src/test/setup.ts`.
- **E2E tests**: Playwright. Config: `playwright.config.ts`. Tests live in `tests/e2e/`.
- Never use Jest — the project is Vitest-only.

## File Conventions

- Test file lives alongside its subject: `src/components/Foo/Foo.test.tsx`.
- E2E spec files: `tests/e2e/*.spec.ts`.
- Import test utilities from `@testing-library/react`, not from Vitest directly, for component rendering.

## Coverage Thresholds

- Overall (Vitest): **70% minimum** across lines, functions, branches, and statements.
- Patch coverage (Codecov): **80% target** for PR diff lines.
- `npm run test:coverage` must pass before a PR is merged.

## What to Test

- Every exported component should have at least a smoke test (`renders without crashing`).
- Test user interactions (click, keyboard navigation, form submission) not implementation details.
- Test accessibility: use `getByRole`, `getByLabelText`, and `getByText` queries — avoid `getByTestId` unless there is no semantic alternative.
- Mock browser APIs that are unavailable in jsdom: `IntersectionObserver`, `matchMedia`, `ResizeObserver`. Patterns are already in `src/test/setup.ts` — extend them there.

## Writing Unit Tests

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...', { name: /…/i })).toBeInTheDocument()
  })
})
```

## Writing E2E Tests

- Base URL is `http://localhost:4173` (Vite preview). Start the server with `npm run preview`.
- Use `page.getByRole()` and `page.getByLabel()` locators; avoid CSS selectors.
- Five browser projects are configured: Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12). E2E tests must pass on all five.
- Add `test.describe` blocks per feature, not per component.

## Commands

```bash
npm run test               # watch mode
npm run test:coverage      # coverage report (must hit 70%)
npm run test:e2e           # run Playwright across all browsers
npm run test:e2e:ui        # interactive Playwright UI
```
