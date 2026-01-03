# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Paperlyte** is a lightning-fast, distraction-free note-taking application that prioritizes simplicity over feature bloat. The landing page aims to communicate this value proposition to frustrated note-takers who are overwhelmed by complex tools like Notion, Evernote, and OneNote.

**Core Promise**: "Your thoughts, unchained."

**Key Differentiators**:

- Zero-Lag Typing: Sub-10ms keystroke response so typing feels instant, even in large docs
- Tag-Based Organization: Inline #tags instead of rigid folder hierarchies
- Cross-Platform Sync: Mac, Windows, Linux, iOS, Android, web
- Distraction-Free Writing: Interface that disappears when you start typing
- Private by Design: Local-first architecture with optional end-to-end encrypted sync
- Offline-First: Core writing and organization work fully offline, sync when connected

This is a React application built with TypeScript and Vite, currently in early development stages.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler + Vite build)
npm run build

# Lint all files
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **React**: 19.2.0 (with React DOM 19.2.0)
- **TypeScript**: ~5.9.3 with strict mode enabled
- **Build Tool**: Vite 7.2.4 with @vitejs/plugin-react
- **Linting**: ESLint 9.39.1 with TypeScript ESLint, React Hooks, and React Refresh plugins

## Project Structure

```
src/
├── main.tsx          # Application entry point (renders App in StrictMode)
├── App.tsx           # Main App component
├── App.css           # App-specific styles
├── index.css         # Global styles
└── assets/           # Static assets (images, etc.)
```

## TypeScript Configuration

The project uses TypeScript's project references with two configs:

- `tsconfig.app.json`: Application code (src/) with strict mode, ES2022 target, and bundler module resolution
- `tsconfig.node.json`: Build tooling configuration

Key compiler settings:

- Strict mode enabled with additional unused variable/parameter checks
- JSX mode: `react-jsx` (automatic runtime)
- Module resolution: `bundler` (Vite-specific)
- `noEmit: true` (Vite handles transpilation)

## ESLint Configuration

ESLint is configured with the flat config format (eslint.config.js) including:

- Base JavaScript/TypeScript recommended rules
- React Hooks rules (enforces hooks best practices)
- React Refresh rules (ensures HMR compatibility)
- Ignores `dist/` directory

## Entry Point

The application mounts at `<div id="root">` in index.html and renders the App component wrapped in React StrictMode.

## Design System

**See `/docs/DESIGN-SYSTEM.md` for comprehensive design documentation.**

### Visual Identity

- **Color Palette**: Sophisticated monochrome aesthetic with near-black (#1a1a1a) and pure white (#ffffff)
- **Typography**: Dual font system - Inter (sans-serif) for UI/body text, Playfair Display (serif) for headlines
- **Buttons**: Pill-shaped (border-radius: 9999px) for a modern, friendly appearance
- **Iconography**: Font Awesome icons with consistent sizing and spacing
- **Animation**: Subtle, performance-optimized, respectful of motion preferences (`prefers-reduced-motion`)

### Frontend Aesthetics

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. 

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. 
- Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. 
- Use CSS variables for consistency. 
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes. 
- Draw from IDE themes and cultural aesthetics for inspiration.

Motion: 
Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: 
Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid the following generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!

### Key Design Features

- **Monochrome Palette**: Black/white design inverts in dark mode (white becomes primary)
- **Serif Headlines**: Large Playfair Display headlines with italic emphasis
- **Pill Buttons**: All buttons use full border-radius for signature look
- **Hero Parallax**: Subtle background shapes with blur effects
- **Floating Elements**: Animated icons and decorative elements (hidden on mobile)

### UX Principles

1. **Speed First**: Every interaction should feel instantaneous
2. **Clarity Over Cleverness**: Clear communication over creative copy
3. **Mobile Excellence**: Mobile experience must be as good as desktop (60%+ mobile traffic expected)
4. **Accessibility**: Usable by everyone, regardless of ability
5. **Progressive Enhancement**: Core content must be accessible without JavaScript

## Performance & Quality Targets

These targets are critical to the product's "lightning-fast" value proposition:

- **Page Load Speed**: <2 seconds initial load
- **Lighthouse Performance**: >90 score
- **Lighthouse Accessibility**: >95 score (WCAG 2.1 AA compliance)
- **Core Web Vitals**: Must pass all metrics
- **Bounce Rate**: Target <45% for organic traffic
- **Engagement Time**: Average session >2 minutes

## Development Phases

### Phase 1: MVP Landing Page (Current)

Essential sections to implement first:

- Hero section with clear value proposition and upcoming launch messaging
- Feature grid (6 core features with performance metrics and icons)
- Call-to-action section with "Join the Waitlist" buttons
- Sticky navigation header
- Footer with social/legal links

Technical requirements:

- Intersection Observer for scroll animations
- Hardware-accelerated CSS transforms
- Semantic HTML structure
- Keyboard-navigation support
- Screen reader friendly markup

### Phase 2: Conversion Optimization (Post-Launch)

High-priority additions:

- Newsletter signup form (email capture)
- Testimonial slider
- Feature comparison table (vs. competitors)
- Pricing teaser section
- FAQ section

### Phase 3: Advanced Features (Growth Stage)

- Privacy-first analytics (cookie-less, GDPR-compliant)
- Dark mode toggle with system preference detection
- Advanced scroll animations and parallax effects
- Social sharing functionality

## Important Constraints

- **No Feature Bloat**: Paperlyte's core value is simplicity - avoid over-engineering
- **Mobile-First**: Design and develop for mobile first, then enhance for desktop
- **Accessibility Required**: Not optional - every feature must be accessible
- **Performance Budget**: If a feature slows the page, it doesn't ship
- **Reduced Motion**: Always respect `prefers-reduced-motion` for animations
