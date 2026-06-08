# [CRITICAL] Resolve 15 legal placeholders in legal.ts - Production Blocker

**Labels**: `priority:critical`, `status:blocked`, `area:legal`

## Description
There are 15 legal placeholders in `src/constants/legal.ts` that must be resolved before production deployment. These placeholders include company information, addresses, legal policies, and social media links.

## Impact
- **Severity**: 🔴 CRITICAL - Production Blocker
- **Risk**: Legal compliance violations, brand credibility issues
- **Owner**: Legal & Compliance Team
- **Blocks**: Production deployment

## Legal Placeholders to Resolve

### Company Information (src/constants/legal.ts)
1. Line 22: `legalName: '[Company Legal Name]'`
2. Line 32: `street: '[Street Address]'`
3. Line 33: `city: '[City]'`
4. Line 34: `state: '[State]'`
5. Line 35: `zip: '[ZIP]'`
6. Line 36: `country: '[Country]'`
7. Line 56: `jurisdiction: '[State/Country]'`
8. Line 57: `governingLaw: '[State] law'`

### Policy Documentation
9. Line 41: `cookies: '#'` - Create cookie policy
10. Line 42: `security: '#'` - Create security practices doc
11. Line 43: `dmca: '#'` - Create DMCA policy
12. Line 44: `accessibility: '#'` - Create accessibility statement

### Social Media Links
13. Line 48: `twitter: '#'` - Create Twitter/X account
14. Line 49: `LinkedIn: '#'` - Create LinkedIn page
15. Line 50: `discord: '#'` - Add Discord server link

## Related Documentation
- `docs/LEGAL-SETUP.md`: Contains 16 TODO items mirroring legal.ts placeholders
- `docs/PRIVACY-POLICY.md:293`: Broken transparency report URL
- `docs/COOKIE-POLICY.md:11`: Cookie policy incomplete (Target: 2025-12-15)
- `docs/TERMS-OF-SERVICE.md:294`: Legal review required for compliance claims

## Acceptance Criteria
- [ ] All 15 placeholders replaced with actual values
- [ ] Legal team review and approval completed
- [ ] Cookie policy created and published
- [ ] Security practices document created
- [ ] DMCA policy created
- [ ] Accessibility statement created
- [ ] Social media accounts created and linked
- [ ] Privacy and Terms revision dates updated

## Timeline
**Required Before Launch** - Week 1-2

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 111-142)
