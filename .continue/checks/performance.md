# Performance Budget

Paperlyte's core value proposition is "lightning-fast." The landing page must load in under 2 seconds and pass all Core Web Vitals. Changes that regress performance do not ship.

## Enforced Limits

- Main JS bundle: **≤150 KB** gzipped
- Main CSS bundle: **≤30 KB** gzipped
- Lighthouse Performance score: **>90**

## Check

Review changed files for patterns that would regress these targets:

1. **Large third-party imports**: Importing an entire library when only one utility is needed (e.g., `import _ from 'lodash'` instead of `import debounce from 'lodash/debounce'`). Flag any new dependency import and verify it is tree-shakeable or justified by its size contribution.

2. **Unoptimized images**: New `<img>` elements without `width`/`height` attributes (causes layout shift, hurts CLS). Images that should use modern formats (WebP/AVIF) or lazy loading (`loading="lazy"`) for below-the-fold content.

3. **Render-blocking patterns**: Synchronous operations in the component render path (heavy loops, synchronous XHR, large JSON parsing inline). Flag anything that would delay Time to Interactive.

4. **Missing memoization for expensive operations**: Heavy calculations or large list renders inside component bodies without `useMemo`. Callbacks passed as props to child components without `useCallback` when the child is wrapped in `React.memo`.

5. **CSS layout thrashing**: Reading layout properties (offsetWidth, getBoundingClientRect) immediately after DOM writes inside the same synchronous block. Applies to any scroll/resize handlers.

6. **Unthrottled event listeners**: `scroll`, `resize`, or `mousemove` listeners that are not debounced or throttled. These directly harm INP and FID scores.

7. **Font loading regressions**: New web fonts added without `font-display: swap` or without being preloaded in the `<head>`. The project already uses Google Fonts — additions must follow the same pattern.

8. **Animations using non-composited properties**: CSS transitions or `@keyframes` animating `width`, `height`, `top`, `left`, `margin`, or `padding` instead of `transform` and `opacity`. These trigger layout recalculation and hurt CLS/INP.

For each issue found, describe the performance impact and suggest a specific, minimal fix.
