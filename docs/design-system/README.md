# Paperlyte Design System

> **Version:** 3.0.0
> **Last Updated:** March 2026
> **Status:** Active

The Paperlyte Design System is the single source of truth for visual design, interaction patterns, and component specifications across the landing page and application. It encodes the brand promise — **"Your thoughts, unchained."** — into concrete, implementable rules.

---

## Contents

| Document                               | Description                                                                |
| -------------------------------------- | -------------------------------------------------------------------------- |
| [`tokens.md`](./tokens.md)             | All design tokens: colors, spacing, radii, shadows, z-index, transitions   |
| [`typography.md`](./typography.md)     | Font families, scale, weights, line-heights, and text utility classes      |
| [`components.md`](./components.md)     | Component API reference: Button, Icon, EmailCapture, ThemeToggle, and more |
| [`layout.md`](./layout.md)             | Grid system, breakpoints, container widths, Section primitives             |
| [`motion.md`](./motion.md)             | Animation principles, easing curves, timing, scroll-triggered reveals      |
| [`landing-page.md`](./landing-page.md) | Section-by-section spec for the marketing landing page                     |

---

## Design Principles

### 1. Speed First

Every visual decision must reinforce the product's core promise of instant response. Avoid heavyweight effects (large blur radii, full-page overlays, font-swap jank) that contradict the brand.

### 2. Clarity Over Cleverness

Copy and UI communicate directly. Metaphor and ornamentation serve clarity — not the other way around.

### 3. Mobile Excellence

60%+ of organic traffic arrives on mobile. Mobile layouts are designed first; desktop is an enhancement.

### 4. Accessibility is Non-Negotiable

WCAG 2.1 AA is the floor, not the ceiling. Every component ships with keyboard navigation, focus styles, and screen reader support built in.

### 5. Progressive Enhancement

Core content renders and is readable without JavaScript. Animations and interactivity layer on top.

---

## Brand Snapshot

| Attribute          | Value                                         |
| ------------------ | --------------------------------------------- |
| Brand name         | Paperlyte                                     |
| Tagline            | "Your thoughts, unchained."                   |
| Aesthetic          | Monochrome minimalism — paper meets dark mode |
| Accent strategy    | No accent color; contrast is the accent       |
| Primary typeface   | Playfair Display (headlines)                  |
| Secondary typeface | Inter (UI / body)                             |
| Button shape       | Full pill (`border-radius: 9999px`)           |
| Dark mode          | Inverted monochrome (white becomes primary)   |

---

## Quick Reference

### Color Roles (Light Mode)

```text
Background  #ffffff   Pure white canvas
Surface     #f9fafb   Card / panel lift
Primary     #1a1a1a   All interactive elements
Text        #111827   Headings, body
Secondary   #6b7280   Supporting copy
Border      #e5e7eb   Dividers, outlines
```

### Color Roles (Dark Mode)

```text
Background  #0f172a   Deep slate
Surface     #1e293b   Card lift
Primary     #ffffff   All interactive elements
Text        #f1f5f9   Headings, body
Secondary   #94a3b8   Supporting copy
Border      #334155   Dividers, outlines
```

### Type Scale (abbreviated)

```text
5xl   clamp(2rem → 3rem)    Hero headline
4xl   clamp(1.75rem → 2.25rem)  Section headline
3xl   clamp(1.5rem → 1.875rem)  Sub-section headline
base  1rem (16px)           Body copy
sm    0.875rem (14px)       Captions, labels
```

### Spacing Scale

```text
xs   0.5rem   (8px)
sm   1rem     (16px)
md   1.5rem   (24px)
lg   2rem     (32px)
xl   3rem     (48px)
2xl  4rem     (64px)
3xl  6rem     (96px)  → 4rem tablet → 3rem mobile
```

---

## File Locations

```text
src/
├── styles/
│   ├── variables.css     ← All CSS custom properties (tokens)
│   ├── reset.css         ← Normalize / box-sizing
│   ├── typography.css    ← Font-face declarations + heading defaults
│   └── utilities.css     ← Utility classes (container, flex, sr-only…)
├── components/
│   ├── ui/               ← Primitive components (Button, Icon, …)
│   ├── sections/         ← Page section components (Hero, Features, …)
│   └── layout/           ← Layout wrappers (Header, Footer, Section)
└── hooks/                ← Shared React hooks
```

---

## Contributing

1. Token changes go in `src/styles/variables.css` first, then update `tokens.md`.
2. New components require a CSS Module (`.module.css`) alongside the `.tsx` file.
3. Every new component needs a `*.test.tsx` file.
4. Run `npm run lint` before committing.
5. Lighthouse accessibility score must remain ≥ 95 on production (≥ 82 CI threshold — see `docs/LIGHTHOUSE-CI.md`).
