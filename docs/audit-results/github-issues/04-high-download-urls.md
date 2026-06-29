# [HIGH] Complete download URLs for all platforms

**Labels**: `priority:high`, `area:deployment`, `area:product`

## Description
Download URLs in `src/constants/downloads.ts` are incomplete, with 5 TODO items blocking users from downloading applications across all platforms.

## Impact
- **Severity**: 🟠 HIGH PRIORITY
- **Risk**: Conversion loss, poor user experience, frustrated users
- **Owner**: Product Team
- **Timeline**: Required before launch

## Incomplete Download URLs

### Current Status (src/constants/downloads.ts)
1. **Line 14**: Windows download - depends on GitHub URL from legal.ts
2. **Line 16**: macOS download - depends on GitHub URL from legal.ts
3. **Line 18**: iOS App Store - TODO: Replace with actual URL
4. **Line 20**: Android Play Store - TODO: Replace with actual URL
5. **Line 22**: Linux download - depends on GitHub URL from legal.ts

## Implementation Plan

### Phase 1: Desktop Applications (Week 2-3)
- [ ] Create GitHub repository for releases (if not exists)
- [ ] Build Windows installer (.exe or .msi)
- [ ] Build macOS installer (.dmg)
- [ ] Build Linux packages (.deb, .rpm, .AppImage)
- [ ] Create GitHub release with all desktop binaries
- [ ] Update `src/constants/legal.ts` with GitHub URL
- [ ] Update `src/constants/downloads.ts` with release URLs

### Phase 2: Mobile Applications (Week 3-4)
- [ ] Build iOS application
- [ ] Submit to Apple App Store
- [ ] Complete App Store review process
- [ ] Build Android application
- [ ] Submit to Google Play Store
- [ ] Complete Play Store review process
- [ ] Update download URLs with store links

## Technical Requirements

### GitHub Releases Setup
```typescript
// Example URL format
const githubReleasesUrl = 'https://github.com/[org]/paperlyte/releases';

// Platform-specific download URLs
const downloads = {
  windows: `${githubReleasesUrl}/latest/download/Paperlyte-Setup.exe`,
  macos: `${githubReleasesUrl}/latest/download/Paperlyte.dmg`,
  linux: `${githubReleasesUrl}/latest/download/Paperlyte.AppImage`,
  ios: 'https://apps.apple.com/app/paperlyte/[app-id]',
  android: 'https://play.google.com/store/apps/details?id=com.paperlyte.app'
};
```

### App Store Requirements
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect setup
- [ ] App privacy policy URL (depends on legal issue #1)
- [ ] App screenshots and metadata
- [ ] App review submission

### Play Store Requirements
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Play Console setup
- [ ] App privacy policy URL (depends on legal issue #1)
- [ ] App screenshots and metadata
- [ ] App review submission

## Dependencies
- **Blocks**: Production launch, user downloads, conversion funnel
- **Blocked by**: Issue #1 (legal placeholders - GitHub URL needed)
- **Related**: Legal team must provide company information for store listings

## Acceptance Criteria
- [ ] All 5 download URLs completed with actual links
- [ ] Desktop apps available via GitHub releases
- [ ] iOS app live on App Store
- [ ] Android app live on Play Store
- [ ] Download buttons tested and functional
- [ ] Analytics tracking download clicks
- [ ] Download page shows correct platform detection

## Verification Steps
1. Test download links on all platforms
2. Verify installers work correctly
3. Check app store listings are live
4. Confirm analytics tracking download events
5. Test platform detection and auto-suggest correct download

## Source
Baseline Audit 2025-12-22: `docs/audit-results/baseline-audit-2025-12-22.md` (Lines 145-150, 322-327)
