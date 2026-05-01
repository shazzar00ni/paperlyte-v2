# TODO

## CI / Dependencies

- [ ] Regenerate `package-lock.json` after the `@size-limit/preset-app` →
      `@size-limit/preset-small-lib` swap in `package.json` (PR #727).
      Run `npm install` locally and commit the updated lockfile so `npm ci`
      in `.github/workflows/ci.yml` and `.circleci/config.yml` stays in sync.
- [ ] Optional: if loading-time budgets are needed in addition to file-size
      budgets, enforce them via Lighthouse CI (`npm run lighthouse`) rather
      than re-introducing `@size-limit/preset-app` (which requires headless
      Chrome / `libnspr4.so` and broke CI previously).
