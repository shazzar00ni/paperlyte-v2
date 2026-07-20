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

**Why this isn't a license violation *for the current release artifacts*:**
`libvips`, the LGPL-3.0 component, is consumed as a dynamically-linked shared
library — exactly the usage LGPL permits without imposing copyleft on the
linking application. `sharp` and its native binaries are a devDependency:
they run during `npm run` build/icon scripts on a developer's or CI machine
and are never included in the production landing page bundle shipped to end
users (verify with `npm ls sharp` — it resolves only under
`devDependencies`, and the build output in `dist/` contains no native
binaries). This conclusion is scoped to the artifacts distributed today —
dynamic linking and devDependency status don't retroactively waive LGPL/MPL
obligations, so if `sharp`, `lightningcss`, or `axe-core` (or their native
binaries) are ever bundled into a distributed build, this assessment must be
revisited.

## Dependency Quality (63–66 issues)

**Root cause:** the majority are FOSSA's composite outdated/maintenance
scoring applied across the ~750-package resolved tree — not concrete defects.
This count drifts by a few issues over time purely from FOSSA re-scoring the
existing tree — these are dated historical snapshots, not a fixed baseline:
63 (FOSSA GitHub App check, 2026-06-21 investigation) and 66 (same check,
observed on PR #1309 as of 2026-07-18) — both without any corresponding
change to this repo's dependencies. The one hard deprecation chain, unchanged
across both snapshots, is:

```text
@lhci/cli (dev) > chrome-launcher > rimraf@3.0.2 > glob@7.2.3 > inflight@1.0.6
```

`inflight@1.0.6` is explicitly marked deprecated upstream ("this module is
not supported, and leaks memory"), and `rimraf@3.0.2` / `glob@7.2.3` are
flagged as unsupported pre-v4/v9 releases.

**Why this can't be fixed by updating (verified 2026-07-18):** `npm view
@lhci/cli versions` shows `0.15.1` as the latest published release, matching
what's installed — there is no newer `@lhci/cli` to pull in a fixed
`chrome-launcher`. `npm outdated` on that date showed no other actionable
bump for this chain either. Its bundled `chrome-launcher` still depends on
the `rimraf@3.0.2` chain upstream (confirmed via `package-lock.json`
inspection: `chrome-launcher` → `rimraf@3.0.2` → `glob@7.2.3` →
`inflight@1.0.6`). Forcing an `overrides` bump of `rimraf`/`glob` to their
current majors (v4+/v6+) was not attempted in this pass — their APIs changed
across those majors and `chrome-launcher`'s actual call paths into them
haven't been audited for compatibility, so treat "would break
`chrome-launcher`" as an unverified risk assessment rather than a confirmed
finding. A safer path, if this is revisited, is to test the override in an
isolated branch and run the Lighthouse CI workflow end-to-end before trusting
it.

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
  **Caveat:** this allowlist is repo-wide, not scoped to the specific
  `@img/sharp-*` / `lightningcss` / `axe-core` packages that justify it —
  the FOSSA CLI config schema (`.fossa.yml` v3) doesn't expose a
  per-package license exception, only a project-wide policy. That means any
  *new* dependency introduced later under one of these allowed licenses
  would pass a CLI scan silently. If a future dependency change adds an
  LGPL-3.0-or-later or MPL-2.0 package, re-check whether it's still
  build-time-only/unmodified before assuming this file's allowance still
  applies.
- Documented the 14 LGPL binaries in `docs/3RD-PARTY-SOFTWARE.md` under
  "Build-Time Native Dependencies," with the same build-only rationale as
  this file, so the license inventory doesn't silently omit them.

## FOSSA dashboard configuration (required for the GitHub App checks to pass)

The in-repo `.fossa.yml` does not configure the hosted GitHub App checks —
those are controlled entirely through the FOSSA web dashboard for this
project. A repo owner with dashboard access needs to:

1. Sign in to the [FOSSA dashboard](https://app.fossa.com/) and open the
   `paperlyte-v2` project (GitHub App installation 1014311).
2. Under **Settings → Issue Policies → License Policy**, **prefer a scoped
   exception** for the specific `sharp` / `@img/sharp-*`, `lightningcss`, and
   `axe-core` packages over a blanket allow-list entry for
   `LGPL-3.0-or-later` / `MPL-2.0`. A blanket allow would silently pass *any*
   future dependency carrying those licenses — including ones that end up in
   the production bundle — not just today's known, build-time-only set.
3. Under **Settings → Issue Policies → Quality**, prefer a scoped/expiring
   exception for the known `inflight@1.0.6` chain (reached only via the
   devDependency `@lhci/cli`) over excluding all devDependencies from quality
   scoring or raising the global threshold — a blanket exclusion or threshold
   change would also stop surfacing genuinely new quality issues in
   devDependencies, not just this one chain.
4. Setting the checks to non-blocking/informational under **Settings →
   Notifications/Checks** is the least precise option: it stops the check
   from gating *any* PR, including one that introduces a real new production
   license or quality problem. If dashboard-level per-license/per-package
   scoping isn't available, treat this as a fallback that needs an owner's
   explicit sign-off, not a default choice.

Until a dashboard change is made, expect both checks to keep reporting
`failure` on every PR — that is expected and does not indicate a new or
regressed issue. Reviewers should treat these two specific, documented
findings as non-blocking noise (see `memory/decisions.md`) while still
watching for the checks to flag genuinely new issues, and rely on the
required CI gates (Lint and Type Check / CI Success, `npm audit`) as the
primary merge signal.
