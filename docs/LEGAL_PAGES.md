# Legal Pages Architecture

## Overview

The Privacy Policy and Terms of Service pages are intentionally kept as **separate, standalone components** despite having similar structural patterns. This document explains why this approach is correct and addresses code duplication concerns.

## Why Separate Components?

### ✅ Legal Document Independence

Privacy and Terms are **fundamentally different legal documents**:

- **Privacy Policy**: Describes data collection, usage, and protection practices
- **Terms of Service**: Defines user agreements, acceptable use, and legal responsibilities

**Maintaining them separately:**
- Allows independent updates without affecting the other document
- Prevents accidental changes to legal content when editing structure
- Makes legal review and version control clearer
- Follows industry standard practice

### ✅ Content Ownership

Legal documents should be:
- Easy for legal teams to review
- Clear in their version history
- Independently auditable
- Simple to update without technical complexity

**Separate files achieve this better than shared abstractions.**

## Structural Similarity is Intentional

Both pages share similar JSX structure:

```tsx
<>
  <title>Page Title</title>
  <meta name="description" content="..." />

  <Section className={styles.hero}>
    <h1>Title</h1>
    <p>Last Updated: {DATE}</p>
  </Section>

  <Section className={styles.content}>
    <section className={styles.section}>
      <h2>Heading</h2>
      <p>Content...</p>
    </section>
  </Section>
</>
```

**This structural similarity is:**
- ✅ **Intentional** - Provides consistent user experience
- ✅ **Beneficial** - Makes maintenance predictable
- ✅ **Not problematic** - JSX structure is not duplicated logic

## What IS Shared (Correctly)

### ✅ Shared CSS Modules

Both pages use design system variables:

```css
/* Shared via CSS variables */
.container {
  max-width: var(--max-width-legal); /* 800px */
}

.section a {
  color: var(--color-link-accent);
}
```

**Benefits:**
- Single source of truth for styling
- Consistent visual appearance
- Easy to update globally

### ✅ Shared Configuration

Both pages reference the same legal config:

```tsx
// src/constants/legal.ts
export const LEGAL_CONFIG = {
  metadata: {
    privacyLastUpdated: '2025-11-28',
    termsLastUpdated: '2025-11-28',
  }
}
```

**Benefits:**
- Centralized metadata management
- Version tracking in one place

### ✅ Shared Layout Components

Both pages use the same base components:

- `<Section>` - Layout wrapper
- `<Link>` - React Router navigation
- Common footer and header

**Benefits:**
- Consistent navigation experience
- Reusable layout components
- Maintainable UI patterns

## What Should NOT Be Shared

### ❌ Legal Content

**Never extract legal content into shared data structures:**

```tsx
// ❌ BAD: Abstracting legal content
const LEGAL_SECTIONS = {
  privacy: [
    { heading: 'Data Collection', content: '...' },
    { heading: 'Data Usage', content: '...' },
  ],
  terms: [
    { heading: 'User Agreement', content: '...' },
  ]
}

function LegalPage({ sections }) {
  return sections.map(s => <Section>{s.content}</Section>)
}
```

**Problems:**
- Legal teams cannot easily review content
- Harder to see full document context
- Complex version control
- Obscures legal meaning
- Makes auditing difficult

### ✅ GOOD: Keep Legal Content Inline

```tsx
// ✅ GOOD: Clear, auditable legal content
export function Privacy() {
  return (
    <>
      <title>Privacy Policy | Paperlyte</title>
      <Section>
        <h2>Data Collection</h2>
        <p>
          We collect email addresses when you join our waitlist...
        </p>
      </Section>
      {/* Full content visible and auditable */}
    </>
  )
}
```

**Benefits:**
- Legal team can review the entire document
- Git history shows exact legal changes
- No hidden abstraction layers
- Searchable content (Ctrl+F works)

## Pattern Reuse vs. Code Duplication

**Code duplication** is bad when:
- ❌ Business logic is repeated
- ❌ Calculations are duplicated
- ❌ Complex algorithms are copied

**Pattern reuse** is good when:
- ✅ Structure follows established conventions
- ✅ Readability is improved
- ✅ Content remains clear and auditable

**Legal pages fall into the second category.**

## Addressing Codacy Warnings

### Static Analysis Limitations

Codacy flags similar JSX structures as "duplication" because:
- It compares AST (Abstract Syntax Tree) patterns
- It doesn't understand legal document semantics
- It can't distinguish content from structure

**This is a false positive for legal documents.**

### If You Must Reduce "Duplication"

If the team decides structural duplication is a concern, the **only acceptable** refactoring is:

```tsx
// Legal page layout wrapper (OPTIONAL)
function LegalPageLayout({
  title,
  description,
  lastUpdated,
  children
}: LegalPageLayoutProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <Section className={styles.hero}>
        <h1>{title.replace(' | Paperlyte', '')}</h1>
        <p>Last Updated: {lastUpdated}</p>
      </Section>
      <Section className={styles.content}>
        {children}
      </Section>
    </>
  )
}

// Usage
export function Privacy() {
  return (
    <LegalPageLayout
      title="Privacy Policy | Paperlyte"
      description="..."
      lastUpdated={LAST_UPDATED}
    >
      {/* Legal content stays inline */}
      <section className={styles.section}>
        <h2>Data Collection</h2>
        <p>We collect...</p>
      </section>
    </LegalPageLayout>
  )
}
```

**However, this adds complexity for minimal benefit.**

## Recommendation

**Keep Privacy and Terms as separate, standalone components.**

The current implementation is:
- ✅ Legally sound
- ✅ Easy to audit
- ✅ Simple to maintain
- ✅ Clear version control
- ✅ Industry standard practice

The perceived "duplication" is **structural similarity**, not code duplication, and is **intentional** for consistency.

---

**Last Updated**: January 2026
**Owner**: Engineering Team & Legal Team
**Decision**: Maintain separate legal page components
