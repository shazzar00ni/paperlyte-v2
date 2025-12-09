# Contributing to Paperlyte

Thank you for your interest in contributing to Paperlyte! We're building a lightning-fast, distraction-free note-taking application, and we welcome contributions that align with our core values of simplicity, speed, and accessibility.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Project Constraints](#project-constraints)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- Git

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/paperlyte-v2.git
cd paperlyte-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Project Structure

Familiarize yourself with the project structure:

```
src/
├── components/
│   ├── layout/          # Layout components (Section, etc.)
│   └── ui/              # Reusable UI components (Button, Icon, etc.)
├── hooks/               # Custom React hooks
├── constants/           # Application constants
├── styles/              # Global styles and design system
└── App.tsx              # Main application component
```

## Development Process

### Branch Naming Convention

Use descriptive branch names following this pattern:

- `feature/description` - New features (e.g., `feature/hero-section`)
- `fix/description` - Bug fixes (e.g., `fix/button-alignment`)
- `docs/description` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/description` - Code refactoring (e.g., `refactor/hooks-structure`)
- `test/description` - Test additions/fixes (e.g., `test/button-component`)

### Workflow

1. **Create a branch** from `main` for your work
2. **Make your changes** following our coding standards
3. **Write/update tests** for your changes
4. **Run linter** and fix any issues: `npm run lint`
5. **Test your changes** thoroughly: `npm test`
6. **Commit your changes** following commit guidelines
7. **Push your branch** and create a pull request

## Coding Standards

### TypeScript

- **Strict mode enabled** - All TypeScript strict checks must pass
- **Type everything** - Avoid `any` types; use proper type definitions
- **Export interfaces** - Make interfaces available for reuse
- **Use functional components** - No class components

### React Best Practices

- **Use hooks** - Follow React Hooks best practices
- **Functional components** - Always use functional components
- **Props destructuring** - Destructure props in function parameters
- **Component naming** - Use PascalCase for components
- **File naming** - Match component name (e.g., `Button.tsx` for `Button` component)

### Code Style

- **Indentation** - 2 spaces (configured in ESLint)
- **Semicolons** - Not required (rely on ASI)
- **Quotes** - Single quotes for strings
- **Line length** - Keep lines under 100 characters when possible
- **Arrow functions** - Prefer arrow functions for callbacks

### Documentation

- **JSDoc comments** - All public APIs must have JSDoc documentation
- **Component props** - Document all props with descriptions
- **Examples** - Include usage examples in JSDoc
- **Inline comments** - Add comments for complex logic only

Example:

````typescript
/**
 * Custom hook that tracks element visibility in viewport
 *
 * @param options - Configuration options
 * @returns Object with ref and visibility state
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useIntersectionObserver();
 * ```
 */
export const useIntersectionObserver = (options = {}) => {
  // Implementation
}
````

### CSS/Styling

- **CSS Modules** - Use CSS Modules for component styles
- **BEM naming** - Follow BEM methodology for class names
- **Mobile-first** - Write mobile styles first, then desktop
- **CSS variables** - Use CSS custom properties from `variables.css`
- **Avoid inline styles** - Only use inline styles for dynamic values

### Accessibility

- **Semantic HTML** - Use appropriate HTML5 semantic elements
- **ARIA labels** - Add aria-label for icon-only buttons
- **Keyboard navigation** - Ensure all interactive elements are keyboard accessible
- **Color contrast** - Maintain WCAG AA contrast ratios (4.5:1 minimum)
- **Reduced motion** - Respect `prefers-reduced-motion` for all animations

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring (no functionality change)
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, build config, etc.)

### Examples

```bash
feat(button): add icon support to Button component

- Added icon prop to ButtonProps interface
- Implemented icon rendering with Font Awesome
- Updated Button documentation with examples

Closes #123
```

```bash
fix(animation): respect prefers-reduced-motion in AnimatedElement

Users with reduced motion preference were still seeing animations.
Now properly detects and disables animations for accessibility.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update documentation** - Update README.md if needed
2. **Add/update tests** - Ensure test coverage for your changes
3. **Run all checks** - Linting, type checking, and tests must pass
4. **Build succeeds** - Run `npm run build` to verify production build
5. **Review your changes** - Double-check your diff before submitting

### PR Title Format

Use the same format as commit messages:

```
feat(component): add new feature
fix(hook): resolve issue with X
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe how you tested your changes

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] Added/updated tests
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Build succeeds
```

### Review Process

1. **Automated checks** - CI/CD must pass (linting, tests, build)
2. **Code review** - At least one maintainer approval required
3. **Address feedback** - Make requested changes promptly
4. **Maintainer merge** - Maintainers will merge once approved

## Testing Requirements

### Test Coverage

- **New features** - Must include tests
- **Bug fixes** - Must include regression tests
- **Components** - Test rendering, props, and interactions
- **Hooks** - Test all return values and side effects
- **Utilities** - Test all edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

We use Vitest and React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Project Constraints

### Core Principles

1. **No Feature Bloat** - Paperlyte's value is simplicity. Avoid over-engineering.
2. **Mobile-First** - Design and develop for mobile first, then enhance for desktop.
3. **Accessibility Required** - Every feature must be accessible (WCAG 2.1 AA).
4. **Performance Budget** - If a feature slows the page, it doesn't ship.
5. **Reduced Motion** - Always respect `prefers-reduced-motion`.

### Performance Targets

- **Page Load** - < 2 seconds initial load
- **Lighthouse Performance** - > 90 score
- **Lighthouse Accessibility** - > 95 score
- **Core Web Vitals** - Must pass all metrics

### What NOT to Do

- ❌ Add unnecessary dependencies
- ❌ Implement features not in the roadmap without discussion
- ❌ Skip accessibility considerations
- ❌ Ignore performance implications
- ❌ Write code without types
- ❌ Skip tests for new features
- ❌ Use `any` type in TypeScript

## Questions?

If you have questions:

1. **Check existing issues** - Your question may already be answered
2. **Open a discussion** - Use GitHub Discussions for general questions
3. **Open an issue** - For bug reports or feature requests

## License

By contributing to Paperlyte, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Paperlyte! Together, we're building the note-taking app that prioritizes simplicity and speed.
