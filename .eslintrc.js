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

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/essential'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: [
      'error',
      2,
      {
        ignoredNodes: [
          'TemplateLiteral'
        ]
      }
    ],
    'template-curly-spacing': [
      'off'
    ],
    'vue/multi-word-component-names': [
      'off'
    ],
    'import/no-duplicates': 'off',
    'no-duplicate-imports': 'error'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
