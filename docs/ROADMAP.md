# Paperlyte Development Roadmap - Landing Page/Waitlist Signup

## Phase 0: Setup & Foundation - Landing Page (Day 1)

- [x] Create GitHub repository with proper structure
- [x] Set up Vite + React project with TypeScript
- [x] Configure CSS Modules for minimal, clean design
- [x] Set up development environment
- [x] Create basic project structure (components, pages, lib, utils)
- [x] Initialize Vercel and Netlify deployment pipelines

## Phase 1: Core Landing Page (MVP) — _Status: Complete_

### Sticky Navigation Header

- [x] Sticky header with scroll-aware styling
- [x] Logo/wordmark and primary nav links
- [x] Mobile hamburger menu with accessible toggle
- [x] "Join the Waitlist" primary CTA in header
- [x] Smooth-scroll anchor navigation to sections

### Hero Section

- [x] Headline: "Your thoughts, unchained."
- [x] Subheadline communicating the value proposition
- [x] Upcoming-launch / waitlist messaging
- [x] Primary CTA button
- [x] Parallax background shapes with blur effects (`useParallax`, `ParallaxLayer`)
- [x] Floating decorative elements (hidden on mobile)

### Feature Grid

- [x] Six core features with icons and performance metrics
- [x] Centralized feature content in `src/constants/`
- [x] Responsive grid layout (mobile-first)
- [x] Scroll-triggered staggered reveal animations

### Call-to-Action & Waitlist

- [x] Dedicated CTA section reinforcing the value proposition
- [x] "Join the Waitlist" buttons
- [x] Email capture wired to Netlify serverless function

### Footer

- [x] Social links
- [x] Legal links (privacy, terms)
- [x] Copyright and brand mark

### Accessibility & Semantic Foundation

- [x] Semantic HTML structure throughout
- [x] "Skip to main content" skip link
- [x] Keyboard navigation support
- [x] Screen-reader-friendly markup (aria attributes, roles)
- [x] 2px focus outlines on interactive elements
- [x] `prefers-reduced-motion` respected on all animations

### Scroll Animations

- [x] Intersection Observer entrance animations (`useIntersectionObserver`)
- [x] Hardware-accelerated CSS transforms
- [x] `AnimatedElement` wrapper with staggered `--animation-delay`

## Phase 2: Conversion Optimization — _Status: Core sections complete; deployment follow-ups deferred to Phase 5_

### Waitlist / Email Capture

- [x] Newsletter/waitlist signup form (`EmailCapture`)
- [x] Client-side email validation and input sanitization
- [x] Server-side handling via Netlify function (keeps API keys off client)
- [x] Success/error states and user feedback
- [ ] Add a Vercel-compatible subscribe function (currently Netlify-only — breaks on Vercel deploys) — _deployment hardening, not a blocker for the Netlify-hosted core; tracked under Phase 5_
- [ ] Replace process-local rate limiting with a durable store — _deployment hardening, tracked under Phase 5_

### Testimonials

- [x] Accessible testimonial carousel/slider
- [x] Keyboard navigation (prev/next) and swipe support
- [x] Centralized testimonial content in `src/constants/testimonials.ts`

### Feature Comparison

- [x] Comparison section vs. competitors (Notion, Evernote, OneNote)
- [x] Responsive comparison layout
- [x] Centralized comparison data

### Pricing Teaser

- [x] Pricing section (Free vs. Plus)
- [x] Centralized pricing data in `src/constants/pricing.ts`

### FAQ

- [x] Accessible FAQ accordion
- [x] Centralized FAQ content in `src/constants/faq.ts`

### Social Sharing

- [x] Twitter / Facebook / LinkedIn share buttons in `EmailCapture`
- [x] Pre-filled share text and URL

## Phase 3: Advanced Features & Polish — _Status: In Progress_

### Dark Mode

- [x] Theme engine with CSS custom properties
- [x] `ThemeToggle` component and `useTheme` hook
- [x] System preference detection (`prefers-color-scheme`)
- [x] Explicit choice overrides system preference (`[data-theme]`)
- [x] Privacy-gated theme persistence (`ALLOW_PERSISTENT_THEME`)

### Advanced Scroll Animations & Parallax

- [x] Parallax layers and scroll-position effects (`useParallax`, `useScrollPosition`)
- [x] Text reveal animations (`TextReveal`)
- [x] SVG path animations (`SVGPathAnimation`)
- [x] Counter animations for statistics (`CounterAnimation`)

### Privacy-First Analytics — _Blocked: scaffolded but not yet wired into runtime; launch-blocking_

- [x] `useAnalytics()` hook centralizing event tracking
- [x] Provider-abstraction layer scaffolded (`src/analytics/`)
- [x] Conversion events defined (waitlist, CTA, navigation, scroll depth)
- [ ] **Wire analytics into runtime** — production currently loads no tracking script, so all events are no-ops
- [ ] Migrate from GA4 wrapper to the cookie-less Plausible provider (the stated privacy-first target)
- [ ] Verify GDPR-compliant, cookie-less configuration end-to-end

### PWA / Offline

- [x] Web app manifest for "add to home screen"
- [x] Service worker (`public/sw.js`) with offline fallback and asset caching
- [ ] Fix asset-cache eviction (pruning currently runs only on activate; cache can exceed cap)

### Performance

- [x] Manual chunk splitting (`react-vendor`, `fontawesome`)
- [x] Self-hosted Inter (Latin subset) — no third-party font CDN
- [x] Bundle-size budgets enforced (main JS <150KB gz, CSS <30KB gz)
- [x] Code-split sections via `React.lazy`
- [ ] Defer lazy chunk loading (sections are split but rendered unconditionally, so all chunks fetch on initial load)
- [ ] Replace corrupted `public/fonts/Inter-Variable.woff2` (silently falls back today)

## Phase 4: Testing & Quality Assurance — _Status: Mostly Complete_

### Automated Testing

- [x] Vitest unit/component tests (~95% line coverage, 1,700+ tests)
- [x] Coverage threshold enforced (70% minimum)
- [x] Playwright E2E setup
- [ ] Bring serverless functions (`subscribe.ts`) and WAF edge function into coverage scope
- [ ] Wire `FeedbackWidget` `onSubmit` (currently rendered without it — submissions fail)

### Accessibility Audit

- [x] WCAG 2.1 AA color contrast verified
- [x] Local Lighthouse accessibility score 100
- [ ] Screen-reader pass across NVDA / VoiceOver
- [ ] Keyboard-only journey audit on mobile

### Performance / Lighthouse

- [x] Lighthouse CI configured
- [x] Local Lighthouse scores 100/100/100/100
- [x] Core Web Vitals monitored
- [ ] Confirm <2s load and >90 performance on production hardware/CDN

## Phase 5: Pre-Launch Readiness — _Status: Blocked / In Progress_

### Legal & Compliance

- [ ] Replace 14 placeholders in `src/constants/legal.ts` (entity name, address, jurisdiction, governing law, social links, doc links)
- [ ] Remove `[e.g., ...]` placeholders from `public/privacy.html`
- [ ] Resolve governing-law mismatch (terms.html: Australia vs. `Terms.tsx`: Delaware)
- [ ] Finish WIP policy docs (COOKIE-POLICY, DMCA stub, ACCESSIBILITY placeholder owner)
- [ ] Publish policy docs via the build (currently `docs/` is not deployed)

### Image & Brand Assets

- [ ] Add `og-image.jpg` / `twitter-image.jpg` (only SVGs exist; meta tags 404 today)
- [ ] Verify favicon and app icon set across sizes

### Domain & SEO

- [ ] Fix `scripts/generate-sitemap.cjs` domain (`paperlyte.com` → canonical `paperlyte.app`)
- [ ] Verify canonical URLs, meta tags, and structured data
- [ ] Confirm `robots.txt` and sitemap submission

### CTA Link Integrity

- [ ] Verify download CTA URLs (iOS/Android store + desktop links currently unverified/404)

## Phase 6: Launch & Post-Launch — _Status: Pending_

### Launch

- [ ] Final cross-browser and mobile QA pass
- [ ] Production analytics smoke test (confirm events fire) — _depends on the Phase 3 analytics wiring landing first_
- [ ] Product Hunt / social launch assets
- [ ] Monitor Sentry and Core Web Vitals post-deploy

### Post-Launch Iteration

- [ ] A/B test hero copy and CTA placement for waitlist conversion
- [ ] Analyze scroll-depth and drop-off to refine section order
- [ ] Iterate on testimonials and pricing copy from real feedback
- [ ] Track bounce rate (<45% target) and session time (>2 min target)

# Paperlyte Development Roadmap - MVP to Launch

## Phase 0: Setup & Foundation - Note Editor (Day 1)

- [ ] Create GitHub repository with proper structure
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS for minimal, clean design
- [ ] Set up development environment
- [ ] Create basic project structure (components, pages, lib, utils)
- [ ] Initialize Vercel and Netlify deployment pipelines

## Phase 1: Core Editor & Basic Functionality (Day 1-2)

### Lightning-Fast Editor

- [ ] Create main editor component
- [ ] Implement textarea/contenteditable with auto-resize
- [ ] Auto-save functionality (debounced, every 500ms)
- [ ] First line becomes title logic
- [ ] Basic Markdown support (headings, bold, italic, lists)
- [ ] Implement local storage for offline capability
  - [ ] Store notes in IndexedDB
  - [ ] Handle offline/online states
  - [ ] Auto-sync when connection restored

### Basic Note Management

- [ ] Notes list component (left sidebar)
- [ ] Display all notes sorted by last modified
- [ ] Click to switch between notes
- [ ] Show note titles and preview
- [ ] Create new note functionality
  - [ ] Auto-create when user starts typing
  - [ ] Generate unique note IDs
- [ ] Delete note functionality with confirmation

### Minimal UI Implementation

- [ ] Clean, distraction-free layout
- [ ] Left sidebar for notes list
- [ ] Main editor panel
- [ ] Minimal header with search
- [ ] Responsive design for mobile/tablet
- [ ] Loading states and smooth transitions

## Phase 2: Search & Organization (Day 3)

### Tagging System

- [ ] Implement inline tag creation (#tagname)
- [ ] Parse tags from note content
- [ ] Store tags in note metadata
- [ ] Visual highlighting of tags in editor
- [ ] Tag management
  - [ ] Extract and index all tags
  - [ ] Tag suggestions while typing
  - [ ] Tag filtering in notes list

### Search Engine

- [ ] Implement instant search functionality
- [ ] Search bar in header
- [ ] Real-time search as user types
- [ ] Search through titles, content, and tags
- [ ] Highlight search results
- [ ] Advanced search logic
  - [ ] Fuzzy matching
  - [ ] Relevance scoring
  - [ ] Search history

### Data Persistence

- [ ] Implement robust local storage
- [ ] Handle large notes efficiently
- [ ] Data migration between versions
- [ ] Export notes to Markdown files
- [ ] Import Markdown files

## Phase 3: User Authentication & Cloud Sync (Day 4-5)

### Authentication System

- [ ] Set up authentication provider (Supabase Auth)
- [ ] Google OAuth integration
- [ ] Apple Sign-In integration
- [ ] Email/password authentication
- [ ] Create user onboarding flow
  - [ ] Minimal signup process
  - [ ] Skip straight to editor after signup
  - [ ] Welcome note with tutorial

### Cloud Sync Implementation

- [ ] Set up Supabase backend
- [ ] Database schema for users and notes
- [ ] Real-time subscriptions for sync
- [ ] Conflict resolution for simultaneous edits
- [ ] End-to-end encryption
  - [ ] Client-side encryption before sync
  - [ ] Key management system
  - [ ] Secure key storage

### Multi-device Sync

- [ ] Sync engine implementation
- [ ] Detect changes and sync automatically
- [ ] Handle offline changes
- [ ] Batch sync for performance
- [ ] Device management
  - [ ] Track active devices
  - [ ] Free tier: 2 device limit
  - [ ] Plus tier: unlimited devices

## Phase 4: Paperlyte+ Premium Features (Day 6-7)

### Premium Feature Gate

- [ ] Implement subscription system
- [ ] Stripe integration for payments
- [ ] Subscription status tracking
- [ ] Free tier limitations
- [ ] Premium features implementation
  - [ ] Advanced search filters (date, multi-tag)
  - [ ] Theme system (dark mode, custom colors)
  - [ ] Priority support system
  - [ ] Early access feature flags

### Advanced Search Filters

- [ ] Date range filtering
- [ ] Created date filter
- [ ] Modified date filter
- [ ] Date picker component
- [ ] Multi-tag filtering
  - [ ] Tag combination logic (AND/OR)
  - [ ] Tag exclusion filters
  - [ ] Saved search queries

### Theme System

- [ ] Create theme engine
- [ ] CSS variables for theming
- [ ] Light/dark mode toggle
- [ ] Custom color palettes
- [ ] Theme persistence across devices

## Phase 5: Polish & Performance (Day 8-9)

### Performance Optimization

- [ ] Editor performance
- [ ] Virtual scrolling for large notes
- [ ] Optimized re-rendering
- [ ] Lazy loading for notes list
- [ ] Search optimization
  - [ ] Index optimization
  - [ ] Debounced search queries
  - [ ] Search result caching
- [ ] Bundle optimization
  - [ ] Code splitting
  - [ ] Asset optimization
  - [ ] Service worker for caching

### UX Polish

- [ ] Keyboard shortcuts
- [ ] Cmd+N for new note
- [ ] Cmd+K for search
- [ ] Markdown shortcuts
- [ ] Smooth animations and transitions
  - [ ] Note switching animations
  - [ ] Loading state animations
  - [ ] Hover effects and feedback
- [ ] Error handling and user feedback
  - [ ] Connection status indicator
  - [ ] Sync status feedback
  - [ ] Error messages and retry logic

### Mobile Experience

- [ ] Mobile-specific optimizations
- [ ] Touch-friendly interface
- [ ] Mobile keyboard handling
- [ ] Swipe gestures for navigation
- [ ] Progressive Web App features
  - [ ] Service worker for offline access
  - [ ] App manifest for installation
  - [ ] Push notifications for sync

## Phase 6: Testing & Quality Assurance (Day 10)

### Comprehensive Testing

- [ ] Unit tests for core functions
- [ ] Editor functionality
- [ ] Search algorithms
- [ ] Sync logic
- [ ] Integration tests
  - [ ] Authentication flow
  - [ ] Note creation and editing
  - [ ] Multi-device sync
- [ ] End-to-end testing
  - [ ] Complete user journeys
  - [ ] Cross-browser compatibility
  - [ ] Mobile device testing

### Security Review

- [ ] Encryption implementation audit
- [ ] Authentication security review
- [ ] Data handling compliance (GDPR)
- [ ] Penetration testing
- [ ] Privacy policy creation

### Performance Testing

- [ ] Load testing with large datasets
- [ ] Sync performance under load
- [ ] Mobile performance optimization
- [ ] Accessibility testing (WCAG compliance)

## Phase 7: Launch Preparation (Day 11-12)

### Marketing Website

- [ ] Landing page design and copy
- [ ] Hero section: "Your thoughts, unchained"
- [ ] Feature highlights with screenshots
- [ ] Pricing table (Free vs Plus)
- [ ] About page and privacy policy
- [ ] Support documentation
- [ ] Blog setup for content marketing

### Analytics & Monitoring

- [ ] Set up analytics (PostHog/Mixpanel)
- [ ] User journey tracking
- [ ] Feature usage metrics
- [ ] Performance monitoring
- [ ] Error logging and monitoring
- [ ] Customer support system setup

### Launch Assets

- [ ] Create demo videos and screenshots
- [ ] Prepare press kit
- [ ] Social media assets
- [ ] Product Hunt submission materials

## Phase 8: Post-Launch Iterations (Week 2+)

### User Feedback Integration

- [ ] In-app feedback system
- [ ] User interview scheduling
- [ ] Feature request tracking
- [ ] Support ticket system

### Quick Wins & Bug Fixes

- [ ] Monitor crash reports and fix critical bugs
- [ ] Performance improvements based on real usage
- [ ] Mobile experience refinements
- [ ] Search accuracy improvements

### Feature Expansion

- [ ] Import tools for other note apps
- [ ] Collaboration features (sharing notes)
- [ ] API for third-party integrations
- [ ] Advanced export options (PDF, HTML)

## Success Criteria for MVP

### Week 1 Goals

- [ ] Core editor works flawlessly offline
- [ ] 50 beta users testing the product
- [ ] Cloud sync working across devices
- [ ] Authentication system stable
- [ ] Landing page converting visitors

### Month 1 Goals

- [ ] 1,000+ registered users
- [ ] 20%+ daily active users
- [ ] 10%+ conversion to Paperlyte+
- [ ] 4.5+ star rating (if on app stores)
- [ ] Clear product-market fit signals

### Month 3 Goals

- [ ] 10,000+ users with organic growth
- [ ] $5,000+ MRR from subscriptions
- [ ] Feature requests indicating expansion opportunities
- [ ] 80%+ user retention after 7 days
- [ ] Technical infrastructure scaling smoothly

## Daily Focus Questions

1. Is the editor experience delightfully fast today?
2. What friction did users report yesterday?
3. Are we maintaining the "light as thought" promise?
4. What can we remove to make it even simpler?

## Feature Backlog (Post-MVP)

- Collaborative editing and note sharing
- Advanced formatting (tables, code blocks, embeds)
- Note templates and snippets
- Calendar integration for time-based notes
- Browser extension for quick capture
- API for third-party integrations
- Advanced export formats (PDF, DOCX, HTML)
- Note linking and backlinking
- Full-text search with regex support
- Bulk operations (tag management, bulk delete)
- Note encryption with custom passwords
- Team workspaces and permissions
- Version history and note recovery
- AI-powered features (summarization, suggestions)

## Technical Debt to Address Later

- Implement proper error boundaries
- Add comprehensive logging system
- Create automated backup system
- Optimize database queries
- Add rate limiting and abuse prevention
- Implement proper caching strategies
- Add comprehensive monitoring dashboards
- Create automated testing pipeline
- Add feature flag system
- Implement A/B testing framework

## Core Principles to Maintain

- **Speed First**: Every feature must maintain sub-100ms response time
- **Simplicity Always**: If it adds complexity, it needs extraordinary justification
- **Privacy by Design**: User data is encrypted and never readable by us
- **Mobile-First**: Every feature works perfectly on mobile
- **Offline-Ready**: Core functionality works without internet

## Remember

**Ship a note-taking app so fast and simple that users forget they're using an app at all.**

Every feature should make writing faster, not slower. Every UI element should disappear when not needed. Every user should feel like their thoughts are flowing directly onto the digital page.
