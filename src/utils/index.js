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

import { watch } from 'vue'
import { i18n } from '@/i18n'

/**
 * i18n-enabled operation, to get the title respecting the locale used
 * in the application settings.
 * @param {string} key - i18n key
 * @param {Object} params - optional object key=value used in the i18n message
 * @returns {string}
 */
export const getPageTitle = (key, params = {}) => {
  return `${i18n.global.t('App.name')} | ${i18n.global.t(key, params)}`
}

/**
 * Watch source until it is truthy, then call the callback (and stop watching).
 *
 * Immediate by default.
 *
 * @param {import('vue').WatchSource} source
 * @param {import('vue').WatchCallback} callback
 * @param {import('vue').WatchOptions?} options
 */
export function when (source, callback, options = {}) {
  const unwatch = watch(
    source,
    (ready) => {
      if (ready) {
        unwatch()
        callback()
      }
    },
    { immediate: true, ...options }
  )
}

/**
 * Return a promise that resolves when the source becomes truthy.
 *
 * Awaitable version of when().
 *
 * @param {import('vue').WatchSource} source
 * @param {import('vue').WatchOptions?} options
 * @returns {Promise<void>}
 */
export function until (source, options = {}) {
  return new Promise((resolve) => {
    when(source, resolve, options)
  })
}
