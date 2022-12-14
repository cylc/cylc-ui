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

const LEVEL = process.env.NODE_ENV === 'production' ? 'error' : 'warn'

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:cypress/recommended',
  ],
  rules: {
    'no-console': LEVEL,
    'no-debugger': LEVEL,
    'no-unreachable': LEVEL,
    'no-unused-vars': LEVEL,
    'max-len': [
      LEVEL,
      {
        code: 80,
        comments: 80,
        ignoreUrls: true,
      },
    ],
    'comma-dangle': [
      LEVEL,
      // 'only-multiline'
      'always-multiline',
    ],
    'func-call-spacing': [
      LEVEL,
      'never',
    ],
    'function-call-argument-newline': [
      LEVEL,
      'consistent',
    ],
    'function-paren-newline': [
      LEVEL,
      'multiline-arguments',
    ],
    indent: [
      LEVEL,
      2,
      {
        ignoredNodes: [
          'TemplateLiteral',
        ],
      },
    ],
    'key-spacing': [
      LEVEL,
    ],
    'operator-linebreak': [
      LEVEL,
      'before',
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'template-curly-spacing': [
      'off',
    ],
    'vue/multi-word-component-names': [
      'off',
    ],
    'vue/no-reserved-component-names': [
      'off',
    ],
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true,
      },
    ],
    'import/no-duplicates': 'off',
    'no-duplicate-imports': 'error',
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
}
