[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cylc/cylc-ui)](https://github.com/cylc/cylc-ui/releases)
[![Build Status](https://github.com/cylc/cylc-ui/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/cylc/cylc-ui/actions/workflows/main.yml?query=branch%3Amaster)
[![codecov](https://codecov.io/gh/cylc/cylc-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/cylc/cylc-ui)

# Cylc UI

## Installation

Install the [UI Server](https://github.com/cylc/cylc-uiserver) which bundles
the UI.

## Copyright and Terms of Use

Copyright (C) 2018-<span actions:bind='current-year'>2023</span> NIWA & British Crown (Met Office) & Contributors.

Cylc is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

Cylc is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
Cylc.  If not, see [GNU licenses](http://www.gnu.org/licenses/).

## Development

### Install & Build

```bash
# Project setup
yarn install

# start dev server in offline mode (uses mock data, auto-updates the browser page on change)
yarn run serve

# pass options to vite (e.g. to use a different port or expose host)
VITE_OPTIONS='--host myhost' yarn run serve

# build for production
yarn run build

# build for development (rebuilds on change)
yarn run build:watch
# and launch using
cylc gui --ui-build-dir=<cylc-ui-path>/dist/

# Note the incremental rebuild is quite slow so an alternative to build:watch is
cylc gui --no-browser --port=3000 --ServerApp.allow_origin='http://localhost:5173'
# and launch using
yarn run serve:vue --mode development

# start dev server in offline mode, using the build instead of source files
yarn run preview
```

### Tests

There are three groups of tests:

* Unit tests
  * Simple unit tests for individual functions and classes.
  * **Framework:** [Vitest](https://vitest.dev/)
  * **Assertions:** [Chai](https://www.chaijs.com/)/[Jest](https://jestjs.io/docs/expect)
  * **Path:** `tests/unit`
  * **Command:** `yarn run test:unit` (watches by default, only re-runs changed file)
    * (To prevent watching, use `yarn vitest run`)
* Component tests
  * In-browser tests which mount a single Vue component standalone.
  * **Framework:** [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
  * **Assertions:** Chai
  * **Path:** `cypress/component`
  * **Command:** `yarn run test:component`
    * (For "headless" mode use `yarn cypress run --component --config video=false`)
* End to end tests
  * In-browser tests which load entire pages of the UI using mocked data.
  * **Framework:** Cypress
  * **Assertions:** Chai
  * **Path:** `tests/e2e`
  * **Command:** `yarn run test:e2e`
    * (For "headless" mode use `yarn run serve cy:run`)

For coverage:
```bash
yarn run coverage:unit
yarn run coverage:e2e
```

### Mocked Data

The "offline" mode (aka `yarn run serve`) which is also used for the end to end
tests is powered by a "mock" data server.

You can find the index of mocked data here:
[`src/services/mock/json/index.js`](src/services/mock/json/index.js)

Mock data is automatically loaded when the subscription/query issued matches
an entry in that file.

### Code Style

See `.eslintrc.js` for style, to test run:

```bash
yarn run lint
```

Or to lint a particular file/directory:

```bash
yarn eslint path/to/file
```

### Project Setup

We are using [Vue](https://vuejs.org/).
The project was originally created with [vue-cli](https://cli.vuejs.org/), but
has switched to [Vite](https://vitejs.dev/) with the upgrade from Vue 2 to 3.

The configuration for how the app is served and built is defined in
[`vite.config.js`](vite.config.js).

We are currently using the [Vuetify component library](https://vuetifyjs.com/en/).
Its configuration is defined in [`src/plugins/vuetify.js`](src/plugins/vuetify.js).

We use [concurrently](https://github.com/open-cli-tools/concurrently) for
concurrently running the mock data json-server and the Vite dev server, and
also Cypress. This is configured in [`scripts/concurrently.js`](scripts/concurrently.js).

### Browser compatibility

There are two aspects of browser compatibility:
- ECMAScript syntax (e.g. does the browser support the optional chaining
operator (`?.`)?)
- API calls (e.g. does the browser support `Array.prototype.at()`?)

The former is [handled by Vite](https://vitejs.dev/guide/build.html#browser-compatibility).
It uses [esbuild](https://esbuild.github.io/api/#target) to transform instances
of newer syntax when building.

However, new APIs are not handled and must be polyfilled if deemed necessary.

We define a specification for browser compatibility in
[`.browserslistrc`](.browserslistrc). See https://github.com/browserslist/browserslist.
- We are not currently using it for the Vite/esbuild configuration because the
default is good enough (but we could do in future using a plugin such as
[esbuild-plugin-browserslist](https://www.npmjs.com/package/esbuild-plugin-browserslist)).
- For polyfilling newer APIs, we could use
[Babel + core-js](https://babeljs.io/docs/babel-preset-env#usebuiltins) which
uses the browserslist specification. Or perhaps the simplest solution is to
use [polyfill.io](https://polyfill.io/v3/) which merely requires adding a
`<script>` tag to [`index.html`](index.html) which will fetch the listed
polyfills only if needed by the user's browser. We could even leave it up to
sites to patch their Cylc UI builds with the polyfills they require.

Remember it is not just our source code that must meet our back-compat
specification, but our bundled dependencies (e.g.
[Vuetify](https://vuetifyjs.com/en/getting-started/browser-support/)) too!
Vite/esbuild handles syntax for bundled dependencies.

However the bottom line is that as of 2023, browser support is much less of an
issue than it was even a couple of years ago, due to the proliferation of
evergreen browsers. The only real concern is bleeding-edge API calls creeping
into our source code or runtime dependencies. To catch this, we are using
[eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat)
in CI to scan the build for any such API calls.

### Integration with the backend Cylc UI server

Running `yarn run build[:watch]` outputs the build into the `./dist/` folder.
When running the Cylc Hub, you must remember to point
the static files directory to the location of your `./dist` folder.

This way with both Cylc Hub and Cylc UI running, you can work on either -
or both - projects. Changes done in your Tornado application should reflect immediately
or upon process restart. While the changes done in your Vue.js application
will be automatically handled by your `build:watch` command.

### Internationalization

This project utilizes [vue-i18n](https://kazupon.github.io/vue-i18n/) for
internationalization. While this project is not part of Vue.js, it is maintained
by one of the Vue.js core developers.

Messages for internationalization are kept in JSON files. Look at
`src/lang/` for each locale. For example, for British English, the message
files are kept under `src/lang/en-GB`.

The locale is defined by a variable `$i18n`, which is accessible in each
component. So in a component you should be able to change the locale -
if necessary - by calling `this.$i18n.locale = 'pt-BR'`.

### Accessibility

After applying changes to the code, might be a good idea to pass the new version of
the application through an accessibility tool such as [WAVE](https://wave.webaim.org/).

There is also a [browser](https://wave.webaim.org/extension/) extension which makes
testing the development version much easier.

### TypeScript

TypeScript is most likely the future for us. It can be adopted gradually.
At the moment we only have JSDoc comments which can provide type information
in your IDE.
