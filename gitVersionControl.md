# Paperlyte Git & Version Control Guidelines

## Purpose & Scope

This document defines Git workflows, branching strategies, commit conventions, and version control best practices for the Paperlyte project.

---

## Git Workflow

### Branch Strategy (GitFlow)

```
main (production)
  └── release/* (release candidates)
      └── develop (integration)
          ├── feature/* (new features)
          ├── bugfix/* (bug fixes)
          └── hotfix/* (emergency fixes from main)
```

### Branch Types

#### Main Branches

**`main`**

- Production-ready code
- Always deployable
- Protected (requires PR + approval)
- Tagged with version numbers
- Direct commits forbidden

**`develop`**

- Integration branch
- Latest development changes
- Automatically deployed to staging
- Protected (requires PR + approval)

#### Supporting Branches

**`feature/*`**

- New features and enhancements
- Branch from: `develop`
- Merge to: `develop`
- Naming: `feature/description` or `feature/TICKET-123-description`
- Delete after merge

**`bugfix/*`**

- Bug fixes for develop
- Branch from: `develop`
- Merge to: `develop`
- Naming: `bugfix/description` or `bugfix/TICKET-123-description`
- Delete after merge

**`hotfix/*`**

- Critical production fixes
- Branch from: `main`
- Merge to: `main` AND `develop`
- Naming: `hotfix/description` or `hotfix/TICKET-123-description`
- Delete after merge

**`release/*`**

- Release preparation
- Branch from: `develop`
- Merge to: `main` AND `develop`
- Naming: `release/v1.2.3`
- Delete after merge

---

## Branch Naming Conventions

### Format

```
<type>/<ticket>-<description>

Examples:
feature/DOC-123-document-sharing
bugfix/AUTH-456-token-expiry
hotfix/SEC-789-xss-vulnerability
release/v1.2.0
```

### Rules

- Use lowercase
- Separate words with hyphens
- Keep descriptions concise (< 50 chars)
- Include ticket number when applicable
- Be descriptive but brief

### Examples

**Good:**

```
feature/document-sharing
feature/DOC-123-real-time-collaboration
bugfix/AUTH-456-session-timeout
hotfix/PERF-789-memory-leak
```

**Bad:**

```
feature/my-feature          # Not descriptive
Feature/Document-Sharing    # Inconsistent case
feature/a                   # Too short
feature/implement-the-new-document-sharing-feature-that-allows-users  # Too long
```

---

## Commit Message Conventions

### Format (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, semicolons, etc.)
- **refactor:** Code refactoring (no functionality change)
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (deps, build, etc.)
- **security:** Security fixes
- **revert:** Reverting previous commit

### Scope (Optional)

Component or area of change:

- `auth` - Authentication
- `api` - API changes
- `ui` - User interface
- `db` - Database
- `docs` - Documentation
- `test` - Tests

### Subject Rules

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Max 50 characters
- Be specific and clear

### Body (Optional)

- Wrap at 72 characters
- Explain what and why, not how
- Include motivation for change
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-authored-by: Name <email>`

### Examples

**Simple commit:**

```
feat(auth): add two-factor authentication

Implements TOTP-based 2FA using speakeasy library.
Users can enable 2FA in their security settings.

Closes #234
```

**Bug fix:**

```
fix(api): resolve token expiry issue

JWT tokens were expiring after 1 hour instead of 7 days
due to incorrect configuration in authService.

The JWT_EXPIRY env variable was being parsed as a string
instead of a number, causing the expiry calculation to fail.

Fixes #567
```

**Breaking change:**

```
feat(api)!: update authentication endpoints

BREAKING CHANGE: The /api/auth/login endpoint now requires
a `deviceId` parameter for session management. All clients
must be updated to include this field.

Old format:
POST /api/auth/login
{ "email": "...", "password": "..." }

New format:
POST /api/auth/login
{ "email": "...", "password": "...", "deviceId": "..." }

Closes #890
```

**Multiple changes:**

```
refactor(services): extract validation logic

- Move email validation to separate utility
- Create reusable validator functions
- Add tests for validation utilities

This refactoring makes validation logic reusable across
different services and improves test coverage.
```

---

## Commit Best Practices

### Do's ✅

**Make atomic commits:**

```bash
# ✅ Good: Each commit is a logical unit
git commit -m "feat(auth): add password strength validation"
git commit -m "feat(auth): add password reset functionality"
git commit -m "test(auth): add tests for password features"
```

**Write descriptive messages:**

```bash
# ✅ Good: Clear what and why
feat(api): add pagination to document list endpoint

Users were experiencing slow load times with large document
collections. This adds cursor-based pagination with a default
limit of 25 documents per page.

Closes #456
```

**Commit often:**

```bash
# ✅ Good: Small, frequent commits
git commit -m "feat(ui): add document card component"
git commit -m "feat(ui): add loading state to document card"
git commit -m "feat(ui): add error handling to document card"
```

### Don'ts ❌

**Avoid vague messages:**

```bash
# ❌ Bad: What changed? Why?
git commit -m "fix stuff"
git commit -m "update"
git commit -m "WIP"
```

**Avoid huge commits:**

```bash
# ❌ Bad: Too many changes in one commit
git commit -m "add entire authentication system with tests and docs"
```

**Avoid mixing concerns:**

```bash
# ❌ Bad: Unrelated changes in one commit
git commit -m "add document sharing, fix login bug, update README"
```

---

## Pull Request Process

### Creating a PR

1. **Update branch:**

```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop  # or git rebase develop
```

2. **Clean up commits (if needed):**

```bash
# Interactive rebase to squash/reword commits
git rebase -i develop

# Or squash all commits into one
git merge --squash feature/my-feature
```

3. **Push and create PR:**

```bash
git push origin feature/my-feature
# Create PR on GitHub
```

### PR Title Format

```
[TYPE] Brief description

Examples:
feat: Add document sharing functionality
fix: Resolve authentication token expiry
refactor: Extract validation logic to service layer
```

### Merging Strategies

**Squash and Merge (Preferred):**

- All commits squashed into one
- Clean history on main/develop
- Use for most feature branches

**Merge Commit:**

- Preserves all commits
- Shows branch history
- Use for releases

**Rebase and Merge:**

- Linear history
- Individual commits preserved
- Use for small, clean branches

---

## Git Commands Reference

### Daily Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Update from develop
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop

# Create PR and merge
# (via GitHub UI)

# Clean up after merge
git checkout develop
git pull origin develop
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Useful Commands

```bash
# View commit history
git log --oneline --graph --all

# Amend last commit
git commit --amend -m "new message"

# Unstage files
git restore --staged <file>

# Discard local changes
git restore <file>

# Stash changes
git stash save "WIP: feature description"
git stash list
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Create tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Delete branch
git branch -d feature/old-feature
git push origin --delete feature/old-feature

# View changes
git diff
git diff --staged
git diff develop..feature/my-feature

# Interactive rebase
git rebase -i HEAD~3  # Last 3 commits
git rebase -i develop
```

---

## Versioning (Semantic Versioning)

### Format: `MAJOR.MINOR.PATCH`

**MAJOR** (v2.0.0)

- Incompatible API changes
- Breaking changes
- Major feature overhauls

**MINOR** (v1.1.0)

- New features
- Backward-compatible functionality
- Enhancements

**PATCH** (v1.0.1)

- Bug fixes
- Security patches
- Backward-compatible fixes

### Pre-release Versions

```
v1.2.0-alpha.1    # Alpha release
v1.2.0-beta.2     # Beta release
v1.2.0-rc.1       # Release candidate
```

### Version Tags

```bash
# Create version tag
git tag -a v1.2.3 -m "Release version 1.2.3"

# Push tag to remote
git push origin v1.2.3

# Push all tags
git push origin --tags

# List tags
git tag -l

# Delete tag
git tag -d v1.2.3
git push origin --delete v1.2.3
```

---

## Release Process

### 1. Create Release Branch

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
```

### 2. Prepare Release

```bash
# Update version in package.json
npm version 1.2.0

# Update CHANGELOG.md
# Run final tests
npm test

# Commit changes
git commit -m "chore(release): prepare v1.2.0"
```

### 3. Merge to Main

```bash
git checkout main
git pull origin main
git merge release/v1.2.0

# Create tag
git tag -a v1.2.0 -m "Release v1.2.0"

# Push
git push origin main
git push origin v1.2.0
```

### 4. Merge Back to Develop

```bash
git checkout develop
git merge release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

---

## Hotfix Process

### 1. Create Hotfix Branch

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
```

### 2. Fix and Test

```bash
# Make fix
git add .
git commit -m "fix: resolve critical security issue"

# Test thoroughly
npm test
```

### 3. Merge to Main

```bash
git checkout main
git merge hotfix/critical-bug

# Bump patch version
git tag -a v1.2.1 -m "Hotfix v1.2.1"

git push origin main
git push origin v1.2.1
```

### 4. Merge to Develop

```bash
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug
```

---

## Git Configuration

### Global Config

```bash
# Set name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default editor
git config --global core.editor "code --wait"

# Set default branch name
git config --global init.defaultBranch main

# Enable colors
git config --global color.ui auto

# Configure line endings
git config --global core.autocrlf input  # Mac/Linux
git config --global core.autocrlf true   # Windows

# Set pull strategy
git config --global pull.rebase false
```

### Project Config

```bash
# .gitconfig (project level)
[core]
    autocrlf = input
    editor = code --wait

[pull]
    rebase = false

[merge]
    conflictstyle = diff3

[alias]
    st = status
    co = checkout
    br = branch
    cm = commit
    lg = log --oneline --graph --all
```

### Useful Aliases

```bash
# Add to ~/.gitconfig or .git/config

[alias]
    # Status and info
    st = status -sb
    lg = log --oneline --graph --all --decorate
    last = log -1 HEAD --stat

    # Branching
    co = checkout
    br = branch
    branches = branch -a

    # Committing
    cm = commit -m
    amend = commit --amend --no-edit

    # Staging
    unstage = restore --staged

    # Clean up
    cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
```

---

## .gitignore

### Comprehensive .gitignore

```bash
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/
out/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Database
*.sqlite
*.db

# Temporary files
tmp/
temp/
*.tmp

# Misc
.cache/
.parcel-cache/
```

---

## Protected Branch Settings

### GitHub Branch Protection Rules

**For `main` branch:**

- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
  - CI tests
  - Linter
  - Security scan
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators
- ✅ Restrict pushes (no direct commits)

**For `develop` branch:**

- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Allow force pushes (admin only)

---

## Troubleshooting

### Undo Last Commit (Not Pushed)

```bash
# Keep changes in working directory
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Undo Pushed Commit

```bash
# Create revert commit
git revert HEAD
git push origin main
```

### Fix Wrong Branch

```bash
# Move commits to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>

# Remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### Resolve Merge Conflicts

```bash
# During merge
git merge develop
# CONFLICT (content): Merge conflict in file.ts

# Fix conflicts in editor
# Then:
git add file.ts
git commit -m "merge: resolve conflicts with develop"
```

### Recover Deleted Branch

```bash
# Find commit hash
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

---

## Best Practices

### Do's ✅

- Commit early and often
- Write clear commit messages
- Keep commits atomic
- Pull before pushing
- Review changes before committing
- Use branches for everything
- Delete merged branches
- Tag releases
- Keep commit history clean
- Communicate with team

### Don'ts ❌

- Don't commit secrets or credentials
- Don't force push to shared branches
- Don't commit generated files
- Don't mix unrelated changes
- Don't use vague commit messages
- Don't skip pull requests
- Don't work directly on main/develop
- Don't commit broken code
- Don't rewrite public history
- Don't ignore merge conflicts

---

## Useful Resources

```bash
# Git cheat sheet
git help <command>

# View git manual
man git

# Common commands help
git help workflows
git help tutorial
```

---

**Version control is the foundation of collaborative development. Use it wisely!** 📝
