---

# 3rd-Party Software for [paperlyte-v2](https://github.com/shazzar00ni/paperlyte-v2)

The following 3rd-party software packages may be used by or distributed with **paperlyte-v2**.  Any information relevant to third-party vendors listed below are collected using common, reasonable means.

This report covers direct and top-level transitive dependencies. It does not
enumerate every transitive package in the tree — notably the LGPL-3.0-or-later
and MPL-2.0 packages below, which are called out separately because they carry
copyleft licenses. See [`docs/security/fossa-compliance-assessment.md`](security/fossa-compliance-assessment.md)
for the full FOSSA license/quality check investigation.


Date generated | Revision ID
:---: | :---:
05/31/26 | 1fa3b0984bdd5230ea85236e202e71f5191c9e86

---

## Dependencies

Package|Licenses|Concluded Licenses
-------|--------|------------------
**[@codecov/rollup-plugin (2.0.1)](#codecovrollup-plugin-201)**|MIT|MIT
**[@eslint/js (10.0.1)](#eslintjs-1001)**|MIT|MIT
**[Inter Variable Font (self-hosted)](#inter-variable-font-self-hosted)**|OFL-1.1|OFL-1.1
**[@lhci/cli (0.15.1)](#lhcicli-0151)**|Apache-2.0|Apache-2.0
**[@netlify/functions (5.2.2)](#netlifyfunctions-522)**|MIT|MIT
**[@playwright/test (1.59.1)](#playwrighttest-1591)**|Apache-2.0|Apache-2.0
**[@sentry/react (10.54.0)](#sentryreact-10540)**|MIT|MIT
**[@size-limit/preset-app (12.1.0)](#size-limitpreset-app-1210)**|MIT|MIT
**[@testing-library/dom (10.4.1)](#testing-librarydom-1041)**|MIT|MIT
**[@testing-library/jest-dom (6.9.1)](#testing-libraryjest-dom-691)**|MIT|MIT
**[@testing-library/react (16.3.2)](#testing-libraryreact-1632)**|MIT|MIT
**[@testing-library/user-event (14.6.1)](#testing-libraryuser-event-1461)**|MIT|MIT
**[@types/node (25.9.1)](#typesnode-2591)**|MIT|MIT
**[@types/react (19.2.14)](#typesreact-19214)**|MIT|MIT
**[@types/react-dom (19.2.3)](#typesreact-dom-1923)**|MIT|MIT
**[@vitejs/plugin-react (5.1.4)](#vitejsplugin-react-514)**|MIT|MIT
**[@vitest/coverage-v8 (4.1.7)](#vitestcoverage-v8-417)**|MIT|MIT
**[autoprefixer (10.5.0)](#autoprefixer-1050)**|MIT|MIT
**[esbuild (0.28.0)](#esbuild-0280)**|MIT|MIT
**[eslint (10.4.0)](#eslint-1040)**|MIT|MIT
**[eslint-config-prettier (10.1.8)](#eslint-config-prettier-1018)**|MIT|MIT
**[eslint-plugin-prettier (5.5.5)](#eslint-plugin-prettier-555)**|MIT|MIT
**[eslint-plugin-react-hooks (7.1.1)](#eslint-plugin-react-hooks-711)**|MIT|MIT
**[eslint-plugin-react-refresh (0.5.2)](#eslint-plugin-react-refresh-052)**|MIT|MIT
**[globals (17.6.0)](#globals-1760)**|MIT|MIT
**[jsdom (29.1.1)](#jsdom-2911)**|MIT|MIT
**[png-to-ico (3.0.1)](#png-to-ico-301)**|MIT|MIT
**[postcss (8.5.15)](#postcss-8515)**|MIT|MIT
**[prettier (3.8.3)](#prettier-383)**|MIT|MIT
**[react (19.2.6)](#react-1926)**|MIT|MIT
**[react-dom (19.2.6)](#react-dom-1926)**|MIT|MIT
**[sharp (0.34.5)](#sharp-0345)**|Apache-2.0|Apache-2.0
**[terser (5.48.0)](#terser-5480)**|BSD-2-Clause|BSD-2-Clause
**[typescript (6.0.3)](#typescript-603)**|Apache-2.0|Apache-2.0
**[typescript-eslint (8.59.4)](#typescript-eslint-8594)**|MIT|MIT
**[vite (8.0.14)](#vite-8014)**|MIT|MIT
**[vitest (4.1.7)](#vitest-417)**|MIT|MIT
**[wait-on (9.0.10)](#wait-on-9010)**|MIT|MIT
### [@codecov/rollup-plugin (2.0.1)](https://www.npmjs.com/package/@codecov/rollup-plugin)
Official Codecov Rollup plugin
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2023-2024 Codecov
### Package Info

**Authors**: Trent.Schmidt@sentry.io, devops@codecov.io, jwbecher@drazisil.com, thomasrockhu@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://www.npmjs.com/package/@codecov/rollup-plugin
**Package Download URL**: https://registry.npmjs.org/@codecov/rollup-plugin/-/rollup-plugin-2.0.1.tgz
**Dependency Paths**: @codecov/rollup-plugin

---

### [@eslint/js (10.0.1)](https://eslint.org/)
ESLint JavaScript language implementation
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  OpenJS Foundation and other contributors, <www.openjsf.org>
### Package Info

**Authors**: contact@eslint.org, npm@openjsf.org
**Package Manager**: NPM
**Package Homepage**: https://eslint.org/
**Package Download URL**: https://registry.npmjs.org/@eslint/js/-/js-10.0.1.tgz
**Dependency Paths**: @eslint/js

---

### [Inter Variable Font (self-hosted)](https://rsms.me/inter/)
Latin-subsetted Inter variable WOFF2 font, self-hosted at `public/fonts/Inter-Variable-v2.woff2`. Previously bundled via `@fontsource/inter`; now sourced directly from Google Fonts (Latin subset, variable weight 100–900).
**Usage**: Bundled static asset
#### Concluded Licenses
OFL-1.1
#### Declared Licenses
OFL-1.1

#### Copyrights
  License: OFL-1.1
Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)

---

### [@lhci/cli (0.15.1)](https://github.com/GoogleChrome/lighthouse-ci#readme)
[![npm version](https://badge.fury.io/js/%40lhci%2Fcli.svg)](https://badge.fury.io/js/%40lhci%2Fcli)
**Usage**: Direct
#### Concluded Licenses
Apache-2.0
#### Declared Licenses
Apache-2.0

#### Copyrights
  License: Apache-2.0
Copyright (c) 2019 Google Inc. All Rights Reserved.
### Package Info

**Authors**: ad.st.raine@gmail.com, cjamcl@gmail.com, npm@paul.irish, patrick.hulce@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/GoogleChrome/lighthouse-ci#readme
**Package Download URL**: https://registry.npmjs.org/@lhci/cli/-/cli-0.15.1.tgz
**Dependency Paths**: @lhci/cli

---

### [@netlify/functions (5.2.2)](https://github.com/netlify/primitives#readme)
TypeScript utilities for interacting with Netlify Functions
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2020 Netlify <team@netlify.com>
### Package Info

**Authors**: bot@netlify.com, david@stackbit.com, domitriusaclark@gmail.com, hrishi5200@gmail.com, info@mathias-biilmann.net, katherine.beck@netlify.com, mail@eduardoboucas.com, mike.gualtieri@netlify.com, mike.wen@netlify.com, philippe.serhal@netlify.com, sam@netlify.com, sarah.etter@netlify.com, scdavis41@gmail.com, sean.roberts90@gmail.com, taylorbarnett42@gmail.com, vit@ribachenko.com, youval.vaknin@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/netlify/primitives#readme
**Package Download URL**: https://registry.npmjs.org/@netlify/functions/-/functions-5.2.2.tgz
**Dependency Paths**: @netlify/functions

---

### [@playwright/test (1.59.1)](https://playwright.dev/)
A high-level API to automate web browsers
**Usage**: Direct
#### Concluded Licenses
Apache-2.0
#### Declared Licenses
Apache-2.0

#### Copyrights
  License: Apache-2.0
Copyright (c)  Microsoft Corporation.
### Package Info

**Authors**: dgozman@microsoft.com, pavel.feldman@gmail.com, playwright-npm-bot@microsoft.com, yury.semikhatsky@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://playwright.dev/
**Package Download URL**: https://registry.npmjs.org/@playwright/test/-/test-1.59.1.tgz
**Dependency Paths**: @playwright/test
### Notice File(s)
NOTICE
```
Playwright
Copyright (c) Microsoft Corporation

This software contains code derived from the Puppeteer project (https://github.com/puppeteer/puppeteer),
available under the Apache 2.0 license (https://github.com/puppeteer/puppeteer/blob/master/LICENSE).

```

---

### [@sentry/react (10.54.0)](https://github.com/getsentry/sentry-javascript/tree/master/packages/react)
Official Sentry SDK for React.js
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2019 Functional Software, Inc. dba Sentry
### Package Info

**Authors**: accounts@sentry.io
**Package Manager**: NPM
**Package Homepage**: https://github.com/getsentry/sentry-javascript/tree/master/packages/react
**Package Download URL**: https://registry.npmjs.org/@sentry/react/-/react-10.54.0.tgz
**Dependency Paths**: @sentry/react

---

### [@size-limit/preset-app (12.1.0)](https://github.com/ai/size-limit#readme)
Size Limit preset for applications
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017 Andrey Sitnik <andrey@sitnik.es>
### Package Info

**Authors**: andrey@sitnik.es
**Package Manager**: NPM
**Package Homepage**: https://github.com/ai/size-limit#readme
**Package Download URL**: https://registry.npmjs.org/@size-limit/preset-app/-/preset-app-12.1.0.tgz
**Dependency Paths**: @size-limit/preset-app

---

### [@testing-library/dom (10.4.1)](https://github.com/testing-library/dom-testing-library#readme)
Simple and complete DOM testing utilities that encourage good testing practices.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017 Kent C. Dodds
### Package Info

**Authors**: brrianalexis.dev@gmail.com, carson.mckinstry@gmail.com, decroockjovi@gmail.com, dfcook@hotmail.com, mail@lenzw.de, mdjastrzebski@gmail.com, me@kentcdodds.com, mpeyper7@gmail.com, patrick.gotthardt@trivago.com, patrick.hulce@gmail.com, polvara@gmail.com, rahim.alwer@gmail.com, silbermann.sebastian@gmail.com, testinglibraryoss@gmail.com, thymikee@gmail.com, timdeschryver@outlook.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/testing-library/dom-testing-library#readme
**Package Download URL**: https://registry.npmjs.org/@testing-library/dom/-/dom-10.4.1.tgz
**Dependency Paths**: @testing-library/user-event > @testing-library/dom > @testing-library/react > @testing-library/dom > @testing-library/dom

---

### [@testing-library/jest-dom (6.9.1)](https://github.com/testing-library/jest-dom#readme)
Custom jest matchers to test the state of the DOM
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017 Kent C. Dodds
### Package Info

**Authors**: brrianalexis.dev@gmail.com, carson.mckinstry@gmail.com, decroockjovi@gmail.com, dfcook@hotmail.com, mail@lenzw.de, mdjastrzebski@gmail.com, me@kentcdodds.com, mpeyper7@gmail.com, patrick.gotthardt@trivago.com, patrick.hulce@gmail.com, polvara@gmail.com, rahim.alwer@gmail.com, silbermann.sebastian@gmail.com, testinglibraryoss@gmail.com, thymikee@gmail.com, timdeschryver@outlook.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/testing-library/jest-dom#readme
**Package Download URL**: https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-6.9.1.tgz
**Dependency Paths**: @testing-library/jest-dom

---

### [@testing-library/react (16.3.2)](https://github.com/testing-library/react-testing-library#readme)
Simple and complete React DOM testing utilities that encourage good testing practices.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017 Present Kent C. Dodds
### Package Info

**Authors**: brrianalexis.dev@gmail.com, carson.mckinstry@gmail.com, decroockjovi@gmail.com, dfcook@hotmail.com, mail@lenzw.de, matanbobi@gmail.com, mdjastrzebski@gmail.com, me@kentcdodds.com, mpeyper7@gmail.com, patrick.gotthardt@trivago.com, patrick.hulce@gmail.com, polvara@gmail.com, rahim.alwer@gmail.com, silbermann.sebastian@gmail.com, testinglibraryoss@gmail.com, thymikee@gmail.com, timdeschryver@outlook.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/testing-library/react-testing-library#readme
**Package Download URL**: https://registry.npmjs.org/@testing-library/react/-/react-16.3.2.tgz
**Dependency Paths**: @testing-library/react

---

### [@testing-library/user-event (14.6.1)](https://github.com/testing-library/user-event#readme)
Fire events the same way the user does
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2020 Giorgio Polvara
### Package Info

**Authors**: brrianalexis.dev@gmail.com, carson.mckinstry@gmail.com, decroockjovi@gmail.com, dfcook@hotmail.com, mail@lenzw.de, mdjastrzebski@gmail.com, me@kentcdodds.com, mpeyper7@gmail.com, patrick.gotthardt@trivago.com, patrick.hulce@gmail.com, polvara@gmail.com, rahim.alwer@gmail.com, silbermann.sebastian@gmail.com, testinglibraryoss@gmail.com, thymikee@gmail.com, timdeschryver@outlook.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/testing-library/user-event#readme
**Package Download URL**: https://registry.npmjs.org/@testing-library/user-event/-/user-event-14.6.1.tgz
**Dependency Paths**: @testing-library/user-event

---

### [@types/node (25.9.1)](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node)
TypeScript definitions for node
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Microsoft Corporation.
### Package Info

**Authors**: ts-npm-types@microsoft.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node
**Package Download URL**: https://registry.npmjs.org/@types/node/-/node-25.9.1.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > @types/node > vitest > @types/node > vitest > @vitest/mocker > vite > @types/node > @vitejs/plugin-react > vite > @types/node > vite > @types/node > @lhci/cli > lighthouse > speedline-core > @types/node > @lhci/cli > lighthouse > chrome-launcher > @types/node > @lhci/cli > chrome-launcher > @types/node > @size-limit/preset-app > @size-limit/time > estimo > find-chrome-bin > @puppeteer/browsers > extract-zip > @types/yauzl > @types/node > @types/node

---

### [@types/react (19.2.14)](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)
TypeScript definitions for react
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Microsoft Corporation.
### Package Info

**Authors**: ts-npm-types@microsoft.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react
**Package Download URL**: https://registry.npmjs.org/@types/react/-/react-19.2.14.tgz
**Dependency Paths**: @testing-library/react > @types/react-dom > @types/react > @types/react-dom > @types/react > @testing-library/react > @types/react > @types/react

---

### [@types/react-dom (19.2.3)](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom)
TypeScript definitions for react-dom
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Microsoft Corporation.
### Package Info

**Authors**: ts-npm-types@microsoft.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom
**Package Download URL**: https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.3.tgz
**Dependency Paths**: @testing-library/react > @types/react-dom > @types/react-dom

---

### [@vitejs/plugin-react (5.1.4)](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#readme)
The default Vite plugin for React projects
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2019 present, Yuxi (Evan) You and Vite contributors
### Package Info

**Authors**: vite@voidzero.dev, yyx990803@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#readme
**Package Download URL**: https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-5.1.4.tgz
**Dependency Paths**: @vitejs/plugin-react

---

### [@vitest/coverage-v8 (4.1.7)](https://vitest.dev/guide/coverage)
V8 coverage provider for Vitest
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2021 Present VoidZero Inc. and Vitest contributors
### Package Info

**Authors**: anthonyfu117@hotmail.com, foxzdavinci@gmail.com, hey.patak@gmail.com, vitest.dev@gmail.com, yyx990803@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://vitest.dev/guide/coverage
**Package Download URL**: https://registry.npmjs.org/@vitest/coverage-v8/-/coverage-v8-4.1.7.tgz
**Dependency Paths**: vitest > @vitest/coverage-v8 > @vitest/coverage-v8

---

### [autoprefixer (10.5.0)](https://github.com/postcss/autoprefixer#readme)
Parse CSS and add vendor prefixes to CSS rules using values from the Can I Use website
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2013 Andrey Sitnik <andrey@sitnik.es>
### Package Info

**Authors**: andrey@sitnik.es
**Package Manager**: NPM
**Package Homepage**: https://github.com/postcss/autoprefixer#readme
**Package Download URL**: https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.5.0.tgz
**Dependency Paths**: autoprefixer

---

### [esbuild (0.28.0)](https://github.com/evanw/esbuild#readme)
An extremely fast JavaScript and CSS bundler and minifier.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2020 Evan Wallace
### Package Info

**Authors**: evan.exe+esbuild@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/evanw/esbuild#readme
**Package Download URL**: https://registry.npmjs.org/esbuild/-/esbuild-0.28.0.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > vite > esbuild > vitest > vite > esbuild > @vitest/coverage-v8 > vitest > @vitest/mocker > vite > esbuild > vitest > @vitest/mocker > vite > esbuild > @vitejs/plugin-react > vite > esbuild > vite > esbuild > esbuild

---

### [eslint (10.4.0)](https://eslint.org/)
An AST-based pattern checker for JavaScript.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT
#### Other Licenses
BSD-3-Clause
#### Copyrights
  License: MIT
Copyright (c)  OpenJS Foundation and other contributors, <www.openjsf.org>
  License: BSD-3-Clause
Copyright (c) 2013 Joel Feenstra
### Package Info

**Authors**: contact@eslint.org, npm@openjsf.org
**Package Manager**: NPM
**Package Homepage**: https://eslint.org/
**Package Download URL**: https://registry.npmjs.org/eslint/-/eslint-10.4.0.tgz
**Dependency Paths**: eslint-plugin-react-hooks > eslint > eslint-plugin-prettier > eslint > eslint-config-prettier > eslint > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/utils > eslint > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/type-utils > eslint > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/parser > eslint > typescript-eslint > @typescript-eslint/eslint-plugin > eslint > @eslint/js > eslint > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/utils > @eslint-community/eslint-utils > eslint > eslint

---

### [eslint-config-prettier (10.1.8)](https://github.com/prettier/eslint-config-prettier#readme)
Turns off all rules that are unnecessary or might conflict with Prettier.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017, 2018, 2019, 2020, 2021, 2022, 2023 Simon Lydell and contributors
### Package Info

**Authors**: admin@1stg.me, georgii.dolzhykov@gmail.com, simon.lydell@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/prettier/eslint-config-prettier#readme
**Package Download URL**: https://registry.npmjs.org/eslint-config-prettier/-/eslint-config-prettier-10.1.8.tgz
**Dependency Paths**: eslint-plugin-prettier > eslint-config-prettier > eslint-config-prettier

---

### [eslint-plugin-prettier (5.5.5)](https://github.com/prettier/eslint-plugin-prettier#readme)
Runs prettier as an eslint rule
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2017 Andres Suarez and Teddy Katz
### Package Info

**Authors**: admin@1stg.me, aosukeke@gmail.com, ben@reload.me.uk, simon.lydell@gmail.com, teddy.katz@gmail.com, zertosh@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/prettier/eslint-plugin-prettier#readme
**Package Download URL**: https://registry.npmjs.org/eslint-plugin-prettier/-/eslint-plugin-prettier-5.5.5.tgz
**Dependency Paths**: eslint-plugin-prettier

---

### [eslint-plugin-react-hooks (7.1.1)](https://react.dev/)
ESLint rules for React Hooks
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT
#### Other Licenses
0BSD
#### Copyrights
  License: MIT
Copyright (c)  Meta Platforms, Inc. and affiliates.
  License: 0BSD
Copyright (c)  Meta Platforms, Inc. and affiliates.
### Package Info

**Authors**: react-core@meta.com
**Package Manager**: NPM
**Package Homepage**: https://react.dev/
**Package Download URL**: https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.1.1.tgz
**Dependency Paths**: eslint-plugin-react-hooks

---

### [eslint-plugin-react-refresh (0.5.2)](https://github.com/ArnaudBarre/eslint-plugin-react-refresh#readme)
Validate that your components can safely be updated with Fast Refresh
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Arnaud Barré (https://github.com/ArnaudBarre)
### Package Info

**Authors**: arnaud.barre72@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/ArnaudBarre/eslint-plugin-react-refresh#readme
**Package Download URL**: https://registry.npmjs.org/eslint-plugin-react-refresh/-/eslint-plugin-react-refresh-0.5.2.tgz
**Dependency Paths**: eslint-plugin-react-refresh

---

### [globals (17.6.0)](https://github.com/sindresorhus/globals#readme)
Global identifiers from different JavaScript environments
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
### Package Info

**Authors**: ben@byk.im, nicholas@nczconsulting.com, schreck.mathias@gmail.com, sindresorhus@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/sindresorhus/globals#readme
**Package Download URL**: https://registry.npmjs.org/globals/-/globals-17.6.0.tgz
**Dependency Paths**: globals

---

### [jsdom (29.1.1)](https://github.com/jsdom/jsdom#readme)
A JavaScript implementation of many web standards
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2010 Elijah Insua
### Package Info

**Authors**: code@zirro.se, d@domenic.me, joris@jorisvanderwel.com, sebmaster16@gmail.com, timothygu99@gmail.com, tmpvar@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/jsdom/jsdom#readme
**Package Download URL**: https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > jsdom > vitest > jsdom > jsdom

---

### [png-to-ico (3.0.1)](https://www.npmjs.com/package/png-to-ico)
convert png to windows ico format
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2016 - 2025 Weilin Shi
### Package Info

**Authors**: chaos2lee@qq.com, weilin834159@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://www.npmjs.com/package/png-to-ico
**Package Download URL**: https://registry.npmjs.org/png-to-ico/-/png-to-ico-3.0.1.tgz
**Dependency Paths**: png-to-ico

---

### [postcss (8.5.15)](https://postcss.org/)
Tool for transforming styles with JS plugins
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2013 Andrey Sitnik <andrey@sitnik.es>
### Package Info

**Authors**: andrey@sitnik.es
**Package Manager**: NPM
**Package Homepage**: https://postcss.org/
**Package Download URL**: https://registry.npmjs.org/postcss/-/postcss-8.5.15.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > vite > postcss > vitest > vite > postcss > @vitest/coverage-v8 > vitest > @vitest/mocker > vite > postcss > vitest > @vitest/mocker > vite > postcss > @vitejs/plugin-react > vite > postcss > vite > postcss > autoprefixer > postcss > postcss

---

### [prettier (3.8.3)](https://prettier.io/)
Prettier is an opinionated code formatter
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT
#### Other Licenses
mit-synopsys, ISC, CC0-1.0, BSD-2-Clause, BSD-3-Clause, Apache-2.0
#### Copyrights
  License: MIT
Copyright (c)  James Long and contributors
  License: mit-synopsys
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
  License: ISC
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
  License: CC0-1.0
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
  License: BSD-2-Clause
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
  License: BSD-3-Clause
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
  License: Apache-2.0
Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
### Package Info

**Authors**: aosukeke@gmail.com, georgii.dolzhykov@gmail.com, ikatyang@gmail.com, lionkay@gmail.com, longster@gmail.com, lucas@azzola.dev, lucasds@gmail.com, me@suchipi.com, prettier-bot@d0d0.com, simon.lydell@gmail.com, vjeuxx@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://prettier.io/
**Package Download URL**: https://registry.npmjs.org/prettier/-/prettier-3.8.3.tgz
**Dependency Paths**: eslint-plugin-prettier > prettier > prettier

---

### [react (19.2.6)](https://react.dev/)
React is a JavaScript library for building user interfaces.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Meta Platforms, Inc. and affiliates.
### Package Info

**Authors**: opensource+npm@fb.com, react-core@meta.com
**Package Manager**: NPM
**Package Homepage**: https://react.dev/
**Package Download URL**: https://registry.npmjs.org/react/-/react-19.2.6.tgz
**Dependency Paths**: @testing-library/react > react-dom > react > react-dom > react > @testing-library/react > react > @sentry/react > react > react

---

### [react-dom (19.2.6)](https://react.dev/)
React package for working with the DOM.
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c)  Meta Platforms, Inc. and affiliates.
### Package Info

**Authors**: opensource+npm@fb.com, react-core@meta.com
**Package Manager**: NPM
**Package Homepage**: https://react.dev/
**Package Download URL**: https://registry.npmjs.org/react-dom/-/react-dom-19.2.6.tgz
**Dependency Paths**: @testing-library/react > react-dom > react-dom

---

### [sharp (0.34.5)](https://sharp.pixelplumbing.com/)
High performance Node.js image processing, the fastest module to resize JPEG, PNG, WebP, GIF, AVIF and TIFF images
**Usage**: Direct
#### Concluded Licenses
Apache-2.0
#### Declared Licenses
Apache-2.0
#### Other Licenses
MIT
#### Copyrights
  License: Apache-2.0
Copyright (c) 2013 Lovell Fuller and others.
  License: MIT
Copyright (c) 2017 François Nguyen and others.
### Package Info

**Authors**: npm@lovell.info
**Package Manager**: NPM
**Package Homepage**: https://sharp.pixelplumbing.com/
**Package Download URL**: https://registry.npmjs.org/sharp/-/sharp-0.34.5.tgz
**Dependency Paths**: sharp

---

### [terser (5.48.0)](https://terser.org/)
JavaScript parser, mangler/compressor and beautifier toolkit for ES6+
**Usage**: Direct
#### Concluded Licenses
BSD-2-Clause
#### Declared Licenses
BSD-2-Clause

#### Copyrights
  License: BSD-2-Clause
Copyright (c) 2012-2018 c) Mihai Bazon <mihai.bazon@gmail.com>
### Package Info

**Authors**: fabiosantosart@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://terser.org/
**Package Download URL**: https://registry.npmjs.org/terser/-/terser-5.48.0.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > vite > terser > vitest > vite > terser > @vitest/coverage-v8 > vitest > @vitest/mocker > vite > terser > vitest > @vitest/mocker > vite > terser > @vitejs/plugin-react > vite > terser > vite > terser > terser

---

### [typescript (6.0.3)](https://www.typescriptlang.org/)
TypeScript is a language for application scale JavaScript development
**Usage**: Direct
#### Concluded Licenses
Apache-2.0
#### Declared Licenses
Apache-2.0
#### Other Licenses
W3C-20150513, Unicode-DFS-2016, MIT, CC-BY-4.0
#### Copyrights
  License: Apache-2.0
Copyright (c)  Microsoft Corporation. All rights reserved.
  License: W3C-20150513
Copyright (c) 1991-2017 Unicode, Inc. All rights reserved.
  License: Unicode-DFS-2016
Copyright (c) 1991-2017 Unicode, Inc. All rights reserved.
  License: MIT
Copyright (c) 1991-2017 Unicode, Inc. All rights reserved.
  License: CC-BY-4.0
Copyright (c) 1991-2017 Unicode, Inc. All rights reserved.
### Package Info

**Authors**: andrew@wheream.io, jacob.b.bailey@gmail.com, npmjs@microsoft.com, typescript-design@microsoft.com, typescript@microsoft.com, wwigham@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://www.typescriptlang.org/
**Package Download URL**: https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz
**Dependency Paths**: typescript-eslint > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > ts-api-utils > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/utils > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/parser > @typescript-eslint/typescript-estree > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/type-utils > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/parser > @typescript-eslint/typescript-estree > @typescript-eslint/project-service > @typescript-eslint/tsconfig-utils > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/parser > @typescript-eslint/typescript-estree > @typescript-eslint/project-service > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/parser > typescript > typescript-eslint > @typescript-eslint/eslint-plugin > typescript > typescript

---

### [typescript-eslint (8.59.4)](https://typescript-eslint.io/packages/typescript-eslint)
Tooling which enables you to use TypeScript with ESLint
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2019 typescript-eslint and other contributors
### Package Info

**Authors**: brad.zacher@gmail.com, james@henry.sc
**Package Manager**: NPM
**Package Homepage**: https://typescript-eslint.io/packages/typescript-eslint
**Package Download URL**: https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.59.4.tgz
**Dependency Paths**: typescript-eslint

---

### [vite (8.0.14)](https://vite.dev/)
Native-ESM powered web dev build tool
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT
#### Other Licenses
ISC, Apache-2.0, CC0-1.0, BSD-2-Clause
#### Copyrights
  License: MIT
Copyright (c) 2019 present, VoidZero Inc. and Vite contributors
  License: ISC
Copyright (c) 2019 present, VoidZero Inc. and Vite contributors
  License: Apache-2.0
Copyright (c) 2019 present, VoidZero Inc. and Vite contributors
  License: CC0-1.0
Copyright (c) 2019 present, VoidZero Inc. and Vite contributors
  License: BSD-2-Clause
Copyright (c) 2019 present, VoidZero Inc. and Vite contributors
### Package Info

**Authors**: vite@voidzero.dev, yyx990803@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://vite.dev/
**Package Download URL**: https://registry.npmjs.org/vite/-/vite-8.0.14.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > vite > vitest > vite > @vitest/coverage-v8 > vitest > @vitest/mocker > vite > vitest > @vitest/mocker > vite > @vitejs/plugin-react > vite > vite

---

### [vitest (4.1.7)](https://vitest.dev/)
Next generation testing framework powered by Vite
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT
#### Other Licenses
ISC, BSD-3-Clause
#### Copyrights
  License: MIT
Copyright (c) 2021 Present VoidZero Inc. and Vitest contributors
  License: ISC
Copyright (c) 2021 Present VoidZero Inc. and Vitest contributors
  License: BSD-3-Clause
Copyright (c) 2021 Present VoidZero Inc. and Vitest contributors
### Package Info

**Authors**: anthonyfu117@hotmail.com, foxzdavinci@gmail.com, hey.patak@gmail.com, vitest.dev@gmail.com, yyx990803@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://vitest.dev/
**Package Download URL**: https://registry.npmjs.org/vitest/-/vitest-4.1.7.tgz
**Dependency Paths**: @vitest/coverage-v8 > vitest > vitest

---

### [wait-on (9.0.10)](https://github.com/jeffbski/wait-on#readme)
wait-on is a cross platform command line utility and Node.js API which will wait for files, ports, sockets, and http(s) resources to become available
**Usage**: Direct
#### Concluded Licenses
MIT
#### Declared Licenses
MIT

#### Copyrights
  License: MIT
Copyright (c) 2015 Jeff Barczewski
### Package Info

**Authors**: jeff.barczewski@gmail.com
**Package Manager**: NPM
**Package Homepage**: https://github.com/jeffbski/wait-on#readme
**Package Download URL**: https://registry.npmjs.org/wait-on/-/wait-on-9.0.10.tgz
**Dependency Paths**: wait-on

---

## Build-Time Native Dependencies

Transitive dependencies of `sharp` (devDependency, used only by
`scripts/generate-icons.js` / `scripts/generate-mockups.js` at build time)
carry `LGPL-3.0-or-later` for their bundled `libvips` shared library.
`libvips` is dynamically linked — permitted usage under LGPL — and none of
these packages are distributed with the production landing page. See
[`docs/security/fossa-compliance-assessment.md`](security/fossa-compliance-assessment.md)
for the full rationale.

Package | License | Notes
--------|---------|------
`@img/sharp-libvips-darwin-arm64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-darwin-x64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-arm` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-arm64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-ppc64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-riscv64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-s390x` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linux-x64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linuxmusl-arm64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-libvips-linuxmusl-x64` (1.2.4) | LGPL-3.0-or-later | libvips shared library
`@img/sharp-win32-arm64` (0.34.5) | Apache-2.0 AND LGPL-3.0-or-later | bundles libvips + sharp glue code
`@img/sharp-win32-ia32` (0.34.5) | Apache-2.0 AND LGPL-3.0-or-later | bundles libvips + sharp glue code
`@img/sharp-win32-x64` (0.34.5) | Apache-2.0 AND LGPL-3.0-or-later | bundles libvips + sharp glue code
`@img/sharp-wasm32` (0.34.5) | Apache-2.0 AND LGPL-3.0-or-later AND MIT | bundles libvips + sharp glue code

Two further transitive packages carry `MPL-2.0`, a weak-copyleft license that
only requires disclosure for modified MPL-licensed files, not the whole
program:

Package | License | Pulled in by | Notes
--------|---------|---------------|------
`lightningcss` (1.32.0) | MPL-2.0 | `vite` | Minifies CSS during production build; unmodified
`axe-core` (4.11.1) | MPL-2.0 | `@lhci/cli` (devDependency) | Accessibility audits in Lighthouse CI; dev/CI-only, unmodified
