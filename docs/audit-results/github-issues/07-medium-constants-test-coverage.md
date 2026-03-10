# [MEDIUM] Add test coverage for constants module (0% coverage)

**Labels**: `priority:medium`, `area:testing`, `area:quality`

## Description
The constants module has 0% test coverage across 8 files. While these are primarily data files, testing ensures configuration correctness and prevents runtime errors from incorrect data structures.

## Impact
- **Severity**: 🟡 MEDIUM PRIORITY
- **Risk**: Configuration errors undetected, incorrect content display, runtime failures
- **Owner**: Engineering Team
- **Timeline**: Sprint 2

## Files Requiring Tests

### Zero Coverage (8 files)
1. `src/constants/legal.ts` - Legal information and company data
2. `src/constants/downloads.ts` - Download URLs and platform info
3. `src/constants/features.ts` - Feature descriptions and metadata
4. `src/constants/comparison.ts` - Competitor comparison data
5. `src/constants/faq.ts` - FAQ questions and answers
6. `src/constants/pricing.ts` - Pricing tiers and features
7. `src/constants/testimonials.ts` - Customer testimonials
8. `src/constants/config.ts` - Application configuration

## Why Test Constants?

While constants are primarily data, tests provide value:
- **Schema Validation**: Ensure data structures match expected shapes
- **Required Fields**: Verify no missing required properties
- **Type Safety**: Catch type mismatches not caught by TypeScript
- **URL Validation**: Ensure URLs are well-formed (especially important for legal.ts and downloads.ts)
- **Data Integrity**: Verify array lengths, object keys, expected values
- **Refactoring Safety**: Detect breaking changes when restructuring data

## Testing Approach

### Example Test Structure

```typescript
// src/constants/__tests__/legal.test.ts
import { describe, it, expect } from 'vitest';
import { LEGAL_CONFIG } from '../legal';

describe('LEGAL_CONFIG', () => {
  it('has required company information', () => {
    expect(LEGAL_CONFIG.company.legalName).toBeDefined();
    expect(LEGAL_CONFIG.company.legalName).not.toBe('[Company Legal Name]');
  });

  it('has valid contact email', () => {
    expect(LEGAL_CONFIG.company.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('has complete address', () => {
    expect(LEGAL_CONFIG.company.address.street).toBeDefined();
    expect(LEGAL_CONFIG.company.address.city).toBeDefined();
    expect(LEGAL_CONFIG.company.address.state).toBeDefined();
    expect(LEGAL_CONFIG.company.address.zip).toBeDefined();
    expect(LEGAL_CONFIG.company.address.country).toBeDefined();
  });

  it('has valid social media URLs', () => {
    Object.entries(LEGAL_CONFIG.company.social).forEach(([platform, url]) => {
      expect(url).toMatch(/^https?:\/\//);
      expect(url).not.toBe('#'); // No placeholder URLs
    });
  });

  it('has valid policy URLs', () => {
    expect(LEGAL_CONFIG.company.policies.privacy).toMatch(/^\//);
    expect(LEGAL_CONFIG.company.policies.terms).toMatch(/^\//);
  });
});
```

### Test Files to Create
- [ ] `src/constants/__tests__/legal.test.ts`
- [ ] `src/constants/__tests__/downloads.test.ts`
- [ ] `src/constants/__tests__/features.test.ts`
- [ ] `src/constants/__tests__/comparison.test.ts`
- [ ] `src/constants/__tests__/faq.test.ts`
- [ ] `src/constants/__tests__/pricing.test.ts`
- [ ] `src/constants/__tests__/testimonials.test.ts`
- [ ] `src/constants/__tests__/config.test.ts`

## Test Coverage Goals

- **Overall coverage**: 70% minimum (data files have less logic)
- **Structural validation**: 100% (all objects validated)
- **URL validation**: 100% (all URLs checked for format)
- **Required fields**: 100% (all required fields present)

## Acceptance Criteria
- [ ] All 8 constants files have test coverage
- [ ] Schema validation tests for all data structures
- [ ] URL validation for all links (legal, downloads, social)
- [ ] Required field validation
- [ ] No placeholder values in production data (e.g., '[Company Legal Name]')
- [ ] Coverage thresholds enforced in CI
- [ ] Tests pass consistently

## Implementation Priority

**High Priority** (Test First):
1. `legal.ts` - Critical for production, many TODOs
2. `downloads.ts` - User-facing, blocks downloads
3. `features.ts` - Core product messaging

**Medium Priority**:
4. `comparison.ts` - Marketing content
5. `pricing.ts` - Revenue-critical data
6. `faq.ts` - User support content

**Lower Priority**:
7. `testimonials.ts` - Social proof content
8. `config.ts` - Application settings

## Related Issues
- Issue #1: Legal placeholders must be resolved (blocks legal.ts tests)
- Issue #4: Download URLs must be completed (blocks downloads.ts tests)

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 169-177, 341-346)
