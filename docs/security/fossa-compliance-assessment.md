# FOSSA Compliance Assessment

This file records the investigation behind the two FOSSA GitHub App checks
that fail on every pull request in this repository — **License Compliance**
and **Dependency Quality** — and the rationale for accepting them as a
dev-tooling baseline rather than treating them as blockers. Tracks
[#1196](https://github.com/shazzar00ni/paperlyte-v2/issues/1196).

Both checks come from the same GitHub App (installation 1014311) and analyze
the full npm dependency tree (`package.json` / `package-lock.json`), including
devDependencies. They fail on PRs that touch neither file, confirming the
issues are pre-existing in the dependency set, not introduced by any one PR.

## License Compliance (14 issues)

**Root cause:** all 14 issues are the `@img/sharp-*` native binaries pulled in
by `sharp`, a devDependency used only by `scripts/generate-icons.js` and
`scripts/generate-mockups.js` to generate favicons/mockups at build time.

| Group | Count | License |
|---|---|---|
| `@img/sharp-libvips-*` (per-platform libvips binaries) | 10 | `LGPL-3.0-or-later` |
| `@img/sharp-win32-*`, `@img/sharp-wasm32` (bundle libvips + sharp glue) | 4 | `Apache-2.0 AND LGPL-3.0-or-later` (`sharp-wasm32` also `AND MIT`) |

The remaining platform binaries (`@img/sharp-darwin-*`, `@img/sharp-linux-*`
without the `-libvips-` infix, etc.) are `Apache-2.0`-only and not flagged.

**Why this isn't a license violation:** `libvips`, the LGPL-3.0 component, is
consumed as a dynamically-linked shared library — exactly the usage LGPL
permits without imposing copyleft on the linking application. `sharp` and its
native binaries are a devDependency: they run during `npm run` build/icon
scripts on a developer's or CI machine and are never included in the
production landing page bundle shipped to end users (verify with
`npm ls sharp` — it resolves only under `devDependencies`, and the build
output in `dist/` contains no native binaries).

## Dependency Quality (63 issues)

**Root cause:** the majority are FOSSA's composite outdated/maintenance
scoring applied across the ~750-package resolved tree — not concrete defects.
The one hard deprecation chain is:

```
@lhci/cli (dev) > chrome-launcher > rimraf@3.0.2 > glob@7.2.3 > inflight@1.0.6
```

`inflight@1.0.6` is explicitly marked deprecated upstream ("this module is
not supported, and leaks memory"), and `rimraf@3.0.2` / `glob@7.2.3` are
flagged as unsupported pre-v4/v9 releases.

**Why this can't be fixed by updating:** `@lhci/cli` is already pinned to its
latest published release (`0.15.1` — confirmed via `npm view @lhci/cli
versions`), and its bundled `chrome-launcher` still depends on the
`rimraf@3.0.2` chain upstream. There is no newer `@lhci/cli` release that
carries a fixed `chrome-launcher`. Forcing an `overrides` bump of `rimraf`/
`glob` to their current majors (v4+/v6+) would be a breaking change for
`chrome-launcher`'s API expectations and isn't a safe unilateral fix.

**Impact:** `@lhci/cli` is a devDependency used only by Lighthouse CI in
`.github/workflows/`. `inflight` is a transitive install-time dependency of a
build tool — it never executes in, or ships with, the production bundle.

## `lightningcss` and `axe-core` (MPL-2.0)

Two other packages in the tree carry `MPL-2.0`, a weak-copyleft license that
only requires source disclosure for modifications to MPL-licensed *files
themselves* (not the whole program) — it doesn't affect the rest of this
project's licensing:

- `lightningcss` (`1.32.0`) — transitive dependency of `vite`, used to
  minify CSS during the production build.
- `axe-core` (`4.11.1`) — transitive dependency of `@lhci/cli`'s Lighthouse
  accessibility audits (devDependency, dev/CI-only).

Neither is modified by this repository, so no MPL-2.0 disclosure obligation
is triggered.

## Remediation applied

- Added `.fossa.yml` (repo root) documenting an explicit license allowlist —
  MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, OFL-1.1, MPL-2.0, and
  LGPL-3.0-or-later — for any FOSSA CLI run against this repo. **Note:** this
  file has no effect on the hosted GitHub App check itself; FOSSA's app-based
  PR checks are configured exclusively through the dashboard (below). It
  exists to document intent in-repo and to support a future CLI-based scan.
- Documented the 14 LGPL binaries in `docs/3RD-PARTY-SOFTWARE.md` under
  "Build-Time Native Dependencies," with the same build-only rationale as
  this file, so the license inventory doesn't silently omit them.

## FOSSA dashboard configuration (required for the GitHub App checks to pass)

The in-repo `.fossa.yml` does not configure the hosted GitHub App checks —
those are controlled entirely through the FOSSA web dashboard for this
project. A repo owner with dashboard access needs to:

1. Sign in to the [FOSSA dashboard](https://app.fossa.com/) and open the
   `paperlyte-v2` project (GitHub App installation 1014311).
2. Under **Settings → Issue Policies → License Policy**, add
   `LGPL-3.0-or-later` and `MPL-2.0` to the allowed-licenses list, or add a
   scoped exception for the `sharp` / `@img/sharp-*` and `lightningcss` /
   `axe-core` packages specifically.
3. Under **Settings → Issue Policies → Quality**, either exclude
   devDependencies from quality scoring, or raise the issue threshold so the
   known `inflight@1.0.6` chain (reached only via the devDependency
   `@lhci/cli`) doesn't fail the check.
4. Alternatively, under the project's **Settings → Notifications/Checks**,
   set the License Compliance and Dependency Quality checks to
   non-blocking/informational if per-license/threshold tuning isn't desired.

Until a dashboard change is made, expect both checks to keep reporting
`failure` on every PR — that is expected and does not indicate a new or
regressed issue. Reviewers should treat these two checks as non-blocking
noise (see `memory/decisions.md`) and rely on the required CI gates (Lint and
Type Check / CI Success, `npm audit`) as the real merge signal.
