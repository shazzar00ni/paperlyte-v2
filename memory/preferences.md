# Preferences

This file tracks coding style, design, and workflow preferences for this project.

## Format

- **Category**: Area this preference applies to (code style, design, workflow, etc.)
- **Preference**: The specific preference
- **Context**: Why this preference exists

---

## Design

- Use Inter for UI/body typography (`src/**/*.{tsx,css}`); Playfair Display (serif) for headlines
- Follow monochrome design aesthetic with near-black (`#1a1a1a`) and white (`#ffffff`) as primary palette (`src/**/*.css`)
- Avoid clichéd decorative choices (purple gradients, sci-fi glows, overly predictable layouts) that conflict with the monochrome identity
- Within the monochrome palette, use dominant near-black/white with sharp accent contrasts; avoid evenly-distributed timid palettes
- Animate high-impact moments (page load staggered reveals) over scattered micro-interactions

## Code

- Design and develop for mobile-first, then enhance for desktop (`src/**/*.{tsx,css}`)
- No feature bloat — simplicity is the core value
- Accessibility required (WCAG 2.1 AA)
- Performance budget is strict: <2s load, >90 Lighthouse performance score

<!-- Add additional preferences below -->
