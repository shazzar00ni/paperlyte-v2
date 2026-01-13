# GitHub Issues - Paperlyte v2

This document contains formatted issue descriptions ready to be copied into GitHub Issues.

---

## 🚀 Immediate Priority (Before Launch)

### Issue #1: Add Legal Pages (Privacy Policy & Terms of Service)

**Priority:** Critical  
**Labels:** `documentation`, `legal`, `pre-launch`

**Description:**

Since we're collecting email addresses through the EmailCapture component, we need legally compliant Privacy Policy and Terms of Service pages.

**Requirements:**

1. **Privacy Policy** (`/privacy`)
   - Data collection practices (email addresses)
   - How we use collected data
   - Third-party services (analytics, email provider)
   - User rights (GDPR, CCPA compliance)
   - Cookie policy
   - Contact information for privacy inquiries

2. **Terms of Service** (`/terms`)
   - Acceptable use policy
   - Intellectual property rights
   - Limitation of liability
   - Dispute resolution
   - Governing law

**Technical Implementation:**

- Create static pages in `/src/components/pages/Legal/`
- Add routes (or sections) for `/privacy` and `/terms`
- Link from Footer component (already has placeholder links)
- Ensure mobile-responsive layout
- Maintain consistent styling with rest of site

**Resources:**

- Consider using templates from [Termly](https://termly.io/) or [TermsFeed](https://www.termsfeed.com/)
- Consult with legal counsel for final review
- Reference GDPR requirements if targeting EU users

**Acceptance Criteria:**

- [ ] Privacy Policy page created and accessible
- [ ] Terms of Service page created and accessible
- [ ] Footer links updated to point to legal pages
- [ ] Pages are mobile-responsive
- [ ] Legal review completed (if applicable)

---

### Issue #2: Performance Audit & Optimization

**Priority:** High  
**Labels:** `performance`, `audit`, `pre-launch`

**Description:**

Conduct comprehensive performance audit to verify we meet our "lightning-fast" targets before launch.

**Current Targets (from README.md):**

- Lighthouse Performance: > 90
- First Contentful Paint (FCP): < 2000ms
- Largest Contentful Paint (LCP): < 2500ms
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms
- Speed Index: < 3000ms

**Audit Steps:**

1. **Run Lighthouse CI**

   ```bash
   npm run lighthouse
   ```

   - Verify all assertions in `.lighthouserc.json` pass
   - Document current scores

2. **Test on Real Devices**
   - Test on actual mobile devices (not just emulators)
   - Use Chrome DevTools Device Mode
   - Test on slow 3G connection

3. **Analyze Bundle Size**

   ```bash
   npm run size
   ```

   - Verify JS bundle < 150 KB (gzipped)
   - Verify CSS bundle < 30 KB (gzipped)
   - Check for unnecessary dependencies

4. **Check Network Performance**
   - Verify all assets are compressed (gzip/brotli)
   - Ensure proper caching headers
   - Check for render-blocking resources

**Known Optimizations Already Implemented:**

- ✅ Code splitting (React vendor chunk)
- ✅ Terser minification with console removal
- ✅ CSS code splitting
- ✅ Path aliases for cleaner imports
- ✅ Vite build optimizations

**Potential Issues to Investigate:**

- [ ] Font Awesome CDN loading time (consider self-hosting critical icons)
- [ ] Google Fonts loading strategy (consider font-display: swap)
- [ ] Image optimization (if images are added)
- [ ] Third-party script impact (analytics)

**Deliverables:**

- [ ] Lighthouse report with all scores documented
- [ ] Bundle size analysis report
- [ ] List of optimizations implemented (if any)
- [ ] Performance budget recommendations for future features

**Tools:**

- Lighthouse CI (already configured)
- [WebPageTest](https://www.webpagetest.org/)
- Chrome DevTools Performance tab
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

---

### Issue #3: Accessibility Audit (WCAG 2.1 AA Compliance)

**Priority:** High  
**Labels:** `accessibility`, `a11y`, `audit`, `pre-launch`

**Description:**

Conduct comprehensive accessibility audit to ensure WCAG 2.1 AA compliance across all components.

**Current Target:**

- Lighthouse Accessibility: > 95
- WCAG 2.1 Level AA compliance

**Audit Steps:**

1. **Automated Testing**

   ```bash
   # Run Lighthouse
   npm run lighthouse

   # Check accessibility score in report
   ```

   Additional tools:
   - [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
   - [WAVE Browser Extension](https://wave.webaim.org/extension/)

2. **Manual Testing Checklist**

   **Keyboard Navigation:**
   - [ ] All interactive elements are keyboard accessible
   - [ ] Focus indicators are visible
   - [ ] Tab order is logical
   - [ ] No keyboard traps
   - [ ] Skip links work properly

   **Screen Reader Testing:**
   - [ ] Test with VoiceOver (macOS) or NVDA (Windows)
   - [ ] All images have appropriate alt text
   - [ ] Form labels are properly associated
   - [ ] ARIA labels are accurate
   - [ ] Heading hierarchy is correct (h1 → h2 → h3)

   **Color & Contrast:**
   - [ ] Text contrast ratio ≥ 4.5:1 (normal text)
   - [ ] Text contrast ratio ≥ 3:1 (large text)
   - [ ] Interactive elements have sufficient contrast
   - [ ] Color is not the only means of conveying information

   **Responsive & Zoom:**
   - [ ] Content is readable at 200% zoom
   - [ ] No horizontal scrolling at 320px width
   - [ ] Touch targets are at least 44x44px

   **Forms & Interactions:**
   - [ ] Error messages are descriptive
   - [ ] Required fields are clearly marked
   - [ ] Form validation is accessible

3. **Component-Specific Checks**

   **Header Component:**
   - [ ] Mobile menu has proper ARIA attributes
   - [ ] Focus trap works correctly when menu is open
   - [ ] Escape key closes menu
   - [ ] Theme toggle has accessible label

   **EmailCapture Component:**
   - [ ] Input has associated label
   - [ ] Error states are announced to screen readers
   - [ ] Success message is announced

   **Button Component:**
   - [ ] Disabled state is properly conveyed
   - [ ] Loading state is accessible

   **AnimatedElement Component:**
   - [ ] Respects `prefers-reduced-motion`
   - [ ] Content is accessible without animation

**Known Accessibility Features Already Implemented:**

- ✅ Semantic HTML5 elements
- ✅ ARIA labels on navigation
- ✅ Focus trap in mobile menu
- ✅ Keyboard event handlers (Escape, Tab)
- ✅ `prefers-reduced-motion` support
- ✅ Skip links (verify implementation)

**Potential Issues to Investigate:**

- [ ] Icon-only buttons need accessible labels
- [ ] Verify all interactive elements have focus styles
- [ ] Check color contrast in dark mode
- [ ] Ensure animations don't cause motion sickness

**Deliverables:**

- [ ] Lighthouse accessibility score (target: > 95)
- [ ] axe DevTools report (0 violations)
- [ ] Manual testing checklist completed
- [ ] List of issues found and fixed
- [ ] Documentation of accessibility features for future reference

**Resources:**

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

### Issue #4: Add Testimonials Section

**Priority:** High  
**Labels:** `feature`, `content`, `pre-launch`

**Description:**

Add a testimonials section to build trust and showcase user feedback.

**Requirements:**

- Display 3-6 testimonials from beta users or early adopters
- Include user name, role/title, and optional avatar
- Responsive layout (grid on desktop, carousel on mobile)
- Maintain design consistency with existing sections

**Technical Implementation:**

- Create `Testimonial` component (appears to be in progress based on open files)
- Add to main App.tsx between Features and CTA sections
- Use CSS modules for styling
- Consider adding subtle animations (respecting prefers-reduced-motion)

**Content Needed:**

- Collect testimonials from beta users
- Get permission to use names and photos
- Write compelling quotes that highlight key benefits

**Acceptance Criteria:**

- [ ] Testimonial component created
- [ ] Integrated into main page
- [ ] Mobile-responsive design
- [ ] Accessible (proper semantic HTML, ARIA if needed)
- [ ] Passes Lighthouse performance targets

---

### Issue #5: Add Test Coverage for Components

**Priority:** High  
**Labels:** `testing`, `quality`, `pre-launch`

**Description:**

Add unit and integration tests for critical components to ensure reliability and prevent regressions.

**Current State:**

- No test files found in `/src` directory
- Testing framework not yet configured

**Recommended Setup:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration:**

1. Add to `vite.config.ts`:

   ```typescript
   test: {
     globals: true,
     environment: 'jsdom',
     setupFiles: './src/test/setup.ts',
   }
   ```

2. Create test setup file with testing-library matchers

3. Add test script to `package.json`:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest --coverage"
   ```

**Priority Components to Test:**

1. **UI Components:**
   - [ ] Button (variants, sizes, disabled state)
   - [ ] Icon (different icons, sizes)
   - [ ] ThemeToggle (theme switching logic)
   - [ ] EmailCapture (form validation, submission)

2. **Layout Components:**
   - [ ] Header (mobile menu, navigation)
   - [ ] Footer (links, layout)

3. **Hooks:**
   - [ ] useTheme (theme detection, persistence)
   - [ ] useMediaQuery (responsive behavior)
   - [ ] useReducedMotion (motion preference detection)
   - [ ] useIntersectionObserver (scroll animations)

4. **Utils:**
   - [ ] analytics (event tracking, initialization)
   - [ ] env (environment detection)
   - [ ] metaTags (meta tag updates)

**Testing Strategy:**

- **Unit tests:** Individual component behavior
- **Integration tests:** Component interactions
- **Accessibility tests:** Using jest-axe
- **Visual regression:** Consider Chromatic or Percy (future)

**Coverage Target:**

- Aim for 80%+ coverage on critical paths
- 100% coverage on utility functions

**Acceptance Criteria:**

- [ ] Vitest configured and running
- [ ] Tests written for all priority components
- [ ] Tests pass in CI/CD pipeline
- [ ] Coverage report generated
- [ ] Documentation on running tests added to README

---

## 📅 Soon After Launch

### Issue #6: Add Social Sharing Functionality

**Priority:** Medium  
**Labels:** `feature`, `enhancement`, `post-launch`

**Description:**

Add social sharing buttons to increase viral growth and make it easy for users to share Paperlyte.

**Requirements:**

- Share buttons for Twitter, Facebook, LinkedIn
- Pre-populated share text highlighting key benefits
- Open Graph meta tags for rich previews
- Twitter Card meta tags

**Implementation:**

1. Add Open Graph tags to `index.html`:

   ```html
   <meta property="og:title" content="Paperlyte - Lightning-fast note-taking" />
   <meta
     property="og:description"
     content="Your thoughts, unchained from complexity"
   />
   <meta property="og:image" content="https://paperlyte.app/og-image.png" />
   ```

2. Create ShareButton component
3. Add to CTA section or create dedicated share section

**Acceptance Criteria:**

- [ ] Share buttons implemented
- [ ] Open Graph tags added
- [ ] Share preview looks good on all platforms
- [ ] Analytics tracking for share events

---

### Issue #7: Create 404 and Error Pages

**Priority:** Medium  
**Labels:** `feature`, `ux`, `post-launch`

**Description:**

Create custom 404 and error pages to improve user experience when things go wrong.

**Requirements:**

1. **404 Page:**
   - Friendly message
   - Link back to home
   - Search functionality (optional)
   - Maintain site design

2. **Error Boundary:**
   - Already implemented (ErrorBoundary component exists)
   - Verify it displays user-friendly error message
   - Add error reporting (Sentry integration?)

**Implementation:**

- Create 404.html for Netlify
- Style to match site design
- Add helpful navigation options

**Acceptance Criteria:**

- [ ] 404 page created
- [ ] Error boundary tested
- [ ] Error reporting configured (optional)
- [ ] User-friendly error messages

---

### Issue #8: Set Up CI/CD Pipeline

**Priority:** Medium  
**Labels:** `devops`, `ci-cd`, `post-launch`

**Description:**

Implement automated CI/CD pipeline for quality assurance and deployment.

**Current State:**

- `.github/workflows/` directory exists but contents unknown
- Netlify deployment configured

**Recommended Pipeline:**

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lighthouse
```

**Pipeline Steps:**

1. **Linting:** ESLint checks
2. **Testing:** Run all tests
3. **Build:** Verify production build succeeds
4. **Lighthouse:** Performance/accessibility checks
5. **Deploy:** Automatic deployment to Netlify (already configured)

**Acceptance Criteria:**

- [ ] CI workflow configured
- [ ] All checks run on PRs
- [ ] Status badges added to README
- [ ] Failed checks block merging
- [ ] Deployment only on successful CI

---

## 🔮 Future Enhancements

### Issue #9: Advanced Parallax Animations

**Priority:** Low  
**Labels:** `enhancement`, `animation`, `nice-to-have`

**Description:**

Add subtle parallax scrolling effects to enhance visual appeal while maintaining performance.

**Requirements:**

- Subtle depth effects on scroll
- Respect `prefers-reduced-motion`
- No negative performance impact
- Works on mobile devices

**Implementation Considerations:**

- Use CSS `transform` for GPU acceleration
- Implement with Intersection Observer
- Test performance impact thoroughly
- Make it optional/configurable

**Acceptance Criteria:**

- [ ] Parallax effects implemented
- [ ] Performance targets still met
- [ ] Reduced motion preference respected
- [ ] Works smoothly on mobile

---

## 📋 Issue Summary

### Immediate (Before Launch)

1. ✅ Email capture form - **Already implemented**
2. 🔄 Testimonials section - **In progress** (files open in editor)
3. ❌ Legal pages (Privacy/Terms) - **Critical**
4. ❌ Performance audit - **High priority**
5. ❌ Accessibility audit - **High priority**
6. ❌ Test coverage - **High priority**

### Soon After Launch

7. ✅ Analytics integration - **Already implemented**
8. ❌ Social sharing functionality
9. ❌ 404/Error pages
10. ❌ CI/CD pipeline

### Future Enhancements

11. ❌ Advanced parallax animations

---

## 🎯 Recommended Order

1. **Legal pages** (critical for email collection)
2. **Performance audit** (verify current state)
3. **Accessibility audit** (verify compliance)
4. **Testimonials** (finish in-progress work)
5. **Test coverage** (prevent regressions)
6. **CI/CD pipeline** (automate quality checks)
7. **404/Error pages** (polish UX)
8. **Social sharing** (growth feature)
9. **Parallax animations** (nice-to-have)

---

_Generated: 2025-12-05_
_Project: Paperlyte v2 Landing Page_
