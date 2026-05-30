# Chrome DevTools MCP

This repository includes a project-level MCP configuration for Chrome DevTools in `.mcp.json`.
MCP-capable clients that support project configuration can load the `chrome-devtools` server from the repository root.

## Server configuration

The configured server runs:

```bash
npx -y chrome-devtools-mcp@latest --headless --isolated --viewport=1440x900 --no-usage-statistics --no-performance-crux
```

The flags are intentional:

- `--headless` keeps browser automation compatible with non-interactive development environments.
- `--isolated` creates a temporary Chrome profile for each session and cleans it up when the browser closes.
- `--viewport=1440x900` gives screenshots and layout checks a predictable desktop viewport.
- `--no-usage-statistics` opts out of Chrome DevTools MCP usage telemetry.
- `--no-performance-crux` prevents performance tools from sending traced URLs to the CrUX API for field data lookup.
- `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=true` disables background update checks for reproducible agent runs.

## Requirements

Chrome DevTools MCP requires Node.js, npm, and a supported Google Chrome or Chrome for Testing installation.
If your local machine or CI image does not include Chrome, install it before starting the MCP server.

## Quick validation

From the repository root, validate the checked-in MCP JSON and the installed package entry point with:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('.mcp.json', 'utf8'))"
npx -y chrome-devtools-mcp@latest --version
```

A full browser session also requires an MCP client to launch the server and a Chrome binary available on the host.
