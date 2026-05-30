# Chrome DevTools MCP

This repository includes a project-level MCP configuration in `.mcp.json` for Playwright MCP with Chrome DevTools capability enabled. Claude Code can load the `playwright` server from the repository root because `.claude/settings.json` explicitly enables that project MCP server.

## Server configuration

The configured server runs:

```bash
npx -y @playwright/mcp@0.0.75 --caps=devtools --browser=chrome
```

The configuration is intentional:

- `@playwright/mcp@0.0.75` pins the current Playwright MCP package instead of floating on `latest`, keeping agent runs reproducible.
- `--caps=devtools` enables the Chrome DevTools capability set for inspection and debugging workflows.
- `--browser=chrome` requests Chrome instead of relying on the package default.
- `PLAYWRIGHT_BROWSERS_PATH=0` makes Playwright resolve project-local browser installs when available.
- `.claude/settings.json` lists `playwright` in `enabledMcpjsonServers`, so Claude Code can approve this project-level MCP server without requiring every developer to configure it manually.

## Requirements

Playwright MCP requires Node.js, npm, and a Chrome or Chrome-compatible browser installation. If your local machine or CI image does not include Chrome, install it before starting the MCP server.

## Quick validation

From the repository root, validate the checked-in JSON files and the pinned MCP package entry point with:

```bash
node -e "for (const file of ['.mcp.json', '.claude/settings.json']) JSON.parse(require('node:fs').readFileSync(file, 'utf8'))"
npx -y @playwright/mcp@0.0.75 --version
```

A full browser session also requires an MCP-capable client to launch the server and a Chrome binary available on the host.
