#!/usr/bin/env bash
# release.sh — Semantic versioning release automation for Paperlyte
#
# Usage:
#   ./scripts/release.sh patch    # 1.0.0 → 1.0.1
#   ./scripts/release.sh minor    # 1.0.0 → 1.1.0
#   ./scripts/release.sh major    # 1.0.0 → 2.0.0
#   ./scripts/release.sh 1.2.3    # exact version

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[release]${NC} $*"; }
success() { echo -e "${GREEN}[release]${NC} $*"; }
warn()    { echo -e "${YELLOW}[release]${NC} $*"; }
error()   { echo -e "${RED}[release]${NC} $*" >&2; exit 1; }

# ── Validate args ─────────────────────────────────────────────────────────────
BUMP="${1:-}"
if [[ -z "$BUMP" ]]; then
  error "Usage: $0 <patch|minor|major|x.y.z>"
fi

# ── Ensure clean working tree ─────────────────────────────────────────────────
if [[ -n "$(git status --porcelain)" ]]; then
  error "Working tree is dirty. Commit or stash changes before releasing."
fi

# ── Ensure we're on main ──────────────────────────────────────────────────────
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  warn "You are on branch '$CURRENT_BRANCH', not 'main'."
  read -r -p "Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || error "Aborted."
fi

# ── Pull latest ───────────────────────────────────────────────────────────────
info "Fetching latest from origin..."
git fetch origin "$CURRENT_BRANCH"
read -r AHEAD_COUNT BEHIND_COUNT <<< "$(git rev-list --left-right --count "HEAD...origin/$CURRENT_BRANCH")"
if (( BEHIND_COUNT > 0 && AHEAD_COUNT == 0 )); then
  error "Local branch is behind origin/$CURRENT_BRANCH. Pull or rebase first."
elif (( AHEAD_COUNT > 0 && BEHIND_COUNT == 0 )); then
  error "Local branch is ahead of origin/$CURRENT_BRANCH. Push your commits or reset before releasing."
elif (( AHEAD_COUNT > 0 && BEHIND_COUNT > 0 )); then
  error "Local branch has diverged from origin/$CURRENT_BRANCH. Reconcile the branches before releasing."
fi

# ── Determine current version ─────────────────────────────────────────────────
CURRENT_VERSION="$(node -p "require('./package.json').version")"
info "Current version: v${CURRENT_VERSION}"

# ── Calculate next version ────────────────────────────────────────────────────
bump_version() {
  local version="$1" part="$2"
  IFS='.' read -r major minor patch <<< "$version"
  case "$part" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "${major}.$((minor + 1)).0" ;;
    patch) echo "${major}.${minor}.$((patch + 1))" ;;
    *)     echo "$part" ;; # exact version passed
  esac
}

if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$BUMP"
elif [[ "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  NEW_VERSION="$(bump_version "$CURRENT_VERSION" "$BUMP")"
else
  error "Invalid argument '$BUMP'. Use patch|minor|major or x.y.z"
fi

TAG="v${NEW_VERSION}"

# Check tag doesn't already exist
if git rev-parse "$TAG" &>/dev/null; then
  error "Tag $TAG already exists."
fi

info "New version: ${TAG}"
read -r -p "Release ${TAG}? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || error "Aborted."

# ── Update CHANGELOG.md ───────────────────────────────────────────────────────
CHANGELOG="CHANGELOG.md"
TODAY="$(date +%Y-%m-%d)"

if ! grep -q "## \[Unreleased\]" "$CHANGELOG"; then
  error "No [Unreleased] section found in $CHANGELOG. Add changes before releasing."
fi

info "Updating $CHANGELOG..."

# Replace ## [Unreleased] header with versioned header, insert new empty [Unreleased]
UNRELEASED_BLOCK="## [Unreleased]

_No unreleased changes._

### Added

- N/A

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

"

# Use perl for portable multi-line replacement
perl -i -0pe "
  s/## \[Unreleased\]/## [Unreleased]\n\n_No unreleased changes._\n\n### Added\n\n- N\/A\n\n### Changed\n\n- N\/A\n\n### Deprecated\n\n- N\/A\n\n### Removed\n\n- N\/A\n\n### Fixed\n\n- N\/A\n\n### Security\n\n- N\/A\n\n## [${NEW_VERSION}] - ${TODAY}/
" "$CHANGELOG"

# ── Update package.json version ───────────────────────────────────────────────
info "Updating package.json..."
npm version "$NEW_VERSION" --no-git-tag-version --no-workspaces-update

# ── Commit ────────────────────────────────────────────────────────────────────
info "Committing release..."
git add "$CHANGELOG" package.json package-lock.json
git commit -m "chore(release): ${TAG}"

# ── Tag ───────────────────────────────────────────────────────────────────────
info "Tagging ${TAG}..."
git tag -a "$TAG" -m "Release ${TAG}"

# ── Push ──────────────────────────────────────────────────────────────────────
info "Pushing commit and tag to origin..."
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

success "Released ${TAG}!"
echo ""
echo "  GitHub Actions will now build and publish the release."
echo "  Track progress: https://github.com/shazzar00ni/paperlyte-v2/actions"
echo "  Release page:   https://github.com/shazzar00ni/paperlyte-v2/releases/tag/${TAG}"
