# Paperlyte

> Your thoughts, unchained from complexity

**Paperlyte** is a lightning-fast, distraction-free note-taking application that prioritizes simplicity over feature bloat. Built for frustrated note-takers overwhelmed by complex tools like Notion, Evernote, and OneNote.

## ✨ Core Features

- **⚡ Lightning Speed** - Instant startup and real-time sync. No loading spinners, no waiting. Your thoughts captured at the speed of thinking.
- **🎨 Beautiful Simplicity** - Paper-inspired design that feels natural and distraction-free. Just you and your thoughts, the way it should be.
- **🏷️ Tag-Based Organization** - Smart categorization without rigid folder structures. Organize freely with tags that adapt to how you think.
- **📱 Universal Access** - Seamless experience across all devices. Start on your phone, finish on your laptop. Always in sync.
- **☁️ Offline-First** - Full functionality without internet. Your notes work everywhere, sync automatically when online.
- **🔒 Privacy Focused** - Your notes are yours alone. End-to-end encryption and local-first storage keep your thoughts private.

## 🚀 Tech Stack

- **React 19.2.0** with React DOM 19.2.0
- **TypeScript 5.9.3** with strict mode enabled
- **Vite 7.2.4** for blazing-fast development and optimized builds
- **ESLint 9.39.1** with TypeScript, React Hooks, and React Refresh plugins
- **CSS Modules** for scoped, maintainable styling
- **Font Awesome** for consistent iconography

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/shazzar00ni/paperlyte-v2.git
cd paperlyte-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Development Commands

```bash
# Start development server with Hot Module Replacement (HMR)
npm run dev

# Build for production (runs TypeScript compiler + Vite build)
npm run build

# Lint all files
npm run lint

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
paperlyte-v2/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Section/          # Section layout component
│   │   └── ui/
│   │       ├── AnimatedElement/  # Intersection Observer-based animations
│   │       ├── Button/           # Reusable button component
│   │       └── Icon/             # Icon wrapper component
│   ├── constants/
│   │   └── features.ts           # Feature definitions
│   ├── hooks/
│   │   ├── useIntersectionObserver.ts  # Scroll animation hook
│   │   ├── useMediaQuery.ts            # Responsive design hook
│   │   └── useReducedMotion.ts         # Accessibility hook
│   ├── styles/
│   │   ├── reset.css             # CSS reset
│   │   ├── variables.css         # CSS custom properties
│   │   ├── typography.css        # Typography styles
│   │   └── utilities.css         # Utility classes
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # App-specific TypeScript config
├── tsconfig.node.json            # Build tooling TypeScript config
├── vite.config.ts                # Vite configuration
├── eslint.config.js              # ESLint configuration
└── package.json                  # Project dependencies
```

## 🎯 Development Phases

### Phase 1: MVP Landing Page (Current)
Essential sections being implemented:
- ✅ Component architecture (Section, Button, Icon, AnimatedElement)
- ✅ Custom hooks (useIntersectionObserver, useMediaQuery, useReducedMotion)
- ✅ Design system foundations (typography, variables, utilities)
- 🚧 Hero section with clear value proposition
- 🚧 Feature grid (6 core features with icons)
- 🚧 Call-to-action section with download buttons
- 🚧 Sticky navigation header
- 🚧 Footer with social/legal links

### Phase 2: Conversion Optimization (Post-Launch)
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

## 🎨 Design System

### Visual Identity
- **Color Palette**: Paper-inspired whites, subtle grays, vibrant purple primary
- **Typography**: Inter font family with clear hierarchy and readable sizes
- **Iconography**: Font Awesome icons with consistent sizing and spacing
- **Animation**: Subtle, performance-optimized, respects `prefers-reduced-motion`

### UX Principles
1. **Speed First** - Every interaction should feel instantaneous
2. **Clarity Over Cleverness** - Clear communication over creative copy
3. **Mobile Excellence** - Mobile experience must be as good as desktop
4. **Accessibility** - Usable by everyone, regardless of ability
5. **Progressive Enhancement** - Core content accessible without JavaScript

## 📊 Performance & Quality Targets

These targets are critical to the product's "lightning-fast" value proposition:

- **Page Load Speed**: < 2 seconds initial load
- **Lighthouse Performance**: > 90 score
- **Lighthouse Accessibility**: > 95 score (WCAG 2.1 AA compliance)
- **Core Web Vitals**: Must pass all metrics
- **Bounce Rate**: Target < 45% for organic traffic
- **Engagement Time**: Average session > 2 minutes

## 🔧 TypeScript Configuration

The project uses TypeScript's project references with two configs:

- `tsconfig.app.json`: Application code (src/) with strict mode, ES2022 target, and bundler module resolution
- `tsconfig.node.json`: Build tooling configuration

Key compiler settings:
- Strict mode enabled with additional unused variable/parameter checks
- JSX mode: `react-jsx` (automatic runtime)
- Module resolution: `bundler` (Vite-specific)
- `noEmit: true` (Vite handles transpilation)

## 🧹 Code Quality

ESLint is configured with the flat config format (`eslint.config.js`) including:
- Base JavaScript/TypeScript recommended rules
- React Hooks rules (enforces hooks best practices)
- React Refresh rules (ensures HMR compatibility)
- Ignores `dist/` directory

## 🤝 Contributing

This project is currently in early development. Contributions are welcome once we reach a stable MVP.

### Development Constraints

- **No Feature Bloat**: Paperlyte's core value is simplicity - avoid over-engineering
- **Mobile-First**: Design and develop for mobile first, then enhance for desktop
- **Accessibility Required**: Not optional - every feature must be accessible
- **Performance Budget**: If a feature slows the page, it doesn't ship
- **Reduced Motion**: Always respect `prefers-reduced-motion` for animations

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vite.dev/)
- [ESLint Documentation](https://eslint.org/)

## 📞 Contact

For questions or feedback about Paperlyte, please open an issue on this repository.

---

Built with ⚡ by developers who believe note-taking should be simple, fast, and beautiful.
