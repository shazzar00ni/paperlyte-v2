# Landing Page Specification

The Paperlyte landing page is a single scrolling page (`/`) composed of stacked section components. Each section is an independent React component in `src/components/sections/`.

---

## Page Structure

```text
┌─────────────────────────────────┐
│  Header (sticky)                │
├─────────────────────────────────┤
│  1. Hero                        │
│  2. Features                    │
│  3. Problem                     │
│  4. Solution                    │
│  5. Statistics                  │
│  6. Testimonials                │
│  7. Comparison                  │
│  8. Mobile                      │
│  9. Pricing                     │
│  10. CTA                        │
│  11. Email Capture              │
│  12. FAQ                        │
├─────────────────────────────────┤
│  Footer                         │
└─────────────────────────────────┘
```

Background alternation:
```text
Hero          → default (white)
Features      → surface (off-white)
Problem       → default
Solution      → surface
Statistics    → dark (inverted)
Testimonials  → default
Comparison    → surface
Mobile        → default
Pricing       → surface
CTA           → dark (inverted)
Email Capture → default
FAQ           → surface
```

---

## 1. Hero

**File:** `src/components/sections/Hero/Hero.tsx`
**Section ID:** `hero`
**Background:** `default`

### Purpose

First impression. Communicates value proposition in under 5 seconds. Drives users to the waitlist.

### Layout

Two-column on desktop (text left, mockup right). Single-column stack on mobile.

```text
Desktop:
┌──────────────────┬──────────────────┐
│ Eyebrow label    │                  │
│ H1 headline      │  App mockup      │
│ Subheading       │  + stat badges   │
│ [CTA] [CTA]      │                  │
│ Trusted by logos │                  │
└──────────────────┴──────────────────┘

Mobile:
┌──────────────────┐
│ H1 headline      │
│ Subheading       │
│ [CTA] [CTA]      │
│ App mockup       │
│ Trusted by logos │
└──────────────────┘
```

### Content Spec

| Element | Content | Typography |
|---|---|---|
| H1 | "Your thoughts, *organized.*" | Playfair Display 5xl, bold, italic on emphasis |
| Subheading | "The minimal workspace for busy professionals." | Inter base, `--color-text-secondary` |
| CTA (primary) | "Start Writing for Free" | Button large primary + arrow-right icon |
| CTA (secondary) | "View the Demo" | Button large secondary |
| Trusted by label | "TRUSTED BY TEAMS AT" | Inter xs, semibold, uppercase, letter-spacing |
| Company list | Acme Corp, Global, Nebula, Vertex, Horizon | Inter sm, `--color-text-secondary` |

### Mockup

The hero mockup is a `<picture>` element with AVIF → WebP → PNG → SVG fallback:
- `/mockups/notes-list.avif` (preferred)
- `/mockups/notes-list.webp`
- `/mockups/notes-list.png`
- `/mockups/notes-list.svg` (fallback `src`)

A floating stat badge overlays the mockup: "+120% PRODUCTIVITY" — styled as a dark pill card with a green indicator.

### Animation Sequence

| Element | Animation | Delay |
|---|---|---|
| H1 | `fadeIn` | 0ms |
| Subheading | `fadeIn` | 100ms |
| CTA buttons | `fadeIn` | 300ms |
| Trusted by | `fadeIn` | 450ms |
| Mockup | `fadeIn` | 400ms |

### Decorative Elements

Floating icon cluster (hidden on mobile ≤ 768px):
- `FloatingElement` wrapping a lightning bolt icon, duration 3s
- `FloatingElement` wrapping a tag icon, duration 3.5s, delay 0.5s

---

## 2. Features

**File:** `src/components/sections/Features/Features.tsx`
**Section ID:** `features`
**Background:** `surface`

### Purpose

Quickly communicate the 6 core features with performance metrics. Reduce cognitive load — icons carry meaning before the user reads.

### Layout

3-column grid on desktop → 2-column tablet → 1-column mobile.

### Feature Cards

Feature data lives in `src/constants/features.ts`. Each card contains:

| Element | Spec |
|---|---|
| Icon | `Icon` component, size `2x`, `color: var(--color-primary)` |
| Icon wrapper | `64px` circle, `--color-primary-faint` background |
| Title (h3) | Inter semibold, `--font-size-xl` |
| Description | Inter normal, `--font-size-base`, `--color-text-secondary`, `line-height-relaxed` |

### Section Header

| Element | Content |
|---|---|
| H2 | "Everything you need. Nothing you don't." |
| Subheading | "Built for speed, designed for simplicity. Focus on your ideas, not the tool." |

Both are centered, max-width `--max-width-content`.

### Animation

Cards stagger with `slideUp`, `delay = 150 + (index × 75)ms`.

### Core Features (6)

| # | Icon | Title | Key metric |
|---|---|---|---|
| 1 | bolt / lightning | Zero-Lag Typing | Sub-10ms keystroke response |
| 2 | tag | Tag-Based Organization | Inline `#tags`, no folders |
| 3 | sync / rotate | Cross-Platform Sync | Mac, Windows, Linux, iOS, Android, web |
| 4 | eye-slash | Distraction-Free Writing | Interface disappears while typing |
| 5 | shield / lock | Private by Design | Local-first + optional E2E encrypted sync |
| 6 | wifi-slash | Offline-First | Full functionality without internet |

---

## 3. Problem

**File:** `src/components/sections/Problem/Problem.tsx`
**Section ID:** `problem`
**Background:** `default`

### Purpose

Create empathy and tension. Name the pain that competitors cause. Set up the Solution section.

### Content Strategy

Present the problem as a short narrative:
1. Acknowledge that users tried alternatives (Notion, Evernote, OneNote)
2. Name the specific failure modes: bloat, complexity, slow startup, folder hell
3. End with the unmet promise: *you just want to write*

### Layout

Centered text block, max-width `--max-width-content`. No grid. One or two paragraphs + a pain-point list.

Pain point list style:
```text
✗  Notes buried under nested folders
✗  Loading screens before you can type
✗  Features you pay for but never use
✗  Sync that loses your work
```

Icon: `✗` in `--color-error` (`#dc2626`) to signal friction.

---

## 4. Solution

**File:** `src/components/sections/Solution/Solution.tsx`
**Section ID:** `solution`
**Background:** `surface`

### Purpose

Resolve the tension established in Problem. Show how Paperlyte's design choices directly counter each pain point.

### Layout

Two-column split: text left, illustrative UI right (or vice-versa on alternating sub-sections). On mobile, stack text above image.

### Content

Pair each Problem pain point with a Solution:
- Fast startup → "Opens in under 300ms"
- Folder hell → "One search. Everything surfaces."
- Feature bloat → "No settings you don't need"
- Sync anxiety → "Local-first. Syncs when you want."

Use short, active sentences. No paragraph blocks — this is a visual scan section.

---

## 5. Statistics

**File:** `src/components/sections/Statistics/Statistics.tsx`
**Section ID:** `statistics`
**Background:** `dark` (inverted, uses `--color-surface-dark`)

### Purpose

Build credibility with specific, memorable numbers. Animated counters create a moment of delight on scroll.

### Layout

4-column stat grid on desktop → 2×2 on tablet → 1-column on mobile.

### Section Header

| Element | Content |
|---|---|
| H2 | "Join thousands who've simplified their notes" |
| Subheading | "Real people, real productivity gains, real peace of mind." |

### Stats

| Value | Suffix | Decimals | Icon | Label |
|---|---|---|---|---|
| 50000 | `+` | 0 | `fa-users` | Active Users |
| 10 | `M+` | 0 | `fa-note-sticky` | Notes Created |
| 99.9 | `%` | 1 | `fa-server` | Uptime |
| 4.9 | `/5` | 1 | `fa-star` | User Rating |

All use `CounterAnimation` with `easing: 'easeOutQuart'`, `duration: 2000ms`.

Each stat card also renders a `SVGPathAnimation` circle behind a Font Awesome icon (`duration: 1500ms`, staggered `delay: 200 + index × 150ms`). The circle trace and icon act as a decorative visual anchor above the number.

---

## 6. Testimonials

**File:** `src/components/sections/Testimonials/Testimonials.tsx`
**Section ID:** `testimonials`
**Background:** `default`

### Purpose

Social proof from representative user archetypes (writer, developer, student, researcher).

### Layout

Horizontal scrolling card list or auto-advancing carousel. 3 visible on desktop, 1 on mobile.

### Card Spec

| Element | Spec |
|---|---|
| Quote | Playfair Display italic, `font-size-xl`, `--color-text-primary` |
| Avatar | 48×48px circle image |
| Name | Inter semibold, `font-size-base` |
| Role / Company | Inter normal, `font-size-sm`, `--color-text-secondary` |
| Quote marks | Decorative `"` in Playfair Display, `font-size-5xl`, `--color-border` |

---

## 7. Comparison

**File:** `src/components/sections/Comparison/Comparison.tsx`
**Section ID:** `comparison`
**Background:** `surface`

### Purpose

Differentiate Paperlyte from Notion, Evernote, and OneNote with a feature comparison table.

### Layout

Scrollable table on mobile (`overflow-x: auto`). Fixed on desktop.

### Table Structure

| Feature | Paperlyte | Notion | Evernote | OneNote |
|---|---|---|---|---|
| Startup time | < 300ms | 2–5s | 3–6s | 2–4s |
| Offline-first | ✓ | Partial | Partial | ✓ |
| Local storage | ✓ | ✗ | ✗ | ✓ |
| E2E encryption | ✓ | ✗ | ✗ | ✗ |
| Keystroke lag | < 10ms | 50–200ms | 30–100ms | 20–80ms |
| Free tier | ✓ | ✓ (limited) | ✓ (limited) | ✓ |

Paperlyte column uses `--color-primary` header background with `--color-text-on-primary` text to draw the eye.

---

## 8. Mobile

**File:** `src/components/sections/Mobile/Mobile.tsx`
**Section ID:** `mobile`
**Background:** `default`

### Purpose

Showcase the mobile experience. Reinforce cross-platform promise.

### Layout

Two-column: platform download badges + brief copy left, phone mockup right. Stacks on mobile.

### Content

- Platform badges: App Store, Google Play
- 3 bullet points: offline mode, dark mode, widget support
- Platform icons for Mac, Windows, Linux (smaller, below badges)

---

## 9. Pricing

**File:** `src/components/sections/Pricing/Pricing.tsx`
**Section ID:** `pricing`
**Background:** `surface`

### Purpose

Set expectations. Convert price-sensitive visitors before they leave. Present the free tier as the default CTA.

### Layout

3-column tier cards on desktop → 1-column stack on mobile.

### Tiers

| Tier | Price | Key features |
|---|---|---|
| Free | $0 | Unlimited local notes, 2 devices, basic tags |
| Pro | $8/mo | Unlimited devices, E2E sync, version history |
| Team | $15/seat/mo | Shared workspaces, admin controls, priority support |

**Pro** tier card gets `--color-primary` border and a "Most Popular" badge to guide selection.

### Visual Hierarchy

Free → text CTA ("Start free").
Pro → Button primary ("Get Pro").
Team → Button secondary ("Contact Sales").

---

## 10. CTA

**File:** `src/components/sections/CTA/CTA.tsx`
**Section ID:** `download`
**Background:** `dark`

### Purpose

Final push before email capture. Address the last remaining objection (it's too much effort to try).

### Content

| Element | Content |
|---|---|
| H2 | "Stop fighting your tools. Start thinking clearly." |
| Body | "Note-taking shouldn't feel like work. It should feel like breathing—natural, effortless, invisible." |
| Primary CTA | "Join the Waitlist" → scrolls to `#email-capture` |
| Text link | "Watch the Demo Again" → scrolls to `#hero` |
| Social proof | "{n} people already on the waitlist · Launching {quarter}" |

Social proof count is sourced from `WAITLIST_COUNT` and `LAUNCH_QUARTER` constants in `src/constants/waitlist.ts`.

---

## 11. Email Capture

**File:** `src/components/sections/EmailCapture/EmailCapture.tsx`
**Section ID:** `email-capture`
**Background:** `default`

### Purpose

Primary conversion goal. Capture email address for launch notification.

### Layout

Centered form, max-width 480px. Email input + submit button inline on desktop, stacked on mobile.

### Component

The Email Capture section renders its own centered email capture form within `src/components/sections/EmailCapture/EmailCapture.tsx`, rather than using the shared `ui/EmailCapture` primitive.
The implementation should follow the layout described above (max-width 480px, email input and submit button inline on desktop and stacked on mobile) and wire the form submission into the launch notification flow.
### Supporting Copy

- Headline: "Be first. Be ready."
- Sub-copy: "No spam, ever. Unsubscribe in one click. We'll only email you when Paperlyte is ready."
- GDPR checkbox: "I agree to receive launch updates. I can unsubscribe at any time."

---

## 12. FAQ

**File:** `src/components/sections/FAQ/FAQ.tsx`
**Section ID:** `faq`
**Background:** `surface`

### Purpose

Preempt common objections. Reduce support load at launch.

### Layout

Accordion list, max-width `--max-width-content`, centered.

### Accordion Behaviour

- Single open item at a time
- Chevron rotates 180° on open
- Height animates with `max-height` transition (not `height: auto` which can't animate)
- `aria-expanded` on trigger, `role="region"` on panel

### Suggested Questions

1. When does Paperlyte launch?
2. Is there a free plan?
3. Where are my notes stored?
4. Does it work offline?
5. What platforms are supported?
6. Is my data private?
7. Can I import from Notion / Evernote?
8. What happens if I forget my password?

---

## Navigation Anchors

| Anchor | Section |
|---|---|
| `#hero` | Hero |
| `#features` | Features |
| `#problem` | Problem |
| `#solution` | Solution |
| `#statistics` | Statistics |
| `#testimonials` | Testimonials |
| `#comparison` | Comparison |
| `#mobile` | Mobile |
| `#pricing` | Pricing |
| `#download` | CTA |
| `#email-capture` | Email Capture |
| `#faq` | FAQ |

All anchors require `scroll-margin-top: var(--header-height)` (64px) on their container.

---

## SEO & Metadata

```html
<title>Paperlyte — Lightning-fast, distraction-free note-taking</title>
<meta name="description"
  content="Your thoughts, unchained. Paperlyte is the minimal note-taking app with sub-10ms response, offline-first sync, and no distractions." />
<meta property="og:title" content="Paperlyte — Your thoughts, unchained" />
<meta property="og:description" content="Lightning-fast, distraction-free note-taking." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Blocking Time | < 200ms |
| Page weight | < 300KB (JS), < 100KB (CSS) |

### Critical Optimisations

- Hero image uses `<picture>` with AVIF → WebP → PNG fallbacks
- Fonts are self-hosted with `font-display: swap`
- Floating elements and parallax are hidden/disabled on mobile
- `content-visibility: auto` on below-fold sections
- All analytics scripts load with `defer` or `async`
- No third-party fonts loaded from Google Fonts CDN
