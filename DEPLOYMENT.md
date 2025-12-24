# Deployment Guide

This document outlines the deployment process for the Paperlyte landing page on Netlify.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Netlify Setup](#initial-netlify-setup)
- [Environment Configuration](#environment-configuration)
- [Custom Domain Setup](#custom-domain-setup)
- [Continuous Deployment](#continuous-deployment)
- [Deploy Previews](#deploy-previews)
- [Rollback Strategy](#rollback-strategy)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- GitHub repository with the Paperlyte codebase
- Netlify account (free tier is sufficient)
- Custom domain: `paperlyte.app` (when ready)
- Admin access to domain DNS settings

## Initial Netlify Setup

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the `paperlyte-v2` repository

### 2. Configure Build Settings

The build settings are automatically configured via `netlify.toml`, but you can verify them in the Netlify UI:

- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (set via environment variable in netlify.toml)

### 3. Deploy Site

1. Click "Deploy site"
2. Netlify will assign a random subdomain (e.g., `random-name-123.netlify.app`)
3. Wait for the initial build to complete (~2-3 minutes)
4. Verify the site is accessible at the Netlify URL

## Environment Configuration

### Build Environment Variables

Currently, no environment variables are required for the landing page. If needed in the future:

1. Navigate to Site settings → Build & deploy → Environment
2. Click "Add a variable"
3. Add key-value pairs as needed

### Node Version

The Node version is set to 18.x in `netlify.toml`:

```toml
[build]
  environment = { NODE_VERSION = "20" }
```

## Custom Domain Setup

### 1. Add Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter `paperlyte.app`
4. Confirm ownership

### 2. Configure DNS Records

Add the following DNS records at your domain registrar:

**A Record** (for apex domain):

```
Type: A
Name: @
Value: 75.2.60.5  (Netlify's load balancer IP)
TTL: 3600
```

**CNAME Record** (for www subdomain):

```
Type: CNAME
Name: www
Value: random-name-123.netlify.app  (your Netlify site URL)
TTL: 3600
```

**Alternative: Using Netlify DNS** (Recommended)

1. Click "Set up Netlify DNS" in Domain settings
2. Copy the provided nameservers
3. Update nameservers at your domain registrar:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`
4. Wait for DNS propagation (can take up to 48 hours, usually <1 hour)

### 3. Enable HTTPS

1. Netlify automatically provisions an SSL certificate via Let's Encrypt
2. Wait for SSL certificate to be issued (~1-2 minutes)
3. Enable "Force HTTPS" in Domain settings
4. All HTTP requests will now redirect to HTTPS

### 4. Set Primary Domain

1. Choose which domain variant should be primary:
   - `paperlyte.app` (apex domain) - **Recommended**
   - `www.paperlyte.app` (www subdomain)
2. Non-primary variant will automatically redirect to primary

## Continuous Deployment

### Automatic Deployments from Main Branch

The `main` branch is configured for automatic deployment:

1. Any push to `main` triggers a new deployment
2. Build process runs automatically
3. Site goes live upon successful build
4. Failed builds do NOT deploy (previous version remains live)

### Branch Protection Rules

Set up branch protection for `main` on GitHub:

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Required status checks:
     - `CI Success` (from GitHub Actions)
     - `netlify/paperlyte-v2/deploy-preview` (from Netlify)
   - ✅ Require pull request reviews before merging (at least 1)
   - ✅ Include administrators

## Deploy Previews

Deploy Previews are automatically created for all pull requests:

1. Open a pull request on GitHub
2. Netlify automatically builds and deploys a preview
3. Preview URL is posted as a comment on the PR
4. Preview URL format: `deploy-preview-[PR_NUMBER]--random-name-123.netlify.app`
5. Preview is updated with each new commit to the PR branch
6. Preview is deleted when PR is closed or merged

### Viewing Deploy Previews

- **In Netlify**: Go to "Deploys" → "Deploy Previews"
- **In GitHub**: Check the PR "Checks" tab for Netlify status
- **Direct link**: Posted as a comment by Netlify bot

## Rollback Strategy

### Instant Rollback

Netlify keeps a history of all deployments. To rollback:

1. Go to "Deploys" in Netlify dashboard
2. Find the previous stable deployment
3. Click "..." menu → "Publish deploy"
4. Confirm rollback
5. Previous version goes live immediately

### Rollback via Git

1. Identify the commit hash of the stable version:

   ```bash
   git log --oneline
   ```

2. Create a revert commit:

   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. Netlify will automatically deploy the reverted version

## Performance Monitoring

### Netlify Analytics (Optional)

Netlify provides built-in analytics:

1. Go to Site settings → Analytics
2. Enable "Analytics" ($9/month per site)
3. View traffic, performance, and user behavior

### Lighthouse CI

Automated Lighthouse audits run on every deployment via GitHub Actions:

1. View results in GitHub Actions tab
2. Check "Lighthouse CI" job for performance scores
3. Download artifacts to view detailed reports

### Performance Targets

Monitor these metrics to meet Paperlyte's performance goals:

- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: > 95
- **Page Load Time**: < 2 seconds
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## Troubleshooting

### Build Failures

**Problem**: Build fails with error message

**Solutions**:

1. Check build logs in Netlify dashboard
2. Verify `package.json` scripts work locally
3. Ensure all dependencies are in `package.json` (not `devDependencies` only)
4. Clear Netlify build cache: Site settings → Build & deploy → Clear cache and retry deploy

### 404 Errors on Refresh

**Problem**: Navigating directly to routes shows 404

**Solution**: Redirect rules in `netlify.toml` handle SPA routing. Verify:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### SSL Certificate Issues

**Problem**: SSL certificate not provisioning

**Solutions**:

1. Verify DNS is correctly configured
2. Wait 24 hours for DNS propagation
3. Try "Renew certificate" in Domain settings
4. Contact Netlify support if issue persists

### Slow Build Times

**Problem**: Builds taking longer than expected

**Solutions**:

1. Enable build cache (enabled by default)
2. Optimize dependencies (remove unused packages)
3. Use `npm ci` instead of `npm install` (already configured)

### Deploy Preview Not Appearing

**Problem**: Deploy preview not created for PR

**Solutions**:

1. Verify Netlify GitHub integration is active
2. Check "Deploy Previews" setting is enabled: Site settings → Build & deploy → Deploy contexts
3. Ensure PR is from a branch in the same repository (not a fork)

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS Only**: Always enforce HTTPS (configured in netlify.toml)
3. **Security Headers**: Review and adjust CSP in netlify.toml as needed
4. **Dependencies**: Regularly update dependencies for security patches
5. **Access Control**: Limit Netlify admin access to trusted team members

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Custom Domain Setup](https://docs.netlify.com/domains-https/custom-domains/)
- [Deploy Previews](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Netlify Status Page](https://www.netlifystatus.com/)

---

**Last Updated**: 2025-11-28
**Maintained By**: Paperlyte Team
