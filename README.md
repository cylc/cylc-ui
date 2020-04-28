[![Build Status](https://github.com/cylc/cylc-ui/workflows/CI/badge.svg)](https://github.com/cylc/cylc-ui/actions)
[![codecov](https://codecov.io/gh/cylc/cylc-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/cylc/cylc-ui)

# Cylc UI

## Building

This project was created with the [vue-cli](https://cli.vuejs.org/). Plugins
can be added through the vue-cli utility, and for building the project, you
can use one of the following commands.

### Project setup

    yarn install

### Compiles and hot-reloads for development

    yarn run serve

### Compiles and minifies for production

    yarn run build

### Compiles and watch for changes for development

    yarn run build:watch

### Produce build report

    yarn run build:report

### Run unit tests

    yarn run test:unit

For coverage

    yarn run coverage:unit

### Run functional tests

    yarn run test:e2e

Or for headless mode

    yarn run test:e2e -- --headless --config video=false

For coverage

    yarn run coverage:e2e

### Lints and fixes files

    yarn run lint

## Integration with the backend Cylc UI server

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

## Internationalization

This project utilizes [vue-i18n](https://kazupon.github.io/vue-i18n/) for
internationalization. While this project is not part of Vue.js, it is maintained
by one of the Vue.js core developers.

Messages for internationalization are kept in JSON files. Look at
`src/lang/` for each locale. For example, for British English, the message
files are kept under `src/lang/en-GB`.

The locale is defined by a variable `$i18n`, which is accessible in each
component. So in a component you should be able to change the locale -
if necessary - by calling `this.$i18n.locale = 'pt-BR'`.

## Accessibility

After applying changes to the code, might be a good idea to pass the new version of
the application through an accessibility tool such as [WAVE](https://wave.webaim.org/).

There is also a [browser](https://wave.webaim.org/extension/) extension which makes
testing the development version much easier.

## JavaScript, ES6, TypeScript

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

## Copyright and Terms of Use

Copyright (C) 2018-2020 NIWA & British Crown (Met Office) & Contributors.

Cylc is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

Cylc is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
Cylc.  If not, see [GNU licenses](http://www.gnu.org/licenses/).
