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

import { ref, watch } from 'vue'

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
  if (source.value) {
    callback()
    return
  }
  const unwatch = watch(
    source,
    (ready) => {
      if (ready) {
        unwatch()
        callback()
      }
    },
    options
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

/**
 * Return a ref that is permanently set to true when the source becomes truthy.
 *
 * @param {import('vue').WatchSource} source
 * @param {import('vue').WatchOptions?} options
 * @returns {import('vue').Ref<boolean>}
 */
export function once (source, options = {}) {
  const _ref = ref(false)
  when(
    source,
    () => { _ref.value = true },
    options
  )
  return _ref
}
