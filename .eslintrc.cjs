/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const commaDangle = {
  arrays: 'always-multiline',
  objects: 'always-multiline',
  imports: 'always-multiline',
  exports: 'always-multiline',
  functions: 'only-multiline',
}

module.exports = {
  root: true,
  parserOptions: {
    /* Allow new ECMAScript syntax but not globals. This is because vite/esbuild
    transforms syntax to es2015 (at the earliest) but does not pollyfill APIs. */
    ecmaVersion: 'latest',
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vuetify/base',
    'plugin:cypress/recommended',
  ],
  rules: {
    'comma-dangle': [
      'error',
      commaDangle,
    ],
    'vue/comma-dangle': [
      'error',
      commaDangle,
    ],
    'vue/html-indent': [
      'error',
      2,
      {
        alignAttributesVertically: false,
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'template-curly-spacing': [
      'off',
    ],
    'vue/multi-word-component-names': [
      'off',
    ],
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true,
      },
    ],
    'promise/param-names': [
      'error',
    ],
    'promise/no-return-wrap': [
      'error',
    ],
    'cypress/unsafe-to-chain-command': [
      'off',
    ],
  },
}
