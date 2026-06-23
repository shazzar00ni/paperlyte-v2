#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "Installing npm dependencies..."
npm install

# Two PPAs in this environment return 403 and cause `apt-get update` to exit
# with code 100, which makes `playwright install --with-deps` fail before it
# can install anything. Disabling them first lets the rest of apt work normally.
echo "Disabling unreachable PPAs..."
sudo rm -f \
  /etc/apt/sources.list.d/deadsnakes-ubuntu-ppa-noble.sources \
  /etc/apt/sources.list.d/ondrej-ubuntu-php-noble.sources

# Install WebKit browser + its OS-level system libraries.
# `--with-deps` is required: `playwright install webkit` alone downloads the
# browser binary but leaves the host missing shared libraries (libwoff1,
# libopus0, libgles2, etc.) that WebKit needs to execute.
echo "Installing Playwright WebKit with system dependencies..."
npx playwright install --with-deps webkit

echo "Session setup complete."
