# Screen Reader Testing Guide - Paperlyte Landing Page

**Last Updated:** January 2, 2026
**WCAG Compliance:** 2.1 Level AA

---

## Overview

This guide provides comprehensive instructions for testing the Paperlyte landing page with screen readers. Proper screen reader support ensures users with visual impairments can access all content and functionality.

---

## Quick Start

### VoiceOver (macOS/iOS) - Free
**Recommended for:** macOS developers, quick accessibility checks

```bash
# Enable VoiceOver
Cmd + F5

# Disable VoiceOver
Cmd + F5 again

# Open VoiceOver Training
Cmd + F8 (while VoiceOver is active)
```

### NVDA (Windows) - Free & Open Source
**Recommended for:** Windows developers, comprehensive testing

```bash
# Download: https://www.nvaccess.org/download/
# Install and run
# Default modifier key: Insert (or Caps Lock)
```

### JAWS (Windows) - Commercial ($95/year)
**Recommended for:** Professional accessibility testing

```bash
# Download: https://www.freedomscientific.com/products/software/jaws/
# Most widely used professional screen reader
# 40-minute trial mode available
```

---

## VoiceOver Testing Guide (macOS)

### VoiceOver Basic Commands

| Command | Action |
|---------|--------|
| **Cmd + F5** | Enable/disable VoiceOver |
| **VO + Arrow Keys** | Navigate through page |
| **VO + A** | Start reading from current position |
| **VO + Cmd + H** | Next heading |
| **VO + Shift + Cmd + H** | Previous heading |
| **VO + U** | Open rotor (navigation menu) |
| **VO + Right Arrow** | Move to next item |
| **VO + Left Arrow** | Move to previous item |
| **VO + Space** | Activate link/button |
| **Control** | Stop reading |

**Note:** VO = Ctrl + Option (by default)

### VoiceOver Step-by-Step Testing Procedure

#### 1. Initial Page Load
```text
✓ Expected announcements:
- "Paperlyte - Lightning-Fast, Distraction-Free Notes"
- "Document, Main, Navigation region, 3 items"
- "Link, Skip to main content"
```

**What to listen for:**
- Page title announced correctly
- Main landmarks identified (navigation, main)
- Skip link available as first interactive element

**Test Actions:**
1. Load page: `http://localhost:4173` or `https://paperlyte.app`
2. Listen for page title announcement
3. VO + Right Arrow to navigate first few items
4. VO + U to open rotor, check landmarks

#### 2. Skip Navigation Link
```text
✓ Action: Press VO + Space on "Skip to main content" link
✓ Expected: Focus jumps to main content, bypassing navigation
✓ Announcement: "Main, region"
```

**Test Actions:**
1. Tab to skip link (first focusable element)
2. Activate with VO + Space or Enter
3. Verify focus moves to main content
4. VO + Right Arrow should announce first content item

#### 3. Header Navigation
```text
✓ Open Rotor: VO + U
✓ Select "Landmarks"
✓ Expected landmarks:
  - Navigation (Header)
  - Main (Main content)
  - Content Information (Footer)
```

**Test Actions:**
1. VO + Right Arrow through header
2. Listen for "Navigation, region, Main navigation"
3. VO + Right Arrow to each nav item
4. Expected announcements:
   - "Features, link"
   - "Download, link"
   - "Get Started, button"
   - "Switch to dark mode, button" (or "Switch to light mode")
   - "Open menu, button" (mobile only)

#### 4. Headings Navigation
```text
✓ Command: VO + Cmd + H (repeatedly)
✓ Expected heading hierarchy:
  H1: "Your thoughts, organized."
  H2: "Everything you need. Nothing you don't."
  H2: "Questions? We've got answers."
  H2: "How we stack up"
  H2: "What people are saying"
  H3: "Lightning Fast Performance" (Features cards)
  H3: "Is Paperlyte free?" (FAQ questions)
```

**Test Actions:**
1. VO + Cmd + H to jump through headings
2. Verify no heading levels are skipped (h1 → h2 → h3)
3. Verify heading text is descriptive
4. Check heading count matches visual structure

#### 5. Forms Testing
**Email Capture Form:**
```text
✓ Navigate to form
✓ Expected announcements:
  - "Email address, edit text"
  - "I agree to receive emails from Paperlyte, checkbox"
  - "Join Waitlist, button"
```

**Test Actions:**
1. Navigate to email input field
2. VO + Right Arrow - should announce label "Email address"
3. Type email address
4. Tab to checkbox
5. VO + Space to check/uncheck
6. Listen for "Checked" or "Unchecked" announcement
7. Tab to submit button
8. VO + Space to submit

**Error Validation:**
1. Submit form without email
2. Listen for error announcement: "Alert, Please enter your email address"
3. Submit invalid email
4. Listen for: "Alert, Please enter a valid email address"
5. Submit without GDPR consent
6. Listen for: "Alert, Please agree to receive emails from Paperlyte"

#### 6. FAQ Accordion
```text
✓ Navigate to FAQ section
✓ Expected for each question:
  - "Is Paperlyte free?, collapsed, button"
  - Press VO + Space to expand
  - "Is Paperlyte free?, expanded, button"
  - Answer content announced
```

**Test Actions:**
1. Navigate to first FAQ question button
2. Listen for "collapsed" or "expanded" state
3. VO + Space to toggle
4. Listen for state change announcement
5. VO + Right Arrow to read answer
6. Verify answer region content is read
7. Test multiple FAQ items

**Live Region Announcement:**
- When expanding/collapsing, listen for: "[Question] expanded" or "[Question] collapsed"
- This should be announced automatically without navigating

#### 7. Testimonials Carousel
```text
✓ Navigate to carousel
✓ Expected announcements:
  - "Testimonials, region"
  - "5 out of 5 stars, image" (star rating)
  - Testimonial quote text
  - "John Doe, citation" (author name)
  - "Product Manager • Acme Corp" (role and company)
```

**Test Actions:**
1. Navigate to testimonials section
2. VO + Right Arrow through carousel content
3. Verify star rating announced as image with label
4. Activate "Next testimonial" button
5. Listen for live region update: "Showing testimonial 2 of 6"
6. Test "Previous" button
7. Test pagination dots
8. Test Play/Pause button

#### 8. Comparison Table
```text
✓ Navigate to table
✓ Expected announcements:
  - "Table with 4 columns and 8 rows"
  - Column headers: "Feature", "Paperlyte", "Notion", "Evernote", "OneNote"
  - Row headers: Feature names
  - Cells: "Supported" or "Not supported" or specific values
```

**Test Actions:**
1. VO + Right Arrow to table
2. Listen for table dimensions announcement
3. Use VO + Cmd + Arrow Keys to navigate cells
4. Verify column headers announced with each cell
5. Verify row headers (feature names) announced
6. Check checkmark announced as "Supported"
7. Check X-mark announced as "Not supported"

#### 9. Modal Testing (Feedback Widget)
```text
✓ Open feedback widget
✓ Expected announcements:
  - "Send Feedback, dialog"
  - "Close feedback form, button"
```

**Test Actions:**
1. Navigate to floating feedback button
2. VO + Space to open modal
3. Listen for dialog announcement
4. VO + Right Arrow through modal content
5. Verify focus trapped in modal
6. Test Escape key to close
7. Verify focus returns to floating button
8. Verify body scroll prevented while modal open

---

## NVDA Testing Guide (Windows)

### NVDA Basic Commands

| Command | Action |
|---------|--------|
| **Insert + Down Arrow** | Say all (read from current position) |
| **Insert + F7** | Elements list (headings, links, landmarks) |
| **H** | Next heading |
| **Shift + H** | Previous heading |
| **K** | Next link |
| **B** | Next button |
| **F** | Next form field |
| **T** | Next table |
| **D** | Next landmark |
| **E** | Next edit field |
| **X** | Next checkbox |
| **Insert + Space** | Browse/Focus mode toggle |
| **Insert + Q** | Quit NVDA |

### NVDA Step-by-Step Testing Procedure

#### 1. Initial Page Load
```text
✓ Start NVDA
✓ Load page
✓ Press Insert + Down Arrow to read page
✓ Expected: Page title, landmarks, and content announced
```

#### 2. Elements List Navigation
```text
✓ Press Insert + F7
✓ Select tabs:
  - Headings: Verify heading hierarchy
  - Links: Check link text is descriptive
  - Landmarks: Verify navigation, main, contentinfo
  - Form fields: Check all form inputs listed
```

**Test Actions:**
1. Insert + F7 → Headings tab
2. Verify all headings present and ordered correctly
3. Insert + F7 → Links tab
4. Verify link text is descriptive (not "click here", "read more")
5. Insert + F7 → Landmarks tab
6. Verify navigation, main, contentinfo landmarks
7. Arrow through list, press Enter to jump to element

#### 3. Forms Mode Testing
```text
✓ Navigate to form field (Insert + F)
✓ Expected: Forms mode automatically activates
✓ Announcement: "Forms mode on"
✓ Type in field, Tab between fields
```

**Test Actions:**
1. Press F to jump to first form field
2. Listen for "Forms mode on" announcement
3. Listen for field label and type
4. Type text, verify characters announced
5. Tab to next field
6. Test checkbox with Space bar
7. Submit form, listen for error messages
8. Verify errors announced via aria-live region

#### 4. Table Navigation
```text
✓ Navigate to table (Insert + Ctrl + T)
✓ Table navigation commands:
  - Ctrl + Alt + Arrow Keys: Navigate cells
  - Ctrl + Alt + Home: First cell
  - Ctrl + Alt + End: Last cell
```

**Test Actions:**
1. Navigate to comparison table
2. Listen for table announcement with dimensions
3. Ctrl + Alt + Right Arrow through cells
4. Verify column headers announced
5. Verify row headers announced
6. Check data cells have meaningful content

---

## JAWS Testing Guide (Windows)

### JAWS Basic Commands

| Command | Action |
|---------|--------|
| **Insert + Down Arrow** | Say all |
| **Insert + F6** | Headings list |
| **Insert + F7** | Links list |
| **Insert + F5** | Form fields list |
| **H** | Next heading |
| **K** | Next link |
| **B** | Next button |
| **F** | Next form field |
| **T** | Next table |
| **Insert + F3** | Elements list |
| **Insert + Z** | JAWS settings |

### JAWS Step-by-Step Testing Procedure
Similar to NVDA with some command differences. Focus on:
1. Forms mode behavior
2. Table navigation
3. ARIA live regions
4. Modal announcements

---

## Mobile Screen Reader Testing

### VoiceOver (iOS)

**Enable:** Settings → Accessibility → VoiceOver → On

| Gesture | Action |
|---------|--------|
| **Swipe Right** | Next element |
| **Swipe Left** | Previous element |
| **Double Tap** | Activate |
| **Two-finger swipe up** | Read from top |
| **Two-finger scrub** | Go back |
| **Rotor (two fingers, rotate)** | Change navigation mode |

**Test Actions:**
1. Load page on iOS Safari
2. Enable VoiceOver
3. Swipe right through page
4. Test form input with on-screen keyboard
5. Test modal interactions
6. Test carousel swipe gestures

### TalkBack (Android)

**Enable:** Settings → Accessibility → TalkBack → On

| Gesture | Action |
|---------|--------|
| **Swipe Right** | Next element |
| **Swipe Left** | Previous element |
| **Double Tap** | Activate |
| **Swipe down then right** | Read from top |
| **Two-finger swipe down** | Stop reading |

**Test Actions:**
1. Load page on Android Chrome
2. Enable TalkBack
3. Swipe through page elements
4. Test form interactions
5. Test navigation gestures

---

## Testing Checklist

### Content Structure
- [ ] Page title announced on load
- [ ] Landmarks identified (navigation, main, contentinfo)
- [ ] Headings in logical order (no skipped levels)
- [ ] Headings descriptive and meaningful
- [ ] Link text descriptive (not "click here")
- [ ] Lists announced as lists with item count

### Interactive Elements
- [ ] All buttons have accessible names
- [ ] All links have meaningful text
- [ ] Form inputs have associated labels
- [ ] Checkboxes have labels
- [ ] Button purposes clear from labels
- [ ] Image alt text present and descriptive

### ARIA Implementation
- [ ] aria-label used for icon-only buttons
- [ ] aria-expanded announces accordion states
- [ ] aria-live regions announce updates
- [ ] aria-hidden used on decorative elements
- [ ] aria-describedby links errors to inputs
- [ ] aria-invalid marks invalid form fields
- [ ] role="dialog" on modals
- [ ] role="alert" on error messages

### Forms
- [ ] Labels announced when focusing inputs
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Form submission feedback provided
- [ ] Validation errors clear and actionable

### Dynamic Content
- [ ] FAQ expand/collapse announced
- [ ] Carousel slide changes announced
- [ ] Form submission status announced
- [ ] Modal open/close state announced
- [ ] Loading states announced

### Navigation
- [ ] Skip link functional
- [ ] Landmarks navigable
- [ ] Headings navigable
- [ ] Links list populated
- [ ] Form fields list populated
- [ ] Table navigation works

---

## Common Issues and Solutions

### Issue: Label Not Announced
**Symptoms:** Screen reader says "Edit text" without label
**Solutions:**
- Check for `<label for="id">` element
- Verify input `id` matches label `for`
- Use `aria-label` if visual label not present
- Use `aria-labelledby` for complex labels

### Issue: Button Purpose Unclear
**Symptoms:** Screen reader says "Button" without description
**Solutions:**
- Add text content inside `<button>`
- Use `aria-label` for icon-only buttons
- Ensure `aria-label` is descriptive

### Issue: State Changes Not Announced
**Symptoms:** Expanding accordion doesn't announce state
**Solutions:**
- Use `aria-expanded="true/false"`
- Add `aria-live="polite"` region for updates
- Use `role="alert"` for important changes

### Issue: Table Navigation Confusing
**Symptoms:** Screen reader doesn't announce headers
**Solutions:**
- Use `<th scope="col">` for column headers
- Use `<th scope="row">` for row headers
- Use `<thead>`, `<tbody>` structure
- Add `<caption>` for table description

---

## Automated Testing Tools

### axe DevTools (Browser Extension)
```
1. Install axe DevTools extension (Chrome/Firefox)
2. Open DevTools (F12)
3. Navigate to "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review violations and warnings
```

### Pa11y (Command Line)
```bash
# Install
npm install -g pa11y

# Run
pa11y http://localhost:4173

# Run with screen reader simulation
pa11y --runner htmlcs http://localhost:4173
```

### Lighthouse (Chrome DevTools)
```
1. Open Chrome DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review score and issues
```

---

## Expected Test Results

### VoiceOver
- [ ] All content readable
- [ ] Headings navigable with VO + Cmd + H
- [ ] Landmarks navigable via Rotor (VO + U)
- [ ] Forms operable
- [ ] Modals announced as dialogs
- [ ] Dynamic updates announced

### NVDA/JAWS
- [ ] Forms mode activates automatically
- [ ] Element lists populated correctly
- [ ] Table navigation works
- [ ] ARIA attributes announced
- [ ] Live regions update
- [ ] Browse/focus mode transition smooth

### Mobile Screen Readers
- [ ] Swipe navigation logical
- [ ] Touch exploration works
- [ ] Form input accessible
- [ ] Modal interactions work
- [ ] Gestures function correctly

---

## Reporting Issues

When reporting screen reader issues, include:

1. **Screen Reader:** Name and version (e.g., "NVDA 2024.1")
2. **Browser:** Name and version (e.g., "Chrome 120")
3. **OS:** Operating system (e.g., "Windows 11")
4. **Steps to Reproduce:**
   - Navigate to [URL]
   - Use [command/gesture]
   - Expected: [description]
   - Actual: [description]
5. **Severity:** Critical / High / Medium / Low
6. **WCAG Criterion:** If applicable (e.g., "1.3.1 Info and Relationships")

---

## Resources

### Learning Resources
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Documentation](https://www.freedomscientific.com/training/jaws/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Screen Reader Keyboard Shortcuts](https://dequeuniversity.com/screenreaders/)
- [Accessibility Insights](https://accessibilityinsights.io/)

### Communities
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM Discussion List](https://webaim.org/discussion/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Document Owner:** Development Team
**Last Review:** January 2, 2026
**Next Review:** Before major feature releases
