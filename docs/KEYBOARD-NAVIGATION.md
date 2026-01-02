# Keyboard Navigation Guide - Paperlyte Landing Page

**Last Updated:** January 2, 2026
**WCAG Compliance:** 2.1 Level AA

---

## Overview

The Paperlyte landing page is fully keyboard accessible, allowing users to navigate and interact with all functionality without a mouse. This document outlines all keyboard interactions and shortcuts.

---

## Global Keyboard Shortcuts

### Skip Navigation
- **Tab (on page load)** → Focus skip link ("Skip to main content")
- **Enter** → Jump directly to main content, bypassing header navigation
- **Location:** Visible only when focused (top-left corner)

### Page-Level Navigation
- **Tab** → Move forward through interactive elements
- **Shift + Tab** → Move backward through interactive elements
- **Home** → Scroll to top of page (browser default)
- **End** → Scroll to bottom of page (browser default)
- **Space** / **Page Down** → Scroll down one viewport
- **Shift + Space** / **Page Up** → Scroll up one viewport

---

## Component-Specific Keyboard Interactions

### 1. Header Navigation

#### Desktop Navigation Menu
**Component:** `Header.tsx`
**Location:** Top of page

| Key | Action |
|-----|--------|
| **Tab** | Navigate to first menu link ("Features") |
| **Arrow Right** | Move to next menu item |
| **Arrow Left** | Move to previous menu item |
| **Home** | Jump to first menu item |
| **End** | Jump to last menu item ("Get Started" button) |
| **Enter** / **Space** | Activate link (scroll to section) |

**Focus Order:**
1. Logo (not focusable, decorative)
2. Features link
3. Download link
4. Get Started button
5. Theme toggle button
6. Mobile menu button (mobile only)

#### Mobile Navigation Menu
**Component:** `Header.tsx`
**Location:** Hamburger menu (< 768px viewport)

| Key | Action |
|-----|--------|
| **Tab** (on menu button) + **Enter** | Open mobile menu |
| **Tab** | Navigate through menu items |
| **Arrow Down** / **Arrow Up** | Navigate through menu items |
| **Escape** | Close mobile menu, return focus to menu button |
| **Tab** (at last item) | Loop back to first item (focus trap active) |

**Focus Trap Active:** Focus is trapped within the menu until closed with Escape or clicking outside.

### 2. Theme Toggle
**Component:** `ThemeToggle.tsx`
**Location:** Header (right side)

| Key | Action |
|-----|--------|
| **Tab** | Focus theme toggle button |
| **Enter** / **Space** | Toggle between light and dark mode |

**Screen Reader Announcement:** "Switch to dark mode" or "Switch to light mode"

### 3. Hero Section
**Component:** `Hero.tsx`
**Location:** Top of main content

| Key | Action |
|-----|--------|
| **Tab** | Navigate to CTA buttons |
| **Enter** / **Space** | Activate button (scroll to relevant section) |

**Focus Order:**
1. "Start Writing for Free" button (primary CTA)
2. "View the Demo" button (secondary CTA)

### 4. Features Section
**Component:** `Features.tsx`
**Location:** After Hero

**Note:** Feature cards are not directly interactive. Tab skips over them to the next interactive element.

### 5. FAQ Section (Accordion)
**Component:** `FAQ.tsx`
**Location:** Near bottom of page

| Key | Action |
|-----|--------|
| **Tab** | Navigate to next FAQ question button |
| **Shift + Tab** | Navigate to previous FAQ question button |
| **Enter** / **Space** | Expand/collapse FAQ answer |
| **Arrow Down** | Move to next FAQ question |
| **Arrow Up** | Move to previous FAQ question |
| **Home** | Jump to first FAQ question |
| **End** | Jump to last FAQ question |

**Screen Reader Announcement:**
- When expanded: "[Question] expanded"
- When collapsed: "[Question] collapsed"

**Focus Order:**
1. First FAQ question button
2. Second FAQ question button
3. ...continuing through all questions

**ARIA Attributes:**
- `aria-expanded="true/false"` - Indicates expansion state
- `aria-controls="answer-[id]"` - Links button to answer region

### 6. Testimonials Carousel
**Component:** `Testimonials.tsx`
**Location:** Customer testimonials section

| Key | Action |
|-----|--------|
| **Tab** (on carousel container) | Focus carousel |
| **Arrow Left** | Show previous testimonial |
| **Arrow Right** | Show next testimonial |
| **Tab** | Navigate to "Previous" button |
| **Tab** | Navigate to "Next" button |
| **Tab** | Navigate to carousel dots (pagination) |
| **Enter** / **Space** (on dots) | Jump to specific testimonial |
| **Tab** | Navigate to Play/Pause button |
| **Enter** / **Space** (on play/pause) | Toggle auto-rotation |

**Focus Order:**
1. Carousel container (for arrow key navigation)
2. Previous button
3. Next button
4. Dot 1, Dot 2, Dot 3... (pagination)
5. Play/Pause button

**Screen Reader Announcement:**
- "Showing testimonial [N] of [Total]" (updates via aria-live region)

**Accessibility Features:**
- Auto-rotation pauses on mouse hover
- Auto-rotation disabled for users with `prefers-reduced-motion`
- Touch/swipe gestures supported on mobile

### 7. Comparison Table
**Component:** `Comparison.tsx`
**Location:** Feature comparison section

**Note:** Table is navigable but not interactive. Screen readers can navigate with table navigation commands.

**Screen Reader Table Navigation (NVDA/JAWS):**
- **Ctrl + Alt + Arrow Keys** - Navigate between cells
- **T** - Jump to next table
- **Shift + T** - Jump to previous table

**ARIA Attributes:**
- `scope="col"` on header cells (product names)
- `scope="row"` on feature names

### 8. Email Capture Form
**Component:** `EmailCapture.tsx` and `src/components/sections/EmailCapture.tsx`
**Location:** Multiple sections (Hero, dedicated section, CTA)

| Key | Action |
|-----|--------|
| **Tab** | Focus email input field |
| **Type** | Enter email address |
| **Tab** | Move to GDPR consent checkbox |
| **Space** | Toggle checkbox |
| **Tab** | Move to "Join Waitlist" button |
| **Enter** | Submit form |

**Focus Order:**
1. Email input field
2. GDPR consent checkbox
3. Submit button

**Error Handling:**
- Errors announced via `aria-live="polite"` region
- Invalid field marked with `aria-invalid="true"`
- Error message linked via `aria-describedby`

**Success State:**
- Form replaced with success message
- Focus remains on form area

### 9. Feedback Widget (Modal)
**Component:** `FeedbackWidget.tsx`
**Location:** Floating button (bottom-right corner)

| Key | Action |
|-----|--------|
| **Tab** | Focus floating feedback button |
| **Enter** / **Space** | Open feedback modal |
| **Escape** | Close modal, return focus to button |

**Inside Modal (Focus Trap Active):**

| Key | Action |
|-----|--------|
| **Tab** (auto-focus) | Close button is focused on open |
| **Tab** | Navigate through modal elements |
| **Arrow Left** / **Arrow Right** | Switch between "Bug" and "Feature" buttons |
| **Tab** | Focus message textarea |
| **Tab** | Focus Submit button |
| **Tab** (at last element) | Loop back to Close button |
| **Enter** | Submit feedback |
| **Escape** | Close modal, return focus to floating button |

**Focus Order in Modal:**
1. Close button (X) - auto-focused on open
2. "Report a Bug" button
3. "Request a Feature" button
4. Message textarea
5. Submit button

**Focus Restoration:** When modal closes, focus returns to the floating button that opened it.

### 10. Footer
**Component:** `Footer.tsx`
**Location:** Bottom of page

| Key | Action |
|-----|--------|
| **Tab** | Navigate through footer links |
| **Enter** | Activate link |

**Focus Order:**
1. Features link
2. Pricing link
3. Contact link
4. Privacy Policy link
5. Terms of Service link
6. GitHub link
7. Twitter link
8. Instagram link
9. Email link

**Link Groups (via `<nav>` landmarks):**
- Product links
- Company links
- Legal links
- Social media links

---

## Focus Indicators

### Visual Focus Styles
All interactive elements have visible focus indicators:

- **Outline:** 2px solid primary color
- **Outline Offset:** 2px
- **Color (Light Mode):** `#1a1a1a` (near black)
- **Color (Dark Mode):** `#ffffff` (white)
- **Contrast Ratio:** Meets WCAG 2.1 AA requirement (3:1 minimum)

**CSS Implementation:**
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Focus-Visible vs Focus
- **`:focus-visible`** - Shows focus indicator for keyboard navigation
- **`:focus:not(:focus-visible)`** - Hides focus indicator for mouse clicks
- **Benefit:** Reduces visual clutter for mouse users while maintaining accessibility for keyboard users

---

## Focus Management Best Practices

### Modal Focus Traps
When a modal opens:
1. Focus moves to the first focusable element (usually Close button)
2. Tab key cycles through modal elements only
3. Shift + Tab moves backward through modal
4. Tab at last element returns to first element
5. Escape key closes modal and restores focus

**Active Focus Traps:**
- Mobile navigation menu (Header.tsx)
- Feedback widget modal (FeedbackWidget.tsx)

### Focus Restoration
When closing modals or collapsible sections:
- Focus returns to the element that triggered the action
- Prevents "lost focus" scenarios
- Improves keyboard navigation UX

**Implementation Examples:**
- Header mobile menu → Menu button
- Feedback widget → Floating button
- FAQ expansion → Same question button

---

## Screen Reader Keyboard Shortcuts

### VoiceOver (macOS)
- **VO** = Ctrl + Option (default)
- **VO + Arrow Keys** - Navigate through page
- **VO + Cmd + H** - Next heading
- **VO + Shift + Cmd + H** - Previous heading
- **VO + U** - Open rotor (navigation menu)
- **VO + Right Arrow** - Read next item
- **VO + Shift + Down Arrow** - Interact with element
- **VO + Shift + Up Arrow** - Stop interacting

### NVDA (Windows)
- **Insert + F7** - Elements list (headings, links, landmarks)
- **H** - Next heading
- **Shift + H** - Previous heading
- **K** - Next link
- **B** - Next button
- **F** - Next form field
- **T** - Next table
- **Insert + Down Arrow** - Read current line
- **Insert + Up Arrow** - Read current word

### JAWS (Windows)
Similar to NVDA with some differences:
- **Insert + F6** - Headings list
- **Insert + F5** - Form fields list
- **Insert + F7** - Links list

---

## Testing Checklist

### Manual Keyboard Testing
Use this checklist to verify keyboard accessibility:

- [ ] **Tab through entire page** without mouse
- [ ] All interactive elements receive focus
- [ ] Focus indicators are visible
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] No keyboard traps (except intentional in modals)
- [ ] Skip link works (first Tab on page load)
- [ ] All buttons/links activate with Enter/Space
- [ ] Forms can be filled and submitted with keyboard
- [ ] Modals open, navigate, and close with keyboard
- [ ] Escape key closes modals and menus
- [ ] Arrow keys work in FAQ, carousel, mobile menu
- [ ] Home/End keys work where implemented
- [ ] Focus restored when modals close

### Browser Testing
Test keyboard navigation in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

### Screen Reader Testing
Test with at least one screen reader:
- [ ] VoiceOver (macOS) - Cmd + F5 to enable
- [ ] NVDA (Windows) - Free download
- [ ] JAWS (Windows) - Trial or paid

---

## Known Limitations

### Not Keyboard Accessible (By Design)
The following elements are decorative and not keyboard focusable:
- Hero section background animations
- Floating decorative elements
- Parallax background layers
- Company logos in "Trusted By" section

These elements are marked with `aria-hidden="true"` to prevent screen reader announcement.

---

## Troubleshooting

### Focus Not Visible
**Issue:** Focus indicator not showing on some elements
**Solution:** Check for `outline: none` in CSS. Use `:focus-visible` instead of removing outline.

### Keyboard Trap
**Issue:** Cannot Tab out of a section
**Solution:**
- Check for focus trap implementation (should only be in modals)
- Verify Escape key closes modal
- Ensure Tab key cycles through all elements

### Arrow Keys Not Working
**Issue:** Arrow key navigation doesn't work in FAQ or carousel
**Solution:**
- Ensure element is focused first (may need to Tab to it)
- Check browser console for JavaScript errors
- Verify keyboard event listeners are attached

---

## Developer Notes

### Adding Keyboard Navigation to New Components

```tsx
// Example: Arrow key navigation
import { getFocusableElements, handleArrowNavigation } from '@utils/keyboard'

const handleKeyDown = (event: KeyboardEvent) => {
  const elements = getFocusableElements(containerRef.current)
  const currentIndex = elements.findIndex(el => el === document.activeElement)

  const newIndex = handleArrowNavigation(
    event,
    elements,
    currentIndex,
    'horizontal' // or 'vertical'
  )

  if (newIndex !== null) {
    event.preventDefault()
    elements[newIndex]?.focus()
  }
}
```

### Testing During Development

```bash
# Run Playwright keyboard navigation tests
npm run test:e2e -- --grep "keyboard"

# Manual testing
# 1. Load page: http://localhost:4173
# 2. Use Tab key only (no mouse)
# 3. Verify all interactions work
```

---

## Resources

- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [ARIA Authoring Practices - Keyboard Interaction](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [MDN: Keyboard Navigable JavaScript Widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [WCAG 2.1 - Keyboard Accessible](https://www.w3.org/WAI/WCAG21/quickref/#keyboard-accessible)

---

**Document Owner:** Development Team
**Last Review:** January 2, 2026
**Next Review:** Before major feature releases
