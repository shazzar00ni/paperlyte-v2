# Design System Adherence

Paperlyte's visual identity is a deliberate, distinctive aesthetic defined in `docs/DESIGN-SYSTEM.md`. Changes must not introduce off-brand styles, break the monochrome palette, or regress the design into generic "AI slop."

## Check

Review changed CSS, TSX, and style files for these violations:

1. **Hardcoded color values outside CSS variables**: Any literal hex, rgb, or hsl color that is not referencing a CSS custom property (e.g., `color: #1a1a1a` instead of `color: var(--color-primary)`). All colors must come from the design token system. Exceptions: `transparent`, `currentColor`, `inherit`.

2. **Hardcoded font families**: Font family declarations that do not use the established CSS variable or the project's defined font stack (Inter for UI/body, Playfair Display for headlines). No Arial, Roboto, system-ui, or other generic fonts in component styles.

3. **Border radius deviations on buttons**: Button and pill-shaped components must use `border-radius: 9999px` (or the corresponding CSS variable). Do not introduce square or slightly-rounded buttons — the pill shape is a signature design element.

4. **Off-system spacing values**: Spacing (margin, padding, gap) that uses arbitrary pixel values not aligned to the design scale. Prefer multiples of 4px/8px and use CSS variables where spacing tokens exist.

5. **Missing dark mode support**: Any new CSS rule that introduces a color, background, or border that only works correctly in light mode, without a corresponding `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)` override using the inverted palette.

6. **Animations using non-composited properties**: (Also checked in performance) — here, flag it as a design-quality issue: animations that jump, stutter, or look unpolished because they animate layout-triggering properties. All UI animations must be smooth and hardware-accelerated.

7. **Generic component patterns**: New UI components that look like default browser styles or unstyled library components. Every visible element must be intentionally designed. Flag placeholder or stub UI that does not match the Paperlyte aesthetic.

8. **Font Awesome icon usage inconsistency**: New icons that are not from Font Awesome, or Font Awesome icons added without the standard sizing/spacing class pattern used in existing components. Check `src/utils/iconLibrary` for the approved icon registry.

For each violation, describe the design rule broken and how to bring the change in line with the system.
