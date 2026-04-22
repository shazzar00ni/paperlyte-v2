# Performance

Paperlyte's core promise is speed. Every code change must respect these budgets.

## Bundle Size Limits (enforced by size-limit)

| Bundle | Limit (gzipped) |
|---|---|
| Main JS (`dist/assets/*.js`) | **150 KB** |
| Main CSS (`dist/assets/*.css`) | **30 KB** |

Run `npm run size` after any build to verify. CI will fail if limits are exceeded.

## Manual Chunk Splitting

Vite is configured to split into two stable vendor chunks:

- `react-vendor` — React + React DOM (~190 KB uncompressed, cached separately)
- `fontawesome` — Font Awesome SVG core (~100 KB uncompressed, cached separately)

When adding a new large third-party dependency (> 20 KB gzipped), evaluate whether it warrants its own manual chunk in `vite.config.ts`.

## Lighthouse Targets

Run `npm run lighthouse` (builds first, then runs `@lhci/cli`):

| Category | Minimum score |
|---|---|
| Performance | **90** |
| Accessibility | **95** |
| Best Practices | **90** |
| SEO | **90** |

Config: `.lighthouserc.json`. Do not lower these thresholds.

## Core Web Vitals

All CWV metrics must pass:

- **LCP** (Largest Contentful Paint): ≤ 2.5s
- **CLS** (Cumulative Layout Shift): ≤ 0.1
- **INP** (Interaction to Next Paint): ≤ 200ms

## Images & Fonts

- Self-host Inter via `@fontsource/inter` (Latin subset only). Never switch to a CDN.
- Use `font-display: swap` on all web fonts to prevent invisible text during load.
- New images: use WebP or AVIF format, provide `width` and `height` attributes to prevent CLS.
- Lazy-load images below the fold: `loading="lazy"` on `<img>`.

## Animation Performance

- Use CSS `transform` and `opacity` for animations — they are composited and do not trigger layout.
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these cause layout reflow.
- Add `will-change: transform` sparingly and only on elements that animate on every page load.

## Code Splitting

- Vite performs automatic code splitting. Do not import large libraries synchronously in components that are not immediately visible.
- Use `React.lazy` + `Suspense` for sections that are scrolled into view (below the fold), if they have significant JS weight.

## Dev Server

Runs on port **3000** (`npm run dev`). Preview server (used by Playwright E2E and Lighthouse) runs on port **4173** (`npm run preview`).
