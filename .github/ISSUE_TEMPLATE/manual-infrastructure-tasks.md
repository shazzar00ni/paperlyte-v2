---
name: Manual Infrastructure Configuration Tasks
about: Complete the remaining manual infrastructure setup tasks from Issue #14
title: 'Complete Manual Infrastructure Configuration Tasks'
labels: infrastructure, deployment, documentation
assignees: ''
---

## 🎯 Objective

Complete the remaining manual infrastructure configuration tasks that require GitHub and Netlify UI access. These tasks finalize the development infrastructure setup initiated in issue #14.

## 📋 Prerequisites

- ✅ All automated infrastructure is complete (see #14)
- ✅ Code changes committed and merged
- ✅ `INFRASTRUCTURE_SETUP.md` documentation available

## 🔧 Tasks

### 1. Configure GitHub Branch Protection Rules

**Location:** Repository Settings → Branches → Add branch protection rule

**Branch:** `main`

**Required settings:**
- [ ] ✅ Require a pull request before merging
- [ ] ✅ Require approvals: **1**
- [ ] ✅ Dismiss stale pull request approvals when new commits are pushed
- [ ] ✅ Require status checks to pass before merging
  - Required status checks:
    - [ ] `lint-and-typecheck`
    - [ ] `build`
    - [ ] `lighthouse`
    - [ ] `ci-success`
- [ ] ✅ Require branches to be up to date before merging
- [ ] ✅ Require conversation resolution before merging
- [ ] ✅ Do not allow bypassing the above settings

**Optional:** Repeat for `develop` branch if using GitFlow workflow

---

### 2. Connect Repository to Netlify

**Steps:**
- [ ] Log in to [Netlify](https://app.netlify.com/)
- [ ] Click **Add new site** → **Import an existing project**
- [ ] Choose **GitHub** as Git provider
- [ ] Authorize Netlify to access GitHub account (if needed)
- [ ] Select the `paperlyte-v2` repository
- [ ] Verify Netlify auto-detects settings from `netlify.toml`:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: 18
- [ ] Click **Deploy site**
- [ ] Wait for initial deployment to complete
- [ ] Verify site is accessible at temporary Netlify URL

---

### 3. Configure Custom Domain

**Location:** Netlify Site Settings → Domain management

**Steps:**
- [ ] Click **Add custom domain**
- [ ] Enter domain: `paperlyte.app`
- [ ] Choose DNS configuration method:
  - **Option A (Recommended):** Use Netlify DNS
    - [ ] Add Netlify nameservers to domain registrar
    - [ ] Wait for DNS propagation (up to 24 hours)
  - **Option B:** Configure DNS at current provider
    - [ ] Add A record pointing to Netlify load balancer
    - [ ] Add CNAME record for `www` subdomain
- [ ] Verify DNS configuration
- [ ] Enable **HTTPS** (Netlify auto-provisions SSL certificate via Let's Encrypt)
- [ ] Enable **Force HTTPS** redirect
- [ ] Test site at `https://paperlyte.app`

**DNS Records (if using Option B):**
```
Type    Name    Value
A       @       75.2.60.5 (Netlify's load balancer - verify current IP)
CNAME   www     [your-site].netlify.app
```

---

### 4. Configure Netlify Deploy Previews (Verification)

**Location:** Site Settings → Build & deploy → Deploy contexts

**Verify settings:**
- [ ] Production branch: `main`
- [ ] Branch deploys: **All branches** or **Let me add individual branches**
- [ ] Deploy previews: **Any pull request against your production branch/branch deploy branches**
- [ ] Deploy notifications enabled for:
  - [ ] Deploy started
  - [ ] Deploy succeeded
  - [ ] Deploy failed

---

### 5. Optional: Configure Environment Variables

**Location:** Site Settings → Build & deploy → Environment

Currently, no environment variables are required. Document any added later:

| Variable Name | Description | Value |
|--------------|-------------|-------|
| (none yet)   |             |       |

---

## ✅ Definition of Done

- [ ] Branch protection rules configured for `main` branch
- [ ] All required CI status checks enforced
- [ ] Repository connected to Netlify
- [ ] Site successfully deployed
- [ ] Custom domain `paperlyte.app` configured
- [ ] SSL/HTTPS enabled and working
- [ ] Deploy previews verified on a test PR
- [ ] Site accessible at `https://paperlyte.app`
- [ ] All team members notified of deployment

---

## 📚 Resources

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Netlify Deployment Docs](https://docs.netlify.com/site-deploys/overview/)
- [Netlify Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)
- [Netlify DNS Configuration](https://docs.netlify.com/domains-https/netlify-dns/)
- Project Infrastructure Documentation: `INFRASTRUCTURE_SETUP.md`

---

## 💬 Notes

- Estimated time: **15-20 minutes** (excluding DNS propagation)
- DNS propagation can take up to 24 hours but is usually faster (2-4 hours)
- SSL certificate provisioning is automatic once DNS is configured
- All settings are documented in repository configuration files (`netlify.toml`, etc.)

---

## 🔗 Related Issues

- Closes #14 (Development Infrastructure Setup)
- Blocks: [Future issues requiring live deployment]
