# Code Style — TypeScript & React

## TypeScript

- Always use TypeScript strict mode. Never use `any`; prefer `unknown` with a type guard when the type is genuinely unknown.
- Provide explicit return types for all exported functions and component props.
- Use interface for object shapes that represent public contracts; use type for unions, intersections, and utility types.
- Never suppress TypeScript errors with `// @ts-ignore` or `// @ts-expect-error` without a detailed comment explaining why.
- Path aliases are configured: `@/*`, `@components/*`, `@hooks/*`, `@utils/*`, `@styles/*`, `@constants/*`. Always use them instead of relative paths that cross directory boundaries.

## React Components

- Component folder structure: one folder per component containing `ComponentName.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`, and `index.ts` (barrel export).
- CSS Modules only — never use Tailwind, styled-components, or inline style objects (except for dynamic values that cannot be expressed as CSS custom properties).
- Name event handler props `on<Event>` (e.g., `onClick`, `onSubmit`). Name handler implementations `handle<Event>`.
- Never call hooks conditionally. Follow all rules of hooks.
- Prefer named exports over default exports for components (except top-level page files).
- Keep components focused: if a component exceeds ~200 lines it likely needs to be split.
- No direct DOM manipulation with `document.*` or `window.*` inside render — use refs or effects.

## Imports & Exports

- Group imports: React first, then third-party libraries, then internal aliases (`@/*`), then relative imports. Separate each group with a blank line.
- Barrel `index.ts` files export only public API; do not re-export internal helpers.

## Formatting (enforced by Prettier)

- No semicolons, single quotes, 2-space indent, trailing comma (ES5), print width 100, LF line endings.
- Run `npm run format:check` to verify. Run `npm run format` to auto-fix.

## Linting

- Run `npm run lint` before committing. Zero warnings are acceptable in new code.
- ESLint flat config is in `eslint.config.js`. Legacy `.eslintrc.cjs` exists only for Codacy — do not edit it for day-to-day rules.
