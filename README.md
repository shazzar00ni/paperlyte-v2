# Paperlyte Landing Page

> **Your thoughts, unchained.**

Lightning-fast, distraction-free note-taking application landing page built with React, TypeScript, and Vite.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/shazzar00ni/paperlyte-v2?utm_source=oss&utm_medium=github&utm_campaign=shazzar00ni%2Fpaperlyte-v2&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

[![PR Quality Check](https://github.com/shazzar00ni/paperlyte-v2/actions/workflows/pr-quality-check.yml/badge.svg)](https://github.com/shazzar00ni/paperlyte-v2/actions/workflows/pr-quality-check.yml)

[![codecov](https://codecov.io/github/shazzar00ni/paperlyte-v2/graph/badge.svg?token=yQtvXFB0KF)](https://codecov.io/github/shazzar00ni/paperlyte-v2)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF)

> **Security:** See our [Security Practices](./docs/SECURITY.md) for vulnerability reporting, contributor guidelines, and supply chain security.

## Table of Contents

- [About Paperlyte](#about-paperlyte)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Project Structure](#project-structure)
- [Performance Targets](#performance-targets)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About Paperlyte

Paperlyte is a note-taking application designed for users who are frustrated with overly complex tools like Notion, Evernote, and OneNote. Our mission is to provide a **lightning-fast**, **beautifully simple** experience that gets out of your way and lets you focus on what matters: your thoughts.

### Core Differentiators

- **Zero-Lag Typing**: Sub-10ms keystroke response so typing feels instant, even in large docs
- **Tag-Based Organization**: Inline #tags instead of rigid folder hierarchies
- **Cross-Platform Sync**: Works offline-first across Mac, Windows, Linux, iOS, Android, web
- **Distraction-Free Writing**: Interface that disappears when you start typing
- **Private by Design**: Local-first architecture with optional end-to-end encrypted sync
- **Offline-First**: Core writing and organization work fully offline, sync when connected

This repository contains the landing page for Paperlyte, built with modern web technologies and optimized for performance and accessibility.

## Features

- Modern React 19 with TypeScript for type safety
- Vite for lightning-fast development and optimized builds
- CSS Modules for scoped, maintainable styling
- **Monochrome design aesthetic** with sophisticated black/white palette
- **Dual typography system**: Inter for UI, Playfair Display for headlines
- Dark mode with system preference detection
- Fully responsive design (mobile-first approach)
- WCAG 2.1 AA accessibility compliance
- Performance-optimized animations with `prefers-reduced-motion` support
- SEO-optimized with semantic HTML5

## Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3 (strict mode)
- **Build Tool**: Vite 7.2.4
- **Styling**: CSS Modules with custom design tokens
- **Icons**: Font Awesome Free 6.5.1 (CDN)
- **Fonts**: Inter + Playfair Display (Google Fonts)
- **Linting**: ESLint 9.39.1 with TypeScript and React plugins

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher (or yarn/pnpm equivalent)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/paperlyte-v2.git
cd paperlyte-v2
```

2. Install dependencies:

```bash
npm install
```

### Development

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000).

Other available commands:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Generate optimized icons and mockups
npm run generate:icons
npm run generate:mockups
```

## Image Optimization

Paperlyte uses modern image formats (WebP, AVIF) to deliver the best performance while maintaining quality. The image optimization workflow automatically generates multiple formats with smart fallbacks.

### How It Works

The application uses a **progressive format strategy** that serves the smallest supported format to each browser:

1. **AVIF** - Next-gen format with ~40-50% better compression than PNG (Chrome 85+, Firefox 93+)
2. **WebP** - Modern format with ~25-35% better compression than PNG (Chrome 23+, Firefox 65+)
3. **PNG** - Universal fallback for compatibility
4. **SVG** - Vector fallback for mockup images

Browsers automatically select the first format they support using the HTML `<picture>` element.

### Generation Scripts

#### Icons (`npm run generate:icons`)

Generates app icons and favicons from `public/favicon.svg`:

- **Small icons** (16x16, 32x32, 180x180): PNG only for maximum compatibility
- **Large icons** (192x192, 512x512): PNG, WebP (quality: 85), AVIF (quality: 75)
- **favicon.ico**: Multi-resolution ICO file for legacy browsers

Generated files:

#### Mockups (`npm run generate:mockups`)

Generates optimized mockup images from SVG sources in `public/mockups/`:

- Reads `notes-list.svg` (1100×800) and `note-detail.svg` (800×600)
- Generates PNG, WebP (quality: 85), AVIF (quality: 75) for each
- Preserves aspect ratio and uses transparent backgrounds

Generated files:

### When to Run Generation Scripts

- **During build**: Scripts run automatically via `prebuild` hook
- **After editing SVG sources**: Run manually if you update `favicon.svg` or mockup SVGs
- **For local testing**: Run `npm run generate:icons && npm run generate:mockups` before starting dev server

### Performance Optimizations

1. **Preloading**: Critical above-the-fold image (`notes-list.avif`) is preloaded in `index.html` to improve LCP
2. **Lazy loading**: Below-the-fold images use `loading="lazy"` attribute
3. **Async decoding**: All images use `decoding="async"` to avoid blocking the main thread
4. **Format quality tuning**:
   - WebP: quality 85, effort 6 (balanced quality/speed)
   - AVIF: quality 75, effort 6 (better compression at lower quality)

### Compression Savings

Expected file size reductions compared to PNG:

- **WebP**: 25-35% smaller
- **AVIF**: 40-50% smaller

For a typical 100KB PNG mockup:

- WebP: ~70KB (30% savings)
- AVIF: ~55KB (45% savings)

### Browser Support

- **AVIF**: Chrome 85+, Firefox 93+, Safari 16+ (2021+)
- **WebP**: Chrome 23+, Firefox 65+, Safari 14+ (2020+)
- **PNG**: Universal support (fallback)

All browsers receive optimized images - newer browsers get smaller files, older browsers get PNG fallbacks.

## Project Structure

```
paperlyte-v2/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Header, Footer, Section)
│   │   ├── sections/     # Page sections (Hero, Features, CTA)
│   │   └── ui/           # Reusable UI components (Button, Icon, ThemeToggle)
│   ├── constants/        # Constants and configuration
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles and CSS variables
│   │   ├── reset.css     # Modern CSS reset
│   │   ├── variables.css # Design system variables (colors, typography, spacing)
│   │   ├── typography.css # Typography styles
│   │   └── utilities.css # Utility classes
│   ├── App.tsx           # Main App component
│   ├── App.css           # App-specific styles
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles import
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── CLAUDE.md             # AI development guidance
├── README.md             # This file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App-specific TypeScript config
├── tsconfig.node.json    # Node-specific TypeScript config
├── vite.config.ts        # Vite configuration
└── eslint.config.js      # ESLint configuration
```

### Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@hooks/*` → `src/hooks/*`
- `@constants/*` → `src/constants/*`
- `@styles/*` → `src/styles/*`

Example:

```typescript
import { Button } from '@components/ui/Button'
import { useTheme } from '@hooks/useTheme'
```

## Performance Targets

These targets align with Paperlyte's "lightning-fast" value proposition:

- **Page Load**: < 2 seconds (initial load)
- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: > 95 (WCAG 2.1 AA compliance)
- **Core Web Vitals**: Pass all metrics
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

## Deployment

The application is deployed on Netlify with automatic deployments from the `main` branch.

### Netlify Configuration

Build settings:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x

Deploy previews are automatically created for all pull requests.

### Custom Domain

Production: [https://paperlyte.app](https://paperlyte.app) (when configured)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Branch naming**: Use descriptive names with prefixes
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring
   - `test/` - Test additions/updates

2. **Code style**: Follow the existing ESLint configuration
   - Run `npm run lint` before committing
   - Use TypeScript strict mode
   - Write accessible, semantic HTML

3. **Commits**: Write clear, descriptive commit messages

4. **Pull requests**:
   - Ensure all CI checks pass
   - Include Lighthouse scores if UI changes are made
   - Request review from code owners

5. **Accessibility**: All features must meet WCAG 2.1 AA standards

For detailed development guidance, see [CLAUDE.md](./CLAUDE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with by the Paperlyte team. Questions? Open an issue or contact us at [hello@paperlyte.app](mailto:hello@paperlyte.app).

## Lighthouse CI: Configurable numberOfRuns for Local vs. CI

By default, `.lighthouserc.json` sets `numberOfRuns` to `1` for fast local development. For more statistically reliable Lighthouse metrics in CI, override this value using the `LIGHTHOUSE_RUNS` environment variable:

- **Local/dev:**
  - `numberOfRuns` = 1 (default)
- **CI/CD:**
  - Set `LIGHTHOUSE_RUNS=3` (or higher) in your CI pipeline or before running LHCI:

    ```sh
    LIGHTHOUSE_RUNS=3 npx lhci autorun
    ```

  - This will run Lighthouse 3 times per URL for more consistent results.

**Why?**

- Single run is fast for local feedback.
- Multiple runs in CI reduce noise and improve reliability of performance scores.

> If your CI system does not support environment variable substitution, you can edit `.lighthouserc.json` before running LHCI, or use a pre-step script.

See `.lighthouserc.json` for the current default and update your pipeline as needed.
