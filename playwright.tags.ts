// ---------------------------------------------------------------------------
// Browser-scoping via tags (keeps the Playwright HTML report clean). Scoped
// tests are not COLLECTED for the projects they don't apply to, so they never
// appear as "skipped" — unlike in-body test.skip(), which still lists the test
// as skipped for every project where the guard fired.
//
// Tags are declared on individual tests via the `tag` option:
//   @chromium-only — runs only on the Chromium desktop project
//   @mobile-only   — runs only on the mobile projects (Pixel 5 / iPhone 12)
//   @no-ci         — never runs in CI (variable CLS/metric delivery on CI runners;
//                    Lighthouse CI is the authoritative Core Web Vitals gate)
//
// Each project excludes the tag patterns that don't belong to it via grepInvert;
// in CI, @no-ci is additionally excluded everywhere. Untagged tests run on all
// projects. Patterns are literal RegExps — Playwright excludes a test when it
// matches ANY pattern in the array, the same OR semantics as a single
// alternation, without building a RegExp from a dynamic string.
// ---------------------------------------------------------------------------

export const CHROMIUM_ONLY = /@chromium-only/
export const MOBILE_ONLY = /@mobile-only/
const NO_CI = /@no-ci/

export function grepInvert(...patterns: RegExp[]): RegExp[] | undefined {
  const excluded = process.env.CI ? [...patterns, NO_CI] : patterns
  return excluded.length > 0 ? excluded : undefined
}
