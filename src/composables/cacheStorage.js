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

/** @type {Map<string,Response>} */
const fallbackStore = new Map()

/**
 * Returns a Cache object for storing workspace layouts.
 *
 * This uses CacheStorage if available, otherwise falls back to a non-persistent store.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Cache
 */
export function useWorkspaceLayoutsCache () {
  return window.caches?.open('cylc-workspace-layouts') ?? Promise.resolve({
    // Fallback for environments without Cache API support (e.g. Cypress Firefox on GH Actions).
    // Does not persist across page reloads, but oh well.
    async match (key) {
      console.error('Cache API not available; falling back to non-persistent store for workspace layouts.')
      return fallbackStore.get(key)?.clone()
    },
    async put (key, value) {
      // FIFO:
      fallbackStore.delete(key)
      fallbackStore.set(key, value)
    },
    async delete (key) {
      fallbackStore.delete(key)
    },
    async keys () {
      return Array.from(fallbackStore.keys())
    },
  })
}
