# Review Guidelines

## CI/CD

- **Node version**: The project uses **Node 20**. All CI systems (GitHub Actions, CircleCI, etc.) must use Node 20 to avoid inconsistent builds. The project uses `sharp` which compiles native bindings per Node major version.
- **No `.nvmrc` or `engines` field exists** — CI configs are the de facto version declarations, so they must stay aligned.
- **npm ci + caching**: When using `npm ci`, cache `~/.npm` (the npm package cache), NOT `node_modules`. `npm ci` always deletes `node_modules` before installing, so caching it is wasted work.
- **Avoid unpinned runtime downloads in CI**: Do not use `npx <package>` for packages not in `package.json` (e.g., `npx serve`). Use existing scripts like `npm run preview` (Vite preview server) or add the package as a pinned devDependency.
- **Workflow gating**: If the pipeline description says Stage N gates Stage N+1, ensure ALL Stage N jobs are in the `requires` list. Don't let builds proceed while unit tests are still running/failing.
- **Undefined commands break CircleCI**: CircleCI fails at config parse time if a command is referenced but not defined. This blocks the entire downstream pipeline.

## Vitest Configuration

- **Reporter config**: `vitest.config.ts` defines default reporters (`default`, `junit`) with `outputFile: { junit: 'junit.xml' }`. CI workflows override this via CLI flags to redirect output to `test-results/junit.xml`. Be aware of this dual source of truth — CLI flags take precedence.
- **Codecov flag**: The project uses the `unittests` flag (not `unit`) for Codecov uploads. This must match `codecov.yml` configuration.

## Build

- **prebuild script**: `package.json` defines a `prebuild` script that runs `generate:icons` and `generate:mockups`. npm automatically runs this before `npm run build`, so CI should NOT run these explicitly — it duplicates work.
- **Build artifacts**: Use `persist_to_workspace` / `attach_workspace` (CircleCI) or `upload-artifact` / `download-artifact` (GitHub Actions) to share `dist/` across jobs. Caching build output keyed by revision is wasteful since it's never reused.

## Playwright E2E

- **Shard indexing**: CircleCI's `CIRCLE_NODE_INDEX` is 0-based, but Playwright `--shard` expects 1-based indices. Always compute `SHARD_INDEX=$((CIRCLE_NODE_INDEX + 1))`.
- **Preview server**: Use `npm run preview -- --host 127.0.0.1 --port 4173` consistently across all jobs that need to serve the built app.

## TODOs

- [ ] **Tighten Lighthouse CI thresholds**: `.lighthouserc.json` gates at Performance ≥ 0.70 and Accessibility ≥ 0.82, but `AGENTS.md` targets Performance > 90 and Accessibility > 95. Bump `minScore` values in `.lighthouserc.json` to match the documented targets so regressions are caught by CI.
- [ ] **Consolidate Vitest reporter config**: `vitest.config.ts` sets `outputFile: { junit: 'junit.xml' }` but CI overrides it via CLI flags to `test-results/junit.xml`. Update `vitest.config.ts` to use `test-results/junit.xml` as the default and remove the CLI override to have a single source of truth.
- [ ] **Add `engines` field to `package.json`**: No `.nvmrc`, `.node-version`, or `engines` field exists. Add `"engines": { "node": ">=20" }` to make the required Node version explicit project-wide.
- [ ] **Resolve duplicate CI systems**: Both GitHub Actions (`.github/workflows/ci.yml`) and CircleCI (`.circleci/config.yml`) run the same pipeline stages on every push/PR, doubling compute costs. Decide on a primary CI system or document the multi-platform strategy.
- [x] **~~Cache `~/.npm` instead of `node_modules` in CircleCI~~**: Already resolved — `save-node-cache` correctly caches `~/.npm`.
- [ ] **Migrate nightly workflow to scheduled pipelines**: The `nightly-e2e` workflow uses the legacy `triggers` → `schedule` syntax which is deprecated. Migrate to CircleCI Scheduled Pipelines for better reliability.
