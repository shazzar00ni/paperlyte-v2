# Decisions

This file tracks key architectural, design, and technical decisions made during development.

## Supabase MCP server added at project scope (2026-07-12)

- **Decision**: Added a `supabase` entry to `.mcp.json` (`type: "http"`, url pointing at `https://mcp.supabase.com/mcp?project_ref=yzrvtzgljsaxetmctplb`), matching what `claude mcp add --scope project --transport http supabase ...` would generate.
- **Update (2026-07-14)**: Added `&read_only=true` to the URL per Codex PR review — Supabase's own MCP docs recommend defaulting to read-only (runs SQL via a read-only role, disables migrations/function-deploy/branch-ops) so agent sessions can't accidentally mutate the shared project. A writable config can be added explicitly if a dev-only session needs it.
- **Not done (needs a human, interactive session)**: OAuth authentication (`claude /mcp` → select `supabase` → Authenticate) can't run in a non-interactive remote session. Optional `npx skills add supabase/agent-skills` step was also left undone — it's marked optional in the setup instructions and wasn't requested beyond the standard 3-step guide.
- **Action for future sessions**: If Supabase MCP tools appear unauthenticated/unavailable, that's expected until a user runs `claude /mcp` locally to complete the OAuth flow.

## CSP — `auto-events.js` / `proxy.js` console errors are extension noise (2026-06-30)

- **Decision**: Do **not** change the CSP in response to console errors of the form "Refused to load the script `https://<deploy>/auto-events.js` (or `/proxy.js`) because it violates ... `script-src 'nonce-…' 'strict-dynamic' 'self' https://plausible.io`". No code fix is warranted — the policy is behaving exactly as designed.
- **Diagnosis**: Neither `auto-events.js` nor `proxy.js` exists in or is referenced by this project (not in the repo, `public/`, `index.html`, or any source), and neither is a Plausible script variant. They are injected into the page by a **browser extension** in the visitor's browser (a classic root-path injection pattern). Because they are parser-inserted outside our trusted nonce chain, `'strict-dynamic'` correctly refuses them.
- **Why there's no safe fix**: `'strict-dynamic'` disables host-based allowlisting by design (the console message says so), so the `'self'`/`https://plausible.io` entries cannot "allow" these scripts. The only way to unblock them would be to drop `'strict-dynamic'`, which would gut the nonce-based XSS protection built in PR #1091 (`netlify/edge-functions/waf.ts` `buildCsp`). Our own scripts are unaffected: `index.html` scripts carry the per-request nonce, and analytics providers load a single validated `.js` via `document.createElement('script')`, which `'strict-dynamic'` transitively trusts.
- **How to confirm**: Load the deploy in a clean/incognito profile with extensions disabled — the errors disappear. They only appear for visitors who have the injecting extension installed and are harmless (no effect on site functionality).
- **Observability**: There is currently no CSP reporting directive (`report-uri`/`report-to`) or `securitypolicyviolation` listener, so these violations are console-only and do not reach Sentry. If CSP violation reporting is ever wired up to Sentry/LogRocket or similar, these same extension-injected `auto-events.js`/`proxy.js` violations will be captured there too — filter or ignore them rather than triaging them as production issues.
- **Action for future sessions**: Treat these specific errors as external noise. Do not weaken the CSP to silence them.

## CI / GitHub Actions — SonarCloud (2026-06-16, reversed 2026-07-02)

- **Superseded 2026-07-02**: A security review flagged the hand-rolled `wget` + SHA-256 download as risky (self-referential checksum — the digest verifying the binary lived in the same file an attacker with write access could also edit). Switched to `SonarSource/sonarqube-scan-action`, pinned to a commit SHA (`713881670b6b3676cda39549040e2d88c70d582e`, `v8.2.0`), which delegates binary retrieval/integrity to the upstream-maintained action.
  - This reverses the 2026-06-16 decision below to avoid that action class. The original rationale (`binaries.sonarsource.com` returning `403 host_not_allowed`) was verified to be specific to the **restricted proxy this Claude Code session runs behind**, not the actual GitHub-hosted runners where the workflow executes (confirmed by `curl`-ing the endpoint directly from a Claude Code session vs. checking that GitHub-hosted runners have unrestricted outbound access by default). If this workflow ever moves to self-hosted or network-restricted runners, re-verify `binaries.sonarsource.com` reachability before relying on this action.
  - `SONAR_PROJECT_KEY`/`SONAR_ORGANIZATION` are still passed as `-D` args (now via the action's `args:` input, quoted — `-Dsonar.projectKey="${{ vars.SONAR_PROJECT_KEY }}"` — to preserve the zizmor-motivated safety property below and avoid word-splitting if a value ever contains spaces).
  - **PR**: #1274 on branch `claude/sonarscanner-download-security-fzxqi9`
- **Original decision (2026-06-16, no longer in effect)**: Download SonarScanner CLI from Maven Central (`repo1.maven.org`) instead of `binaries.sonarsource.com` or the `SonarSource/sonarcloud-github-action`.
- **Original rationale**: `binaries.sonarsource.com` returns `403 host_not_allowed` in restricted network environments (e.g. Claude Code remote sessions). Maven Central is accessible and publishes the same artifacts.
- **Original implementation** (superseded, kept for history):
  - SHA-256 pinned directly in the workflow (`ef72465a...`) — more secure than fetching `.sha256` at runtime since a compromised Maven Central cannot produce a matching archive without also compromising git history.
  - Download and extraction happen in `$RUNNER_TEMP` so no scanner files land in the analyzed workspace (`sonar.projectBaseDir=.`).
  - `set -euo pipefail` for strict error handling; `wget --timeout=60 --tries=3` for resilience.
  - Sonar vars passed via `env:` block to prevent template injection (zizmor finding).
- **SonarCloud analysis will fail** until repo owner sets `SONAR_PROJECT_KEY` and `SONAR_ORGANIZATION` under GitHub Settings → Secrets and variables → Actions → Variables, and `SONAR_TOKEN` under Secrets. This is a configuration gap, not a code bug — still true after the 2026-07-02 change.
- **CodeRabbit false positive**: flagged `actions/checkout` SHA `df4cb1c...` as not matching v6.0.3. This is a false positive — the API returns the annotated tag object SHA (`9f698171...`), not the commit SHA. Dependabot correctly pins the commit SHA. No change needed.
- **All bot review findings addressed**: Codex P1 (SHA verification ✅), Codex P2 (RUNNER_TEMP ✅), CodeRabbit wget timeout ✅, CodeRabbit template injection ✅.
- **PR**: #1085 on branch `claude/clever-pasteur-kzrtI`

## Analytics — trackSocialClick platform normalization (2026-06-29)

- **Decision**: `trackSocialClick(platform)` normalizes its argument by trimming whitespace and lowercasing (`platform.trim().toLowerCase()`) before reporting, with a docstring stating the behavior explicitly.
- **Rationale**: The lowercasing was pre-existing on `main`, but CodeRabbit's "Out of Scope Changes" pre-merge check on #1247 kept flagging it (false positive — not introduced by that refactor). Per CodeRabbit's own suggested resolution, the normalization was moved into a dedicated, properly-scoped PR (#1249) so it is intentional and documented, laying the recurring warning to rest. Trimming was added as a genuine robustness improvement so the change carries real scope.
- **Tests**: Added a whitespace-trimming case alongside the existing lowercase tests in `src/utils/analytics.test.ts`.
- **PR**: #1249 (merged) on branch `claude/tracksocialclick-lowercase-alert-ypgzfn`. All substantive CI gates green; only red statuses were external quota/billing bots (Snyk, CodeRabbit, Codex) and pre-existing repo-wide scans (Dependency Quality, License Compliance, Mintlify config) unrelated to the 2-file diff.

## Sentry / Source Maps (2026-07-11)

- **Decision**: Added `@sentry/vite-plugin` to `vite.config.ts`, instantiated only when `SENTRY_AUTH_TOKEN` env var is present (same conditional pattern as the existing Codecov plugin). `build.sourcemap` set to `'hidden'` (maps generated locally, no `sourceMappingURL` comment shipped in the public JS) and `filesToDeleteAfterUpload: ['dist/**/*.js.map']` removes local `.map` files after upload so they're never published. `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` are deliberately **not** `VITE_`-prefixed (build-time only, never bundled to the client) and documented in `.env.example`. Wired through `.github/workflows/ci.yml`'s build step via `secrets.SENTRY_AUTH_TOKEN`/`vars.SENTRY_ORG`/`vars.SENTRY_PROJECT` (currently unset — a config gap for the repo owner, same pattern as the SonarCloud vars gap above).
- **Context**: The Sentry React SDK (`@sentry/react` in `src/main.tsx`, `src/utils/monitoring.ts`, `ErrorBoundary`) was already fully set up before this session — init, tracing, lazy-loaded session replay, sensitive query-param stripping, CSP already allowing `*.ingest.sentry.io`/`worker-src blob:`. The only gap versus Sentry's current recommended setup was source maps: without them, production stack traces show minified code. This change closes that gap.
- **Note**: `skills.sentry.dev` is blocked by this session's organization egress policy (403 on CONNECT, confirmed via both `curl` and `WebFetch`) — could not fetch the official Sentry "instrument" skill content. The source-map-upload approach above is based on general Sentry/`@sentry/vite-plugin` knowledge, not that specific doc. If a future session can reach `skills.sentry.dev`, worth diffing against it for anything else it recommends.
- **Alternatives considered**: `sourcemap: true` (rejected — leaves a `sourceMappingURL` comment referencing a file that gets deleted post-upload, and briefly exposes source before deletion in some setups); unconditional plugin instantiation (rejected — would fail/no-op noisily on every local dev build without a token).
- **PR #1294 review (gitar-bot, resolved 2026-07-11)**: Two findings, both resolved — (1) "CSS source maps leaked" claim did not hold (verified locally: this build's `cssMinify: true`/esbuild config emits only `.js.map`, never `.css.map`), but broadened the delete glob to `dist/**/*.map` anyway as cheap future-proofing; (2) real bug — the plugin was gated on `SENTRY_AUTH_TOKEN` alone, so a token set before `SENTRY_ORG`/`SENTRY_PROJECT` would build with `undefined` org/project and fail; fixed by requiring all three env vars before instantiating the plugin. Both review threads marked resolved on GitHub.
- **PR #1294 review (coderabbitai, resolved 2026-07-11)**: Real finding — `build.sourcemap: 'hidden'` was unconditional, so before the repo owner actually sets the three `SENTRY_*` build vars, every production build would ship `.map` files into `dist/` with no upload/cleanup step, publicly exposing original source. Fixed by hoisting a `sentryConfigured` boolean (same three-var check) and setting `sourcemap: sentryConfigured ? 'hidden' : false`. Verified: zero `.map` files in `dist/` when unconfigured; hidden maps + plugin invocation both trigger correctly when a (test) token/org/project are set. Thread resolved on GitHub.

## Format

- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Alternatives considered**: What else was considered

---

## Architecture

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Single-page landing page with no client-side router
- **Rationale**: Product is a marketing/waitlist page; no multi-route navigation needed; anchor links + smooth scroll suffice
- **Alternatives considered**: React Router

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: No global state library
- **Rationale**: Landing page has minimal shared state; component-level hooks plus custom hooks (`useTheme`, `useAnalytics`, etc.) cover all needs
- **Alternatives considered**: Zustand, Context API

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: CSS Modules for all component styles
- **Rationale**: Scoped by default, no naming collisions, no runtime overhead
- **Alternatives considered**: Tailwind CSS, styled-components, vanilla CSS

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: TypeScript path aliases (`@/*`, `@components/*`, `@hooks/*`, etc.)
- **Rationale**: Cleaner imports, avoids deep relative paths
- **Alternatives considered**: Relative paths only

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Manual chunk splitting in Vite — `react-vendor` and `fontawesome` chunks
- **Rationale**: Stable third-party bundles cache independently from app code; improves repeat-visit performance
- **Alternatives considered**: Default Vite chunking

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Self-hosted Inter font via `@fontsource/inter` (Latin subset only)
- **Rationale**: Saves ~800KB vs full font; no third-party DNS lookup; GDPR safer
- **Alternatives considered**: Google Fonts CDN

## Analytics

- **Date**: YYYY-MM-DD (unknown), clarified 2026-04-18
- **Decision**: Privacy-first analytics is the stated goal; current runtime uses GA4 (`@utils/analytics`) which does not fully meet that bar — migration to the Plausible module is a known future step
- **Rationale**: Paperlyte brand value is privacy; GA4 is a pragmatic interim choice while the provider-abstraction layer matures
- **Alternatives considered**: Plausible (target), Fathom, Umami, Mixpanel

- **Date**: YYYY-MM-DD (unknown), later clarified 2026-04-18, corrected 2026-06-11
- **Decision**: `useAnalytics()` routes analytics events through `@utils/analytics` (gtag/GA4 wrapper); the Plausible module (`src/analytics/`) exists as an abstraction/provider candidate but is not wired into runtime initialization
- **Rationale**: Reflects the actual current integration state in the codebase while preserving flexibility to switch providers later
- **Important caveat (2026-06-11 audit)**: production analytics is currently **disconnected end-to-end** — no production file loads the gtag script (`window.gtag` exists only as a type declaration plus guarded calls), and `analytics.init()`/`getAnalyticsConfig()` are called only in tests. All conversion events (waitlist, CTA, navigation, scroll depth) are silent no-ops in production
- **Alternatives considered**: Plausible as the active provider, Fathom, Umami, Simple Analytics

- **Date**: YYYY-MM-DD (unknown), later clarified 2026-04-18
- **Decision**: Analytics usage is exposed via the `useAnalytics()` hook, but current runtime behavior is backed by the GA4 utility (`@utils/analytics`) rather than App-level Plausible singleton initialization
- **Rationale**: Keeps analytics calls centralized behind a hook while accurately documenting that the active implementation is `@utils/analytics` today
- **Alternatives considered**: Module-level initialization, wiring the existing Plausible singleton into runtime

## Error & Performance Monitoring

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Sentry for error monitoring with sensitive query parameter filtering
- **Rationale**: Production visibility into errors; filtering prevents accidental PII capture
- **Alternatives considered**: Datadog, Bugsnag, no monitoring

- **Date**: 2026-04-20
- **Decision**: Removed `@vercel/analytics` — component stripped from `App.tsx`, dependency removed from `package.json`
- **Rationale**: Site is deployed on Netlify; `/_vercel/insights/script.js` does not exist there, causing a MIME-type console error that degraded the Lighthouse Best Practices score
- **Alternatives considered**: Conditional rendering per platform, keeping it for a future Vercel deployment

- **Date**: 2026-04-20 (known pre-existing issue, resolved 2026-05-30)
- **Decision**: `worker-src 'self' blob:'` in production CSP — enables Sentry Session Replay workers
- **Rationale**: Sentry `replayIntegration()` uses blob: URL workers. Updated from `worker-src 'none'` to `worker-src 'self' blob:` in both `netlify.toml` and `vercel.json` to unblock it.
- **Alternatives considered**: `worker-src 'none'` (silently disables Replay), removing `replayIntegration()` entirely

- **Date**: 2026-05-30
- **Decision**: Resolved two CSP console errors: (1) Font Awesome JS inline-style violation; (2) Vercel analytics MIME-type error
- **Rationale**: Font Awesome JS was removed and replaced with custom bundled SVG paths (`src/components/ui/Icon/icons.ts`). Font Awesome JS injected inline styles via `setAttribute('style', ...)`, which the strict `style-src 'self'` CSP blocked. `@vercel/analytics` was removed because the site runs on Netlify — the script URL `/_vercel/insights/script.js` returns HTML 404, causing a MIME-type rejection. Both fixes were already on `main`; this PR documents and deploys them.
- **Alternatives considered**: Adding `'unsafe-inline'` to `style-src` (weakens CSP), adding the specific sha256 hash for the Font Awesome style (fragile — breaks on library updates)

## Security

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Two-tier CSP — relaxed in dev (allows unsafe-eval for Vite HMR), strict in prod via hosting-provided HTTP headers (`vercel.json` / `netlify.toml`)
- **Rationale**: Dev ergonomics vs. production security; CSP meta tags not sufficient for frame-ancestors
- **Note**: `netlify.toml` and `vercel.json` must always have identical CSP values. Drift between them is a common bug source — any future CSP change must update both files.
- **Alternatives considered**: Single CSP for both environments

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: URL validation (`isSafeUrl()`) in polymorphic Button component
- **Rationale**: Button renders as `<a>` when given href; must block `javascript:`, `data:`, `vbscript:` protocols
- **Alternatives considered**: No validation (unsafe), allow-list of domains

- **Date**: 2026-05-06
- **Decision**: `.npmrc` (content must be exactly `legacy-peer-deps=true`), `docs/ROADMAP.md`, `docs/gitVersionControl.md`, `docs/review.md`, and the `hasDangerousProtocol`/`isRelativeUrl` helpers in `src/utils/navigation.ts` are required files that must never be deleted from any branch
- **Rationale**: Accidental deletion of these files on several branches blocked their PRs from merging (Issue #876). Restoration is done via `git checkout origin/main -- .npmrc docs/ROADMAP.md docs/gitVersionControl.md docs/review.md src/utils/navigation.ts`.
- **Alternatives considered**: Manual re-creation of file content

## Email / Waitlist

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Email subscribe handled by Netlify function server-side, not client-side
- **Rationale**: Keeps API keys off the client; privacy-first; avoids exposing email provider credentials
- **Alternatives considered**: Client-side SDK calls to ConvertKit/Mailchimp

## Testing

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Vitest for unit/component tests, Playwright for E2E
- **Rationale**: Vitest is Vite-native (fast, no config mismatch); Playwright is the modern standard for E2E
- **Alternatives considered**: Jest + Cypress

- **Date**: YYYY-MM-DD (unknown)
- **Decision**: Coverage threshold set at 70% (lines, functions, branches, statements)
- **Rationale**: Enforces baseline quality without being prohibitively strict for a landing page
- **Alternatives considered**: 80%, 60%, no threshold

- **Date**: 2026-06-17
- **Decision**: Browser-scoped E2E tests in `tests/e2e/landing-page.spec.ts` are scoped via Playwright **tags + per-project `grepInvert`** (in `playwright.config.ts`) instead of in-body `test.skip()`. This keeps the run sets identical but stops the scoped tests from appearing as "skipped" in the Playwright HTML report (scoped tests are simply not *collected* for projects they don't apply to). Tags: `@chromium-only` (Chromium desktop only — used by `load-performance smoke check` and `should have accessible keyboard navigation`), `@mobile-only` (mobile projects only — used by `should show mobile-specific UI`), `@no-ci` (excluded in CI — used by the perf check). `grepInvert(...)` helper appends `@no-ci` to every project's exclusions when `process.env.CI` is set. Verified via `playwright test --list`: 29 tests collected locally / 28 in CI, zero skipped.
- **Rationale**: User asked to "reduce skip noise in the report" without changing what runs. Underlying scoping reasons unchanged: Lighthouse CI is the authoritative Core Web Vitals gate (perf check is flaky on CI runners); mobile-UI assertions require a mobile viewport (would fail on desktop); Firefox/WebKit headless don't reliably dispatch Tab-focus events without prior pointer activation. Note: the report URL filter `#?q=s:skipped` is Playwright HTML-report syntax (not Lighthouse).
- **Alternatives considered**: Keeping `test.skip()` guards (rejected — produces the skip noise the user wanted gone); enabling the perf check in CI or broadening keyboard-nav to Firefox/WebKit (rejected — flakiness / unreliable headless focus)

- **Date**: 2026-06-18 (refined 2026-06-19 after PR #1167 review)
- **Decision**: Suppress coverage for genuinely *unreachable* defensive code with `/* v8 ignore ... */` (pattern already used at `src/utils/navigation.ts:202`). Mechanics matter: `/* v8 ignore next */` suppresses the **statement/line** but NOT the implicit-`else` **branch** (which is anchored to the `if`/`else if` line). A `/* v8 ignore start ... stop */` region *can* drop the branch — but only by also removing the sibling **reachable** arm from measurement, so it must never wrap an `if` whose taken arm is exercised by tests (that hides real coverage; it was flagged in review). Concretely, `keyboard.ts` `getFocusableElements` uses `/* v8 ignore next */` on just the impossible `return 0` fall-through; the reachable `if (PRECEDING) return 1` stays measured, and the branch metric honestly shows the impossible else-arm rather than masking the reachable one. Only suppress code that is truly unreachable; leave reachable-but-untested branches visible (add tests, don't hide).
- **Rationale**: Keeps coverage honest — suppress unreachable statements without masking reachable branches
- **Alternatives considered**: `start...stop` region around the comparator (over-reaches — hides the reachable reverse-order `return 1` branch; reverted after review), wrapping whole guard blocks (hides tested logic), adding tests for genuinely unreachable defensive code (impossible)

## Tooling / Commit Convention

- **Date**: 2026-06-18 (revised 2026-06-19 in PR #1167 review)
- **Decision**: `commitlint.config.js` uses `extends: ['@commitlint/config-conventional']`, and both `@commitlint/cli` and `@commitlint/config-conventional` are devDependencies pinned to **^20** (NOT ^21 — see Node note below). config-conventional supplies the standard Conventional Commits ruleset **and** the conventionalcommits parser, so breaking-change shorthand like `feat!:`/`feat(scope)!:` validates. There is no commit-msg git hook installed; validation is the manual/ad-hoc `npx commitlint` workflow documented in CLAUDE.md. **Caveat (2026-06-20)**: the local install only helps *after* `npm ci`/`npm install` has populated `node_modules`. On a freshly cloned checkout with deps not yet installed, a bare `npx commitlint` does NOT use the (uninstalled) local CLI — it fetches a generic transient `commitlint` from the registry, which can't resolve the local `@commitlint/config-conventional` and misreports "missing rules". Fix: the documented command uses `npx --no-install commitlint`, which errors clearly ("command not found") instead of silently fetching, making the "run `npm ci` first" prerequisite obvious. **Node compatibility**: commitlint **v21 requires Node >=22.12**, but this repo's deploy/CI runtime is **Node 20** (`netlify.toml` NODE_VERSION="20"; nearly all GitHub Actions workflows pin node-version "20"). commitlint v20 declares `engines.node >=v18`, so it's compatible across the repo's Node 20 (GH Actions/Netlify), 22 (CircleCI), and 24 (pr-quality-check) runtimes. Stay on v20 until the repo's baseline Node is raised to ≥22.12.
- **Socket Security (commitlint transitive deps)**: commitlint's CLI tree bundles minified deps that trip Socket's "obfuscated code" heuristic (false positives, ~90% confidence). Handling pattern: prefer deduping to a version already trusted in the repo; otherwise Socket-ignore the specific package. Applied: `jiti` (pulled via `cosmiconfig-typescript-loader`) is deduped to the repo's existing `^2.7.0` through an `overrides` entry; `yargs@17.7.3` (pulled by `@commitlint/cli`; repo already trusts `yargs@17.7.2` via lighthouse/size-limit) is accepted as risk via a `@SocketSecurity ignore npm/yargs@17.7.3` PR comment (PR #1167) rather than another brittle exact-pin override. All are dev-only deps, never shipped.
- **Rationale**: The repo originally had no commitlint config, so `npx commitlint` failed with `[empty-rules]`. The first fix was a self-contained inline config (zero deps) to keep with the project's dependency-consciousness, but review (Codex P2) noted `npx commitlint` isn't runnable on a fully offline/clean checkout without the CLI installed, and inline rules also needed a hand-maintained parserPreset to handle `!`. Adding the CLI + config-conventional as devDeps is the standard, robust setup and removes the hand-maintained rules/parser. `npm audit` stays clean (0 vulns) after the add.
- **Alternatives considered**: self-contained inline rules + inline parserPreset, zero deps (initial approach; reverted — not offline-runnable, parser hand-maintained), husky commit-msg hook to enforce on `git commit` (out of scope; repo doesn't use husky)

## PWA

- **Date**: YYYY-MM-DD (unknown), superseded by 2026-06-11 observation
- **Decision**: Web manifest present; a hand-rolled service worker (`public/sw.js`) is now implemented — versioned cache name, offline.html fallback, cache-first for hashed `/assets/*` with eviction (60-entry cap, but pruning runs only in `onActivate()` — cache can exceed the cap between activations; incomplete eviction noted in 2026-06-11 audit)
- **Rationale**: PWA manifest enables "add to home screen"; SW added to deliver the offline-first brand promise on the landing page
- **Alternatives considered**: Workbox, no service worker

- **Date**: 2026-06-08
- **Decision**: Added conditional `self.skipWaiting()` (guarded by `!self.registration.active`) to the SW `onInstall` handler
- **Rationale**: Without `skipWaiting()`, the SW enters a "waiting" state after install and never activates during the same page visit. Lighthouse's PWA audit ("Does not register a service worker that controls page and start_url") runs within a single visit, so it would never see the SW as active. The `!self.registration.active` guard restricts the call to first installs only — skipping it on updates avoids forcing immediate activation while existing tabs still reference lazy-loaded chunks from the prior cache, which would cause 404s. On first install there is no active SW, so the guard fires and `skipWaiting()` + existing `clients.claim()` ensures the SW activates and controls the page immediately.
- **Alternatives considered**: Unconditional `skipWaiting()` (risks update-time 404s for lazy chunks); remove large fonts from PRECACHE (speeds install, but doesn't fix the fundamental waiting-state issue)

## Infrastructure / Edge

- **Date**: 2026-04-29
- **Decision**: Netlify WAF edge function runs on every non-asset request before origin
- **Rationale**: Blocks scanner UAs, path traversal, SQL/XSS injection signatures, oversized payloads (>512 KB), and illegal HTTP methods on `/.netlify/functions/*` at the CDN edge before any serverless function cold-start cost is incurred. Static assets (`/assets/*`, `/fonts/*`, images) are excluded via `excludedPath`. Every response — blocked or forwarded — receives an `X-Request-ID` UUID for log correlation.
- **Alternatives considered**: Application-level middleware, Netlify's built-in DDoS protection only

- **Date**: 2026-06-15
- **Decision**: WAF nonce-based CSP — per-request 128-bit nonce replaces host-allowlist `script-src`; `netlify.toml` and `vercel.json` keep a static fallback CSP for non-WAF paths. PR #1091 (`claude/content-security-policy-issues-sHVSm`), merged clean with all 18 review threads resolved and CI green on commit `603aafc`.
- **Key implementation details**:
  - Nonce injected via `buildCsp(nonce)` in `netlify/edge-functions/waf.ts`; placeholder `nonce="CSP_NONCE"` stamped into HTML at build time by `vite.config.ts` `transformIndexHtml` plugin (post-order hook) and into `public/offline.html` and `public/privacy.html` manually
  - 200 HTML responses: strip `ETag`, `Last-Modified`, `Accept-Ranges`, `Content-Length` — the nonce makes every body unique so origin validators no longer describe the response; a stale `ETag`+`If-Range` could cause the origin to return a 206 slice of placeholder HTML whose offsets don't align with the cached nonce-expanded body
  - HEAD HTML responses: strip the same four headers PLUS `Content-Security-Policy` — a cache can use HEAD headers to update a stored GET response, which would reintroduce stale validators or the static fallback CSP
  - 304 responses: returned unchanged (no body to rewrite; cached nonce stays in effect)
  - 206 responses: passed through unchanged (nonce rewriting only on complete 200s)
  - `isHtmlResponse()` lowercases `Content-Type` before matching to catch mixed-case origins
  - 502 catch block logs `console.error('WAF origin/network error', { requestId, error })` for edge log traceability
  - `netlify.toml` and `vercel.json` CSPs must remain identical on all non-`script-src` directives; enforced by `src/test/config/csp-config.test.ts` with bidirectional union-key assertions
- **Alternatives considered**: Static CSP only (no nonces), server-side rendering with inline nonces

## Privacy / Storage

- **Date**: 2026-04-29
- **Decision**: Theme persistence is gated by `PERSISTENCE_CONFIG.ALLOW_PERSISTENT_THEME` in `src/constants/config.ts`
- **Rationale**: Enforces a privacy-first default for persistent theme storage: the theme preference is only written to localStorage when explicitly permitted. It contains no PII, measurably improves UX across visits, and can be cleared by the user. Note: this decision covers theme persistence specifically — other localStorage usage (e.g. `FeedbackWidget` writes `paperlyte_feedback` directly) is not yet gated by this config.
- **Alternatives considered**: Always persist theme preference, sessionStorage for theme only

## Data Layer

- **Date**: 2026-04-29
- **Decision**: Much of the reusable section content is centralized in `src/constants/*.ts` as typed `as const` objects; some sections still define local data inline in their component files
- **Rationale**: Centralizing content separates it from presentation, enables type-safe access, snapshot testing of data shapes, and content updates without touching component files. Covers features, testimonials, FAQs, comparisons, pricing, downloads, waitlist copy, and legal metadata. Not yet universal — e.g. `Solution.tsx` defines `VALUE_PROPS` inline.
- **Alternatives considered**: All content inline in JSX, headless CMS (deferred to later phase), MDX files

## Serverless Functions

- **Date**: 2026-04-29
- **Decision**: Netlify Functions validate external API responses at runtime using Zod; TypeScript types are derived from Zod schemas via `z.infer<>`
- **Rationale**: External APIs (ConvertKit, etc.) can change their response shape without warning; runtime validation catches this in production and prevents silent data corruption. Deriving TypeScript types from the schema guarantees type/schema consistency — no drift possible.
- **Alternatives considered**: Trust TypeScript types only (no runtime check), manual type guards

## React

- **Date**: 2026-04-29
- **Decision**: React is used with standard `@vitejs/plugin-react` — the React Compiler is not configured; `useMemo`/`useCallback`/`memo` should only be added when profiling shows a clear need
- **Rationale**: The Vite config uses `react()` with no Babel plugin or `babel-plugin-react-compiler` dependency, so automatic compiler memoization cannot be assumed. Avoid adding manual memoization by default — only add it when a measured performance problem exists. Note: some code comments in the repo incorrectly state the compiler is active; these are aspirational/stale and should be corrected when encountered.
- **Alternatives considered**: Enable React Compiler via `babel-plugin-react-compiler`, manual memoization everywhere

## CSS / Theming

- **Date**: 2026-04-29
- **Decision**: Dark-mode CSS tokens are intentionally duplicated in two blocks in `src/styles/variables.css`
- **Rationale**: Two distinct use cases require separate selectors: (1) `[data-theme='dark']` for explicit user toggle, (2) `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }` for system preference when no explicit choice has been made. The `:root:not([data-theme='light'])` guard is critical — it prevents system preference from overriding an explicit light-mode choice. Any palette change must update both blocks in sync; drift is a known bug source.
- **Alternatives considered**: Single CSS custom property override, JavaScript-only theming

## Documentation / Roadmap

- **Date**: 2026-06-17
- **Decision**: `docs/ROADMAP.md` holds **two** separate roadmaps under two top-level headings: "Landing Page/Waitlist Signup" and "MVP to Launch" (the note-editor app). The landing-page roadmap was expanded from a lone Phase 0 to full Phases 0–6 with per-feature status labels (PR #1142)
- **Rationale**: The landing-page roadmap previously stopped at Phase 0; Phases 1–6 now document shipped vs. pending work so the doc reflects reality. Statuses derived from the actual codebase + the 2026-06-11 audit
- **Note**: Phase 0 originally mis-stated the stack as "Next.js" + "Tailwind CSS"; corrected to **Vite + React / CSS Modules** (the actual stack per `package.json` and project guidelines). When editing, do not conflate the two roadmaps — the MVP-to-Launch (editor) roadmap is intentionally separate
- **Alternatives considered**: Splitting into two files (rejected — `docs/ROADMAP.md` is a required, never-delete file per Issue #876)

## Dependency Security & Licensing

- **Date**: 2026-06-21
- **Decision**: `undici` override floor raised `^7.20.0` → `^7.28.0` (PR #1173) to clear a high-severity npm-audit advisory cluster (GHSA-vmh5-mc38-953g TLS bypass, GHSA-pr7r-676h-xcf6 shared-cache disclosure, and others spanning the vulnerable range 7.0.0–7.27.2)
- **Rationale**: The existing `^7.20.0` override resolved to 7.24.1, inside the vulnerable range. 7.28.0 is the next patched 7.x release and still satisfies `jsdom`'s `^7.25.0` requirement, so it stays on the 7.x line (no major jump). undici is a **dev-only** transitive dep (jsdom/vitest + `@actions/*`). After the bump: `npm audit` → 0 vulnerabilities; full suite (1758 tests) green
- **Alternatives considered**: bump to 8.x (rejected — needless major jump for a dev-only dep), `npm audit fix` (a parallel branch used this; the override approach won out on merge)

- **Date**: 2026-06-21
- **Decision**: The FOSSA **License Compliance** (14 issues) and **Dependency Quality** (63 issues) PR checks are accepted **dev-tooling baselines**, not blockers — they are pre-existing on `main`, non-required (PR mergeable state is `unstable`, not `blocked`), and not introduced by dependency changes in PR #1173
- **Rationale (investigation 2026-06-21)**:
  - License Compliance's 14 issues are **exactly** the 14 `@img/sharp-*` binaries carrying LGPL-3.0-or-later (10 `sharp-libvips-*`, 3 `sharp-win32-*`, 1 `sharp-wasm32`), pulled by **`sharp`** — a devDependency used only by `scripts/generate-icons.js` / `generate-mockups.js` at build time. `libvips` (the LGPL component) is a separate shared library (LGPL permits this) and is **never in the production bundle**, so there is no license violation in the distributed product
  - Dependency Quality's 63 are mostly FOSSA composite "outdated/maintenance" scoring across the ~750-pkg tree. The only hard deprecation flags are 3 packages in a single chain — `@lhci/cli` (dev) → `chrome-launcher` → `rimraf@3.0.2` → `glob@7.2.3` → `inflight@1.0.6`. Overriding to newer rimraf/glob risks breaking chrome-launcher (v4+/v9+ are breaking majors), so leave to upstream
- **Recommended remediation (not yet applied — needs owner decision)**: handle in the FOSSA dashboard — allow LGPL-3.0 or ignore dev-only issues; or, if FOSSA runs via CLI, scope analysis to `--production`. Code-side alternatives (replace `sharp` with jimp/MIT or `@resvg/resvg-js`; wait for `@lhci/cli` to update chrome-launcher) are heavier and deferred
- **Alternatives considered**: adding a `.fossa.yml` (may not affect the FOSSA GitHub-app checks, only CLI runs), replacing `sharp` outright (rejected for now — dev-only, build-time)

## CSP `style-src 'self'` blocked inline `<style>` on static legal pages (2026-07-20, Issue #1310)

- **Decision**: Externalized the inline `<style>` block (previously duplicated near-identically across `public/privacy.html`, `terms.html`, `cookies.html`, `security.html`, `dmca.html`, `accessibility.html`) into a single shared `public/styles/legal.css`, referenced via `<link rel="stylesheet" href="/styles/legal.css">`. `style-src 'self'` in `netlify.toml`/`vercel.json`/`waf.ts` was left completely unchanged.
- **Rationale**: These six pages are static files copied verbatim by Vite (never pass through `transformIndexHtml`/nonce injection), so a style nonce wasn't an option without new per-page infra, and Vercel has no edge function to inject one anyway. Externalizing to a same-origin file satisfies `style-src 'self'` with zero CSP changes on any deploy target and no `csp-config.test.ts` churn — consistent with the standing team preference against `'unsafe-inline'`/hash relaxations (see the 2026-06-11 Font Awesome CSP entry above).
- **Note**: The six inline blocks weren't byte-identical — `legal.css` is their union (shared `@font-face` + resets + typography, plus page-specific classes like `.policy-note`, `.contact-block`, `table/th/td`, `.cookie-preferences-btn`, `.visually-hidden`). One intentional side effect: pages that previously had no generic `a { color }` rule (`privacy.html`, `terms.html`) now pick it up from the shared file, so their prose `mailto:`/external links render in `--color-primary` instead of the browser-default link color — matching the other four pages instead of diverging from them.
- **Untouched**: `privacy.html`'s `<script nonce="CSP_NONCE">` block (separate mechanism), the `{{BUILD_DATE}}`/`{{BUILD_YEAR}}` placeholders for `scripts/inject-dates.js`. `help.html`/`community.html` referenced in the issue don't exist in this codebase — apply the same treatment if they're added later.
- **Alternatives considered**: extending the nonce architecture to `<style>` tags (rejected — needs new WAF style-nonce plumbing, still broken on Vercel and WAF-excluded static-fallback paths, and would require loosening `csp-config.test.ts`'s directive-parity check).
