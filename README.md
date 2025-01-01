[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cylc/cylc-ui)](https://github.com/cylc/cylc-ui/releases)
[![Build Status](https://github.com/cylc/cylc-ui/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/cylc/cylc-ui/actions/workflows/main.yml?query=branch%3Amaster)
[![codecov](https://codecov.io/gh/cylc/cylc-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/cylc/cylc-ui)

# Cylc UI

## Installation

Install the [UI Server](https://github.com/cylc/cylc-uiserver) which bundles
the UI.

## Copyright and Terms of Use

Copyright (C) 2018-<span actions:bind='current-year'>2025</span> NIWA & British Crown (Met Office) & Contributors.

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

# start dev server in offline mode, using the build instead of source files
yarn run preview
```

Note the incremental rebuild is quite slow so an alternative to `yarn run build:watch` is
to run the Vite development server while using the Cylc UI Server live data:

```bash
# First launch the gui to authenticate with the URL token
cylc gui --port=3000 --ServerApp.allow_origin='http://localhost:5173'
# Close that tab once it's loaded
# Now launch using
yarn run serve:vue --mode development
# (you must access via http://localhost:5173)
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
[`src/services/mock/json/index.cjs`](src/services/mock/json/index.cjs)

Mock data is automatically loaded when the subscription/query issued matches
an entry in that file.

### Code Style

See [`.eslintrc.cjs`](.eslintrc.cjs) for style. To test, run:

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
also Cypress. This is configured in [`scripts/concurrently.cjs`](scripts/concurrently.cjs).

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

> [!NOTE]
> Internationalization is only partly implemented at the moment.

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

## How The Data Is Provisioned

The Cylc UI connects to the GraphQL endpoint provided by the Cylc UI Server
using a websocket.

### GraphQL Queries

Here's the "Hello World!" of Cylc GraphQL queries, it returns the ID of every
workflow (under `~/cylc-run`):

```graphql
query {
  workflows {
    id
  }
}
```

### GraphQL Subscriptions

To keep data up to date, we use subscriptions, a subscription is essentially a
repeating query. The way we've set it up, the server will only send new
responses when the data changes.

This subscription will send back the ID of every workflow, any time the list of
workflows changes (i.e. when you install a new workflow or clean an old one):

```graphql
subscription {
  workflows {
    id
  }
}
```

### GraphQL Delta-Subscriptions

To avoid sending the entire list of workflow IDs every time the list changes
we subscribe to special "delta" objects. These allow us to track changes in
the list which is useful for efficiently synchronising data between the server
and the web app.

This subscription will notify us when workflows are added, updated or removed:

```graphql
subscription {
  deltas {
    added {
      workflows {
        id
      }
    }
    updated {
      workflows {
        id
      }
    }
    pruned {
      id
    }
  }
}
```

* The added-delta returns newly added data.
* The updated-delta returns updated data.
* The pruned-delta returns a list of IDs which have been removed.

### How Views Request Data

The Cylc "views" (e.g. the Tree, Table and Graph views) define a subscription
which defines **all** of the data they require.

This subscription is automatically registered with the WorkflowService when the
view is loaded.

The WorkflowService will then issue and manage this subscription on your
behalf. The data you requested will become available in the data store
when it arrives. The data store will be kept up to date whenever this data
changes.

The subscription will be cancelled when the view is closed.

### Subscription Merging

When a new view is opened, the WorkflowService will take the subscription for
this view merge it with any other active subscriptions from other views.

E.G. If view-a has this subscription:

```graphql
subscription {
  deltas {
    added {
      taskProxies {
        id
        name
        status
        firstParent
      }
    }
  }
}
```

And view-b has this subscription:

```graphql
subscription {
  deltas {
    added {
      taskProxies {
        id
        status
        isHeld
        isRunahead
        isQueued
      }
    }
  }
}
```

Then the WorkflowService will merge these subscriptions into:

```graphql
subscription {
  deltas {
    added {
      taskProxies {
        id
        name
        status
        firstParent
        isHeld
        isRunahead
        isQueued
      }
    }
  }
}
```

This is how we avoid requesting duplicate information about the same things for
different views.

Each view can request whatever data it needs, however, filtering cannot be
performed in the subscription because that filtering would apply to all merged
subscriptions. If two subscriptions cannot be merged (e.g. different filtering
options) then an error will be raised. Perform filtering within the view
where appropriate.

When the UI Server sends deltas back to the WorkflowService, they are used to
maintain the data store.

Note, ensure you request the `id` for **all** objects, the data store needs
this to operate.

### The Data Store

The central data store contains all of the information requested by **all** of
the views. The WorkflowService keeps this up to date by applying the deltas it
receives from the UI Server to the store in order. Each delta is timestamped
which allows us to detect transmission errors, the store will be rebuilt in the
event of error.

The data store is currently VueX but will probably be migrated to Pina in the
future.

The data store contains an entry for every object requested where an object
might be a user, workflow, cycle-point, task or job. Every object has a unique
ID.

For example, a workflow in the data store might look like this:

```js
{
  // the unique object ID as a string
  id: '~me/my-workflow',
  // the parsed ID as an object
  tokens: {user: 'me', workflow: 'my-workflow, ...},
  // the kind of node that this is
  type: 'workflow',
  // the last part of the ID
  name: 'my-workflow',
  // any data that has been requested
  data: {
    status: 'running',
    host: 'myhost',
    port: '1234',
  },
  // read on...
  children: [],
}
```

You can access these objects via one of two ways, the index or the tree.

#### The Index

This is a mapping which contains every object listed by its ID.

E.G. something along the lines of:

```js
$index = {
  '~me': Object,
  '~me/my-workflow': Object,
  '~me/my-workflow//cycle': Object,
  '~me/my-workflow//cycle/task': Object,
  '~me/my-workflow//cycle/task/job': Object,
}
```

This is useful if you know the ID of the object you want to retrieve.

#### The Tree

For convenience, these nodes are also arranged into a hierarchy allowing you to
walk/iterate over them.

* The children of a node are stored in `children`.
* The ID of the parent node is stored in `parent`.

E.G. the tree structure might look like this:

* `~me`
  * `workflow-one`
    * `cycle-one`
      * `task-a`
        * `job-1`
        * `job-2`
      * `task-b`
    * `cycle-one`
      * `task-a`
  * `workflow-two`

### Family Hierarchies

Some views (e.g. the Tree view) want access to the family hierarchy of tasks.

E.G. for this workflow:

```ini
[runtime]
  [A]
  [[a1, a2]]
    inherit = A
```

Defines this hierarchy:

* root (implicit root family)
  * A (user-defined family)
    * a1 (task)
    * a2 (task)

If you need to walk the family hierarchy down to a task (like the Tree view
does), then add these fields to your `TaskProxy` subscription:

```
ancestors
FirstParent
```

The data store will now automatically construct a family tree for you to
iterate in every Cycle object.

Access this using the `FamilyTree` property.

### Edges & Namespaces

Some views may require graph edges (i.e. the arrows in the Graph view).

Some views may require namespaces (i.e. task definitions).

These are available via the `$edges` and `$namespaces` indexes which are
available on workflow objects.

### Example View

For documentation on how to write a view see `src/views/SimpleTree.vue` which
contains a simple implementation of a minimal tree view.
