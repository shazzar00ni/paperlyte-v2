---
name: Implement Additional Analytics Providers
about: Track implementation of Fathom, Umami, Simple Analytics, and Custom providers
title: 'Implement additional analytics providers (Fathom, Umami, Simple Analytics, Custom)'
labels: enhancement, analytics
---

## Overview

Currently, only Plausible Analytics is implemented. We need to add support for additional privacy-first analytics providers to give users more flexibility.

## Providers to Implement

### 1. Fathom Analytics

- **Website**: <https://usefathom.com>
- **Script URL**: `https://cdn.usefathom.com/script.js`
- **Configuration**: Site ID (not domain)
- **Features**: Cookie-less, GDPR compliant, simple event tracking
- **Script attributes**: `data-site` for site ID

### 2. Umami Analytics

- **Website**: <https://umami.is>
- **Script URL**: Self-hosted or cloud (`https://analytics.umami.is/script.js`)
- **Configuration**: Website ID + optional custom domain
- **Features**: Self-hosted option, open source, privacy-focused
- **Script attributes**: `data-website-id` for website ID

### 3. Simple Analytics

- **Website**: <https://simpleanalytics.com>
- **Script URL**: `https://scripts.simpleanalytics.com/latest.js`
- **Configuration**: Domain-based (like Plausible)
- **Features**: Cookie-less, GDPR compliant, minimal
- **Script attributes**: Auto-detects domain

### 4. Custom Provider

- **Purpose**: Allow users to integrate any analytics provider
- **Configuration**: Custom script URL, custom event handler
- **Implementation**: Minimal wrapper that calls custom functions if available

## Implementation Requirements

### Interface Compliance

Each provider must implement the `AnalyticsProvider` interface:

```typescript
interface AnalyticsProvider {
  init(config: AnalyticsConfig): void
  trackPageView(url?: string): void
  trackEvent(event: AnalyticsEvent): void
  trackWebVitals(vitals: CoreWebVitals): void
  isEnabled(): boolean
  disable(): void
}
```

### Required Behavior

1. **Async script loading**: Non-blocking, deferred script injection
2. **SSR/Node.js safety**: Check `typeof window !== 'undefined'` before DOM operations
3. **Do Not Track respect**: Honor browser DNT setting if `config.respectDNT` is true
4. **Debug mode**: Log events to console when `config.debug` is enabled
5. **Graceful degradation**: Handle script load failures without breaking the app
6. **Script cleanup**: Remove injected scripts on `disable()`

### Configuration Structure

Each provider should support:

```typescript
{
  provider: 'fathom' | 'umami' | 'simple' | 'custom',
  domain: string,              // Site ID for Fathom, domain for others
  scriptUrl?: string,          // Optional custom script URL
  debug?: boolean,
  trackPageviews?: boolean,
  trackWebVitals?: boolean,
  trackScrollDepth?: boolean,
  respectDNT?: boolean,
}
```

### Core Web Vitals Tracking

Each provider should track Web Vitals as custom events:
- Preserve CLS precision (3 decimal places)
- Round time-based metrics (LCP, FID, TTFB, FCP, INP) to milliseconds
- Include metric name and value in event properties

## Acceptance Criteria

- [ ] Create `FathomProvider` class in `src/analytics/providers/fathom.ts`
- [ ] Create `UmamiProvider` class in `src/analytics/providers/umami.ts`
- [ ] Create `SimpleProvider` class in `src/analytics/providers/simple.ts`
- [ ] Create `CustomProvider` class in `src/analytics/providers/custom.ts`
- [ ] Update `src/analytics/index.ts` to instantiate new providers in `createProvider()`
- [ ] Add provider-specific documentation to `src/analytics/README.md`
- [ ] Add example configuration to `.env.example`
- [ ] Write unit tests for each provider
- [ ] Verify script URL validation works for each provider
- [ ] Test DNT respect for each provider
- [ ] Verify Web Vitals tracking for each provider
- [ ] Update pricing information in README (with disclaimer)

## Testing Checklist

- [ ] Script loads correctly without blocking render
- [ ] Events are tracked properly (page views, custom events, Web Vitals)
- [ ] DNT setting is respected when enabled
- [ ] Debug mode logs events to console
- [ ] Script cleanup works on `disable()`
- [ ] Handles missing/invalid configuration gracefully
- [ ] Works in SSR/Node.js environments (no errors, no-ops)
- [ ] TypeScript types are correct
- [ ] Passes ESLint and builds without errors

## References

- Plausible provider implementation: `src/analytics/providers/plausible.ts`
- Analytics module architecture: `src/analytics/README.md`
- Provider interface: `src/analytics/types.ts`
- Code reference: `src/analytics/index.ts:94-102`

## Priority

**Medium** - Current Plausible implementation meets MVP requirements, but additional providers increase flexibility and market appeal.

## Related Code

The error message pointing users to this issue is located at:
- `src/analytics/index.ts` lines 94-102
