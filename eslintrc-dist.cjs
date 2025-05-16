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

/**
 * Eslint config for dist directory.
 *
 * Note: we can't keep it in there because it would get wiped by build.
 */
module.exports = {
  plugins: ['compat'],
  extends: ['plugin:compat/recommended'],
  env: {
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    // Don't need to worry about ECMA syntax as that's handled by Vite/ESBuild
    ecmaVersion: 'latest',
  },
  noInlineConfig: true,
  reportUnusedDisableDirectives: false, // doesn't seem to work
  settings: {
    polyfills: [
      // Used by GraphiQL, shouldn't be a problem:
      'navigator.userAgentData',
    ],
  },
}
