# GitHub Branch Protection Configuration

This document describes the branch protection setup for the Paperlyte repository.

## Overview

Branch protection rules help maintain code quality by enforcing reviews and status checks before code can be merged into protected branches.

## Protected Branches

### Main Branch (`main`)

The `main` branch is protected with the following rules:

#### Required Status Checks

All of the following CI checks must pass before a pull request can be merged:

1. **Lint and Type Check** (`lint-and-typecheck`)
   - Runs ESLint for code quality
   - TypeScript type checking
   - Code formatting validation
   - Security audit

2. **Build** (`build`)
   - Ensures the application builds successfully
   - Verifies no build errors
   - Generates production artifacts

3. **Lighthouse CI** (`lighthouse`)
   - Performance testing (target: >90 score)
   - Accessibility testing (target: >95 score)
   - Best practices validation
   - SEO checks

4. **CI Success** (`ci-success`)
   - Aggregate check that ensures ALL CI jobs pass
   - Includes: tests, e2e tests, bundle size checks
   - Fails if any required job fails

#### Pull Request Requirements

- **Minimum Approvals**: 1 required
- **Dismiss Stale Reviews**: Enabled (new commits dismiss previous approvals)
- **Require Conversation Resolution**: All review comments must be resolved
- **Force Push**: Disabled
- **Branch Deletion**: Disabled after merge (GitHub default)

#### Additional Settings

- **Linear History**: Not required (allows merge commits)
- **Admin Enforcement**: Disabled (admins can bypass for emergencies)
- **Fork Syncing**: Disabled

## How to Apply Branch Protection

There are two methods to configure branch protection for this repository:

### Method 1: Manual Script Execution (Recommended for Initial Setup)

1. **Create a Personal Access Token**
   - Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Branch Protection Setup")
   - Select scope: **`repo`** (Full control of private repositories)
   - Generate and copy the token

2. **Run the setup script**
   ```bash
   # Export your token
   export GITHUB_TOKEN=your_personal_access_token_here

   # Run the setup script
   ./.github/scripts/setup-branch-protection.sh
   ```

3. **Verify the configuration**
   - Go to [Repository Settings > Branches](https://github.com/shazzar00ni/paperlyte-v2/settings/branches)
   - Check that the `main` branch has protection rules applied

### Method 2: GitHub Actions Workflow (Recommended for Updates)

This method is useful for updating protection rules or setting up protection on new branches.

1. **Configure the BRANCH_PROTECTION_TOKEN secret**
   - Create a Personal Access Token as described in Method 1
   - Go to [Repository Settings > Secrets and variables > Actions](https://github.com/shazzar00ni/paperlyte-v2/settings/secrets/actions)
   - Click "New repository secret"
   - Name: `BRANCH_PROTECTION_TOKEN`
   - Value: Your personal access token
   - Click "Add secret"

2. **Run the workflow**
   - Go to [Actions > Setup Branch Protection](https://github.com/shazzar00ni/paperlyte-v2/actions/workflows/setup-branch-protection.yml)
   - Click "Run workflow"
   - Select the branch to protect (default: `main`)
   - Click "Run workflow"

3. **Check the workflow output**
   - The workflow will validate the branch exists
   - Apply protection rules
   - Display a summary of configured settings

## Workflow Integration

The branch protection rules integrate with the CI/CD pipeline defined in `.github/workflows/ci.yml`:

```
Pull Request Created/Updated
  ↓
Run CI Pipeline
  ├─ Lint and Type Check
  ├─ Tests (with coverage)
  ├─ Build
  ├─ Bundle Size Check
  ├─ Lighthouse CI
  ├─ E2E Tests
  └─ CI Success (aggregates all)
  ↓
Required checks pass → Ready for review
  ↓
1+ Approval + All conversations resolved
  ↓
Merge allowed ✓
```

## Troubleshooting

### Branch protection setup fails with 404

**Problem**: The branch doesn't exist on the remote repository.

**Solution**:
```bash
# Check if branch exists
git ls-remote --heads origin main

# If not, push the branch first
git checkout main
git push -u origin main
```

### Branch protection setup fails with 401/403

**Problem**: Insufficient permissions or invalid token.

**Solutions**:
- Ensure your token has `repo` scope
- Check if your token has expired
- Verify you have admin access to the repository
- Generate a new token if needed

### Required checks not appearing

**Problem**: CI workflow hasn't run yet, so GitHub doesn't know about the checks.

**Solution**:
1. Create and merge at least one PR to generate the checks
2. Or manually trigger the CI workflow
3. Then reapply branch protection

### PR can be merged without approval

**Problem**: Branch protection might not be properly configured.

**Solution**:
1. Verify protection rules at Settings > Branches
2. Ensure "Require a pull request before merging" is enabled
3. Check "Require approvals" is set to at least 1

## Maintenance

### Updating Protection Rules

To modify branch protection rules:

1. Edit `.github/scripts/setup-branch-protection.sh`
2. Update the `PROTECTION_CONFIG` JSON object
3. Commit and push changes
4. Re-run the setup script or workflow

### Adding New Required Checks

When adding new CI jobs that should be required:

1. Update the `checks` array in `setup-branch-protection.sh`
2. Add an object with the job name as `context`
3. Re-run the setup script

Example:
```json
{
  "context": "New Check Name",
  "app_id": -1
}
```

### Removing Protection (Emergency Only)

If you need to temporarily disable protection:

```bash
# Using GitHub CLI (if installed)
gh api -X DELETE /repos/shazzar00ni/paperlyte-v2/branches/main/protection

# Or via web UI
# Go to Settings > Branches > main > Edit > Delete protection rule
```

**Warning**: Only do this in emergencies. Re-enable protection immediately after.

## References

- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub API: Branch Protection](https://docs.github.com/en/rest/branches/branch-protection)
- [GitHub Docs: Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

## Security Considerations

- **Personal Access Tokens**: Treat them like passwords. Never commit them to the repository.
- **Token Scope**: Use minimal necessary scope (`repo` for private repos, `public_repo` for public repos)
- **Token Rotation**: Rotate tokens regularly (every 90 days recommended)
- **GitHub Actions Secrets**: Use secrets for sensitive data, never hardcode tokens
- **Audit Logs**: Review repository settings changes in the audit log regularly

---

**Last Updated**: 2026-01-02
**Maintained By**: Development Team
**Questions?** Open an issue or contact the repository maintainers.
