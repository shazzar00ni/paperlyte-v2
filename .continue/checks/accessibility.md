# Accessibility Standards (WCAG 2.1 AA)

This project targets a Lighthouse Accessibility score >95 and WCAG 2.1 AA compliance. Every component and section must meet these requirements.

## Check

Review the changed files for the following accessibility violations:

1. **Missing or inadequate alt text**: Images must have descriptive `alt` attributes. Decorative images use `alt=""`. Icons used without visible text must have `aria-label` or `aria-hidden`.

2. **Keyboard navigation gaps**: Interactive elements (buttons, links, form controls) must be reachable and operable via keyboard. Avoid `tabIndex` values greater than 0. Custom interactive components must handle `Enter` and `Space` key events.

3. **Missing ARIA roles or labels**: Interactive elements that lack visible text labels must have `aria-label` or `aria-labelledby`. Landmark regions (nav, main, aside, footer) must be present and correctly scoped.

4. **Insufficient color contrast**: Text must meet a 4.5:1 contrast ratio (3:1 for large text). Do not introduce new color combinations that rely on low-contrast values. Check text on gradient or image backgrounds.

5. **Focus management issues**: Modal dialogs, drawers, and overlays must trap focus while open and return focus to the trigger on close. Dynamic content insertions must not steal focus unexpectedly.

6. **Semantic HTML violations**: Use `<button>` for actions and `<a>` for navigation — not `<div onClick>` or `<span onClick>`. Headings must follow a logical hierarchy (no skipping from h1 to h3).

7. **Form accessibility**: Every `<input>`, `<textarea>`, and `<select>` must be associated with a `<label>` (via `htmlFor`/`id` or `aria-label`). Error messages must be programmatically linked to their field with `aria-describedby`.

8. **Screen reader text**: Use `.sr-only` (visually hidden but accessible) for text that provides context only needed by screen readers. Do not suppress content with `visibility: hidden` or `display: none` when it must remain accessible.

Flag any violation with a specific fix suggestion referencing the exact element, component, or line.
