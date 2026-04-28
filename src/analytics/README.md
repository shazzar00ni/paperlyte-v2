# Privacy-First Analytics

This module implements privacy-first, cookie-less analytics for the Paperlyte landing page. It's designed to be GDPR-compliant out of the box while providing essential insights into user behavior and page performance.

## Features

- **Cookie-less Tracking**: No cookies, no personal data storage
- **GDPR Compliant**: Privacy-first by default, respects Do Not Track
- **Core Web Vitals**: Automatic tracking of LCP, FID, CLS, TTFB, FCP, INP
- **Scroll Depth**: Monitors user engagement (25%, 50%, 75%, 100%)
- **Event Tracking**: Custom events for CTAs, downloads, and navigation
- **Lightweight**: <5KB bundle overhead (gzipped)
- **Async Loading**: Non-blocking script loading for optimal performance
- **Multiple Providers**: Supports Plausible, Fathom, Umami, Simple Analytics

## Quick Start

### 1. Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Enable analytics
VITE_ANALYTICS_ENABLED=true

# Choose provider (plausible recommended)
VITE_ANALYTICS_PROVIDER=plausible

# Your domain/site ID
VITE_ANALYTICS_DOMAIN=paperlyte.com

# Optional: Custom script URL (for self-hosted)
# VITE_ANALYTICS_SCRIPT_URL=https://your-domain.com/js/script.js

# Optional: Enable debug mode
VITE_ANALYTICS_DEBUG=false
```

### 2. Analytics Initialization

Analytics is automatically initialized in `App.tsx` when the application starts. The configuration is loaded from environment variables.

```tsx
import { analytics } from '@/analytics'
import { getAnalyticsConfig } from '@/analytics/config'

// Initialize on app mount
useEffect(() => {
  const config = getAnalyticsConfig()
  if (config) {
    analytics.init(config)
  }
}, [])
```

### 3. Track Events in Components

Use the `useAnalytics` hook to track user interactions:

```tsx
import { useAnalytics } from '@hooks/useAnalytics'

function MyComponent() {
  const { trackCTAClick, trackDownload } = useAnalytics()

  return (
    <button onClick={() => trackCTAClick('Get Started', 'hero')}>
      Get Started
    </button>
  )
}
```

## Available Methods

### `useAnalytics()` Hook

```tsx
const {
  trackEvent,       // Track custom events
  trackPageView,    // Track page views
  trackCTAClick,    // Track CTA button clicks
  trackDownload,    // Track download button clicks
  trackNavigation,  // Track navigation clicks
  isEnabled,        // Check if analytics is enabled
} = useAnalytics()
```

### Direct Analytics API

```tsx
import { analytics } from '@/analytics'

// Track custom event
analytics.trackEvent({
  name: 'custom_event',
  properties: {
    category: 'engagement',
    value: 42,
  },
})

// Track page view
analytics.trackPageView('/about')

// Track CTA click
analytics.trackCTAClick('Sign Up', 'pricing-section')

// Track download
analytics.trackDownload('mac', 'hero')

// Track navigation
analytics.trackNavigation('features', 'header')
```

## Automatic Tracking

The following metrics are tracked automatically when analytics is enabled:

1. **Page Views**: Initial page load and SPA navigation
2. **Core Web Vitals**: LCP, FID, CLS, TTFB, FCP, INP
3. **Scroll Depth**: 25%, 50%, 75%, 100% milestones

## Supported Analytics Providers

> **Note**: Pricing information is subject to change. Please check provider websites for current pricing details.

### Plausible (Recommended)

- **Website**: <https://plausible.io>
- **Pricing**: Starting at ~$9/month (check website for current pricing)
- **Features**: Cookie-less, GDPR-compliant, lightweight (<1KB)
- **Configuration**:

  ```bash
  VITE_ANALYTICS_PROVIDER=plausible
  VITE_ANALYTICS_DOMAIN=yourdomain.com
  ```

### Fathom Analytics

- **Website**: <https://usefathom.com>
- **Pricing**: Starting at ~$14/month (check website for current pricing)
- **Features**: Privacy-focused, GDPR-compliant, beautiful dashboards
- **Configuration**:

  ```bash
  VITE_ANALYTICS_PROVIDER=fathom
  VITE_ANALYTICS_DOMAIN=YOUR_SITE_ID
  ```

### Umami (Self-Hosted)

- **Website**: <https://umami.is>
- **Pricing**: Free (self-hosted), cloud plans available (check website)
- **Features**: Open-source, privacy-focused, self-hostable
- **Configuration**:

  ```bash
  VITE_ANALYTICS_PROVIDER=umami
  VITE_ANALYTICS_DOMAIN=YOUR_WEBSITE_ID
  VITE_ANALYTICS_SCRIPT_URL=https://your-umami-instance.com/script.js
  ```

### Simple Analytics

- **Website**: <https://simpleanalytics.com>
- **Pricing**: Starting at ~$19/month (check website for current pricing)
- **Features**: Privacy-friendly, no cookies, clean UI
- **Configuration**:

  ```bash
  VITE_ANALYTICS_PROVIDER=simple
  VITE_ANALYTICS_DOMAIN=yourdomain.com
  ```

## Event Types

### Predefined Events

- `page_view`: Page view tracking
- `cta_click`: Call-to-action button clicks
- `scroll_depth`: Scroll depth milestones
- `web_vitals`: Core Web Vitals metrics
- `download_click`: Download button clicks
- `navigation_click`: Navigation menu clicks
- `feature_interaction`: Feature-specific interactions

### Custom Events

You can track any custom event:

```tsx
analytics.trackEvent({
  name: 'newsletter_signup',
  properties: {
    source: 'footer',
    email_confirmed: false,
  },
})
```

## Privacy Compliance

### GDPR Compliance

The analytics module is GDPR-compliant by default:

- ✅ No cookies used
- ✅ No personal data collected
- ✅ No cross-site tracking
- ✅ Respects Do Not Track browser setting
- ✅ Data anonymization by provider
- ✅ EU-based data processing (Plausible)

### Do Not Track

The module respects the browser's Do Not Track (DNT) setting:

```tsx
// Disable DNT respect (not recommended)
analytics.init({
  ...config,
  respectDNT: false,
})
```

## Performance Impact

### Bundle Size

- Core analytics module: ~3KB (gzipped)
- Plausible script: <1KB (gzipped)
- **Total overhead: <5KB** ✅

### Loading Strategy

- Scripts loaded asynchronously
- Non-blocking page render
- Deferred script execution
- No impact on Core Web Vitals

### Lighthouse Impact

- Performance score: >90 ✅
- No blocking resources
- Minimal JavaScript execution time

## Development

### Debug Mode

Enable debug mode to see analytics events in the console:

```bash
VITE_ANALYTICS_DEBUG=true
```

This will log all events, page views, and performance metrics to the browser console.

### Testing

Analytics is disabled by default in development. To test:

1. Set `VITE_ANALYTICS_ENABLED=true` in `.env`
2. Set `VITE_ANALYTICS_DEBUG=true` to see console logs
3. Use a test domain or Plausible's test mode

### Disabling Analytics

To disable analytics entirely:

```bash
VITE_ANALYTICS_ENABLED=false
```

Or remove the `VITE_ANALYTICS_DOMAIN` from your `.env` file.

## Architecture

```text
src/analytics/
├── index.ts              # Main analytics module (singleton)
├── config.ts             # Configuration loader
├── types.ts              # TypeScript type definitions
├── webVitals.ts          # Core Web Vitals tracking
├── scrollDepth.ts        # Scroll depth monitoring
├── providers/
│   └── plausible.ts      # Plausible provider implementation
└── README.md             # This file

src/hooks/
└── useAnalytics.ts       # React hook for components
```

## FAQ

**Q: Is this GDPR compliant?**
A: Yes, by default. No cookies, no personal data, EU-based processing (Plausible).

**Q: What data is collected?**
A: Only anonymous metrics: page views, events, performance metrics. No personal information.

**Q: Can users opt out?**
A: Yes, the module respects the browser's Do Not Track setting.

**Q: What's the performance impact?**
A: <5KB bundle overhead with async loading. No impact on Lighthouse score.

**Q: Which provider should I use?**
A: Plausible is recommended for its lightweight script, privacy features, and ease of use.

**Q: Can I self-host?**
A: Yes, Plausible and Umami both support self-hosting.

**Q: How do I view analytics data?**
A: Log into your analytics provider's dashboard (e.g., https://plausible.io).

## Resources

- [Plausible Documentation](https://plausible.io/docs)
- [Core Web Vitals](https://web.dev/vitals/)
- [GDPR Guidelines](https://gdpr.eu/)
- [Do Not Track](https://en.wikipedia.org/wiki/Do_Not_Track)
