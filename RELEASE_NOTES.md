# Paperlyte v1.1.0 - Performance & Resilience Update

> **Release Date:** 2026-05-15
> **Type:** Minor Release
> **Status:** Production Ready

---

## 🎯 Overview

This release focuses on making the Paperlyte landing page faster, more resilient offline, and more polished visually. The biggest improvements are a stronger service worker strategy for offline behavior and optimized logo delivery in modern image formats.

---

## ✨ Highlights

### Faster Branding Assets

- Added optimized logo assets in **AVIF** and **WebP** formats.
- Updated header and footer logos to use `<picture>` fallbacks for modern format support.
- Right-sized logo dimensions and added explicit `width`/`height` attributes to improve Lighthouse image diagnostics and layout stability.
- Reduced logo payload size through image optimization and responsive delivery.

### Improved Offline Reliability

- Refined service worker behavior to better serve offline assets from cache.
- Removed unsafe/over-aggressive service worker activation behavior.
- Ensured cache writes are properly awaited to reduce race-condition risk.
- Added cleanup logic to prune stale hashed assets and control cache growth over time.
- Improved maintainability by extracting service worker event handlers with clear documentation.

### Quality & Accessibility Refinements

- Addressed linting, formatting, and code review feedback across recent updates.
- Improved unit test alignment with updated logo rendering behavior.
- Fixed smaller implementation issues surfaced by static analysis and review tooling.

---

## 🧪 Validation Focus For This Release

Recommended post-deploy checks:

- Verify logo loading and fallback behavior in Chromium, Safari, and Firefox.
- Confirm offline page behavior after first successful service worker install.
- Run Lighthouse to validate image sizing and performance score deltas.
- Validate no CSP regressions related to service worker/offline assets.

---

## 🔄 Upgrade Notes

- No breaking changes are expected for users.
- Deploy environments should continue to serve `public/sw.js` with correct caching headers.
- If modifying service worker cache naming in future updates, ensure cache version changes are coordinated with rollout.
