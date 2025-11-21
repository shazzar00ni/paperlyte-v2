# CLAUDE.md - AI Assistant Guide for paperlyte-v2

This document provides comprehensive guidance for AI assistants working on the paperlyte-v2 codebase. It outlines the project structure, development workflows, coding conventions, and key considerations.

## Project Overview

**paperlyte-v2** is a modern React application built with TypeScript, Vite, and React 19.2. The project uses a minimal, performant setup focused on fast development iteration with Hot Module Replacement (HMR).

### Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Bundler**: Vite with @vitejs/plugin-react (Babel for Fast Refresh)
- **Linting**: ESLint 9.39.1 with TypeScript ESLint
- **Package Manager**: npm (lockfile present)

## Directory Structure

```
paperlyte-v2/
├── .git/                    # Git version control
├── .gitignore              # Git ignore rules
├── public/                 # Static assets served at root
│   └── vite.svg           # Vite logo
├── src/                    # Application source code
│   ├── assets/            # Static assets (images, fonts, etc.)
│   │   └── react.svg     # React logo
│   ├── App.tsx           # Main App component
│   ├── App.css           # App component styles
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── index.html             # HTML template
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── tsconfig.json          # TypeScript project references
├── tsconfig.app.json      # TypeScript config for app code
├── tsconfig.node.json     # TypeScript config for build tools
├── vite.config.ts         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project README
```

## Development Workflow

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start development server with HMR |
| `npm run build` | `tsc -b && vite build` | Type-check and build for production |
| `npm run lint` | `eslint .` | Run ESLint on entire codebase |
| `npm run preview` | `vite preview` | Preview production build locally |

### Development Server

- Run `npm run dev` to start the development server
- Vite provides instant HMR for rapid iteration
- Changes to `.tsx`, `.ts`, `.css` files trigger automatic updates
- Server typically runs on `http://localhost:5173`

### Building for Production

1. Run `npm run build` to:
   - Type-check the entire codebase (`tsc -b`)
   - Bundle and optimize for production (`vite build`)
2. Output is generated in the `dist/` directory
3. Run `npm run preview` to test the production build locally

### Code Quality

- Run `npm run lint` before committing
- ESLint is configured with:
  - TypeScript ESLint recommended rules
  - React Hooks rules (enforces Hooks best practices)
  - React Refresh rules (for proper HMR)
- Address all linting errors before pushing

## TypeScript Configuration

### Compiler Settings

The project uses strict TypeScript settings for maximum type safety:

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **JSX**: `react-jsx` (automatic JSX runtime)
- **Strict Mode**: Enabled
- **Additional Checks**:
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedSideEffectImports: true`

### Import Conventions

- Use `.tsx` extension for files containing JSX
- TypeScript allows importing `.ts` and `.tsx` extensions explicitly
- Prefer named imports for better tree-shaking
- Default exports are used for components (see `App.tsx`)

## React Conventions

### Component Structure

Components follow standard React functional component patterns:

```tsx
import { useState } from 'react'
import './ComponentName.css'

function ComponentName() {
  const [state, setState] = useState(initialValue)

  return (
    <div>
      {/* JSX content */}
    </div>
  )
}

export default ComponentName
```

### State Management

- Currently uses React built-in `useState` and `useEffect`
- No global state management library (Redux, Zustand, etc.) installed
- Consider adding state management if complexity grows

### Styling Approach

- **Component-scoped CSS**: Each component has its own `.css` file
- **Global styles**: `src/index.css` for app-wide styles
- **CSS Variables**: Uses `:root` for theming (see `index.css:1-14`)
- **Responsive Design**: Media queries for light/dark mode
- **No CSS-in-JS**: Pure CSS approach

### React 19 Considerations

This project uses React 19.2, which includes:
- Improved concurrent rendering
- Server Components (if enabled)
- Enhanced Suspense capabilities
- Compiler optimizations (not enabled by default)

**Note**: React Compiler is NOT enabled due to performance impact on dev/build. See `README.md:10-12` if considering enablement.

## Code Style Guidelines

### Naming Conventions

- **Components**: PascalCase (e.g., `App`, `UserProfile`)
- **Files**: Match component name (e.g., `App.tsx`, `UserProfile.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleClick`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: kebab-case (e.g., `logo-spin`, `read-the-docs`)

### File Organization

- Component files should include:
  1. Imports (React, hooks, types, assets, styles)
  2. Type definitions (if any)
  3. Component function
  4. Helper functions (if needed)
  5. Default export
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks

### Import Order

Follow this import order (as seen in codebase):
1. React imports
2. Third-party libraries
3. Local components
4. Assets (images, icons)
5. Styles (CSS imports last)

Example:
```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
```

## ESLint Configuration

ESLint is configured with the flat config format (`eslint.config.js`):

- **Files**: Lints all `.ts` and `.tsx` files
- **Ignores**: `dist/` directory
- **Extends**:
  - `@eslint/js` recommended
  - TypeScript ESLint recommended
  - React Hooks flat config
  - React Refresh Vite config
- **Globals**: Browser environment

### Key Rules

- React Hooks rules enforce proper hook usage
- React Refresh requires components to be pure for HMR
- TypeScript rules enforce type safety

## Git Workflow

### Branch Strategy

- **Main Branch**: (not yet set in git status, likely `main` or `master`)
- **Feature Branches**: Use format `claude/claude-md-{id}`
- Current branch: `claude/claude-md-mi99o181rvyluac7-01GBap4tmQKY2HHePk1jxVXy`

### Commit Practices

- Write clear, descriptive commit messages
- Use conventional commit format: `type: description`
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Reference issues/PRs when applicable

### Ignored Files

The `.gitignore` includes:
- `node_modules/` - Dependencies
- `dist/` and `dist-ssr/` - Build outputs
- `*.local` - Local environment files
- Log files
- Editor-specific files (except `.vscode/extensions.json`)

## AI Assistant Guidelines

### When Adding Features

1. **Understand Context**: Read related files before making changes
2. **Maintain Patterns**: Follow existing code style and structure
3. **Type Safety**: Ensure all TypeScript types are correct
4. **Test Changes**: Verify with `npm run dev` and `npm run lint`
5. **Update Dependencies**: Only add necessary packages

### When Fixing Bugs

1. **Reproduce**: Understand the bug before fixing
2. **Root Cause**: Find the underlying issue, not just symptoms
3. **Test Thoroughly**: Ensure fix doesn't break other features
4. **Consider Edge Cases**: Think about unusual inputs/states

### When Refactoring

1. **Preserve Behavior**: Don't change functionality during refactoring
2. **Small Steps**: Make incremental, reviewable changes
3. **Test Between Changes**: Ensure each step works
4. **Update Tests**: If test files exist, update them

### Common Pitfalls to Avoid

1. **Don't break strict TypeScript**: Use proper types, avoid `any`
2. **Don't ignore ESLint**: Fix warnings, don't disable rules
3. **Don't skip the build**: Always test `npm run build` succeeds
4. **Don't violate React Hooks rules**: Follow hooks best practices
5. **Don't add unnecessary dependencies**: Keep bundle size small
6. **Don't forget CSS organization**: Keep styles scoped and maintainable

## Performance Considerations

### Vite Optimization

- Vite uses esbuild for fast builds
- Tree-shaking enabled automatically
- Code splitting via dynamic imports
- CSS code splitting by default

### React Best Practices

- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` for heavy computations
- Lazy load routes/components with `React.lazy()`
- Keep component tree shallow

### Asset Optimization

- Images in `src/assets/` are processed by Vite
- Public assets served as-is from `public/`
- SVGs preferred for icons (smaller, scalable)

## Extending the Project

### Adding New Dependencies

```bash
npm install <package-name>
npm install -D <dev-package-name>
```

### Common Additions

- **Routing**: `react-router-dom`
- **State**: `zustand`, `redux`, `jotai`
- **Forms**: `react-hook-form`, `formik`
- **Styling**: `tailwindcss`, `styled-components`, `emotion`
- **HTTP**: `axios`, `react-query`
- **UI**: `@mui/material`, `@chakra-ui/react`, `antd`

### Type-Aware ESLint (Optional)

To enable stricter linting (see `README.md:14-44`):
1. Update `eslint.config.js` with `tseslint.configs.recommendedTypeChecked`
2. Add `parserOptions.project` pointing to tsconfig files
3. Consider `tseslint.configs.strictTypeChecked` for maximum strictness

## Testing

**Note**: No testing framework is currently configured.

### Recommended Setup

Consider adding:
- **Vitest**: Fast unit testing (Vite-native)
- **Testing Library**: React component testing
- **Playwright**: E2E testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Environment Variables

Vite handles environment variables:
- Prefix with `VITE_` to expose to client code
- Create `.env`, `.env.local`, `.env.production` files
- Access via `import.meta.env.VITE_VAR_NAME`
- Never commit `.env.local` (already gitignored as `*.local`)

## Deployment

### Build Output

- Production build in `dist/` directory
- Contains optimized, minified assets
- Ready for static hosting

### Hosting Options

- **Vercel**: Native Vite support
- **Netlify**: Drag-and-drop or Git integration
- **GitHub Pages**: With `gh-pages` package
- **AWS S3 + CloudFront**: Static site hosting
- **Docker**: Can containerize for any platform

### Build Command

```bash
npm run build
```

### Deployment Configuration

For most platforms, use:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Install command**: `npm install`

## Troubleshooting

### Common Issues

1. **Type errors**: Run `tsc --noEmit` to see all type issues
2. **Lint errors**: Run `npm run lint` and fix issues
3. **HMR not working**: Restart dev server, check Vite config
4. **Build fails**: Check for type errors, missing dependencies
5. **Import errors**: Verify file paths, extensions

### Debugging

- Use browser DevTools for React debugging
- Install React DevTools extension
- Check Vite dev server console for errors
- Review browser console for runtime errors

## Resources

### Documentation

- [React 19 Docs](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)

### Project-Specific

- `README.md`: Basic setup and ESLint expansion guide
- `package.json`: All dependencies and scripts
- `tsconfig.app.json`: TypeScript configuration details

## Version Information

- **Project Version**: 0.0.0 (initial setup)
- **Node Types**: 24.10.1
- **Last Updated**: 2025-11-21
- **Initial Commit**: 03ff876 - "initial commit: setup React + TypeScript + Vite project with ESLint and basic configuration"

---

## Quick Reference

### Start Development
```bash
npm install
npm run dev
```

### Check Code Quality
```bash
npm run lint
npm run build
```

### File Locations
- Components: `src/`
- Styles: `src/*.css`
- Assets: `src/assets/` or `public/`
- Config: Root directory

### Key Commands
- Add dependency: `npm install <package>`
- Type check: `tsc --noEmit`
- Clean install: `rm -rf node_modules package-lock.json && npm install`

---

**This document should be updated as the project evolves. When making significant architectural changes, please update this guide accordingly.**
