/*
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

import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginVuetify from 'eslint-plugin-vuetify'
import pluginCypress from 'eslint-plugin-cypress/flat'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

const cypressTestFiles = ['tests/e2e/**', 'tests/component/**']
const unitTestFiles = ['**/*.spec.js']

export default defineConfig([
  // NOTE: neostandard includes various plugins
  ...neostandard({
    noJsx: true,
    // Neostandard makes it easier to configure ignores than ESLint's way:
    ignores: [
      ...resolveIgnoresFromGitignore(),
      '.yarn/',
    ],
  }),

  js.configs.recommended,

  ...pluginVue.configs['flat/essential'],

  ...pluginVuetify.configs['flat/base'],

  {
    languageOptions: {
      sourceType: 'module',
      // Allow new ECMAScript syntax but not globals. This is because vite/esbuild
      // transforms syntax to es2015 (at the earliest) but does not pollyfill APIs.
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      }
    },
    rules: {
      '@stylistic/comma-dangle': ['error', {
        arrays: 'only-multiline',
        objects: 'only-multiline',
        imports: 'only-multiline',
        exports: 'only-multiline',
        functions: 'only-multiline',
      }],

      'no-console': ['error', {
        allow: ['warn', 'error'],
      }],

      'vue/multi-word-component-names': ['off'],

      'promise/param-names': ['error'],
      'promise/no-return-wrap': ['error'],
    },
  },

  {
    files: ['scripts/**', 'src/services/mock/**'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['off'],
    },
  },

  {
    files: cypressTestFiles,
    plugins: {
      cypress: pluginCypress,
    },
    extends: ['cypress/recommended'],
    rules: {
      'cypress/unsafe-to-chain-command': ['off'],
    }
  },

  {
    files: unitTestFiles,
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },

  {
    files: [...unitTestFiles, ...cypressTestFiles],
    plugins: {
      'no-only-tests': noOnlyTests,
    },
    rules: {
      'no-console': ['off'],

      'no-only-tests/no-only-tests': ['error'],

      // Don't complain about certain chai assertions:
      'no-unused-expressions': ['off'],
    },
  },
])
