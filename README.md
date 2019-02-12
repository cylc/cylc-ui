# Cylc Web

## Building

This project was created with the [vue-cli](https://cli.vuejs.org/). Plugins
can be added through the vue-cli utility, and for building the project, you
can use one of the following commands.

### Project setup

    npm install

### Compiles and hot-reloads for development

    npm run serve

### Compiles and minifies for production

    npm run build

### Run unit tests

    npm run test:unit

### Run functional tests

    npm run test:e2e

Or for headless mode

    npm run test:e2e -- --headless

### Lints and fixes files

    npm run lint

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
