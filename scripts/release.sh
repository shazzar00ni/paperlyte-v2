#!/usr/bin/env bash
# release.sh — Semantic versioning release automation for Paperlyte
#
# Usage:
#   ./scripts/release.sh patch    # 1.0.0 → 1.0.1
#   ./scripts/release.sh minor    # 1.0.0 → 1.1.0
#   ./scripts/release.sh major    # 1.0.0 → 2.0.0
#   ./scripts/release.sh 1.2.3    # exact version

set -euo pipefail

# ── Resolve repo root ─────────────────────────────────────────────────────────
# Always run from the repository root, regardless of the caller's working
# directory, so git/npm/node commands reliably find their config files.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

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

UPSTREAM_REMOTE="$(git config --get "branch.${CURRENT_BRANCH}.remote" || true)"
if [[ -z "$UPSTREAM_REMOTE" ]]; then
  error "No upstream remote is configured for branch '$CURRENT_BRANCH'. Set an upstream branch before releasing."
fi

# ── Pull latest ───────────────────────────────────────────────────────────────
info "Fetching latest from ${UPSTREAM_REMOTE}..."
git fetch "$UPSTREAM_REMOTE" "$CURRENT_BRANCH"
read -r AHEAD_COUNT BEHIND_COUNT <<< "$(git rev-list --left-right --count "HEAD...${UPSTREAM_REMOTE}/$CURRENT_BRANCH")"
if (( BEHIND_COUNT > 0 && AHEAD_COUNT == 0 )); then
  error "Local branch is behind ${UPSTREAM_REMOTE}/$CURRENT_BRANCH. Pull or rebase first."
elif (( AHEAD_COUNT > 0 && BEHIND_COUNT == 0 )); then
  error "Local branch is ahead of ${UPSTREAM_REMOTE}/$CURRENT_BRANCH. Push your commits or reset before releasing."
elif (( AHEAD_COUNT > 0 && BEHIND_COUNT > 0 )); then
  error "Local branch has diverged from ${UPSTREAM_REMOTE}/$CURRENT_BRANCH. Reconcile the branches before releasing."
fi

# ── Determine current version ─────────────────────────────────────────────────
CURRENT_VERSION="$(node -p "require('./package.json').version")"
info "Current version: v${CURRENT_VERSION}"

# ── Calculate next version ────────────────────────────────────────────────────
bump_version() {
  local version="$1" part="$2"
  # Strip any pre-release suffix before arithmetic (e.g. "1.0.0-beta.1" → "1.0.0")
  local semver_core="${version%%-*}"
  IFS='.' read -r major minor patch <<< "$semver_core"
  if ! [[ "$major" =~ ^[0-9]+$ && "$minor" =~ ^[0-9]+$ && "$patch" =~ ^[0-9]+$ ]]; then
    error "Cannot increment version '$version': major/minor/patch must be numeric integers. Pass an exact version (x.y.z) instead."
  fi
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

# Check tag doesn't already exist locally or on origin
info "Checking tag ${TAG} does not already exist..."
git fetch --tags origin 2>/dev/null || true
if git rev-parse "refs/tags/${TAG}" &>/dev/null; then
  error "Tag ${TAG} already exists locally."
fi
if git ls-remote --tags origin "refs/tags/${TAG}" | grep -q "refs/tags/${TAG}"; then
  error "Tag ${TAG} already exists on origin."
fi

info "New version: ${TAG}"
read -r -p "Release ${TAG}? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || error "Aborted."

# ── Update CHANGELOG.md ───────────────────────────────────────────────────────
# NOTE: CHANGELOG.md is the authoritative human-readable changelog for the repo.
# GitHub Release bodies are auto-generated separately by
# mikepenz/release-changelog-builder-action in .github/workflows/release.yml and
# are based on PR labels/titles — not CHANGELOG.md entries. Both are intentionally
# maintained: CHANGELOG.md for the repository history, GitHub Releases for the
# release page. If you change the CHANGELOG format, update the release-changelog-
# builder configuration at .github/changelog-config.json accordingly.
CHANGELOG="CHANGELOG.md"
TODAY="$(date +%Y-%m-%d)"

if ! grep -q "## \[Unreleased\]" "$CHANGELOG"; then
  error "No [Unreleased] section found in $CHANGELOG. Add changes before releasing."
fi

info "Updating $CHANGELOG..."

# Replace the [Unreleased] heading with a fresh scaffold, then insert the new
# versioned heading followed by the captured [Unreleased] content so existing
# entries are moved under the new version rather than discarded.
# The (.*?) capture group preserves content; \1 appends it after the heading.
# The (?=\n## \[) lookahead stops the match at the next version section without
# consuming it. -0777 slurps the whole file so .* can span newlines (/s flag).
perl -i -0777pe \
  's/## \[Unreleased\](.*?)(?=\n## \[)/## [Unreleased]\n\n### Added\n\n- N\/A\n\n### Changed\n\n- N\/A\n\n### Deprecated\n\n- N\/A\n\n### Removed\n\n- N\/A\n\n### Fixed\n\n- N\/A\n\n### Security\n\n- N\/A\n\n## ['"${NEW_VERSION}"'] - '"${TODAY}"'\1/s' \
  "$CHANGELOG"

# Update the Keep a Changelog comparison link footer. Derive the repo URL
# dynamically from the git remote so the script works in forks.
REMOTE_URL="$(git config --get remote.origin.url || true)"
if [[ -n "$REMOTE_URL" ]]; then
  REPO_URL="$(printf '%s' "$REMOTE_URL" | perl -pe 's#^git@github\.com:(.+?)(?:\.git)?$#https://github.com/$1#; s#^https?://github\.com/(.+?)(?:\.git)?$#https://github.com/$1#; s#/$##;')"
  PREVIOUS_TAG="v${CURRENT_VERSION}"

  info "Updating changelog comparison links..."
  REPO_URL="$REPO_URL" TAG="$TAG" NEW_VERSION="$NEW_VERSION" PREVIOUS_TAG="$PREVIOUS_TAG" perl -i -0pe '
    my $unreleased = "[Unreleased]: $ENV{REPO_URL}/compare/$ENV{TAG}...HEAD";
    my $released   = "[$ENV{NEW_VERSION}]: $ENV{REPO_URL}/compare/$ENV{PREVIOUS_TAG}...$ENV{TAG}";

    if (s/^\[Unreleased\]: .*$/$unreleased/m) {
      1;
    } else {
      $_ .= "\n" unless /\n\z/;
      $_ .= "$unreleased\n";
    }

    if (s/^\[\Q$ENV{NEW_VERSION}\E\]: .*$/$released/m) {
      1;
    } else {
      $_ .= "$released\n";
    }
  ' "$CHANGELOG"
else
  warn "Could not determine origin remote; skipping changelog comparison link update."
fi

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

# ── Push (atomic: commit and tag land together or neither does) ───────────────
info "Pushing commit and tag to origin (atomic)..."
git push --atomic origin "$CURRENT_BRANCH" "$TAG"

success "Released ${TAG}!"
echo ""
echo "  GitHub Actions will now build and publish the release."
if [[ -n "${REPO_URL:-}" ]]; then
  echo "  Track progress: ${REPO_URL}/actions"
  echo "  Release page:   ${REPO_URL}/releases/tag/${TAG}"
fi
