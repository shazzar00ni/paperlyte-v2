# Environment Configuration Guide

This project uses environment-aware configuration for SEO and Open Graph meta tags.

## Environment Files

Three environment files control the application's URLs and SEO metadata:

- **`.env.example`** - Template showing all available variables
- **`.env.development`** - Used during `npm run dev`
- **`.env.production`** - Used during `npm run build`

## Available Variables

### `VITE_BASE_URL`

The base URL of your application (no trailing slash).

- **Development**: `http://localhost:5173`
- **Production**: `https://paperlyte.com`
- **Staging**: `https://staging.paperlyte.com` (if applicable)

### `VITE_SEO_KEYWORDS`

Comma-separated keywords for SEO meta tags.

- Default: `"note-taking app, simple notes, fast notes, offline notes, tag-based organization, distraction-free writing, minimalist notes"`

### `VITE_OG_IMAGE`

Open Graph image for social media previews.

- **Development**: `/og-image.png` (relative path)
- **Production**: `https://paperlyte.com/og-image.png` (absolute URL)

## How It Works

1. **Build Time**: Vite injects environment variables during build
2. **Runtime**: The `src/utils/env.ts` module reads these variables
3. **Meta Tag Update**: `updateMetaTags()` runs on app initialization in `main.tsx`
4. **Dynamic Updates**: Canonical URL, keywords, and Open Graph tags are updated based on environment

## Usage in Code

```typescript
import { env } from './utils/env';

console.log(env.baseUrl); // http://localhost:5173 or https://paperlyte.com
console.log(env.seoKeywords); // SEO keywords string
console.log(env.ogImage); // Full OG image URL
console.log(env.isDevelopment); // true/false
console.log(env.isProduction); // true/false
```

## Local Development

1. Copy `.env.example` to `.env.local` for custom local overrides:

   ```bash
   cp .env.example .env.local
   ```

2. Customize values in `.env.local` (this file is gitignored)

3. Start dev server:
   ```bash
   npm run dev
   ```

## Production Deployment

The production build automatically uses `.env.production`:

```bash
npm run build
```

### Netlify/Vercel Environment Variables

For deployment platforms, set these in the platform's UI:

```
VITE_BASE_URL=https://paperlyte.com
VITE_SEO_KEYWORDS=note-taking app, simple notes, fast notes
VITE_OG_IMAGE=https://paperlyte.com/og-image.png
```

## Testing

Verify environment configuration in browser console (development mode):

document.querySelector('link[rel="canonical"]').href
document.querySelector('meta[property="og:url"]').content
document.querySelector('meta[property="og:image"]').content

```javascript
// Check if meta tags are updated correctly (defensive: won't throw if missing)
const canonical = document.querySelector('link[rel="canonical"]');
console.log('Canonical:', canonical ? canonical.href : 'Not found');
const ogUrl = document.querySelector('meta[property="og:url"]');
console.log('OG URL:', ogUrl ? ogUrl.content : 'Not found');
const ogImage = document.querySelector('meta[property="og:image"]');
console.log('OG Image:', ogImage ? ogImage.content : 'Not found');
```

## Important Notes

- **Never commit `.env.local`** - Contains local overrides
- **Always commit `.env.example`** - Documents available variables
- **Production URLs** - Must be absolute (include protocol)
- **Development URLs** - Can be relative or absolute
- **Vite Prefix** - All custom variables must start with `VITE_`

## Troubleshooting

### Meta tags not updating?

- Check console for environment log (development mode only)
- Verify `updateMetaTags()` is called in `main.tsx`
- Ensure variables start with `VITE_` prefix

### Wrong URL in production?

- Check `.env.production` values
- Verify build command uses production mode
- Clear build cache: `rm -rf dist && npm run build`

### Open Graph preview not working?

- Ensure production OG image URL is absolute
- Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
