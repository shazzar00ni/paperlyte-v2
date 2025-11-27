# Deployment Guide

This guide covers deploying Paperlyte to various hosting platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Custom Server](#custom-server)
- [CI/CD Setup](#cicd-setup)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

Before deploying, ensure:

- [x] All tests pass: `npm test`
- [x] Build succeeds: `npm run build`
- [x] No linting errors: `npm run lint`
- [x] Performance targets met (Lighthouse > 90)
- [x] Accessibility compliance (WCAG 2.1 AA)

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

### Build Configuration

Build settings are in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting for better caching
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

## Environment Variables

### Required Variables

Create a `.env.production` file:

```bash
# API endpoint (when backend is implemented)
VITE_API_BASE_URL=https://api.paperlyte.com

# Feature flags
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_DARK_MODE=false

# Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### Variable Naming

- All client-side variables **must** be prefixed with `VITE_`
- Never commit `.env.production` to version control
- Use your platform's environment variable UI for sensitive values

## Deployment Platforms

### Vercel (Recommended)

Vercel provides optimal deployment for Vite/React applications.

#### Setup

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

#### Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Environment Variables in Vercel

```bash
# Via CLI
vercel env add VITE_API_BASE_URL production

# Or use the Vercel dashboard
```

### Netlify

#### Setup

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   # Deploy to preview
   netlify deploy

   # Deploy to production
   netlify deploy --prod
   ```

#### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Pages

#### Setup

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/paperlyte-v2/', // Replace with your repo name
     // ... other config
   });
   ```

3. **Add deploy script to package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Configure GitHub**:
   - Go to repository Settings > Pages
   - Select `gh-pages` branch as source

### Custom Server

For deploying to your own server:

#### Using Nginx

```nginx
server {
    listen 80;
    server_name paperlyte.com;

    root /var/www/paperlyte/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

#### Using Apache

```apache
<VirtualHost *:80>
    ServerName paperlyte.com
    DocumentRoot /var/www/paperlyte/dist

    <Directory /var/www/paperlyte/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Handle client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Security headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Cache static assets
    <FilesMatch "\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
</VirtualHost>
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_ANALYTICS_ID: ${{ secrets.VITE_ANALYTICS_ID }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization

### Pre-Deployment Checklist

- [ ] Run Lighthouse audit (target: > 90)
- [ ] Test on slow 3G connection
- [ ] Check bundle size: `npm run build -- --stats`
- [ ] Verify Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### Optimization Techniques

1. **Code Splitting**: Implemented in `vite.config.ts`
2. **Asset Optimization**: Images compressed and served in modern formats
3. **Font Loading**: Preload critical fonts
4. **Critical CSS**: Inline above-the-fold CSS
5. **Service Worker**: For offline functionality (future)

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Analyze bundle
npm run build -- --stats
```

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics 4**: Privacy-focused analytics
- **Lighthouse CI**: Automated performance audits

### Setting Up Monitoring

```bash
# Install Sentry (example)
npm install @sentry/react

# Configure in src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

## Rollback Procedures

### Vercel

```bash
# List deployments
vercel list

# Promote a previous deployment to production
vercel promote [deployment-url]
```

### Netlify

```bash
# List deployments
netlify deploy list

# Restore a previous deployment
netlify deploy restore [deployment-id]
```

### GitHub Pages

```bash
# Revert to previous commit and redeploy
git revert HEAD
git push origin main
npm run deploy
```

## Troubleshooting

### Common Issues

**Build fails with "out of memory"**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Routes return 404**:
- Ensure SPA fallback is configured (see platform configs above)
- Check that `base` URL in `vite.config.ts` is correct

**Environment variables not working**:
- Verify variables are prefixed with `VITE_`
- Check that variables are set in platform dashboard
- Rebuild after adding new variables

## Security Checklist

Before deploying to production:

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Content Security Policy implemented
- [ ] Dependencies audited: `npm audit`
- [ ] No console.logs in production build
- [ ] Source maps disabled in production

## Support

For deployment issues:

- Check [GitHub Issues](https://github.com/shazzar00ni/paperlyte-v2/issues)
- Consult platform documentation (Vercel, Netlify, etc.)
- Contact the development team

---

**Last Updated**: 2025-01-27
