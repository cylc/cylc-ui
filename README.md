[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cylc/cylc-ui)](https://github.com/cylc/cylc-ui/releases)
[![Build Status](https://github.com/cylc/cylc-ui/workflows/CI/badge.svg)](https://github.com/cylc/cylc-ui/actions)
[![codecov](https://codecov.io/gh/cylc/cylc-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/cylc/cylc-ui)

# Cylc UI

## TODO

I haven't managed to configure webpack to pass through the WASM files yet
so for the moment you have to manually copy the wasm file over into dist
the first time you build.

```bash
cp node_modules//@hpcc-js/wasm/dist/graphvizlib.wasm dist/js/
```

Also use PORT="" in HTML-like markup to move the arrow onto the node rather
than the node label.

## Installation

Install the [UI Server](https://github.com/cylc/cylc-uiserver) which bundles
the UI.

## Copyright and Terms of Use

Copyright (C) 2018-<span actions:bind='current-year'>2022</span> NIWA & British Crown (Met Office) & Contributors.

Cylc is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

Cylc is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
Cylc.  If not, see [GNU licenses](http://www.gnu.org/licenses/).

## Developers

### Building

This project was created with the [vue-cli](https://cli.vuejs.org/).

Vue CLI wraps Webpack, Babel, and other utilities. If you need to
customize Webpack, then you will have to modify the `vue.config.js`
file.

Its syntax is different than what you may find in Webpack documentation
or other websites.

```js
# webpack
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'some-loader',
        options: {
          someOption: true
        }
      }
    ]
  }
}

# vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module.rule('js')
      .test(/\.js$/)
      .use('some-loader')
      .loader('some-loader')
      .options({
        someOption: true
      })
  }
}
```

If you need to customize Babel, take a look at the `babel.config.js`
file. But if you want to transpile dependencies you must update the
`transpileDependencies` array in `vue.config.js`.

```js
# babel.config.js
module.exports = (api) => {
  api.cache(true)
  const presets = [
    '@vue/app'
  ]
  const plugins = [
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
  return { presets, plugins }
}
```

The example above enables class properties (e.g. static properties used in
enumify's Enums) for the code. But dependencies are not transpiled. So you
will have to remember to update `vue.config.js`.

```js
# vue.config.js
module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
  transpileDependencies: [
    // now the project should build fine, and the code in the dependency
    // below can use class properties without any errors. Other dependencies
    // are not transpiled, so if any of those dependencies use class
    // properties in the exported code, then our build may fail, unless
    // we include each library here.
    'some-dependency-using-class-properties'
  ],
  // ...
}
```

`@vue/babel-preset-app` uses `@babel/preset-env` and the `browserslist` config
(`.browserslistrc`) to determine the polyfills needed. See
https://cli.vuejs.org/guide/browser-compatibility.html.

#### Project setup

```
yarn install
```

#### Compiles and hot-reloads demo mode for development

```
yarn run serve
```

#### Compiles and minifies for production

```
yarn run build
```

#### Compiles and watch for changes for development

```
yarn run build:watch
```

#### Produce build report

```
yarn run build:report
```

#### Run unit tests

```
yarn run test:unit
```

Useful opts:
- `--watch`: watch for changes (allows re-running tests much quicker)
- `--bail`: exit after first test failure
- `--colors`: enables coloured output in VSCode integrated terminal

For coverage:
```
yarn run coverage:unit
```

#### Run functional tests

```
yarn run test:e2e
```

Or for headless mode

```
yarn run test:e2e -- --headless --config video=false
```

For coverage

```
yarn run coverage:e2e
```

#### Lints and fixes files

```
yarn run lint
```

### Integration with the backend Cylc UI server

In the previous section _"Compiles and watch for changes for development"_,
there is part of the solution for the integration with the backend Cylc UI Server.

Running the comment to build and watch the solution, will produce a `index.html`
in the `./dist/` folder. When running the Cylc Hub, you must remember to point
the static files directory to the location of your `./dist` folder.

If you have a folder used a _workspace_, you could check out both projects in
that directory. Then, in your working copy of the Cylc Hub, it should be
enough to point the static files directory to `../cylc-ui/dist/`.

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

### JavaScript, ES6, TypeScript

For the moment, the code in this repository is created using ES6, then Babel/WebPack take
care to produce the final JavaScript code executed on browsers.

TypeScript is most likely the future for us, especially as Vue.js announced their 3.x release
includes porting their whole code base to TypeScript. However, we are still pending as of the
time of writing a decision on the libraries used for displaying the workflow graphs.

This is an important decision, and as such may take a little longer to be over. Choosing
a library that does not export types, would require us to find time to type the library
and maintain that type code alongside any library updates.

So for the time being, we are continuing with ES6, and once we have chosen the project
dependencies, we can assess the amount of work to adopt TypeScript given our code base,
ability of other developers to adapt to TypeScript, and the ease of use of the libraries
in our code base.
