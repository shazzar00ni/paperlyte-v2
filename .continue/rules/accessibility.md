# Accessibility

Target: **WCAG 2.1 AA** compliance. Lighthouse accessibility score must stay above **95**.

## Semantic HTML

- Use the correct element for the job: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>` for landmarks.
- Never make a `<div>` or `<span>` interactive without adding `role`, `tabIndex`, and keyboard handlers.
- Heading hierarchy must be sequential (h1 → h2 → h3). Do not skip levels.

## Keyboard Navigation

- Every interactive element must be reachable and operable with a keyboard.
- Focus order must follow visual reading order.
- Provide a **skip link** (`Skip to main content`) as the first focusable element on every page.
- All focus states: minimum **2px solid outline** with **2px offset**. Never remove `:focus-visible` styles.

## ARIA

- Prefer native semantics over ARIA. Add ARIA only when native HTML cannot express the role.
- `aria-label` or `aria-labelledby` required on all interactive elements that lack visible text.
- Meaningful icons: add `ariaLabel` prop. Decorative icons: omit `ariaLabel` (component should render `aria-hidden="true"`).
- Live regions: use `aria-live="polite"` for non-urgent updates, `aria-live="assertive"` only for errors.

## Colour Contrast

- Normal text (< 18px / 14px bold): minimum **4.5:1** contrast ratio.
- Large text (≥ 18px or ≥ 14px bold): minimum **3:1** contrast ratio.
- UI components (borders, icons, focus indicators): minimum **3:1** against adjacent colours.
- See `docs/DESIGN-SYSTEM.md` for the verified contrast matrix.

## Images & Media

- All `<img>` elements require a meaningful `alt` attribute, or `alt=""` if purely decorative.
- SVGs used as content must have `<title>` or `aria-label`. Decorative SVGs: `aria-hidden="true"`.
- Video/audio: provide captions or transcripts.

## Motion

- Always respect `prefers-reduced-motion: reduce`. Set `transition-duration` and `animation-duration` to `0.01ms` inside that media query — not `0` (which can break JS-driven animations).

## Forms

- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` (explicit `for/id` pair or `aria-label`).
- Validation errors must be announced via `aria-describedby` or `aria-live`.
- Required fields: use `aria-required="true"` in addition to HTML `required`.

## Testing Accessibility

- Use `getByRole`, `getByLabelText`, and `getByText` in tests — avoid `getByTestId`.
- Run the Lighthouse accessibility audit: `npm run lighthouse`. Score must be ≥ 95.
- Manual check: tab through the entire page with keyboard only before marking any UI work done.
