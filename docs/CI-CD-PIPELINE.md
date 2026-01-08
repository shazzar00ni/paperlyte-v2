# CI/CD Pipeline Documentation

This document describes the complete Continuous Integration and Continuous Deployment (CI/CD) pipeline for Paperlyte.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Quality Gates](#quality-gates)
- [Deployment Process](#deployment-process)
- [Monitoring and Notifications](#monitoring-and-notifications)
- [Setup Instructions](#setup-instructions)
- [Troubleshooting](#troubleshooting)

## Overview

The Paperlyte CI/CD pipeline is designed to ensure code quality, performance, and accessibility standards are maintained while enabling fast, reliable deployments.

### Key Features

- ✅ **Automated Testing**: Unit tests with coverage reporting
- ✅ **Code Quality**: Linting, type checking, and formatting verification
- ✅ **Performance Monitoring**: Lighthouse CI with strict thresholds
- ✅ **Bundle Size Tracking**: Performance budget enforcement
- ✅ **Dependency Security**: Automated security vulnerability scanning
- ✅ **Deployment Automation**: Automatic deploys from main branch
- ✅ **Deploy Previews**: Every PR gets a preview deployment

### Pipeline Architecture

```text
┌─────────────┐
│  Push/PR    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│     Parallel Quality Checks          │
├──────────────┬──────────┬────────────┤
│ Lint & Type  │  Tests   │ PR Quality │
│   Check      │          │   Check    │
└──────┬───────┴────┬─────┴──────┬─────┘
       │            │            │
       └────────────┴────────────┘
                    │
                    ▼
              ┌──────────┐
              │  Build   │
              └────┬─────┘
                   │
                   ▼
           ┌───────────────┐
           │  Lighthouse   │
           │      CI       │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │  CI Success   │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │   Deploy to   │
           │    Netlify    │
           └───────────────┘
```

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

Main continuous integration workflow that runs on all pushes and pull requests.

#### Jobs

#### Lint and Type Check

- Runs Prettier format check
- Executes ESLint
- Performs TypeScript type checking
- **Trigger**: On push/PR to main or develop

#### Test

- Runs Vitest test suite (455 tests)
- Generates coverage reports
- Uploads coverage to Codecov
- Creates coverage summary in PR
- **Coverage Artifacts**: Retained for 30 days
- **Trigger**: On push/PR to main or develop

#### Build

- Compiles TypeScript
- Bundles application with Vite
- Uploads build artifacts
- **Artifact Retention**: 7 days
- **Depends On**: Lint & Type Check, Tests
- **Trigger**: On push/PR to main or develop

#### Lighthouse CI

- Runs Lighthouse audits (3 runs per check)
- Enforces performance/accessibility thresholds
- Uploads detailed reports
- **Thresholds**:
  - Performance: ≥90
  - Accessibility: ≥95
  - Best Practices: ≥90
  - SEO: ≥90
- **Core Web Vitals**:
  - FCP: ≤2000ms
  - LCP: ≤2500ms
  - CLS: ≤0.1
  - TBT: ≤300ms
- **Depends On**: Build
- **Trigger**: On push/PR to main or develop

#### CI Success

- Aggregates all job results
- Provides single status check for branch protection
- Displays comprehensive status summary
- **Depends On**: All jobs above
- **Trigger**: Always (even if jobs fail)

### 2. PR Quality Check (`.github/workflows/pr-quality-check.yml`)

Additional quality checks specific to pull requests.

#### Jobs

#### PR Metadata

- Analyzes PR size (files, lines changed)
- Warns if PR is too large (>1000 lines)
- Validates PR title format (conventional commits)
- **Trigger**: On PR open/update

#### Dependency Review

- Scans for security vulnerabilities in dependencies
- Fails on moderate+ severity issues
- Posts summary comment on PR when issues found
- **Trigger**: PRs to main branch only

#### Bundle Size Check

- Builds application
- Analyzes bundle size
- Lists largest assets
- Warns if any JS bundle exceeds 200KB
- **Performance Budget**: 200KB per JS bundle
- **Trigger**: On PR open/update

#### Quality Summary

- Aggregates all PR quality check results
- Creates comprehensive quality report
- **Depends On**: All PR quality jobs
- **Trigger**: Always (even if checks fail)

### 3. Deployment Status (`.github/workflows/deployment-status.yml`)

Monitors Netlify deployment status and provides notifications.

#### Jobs

#### Deployment Notification

- Tracks deployment success/failure
- Posts deployment URL to PR
- Reports deployment environment
- **Trigger**: On Netlify deployment status change

## Quality Gates

### Required Checks (Branch Protection)

The following checks must pass before merging to `main`:

1. ✅ **CI Success** - All CI jobs pass
2. ✅ **Netlify Deploy Preview** - Deployment successful
3. ✅ **Code Review** - At least 1 approval required

### Performance Thresholds

All thresholds are enforced by Lighthouse CI:

| Metric | Threshold | Category |
|--------|-----------|----------|
| Performance Score | ≥90 | Performance |
| Accessibility Score | ≥95 | Accessibility |
| Best Practices Score | ≥90 | Quality |
| SEO Score | ≥90 | SEO |
| First Contentful Paint | ≤2000ms | Core Web Vitals |
| Largest Contentful Paint | ≤2500ms | Core Web Vitals |
| Cumulative Layout Shift | ≤0.1 | Core Web Vitals |
| Total Blocking Time | ≤300ms | Performance |

### Bundle Size Budget

- **Per JS Bundle**: 200KB maximum
- **Rationale**: Ensures fast load times, especially on mobile
- **Enforcement**: Warning generated if exceeded

## Deployment Process

### Automatic Deployments

#### Production (main branch)

1. Push to `main` triggers CI pipeline
2. All quality gates must pass
3. Netlify automatically deploys to production
4. Production URL: `paperlyte.app` (when configured)

#### Deploy Previews (PRs)

1. Open/update PR triggers CI pipeline
2. Netlify creates deploy preview
3. Preview URL posted as PR comment
4. Preview updates with each new commit
5. Preview URL format: `deploy-preview-[PR]-[site-name].netlify.app`

### Manual Deployments

Netlify deployments can be triggered manually:

1. Go to Netlify dashboard
2. Select "Deploys" tab
3. Click "Trigger deploy"
4. Choose "Deploy site" or "Clear cache and deploy"

### Rollback

Two rollback options are available:

#### Option 1: Netlify Dashboard (Instant)

1. Go to Netlify → Deploys
2. Find previous stable deployment
3. Click "..." → "Publish deploy"
4. Previous version goes live immediately

#### Option 2: Git Revert

```bash
git revert <commit-hash>
git push origin main
# Netlify will auto-deploy the reverted version
```

## Monitoring and Notifications

### GitHub Actions Notifications

- **In-PR Statuses**: All checks appear in PR "Checks" tab
- **Email Notifications**: Sent to committer on workflow failure
- **Status Badge**: Can be added to README (optional)

### Codecov Integration

- **Coverage Reports**: Uploaded on every PR/push
- **Trend Analysis**: Track coverage changes over time
- **PR Comments**: Coverage diff posted to PRs (when configured)
- **Setup Required**: Add `CODECOV_TOKEN` to repository secrets

### Lighthouse CI Reports

- **Temporary Storage**: Reports available for 7 days at public URL
- **Artifacts**: Full HTML reports in GitHub Actions artifacts (30 days)
- **LHCI Server**: Can self-host for permanent storage (optional)

## Setup Instructions

### Prerequisites

- GitHub repository with admin access
- Netlify account connected to repository
- Node.js 20+ locally for testing

### Initial Setup

#### 1. GitHub Repository Secrets

Add these secrets in repository settings (Settings → Secrets and variables → Actions):

| Secret Name | Required | Purpose | Where to Get |
|------------|----------|---------|--------------|
| `CODECOV_TOKEN` | Optional | Code coverage reporting | [codecov.io](https://codecov.io) → Repository Settings → Copy token |
| `LHCI_GITHUB_APP_TOKEN` | Optional | Lighthouse CI GitHub integration | [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) → Install & configure |
| `ADD_TO_PROJECT_PAT` | Optional | Automatically add PRs to GitHub Projects | GitHub Settings → Developer settings → Personal access tokens → Generate new token with `repo` and `project` scopes |

**Note:** The CI pipeline will run without these tokens, but some features will be limited:
- Without `CODECOV_TOKEN`: Coverage reports won't be uploaded to Codecov (still available as artifacts)
- Without `LHCI_GITHUB_APP_TOKEN`: Lighthouse results won't be commented on PRs (still available as artifacts)
- Without `ADD_TO_PROJECT_PAT`: PRs won't be automatically added to GitHub Projects board

#### 2. Branch Protection Rules

Configure branch protection for `main`:

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Required status checks:
     - `CI Success`
     - `netlify/paperlyte-v2/deploy-preview`
   - ✅ Require pull request reviews before merging (≥1)
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators

#### 3. Netlify Configuration

The `netlify.toml` file is already configured. Verify settings:

1. Log in to Netlify
2. Select site
3. Go to Site settings → Build & deploy
4. Verify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
5. Enable Deploy Previews:
   - Go to Site settings → Build & deploy → Deploy contexts
   - Enable "Deploy Preview" for all pull requests

#### 4. Codecov Setup (Optional)

1. Visit [Codecov](https://codecov.io)
2. Sign in with GitHub
3. Add `paperlyte-v2` repository
4. Copy upload token
5. Add `CODECOV_TOKEN` to GitHub repository secrets
6. Coverage will be tracked on next CI run

### Local Testing

Test the CI pipeline locally before pushing:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type check
npx tsc --noEmit

# Run tests with coverage
npm run test:coverage -- --run

# Build application
npm run build

# Preview build
npm run preview
```

## Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally

**Cause**: Dependency version mismatch or environment differences

**Solution**:

1. **Use lockfile-respecting install**: Run `npm ci` instead of `npm install` to match exact versions from package-lock.json
2. **Verify Node.js version**: Ensure local Node version matches CI (Node 20.x) - check with `node --version`
3. **Clear dependency cache**: Remove `node_modules/` and clear npm cache, then reinstall:
   ```bash
   rm -rf node_modules
   npm cache clean --force
   npm ci
   ```
4. **Check environment variables**: Confirm all CI environment variables and secrets are present locally or properly mocked in test setup
5. **Pin flaky dependencies**: Use `package.json` overrides or resolutions to lock problematic dependency versions
6. **Match CI test command**: Run tests locally with identical flags used in CI workflow (e.g., `npm run test:coverage -- --run`)
7. **Reproduce CI environment**: Use Docker to replicate CI container or enable verbose test logging with `npm test -- --reporter=verbose`
8. **Add diagnostic CI job**: Create a workflow step that prints environment details for easier debugging:
   ```yaml
   - name: Print environment
     run: |
       node --version
       npm --version
       npm list --depth=0
   ```

#### Lighthouse Scores Failing

**Cause**: Performance regression or accessibility issues

**Solution**:
1. Download Lighthouse artifacts from GitHub Actions
2. Open HTML report to see specific issues
3. Fix issues identified in report
4. Test locally:

   ```bash
   npm run build
   npx lhci autorun --config=./.lighthouserc.json
   ```

#### Build Artifacts Missing

**Cause**: Build step failed or artifact retention expired

**Solution**:
1. Check build logs for errors
2. Verify `dist/` directory exists after build
3. Artifacts are retained for 7 days only

#### Codecov Upload Failing

**Cause**: Missing or invalid token, or coverage files not generated

**Solution**:
1. Verify `CODECOV_TOKEN` secret is set
2. Check coverage files exist in `coverage/` directory
3. CI continues even if Codecov upload fails (`fail_ci_if_error: false`)

#### Deploy Preview Not Appearing

**Cause**: Netlify integration issues or PR from fork

**Solution**:
1. Verify Netlify GitHub integration is active
2. Check "Deploy Previews" setting is enabled in Netlify
3. PRs from forks won't trigger deploy previews (security)

### Getting Help

- **CI/CD Issues**: Check GitHub Actions logs for detailed error messages
- **Deployment Issues**: Review Netlify deploy logs
- **Performance Issues**: Analyze Lighthouse report artifacts
- **Coverage Issues**: Review coverage summary in test job

## Maintenance

### Regular Tasks

- **Weekly**: Review failed workflows and address issues
- **Monthly**: Update GitHub Actions versions (Dependabot enabled)
- **Quarterly**: Review and adjust performance thresholds as needed

### Updating Workflows

When modifying workflows:

1. Test changes in a feature branch
2. Verify all jobs pass in PR
3. Get code review approval
4. Monitor first few runs after merge

### Adding New Jobs

When adding new CI jobs:

1. Add job to appropriate workflow file
2. Update `ci-success` job dependencies if required
3. Document new job in this file
4. Update branch protection rules if it's a required check

---

**Last Updated**: 2025-12-23
**Maintained By**: Paperlyte Team
**Issue Reference**: #68
