# Reduced Motion Compliance

Every animation and transition in this codebase must respect the user's `prefers-reduced-motion: reduce` media preference. This is a hard requirement — not a nice-to-have — because vestibular disorders can make motion-heavy UIs physically harmful.

## Check

Review all changed CSS, component files, and animation-related hooks for these violations:

1. **CSS animations without `prefers-reduced-motion` guard**: Any `@keyframes`, `animation`, or `transition` property that is not wrapped in or overridden inside a `@media (prefers-reduced-motion: no-preference)` block (preferred) or a `@media (prefers-reduced-motion: reduce)` override block.

   **Preferred pattern** (opt-in motion):
   ```css
   @media (prefers-reduced-motion: no-preference) {
     .element { animation: fadeIn 0.3s ease; }
   }
   ```
   Not just adding `transition: none` in the reduce block — the animation must be absent by default or the override must fully disable it.

2. **JavaScript-driven animations ignoring the hook**: Any use of `requestAnimationFrame`, a motion library (e.g., Framer Motion, GSAP), or `Element.animate()` that does not first check the `useReducedMotion` hook (already defined in this codebase at `src/hooks/useReducedMotion`). The hook must gate the animation logic.

3. **Parallax effects without fallback**: The `ParallaxLayer` component and any scroll-linked position updates must be disabled entirely (not just slowed) when `useReducedMotion()` returns `true`.

4. **Floating/auto-playing animated elements**: Any element with continuous looping animation (e.g., `FloatingElement`) must stop all motion when reduced motion is preferred, not just reduce speed.

5. **Third-party animation components**: If using a library that has its own motion preference API (e.g., Framer Motion's `useReducedMotion`), verify it is being used. Do not rely solely on CSS media queries if JS is controlling the animation.

Flag each violation with the file, the animation, and a concrete code fix.
