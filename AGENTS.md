# Paperlyte Agent Instructions

## Project Overview

Paperlyte is a privacy-focused note-taking application built with React 18, TypeScript, and Vite. This is currently an MVP using localStorage for data persistence, with plans to migrate to a full API backend in Q4 2025.

## Build/Lint/Test Commands

### Core Commands

```bash
npm run dev              # Start Vite dev server (port 3000)
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build locally
npm run ci               # Full pipeline: lint, type-check, test, build
```

### Testing

```bash
npm run test             # Run all tests with memory optimization
npm run test:run         # Run tests once (no watch mode)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Run tests with Vitest UI
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:all         # Run unit + E2E tests
```

**Running a Single Test:**

```bash
# Run specific test file
npm run test -- src/components/__tests__/WaitlistModal.test.tsx

# Run test with pattern match
npm run test -- --testNamePattern="should render when open"

# Run single test in a file
npx vitest run src/services/__tests__/dataService.test.ts
```

### Linting & Formatting

```bash
npm run lint             # ESLint with all warnings as errors
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format all files with Prettier
npm run format:check     # Check Prettier formatting
npm run type-check       # TypeScript type checking only
```

### Dependency Management

```bash
npm run security-audit   # Audit dependencies for vulnerabilities
npm run deps:update      # Check and update dependencies
npm run deps:check       # Check for outdated packages
npm run clean            # Remove build artifacts
```

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` or specific types instead
- Use interfaces for object shapes, types for unions/primitives
- Enable `strict: true` in tsconfig.json

### Naming Conventions

- **Components**: PascalCase (e.g., `NoteEditor.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables/Functions**: camelCase (e.g., `saveNote`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_NOTE_LENGTH`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `ModalProps`)
- **Types**: PascalCase (e.g., `Note`, `WaitlistEntry`)

### Imports

```typescript
// Absolute imports for project modules
import { useState } from 'react'
import { NoteEditor } from '@/components/NoteEditor'

// Relative imports for same-level or parent imports
import { formatDate } from './dateUtils'
import { dataService } from '../../services/dataService'

// Import ordering: React → External → Internal → Relative
```

### React Patterns

- Use functional components with hooks (no class components)
- Use custom hooks for shared logic
- Proper dependency arrays in `useEffect`
- Loading states for all async operations
- Error boundaries for all page components

### Error Handling

```typescript
try {
  const result = await dataService.saveNote(note)
  if (result) {
    // Success path
  }
} catch (error) {
  monitoring.logError(error as Error, {
    feature: 'note_editor',
    action: 'save_note',
  })
}
```

- Always use try/catch for async operations
- Differentiate network, business logic, and runtime errors
- Provide user-friendly messages, log technical details
- Use `monitoring.logError()` from `src/utils/monitoring.ts`

### Analytics & Monitoring

- Track page views with `trackFeatureUsage()` in component `useEffect`
- Add breadcrumbs with `monitoring.addBreadcrumb()`
- Use `trackNoteEvent()`, `trackWaitlistEvent()` for user interactions

### Data Persistence

- Use `dataService` methods exclusively for persistence operations
- Storage keys: `paperlyte_notes`, `paperlyte_waitlist_entries`
- All data operations return promises for future API compatibility

### CSS & Styling

- Use Tailwind CSS with custom utilities
- Use CSS Grid and Flexbox for layouts
- Include dark mode support with `prefers-color-scheme`
- Use modern units (rem, vh, vw) instead of pixels

## File Structure

```
paperlyte/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-level page components
│   ├── services/        # Data service and sync engine
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Tailwind CSS styles
│   └── __tests__/       # Shared test utilities
├── tests/               # E2E and integration tests
├── docs/                # Project documentation
└── simple-scribbles/    # Planning and notes
```

## Development Workflow

1. Create detailed plan before editing large files (>300 lines)
2. Run tests before committing: `npm run test:run`
3. Run linting: `npm run lint`
4. Ensure type checking passes: `npm run type-check`
5. Husky pre-commit hooks enforce lint-staged checks

## Key Patterns

### Data Service Usage
```typescript
const notes = await dataService.getNotes()
const success = await dataService.saveNote(updatedNote)
```

### Component Analytics
```typescript
useEffect(() => {
  trackFeatureUsage('note_editor', 'view')
  monitoring.addBreadcrumb('Note editor loaded', 'navigation')
}, [])
```

### Keyboard Shortcuts
```typescript
useKeyboardShortcut(['cmd+s', 'ctrl+s'], saveNote)
```

## Accessibility

- WCAG 2.1 AA minimum compliance
- Semantic HTML elements
- Proper ARIA roles and attributes
- Color contrast checks
- Alt text for images
