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

import axios from 'axios'

/**
 * Remove double forward-slashes from URL's. It avoids the slashes that
 * are preceded by ':', so that the slashes in the URL protocol are kept.
 *
 * @private
 * @param {string} url - the URL
 * @returns {string} - a URL without unnecessary double forward-slashes
 */
function normalize (url) {
  return url.replace(/([^:]\/)\/+/g, '$1')
}

/**
 * Get the application base URL. If the URL will be used for WebSockets, a boolean parameter
 * can be passed so that the protocol can be corrected (when HTTPS, we want WSS, otherwise
 * we will have WS).
 *
 * The returned URL does not include the query search params (i.e. excludes ?redirectTo=/hub/login).
 *
 * The parameter `baseOnly` can be used to define whether the final URL will incl
 *
 * @private
 * @param {boolean} websockets - whether the URL will be used for websockets or not
 * @param {boolean} baseOnly - whether to use only the base URL or not when creating the new URL
 * @returns {string} - the application base URL, containing protocol, hostname, port, and pathname
 */
function getBaseUrl (websockets = false, baseOnly = false) {
  const protocol = websockets
    ? window.location.protocol.startsWith('https') ? 'wss:' : 'ws:'
    : window.location.protocol
  const host = window.location.host
  const baseUrl = `${protocol}//${host}`
  if (baseOnly) {
    return normalize(baseUrl)
  } else {
    const pathname = window.location.pathname
    return normalize(new URL(pathname, baseUrl).href)
  }
}

/**
 * Create a new URL, combining the application base URL with the given URL
 * path.
 *
 * @param {string} path - path to be used when creating a new URL (e.g. /users)
 * @param {boolean} websockets - whether the URL will be used for websockets or not
 * @param {boolean} baseOnly - whether to use only the base URL or not when creating the new URL
 * @returns {string} - the new URL, preceded by the base URL (e.g. https://hub:8080/users/cylc/users)
 */
export function createUrl (path, websockets = false, baseOnly = false) {
  const baseUrl = getBaseUrl(websockets, baseOnly)
  const url = [baseUrl, path]
    .map(part => part.trim())
    .join('/')
  return normalize(url)
}

/**
 * Get request headers for use with UI Server requests.
 *
 * - Adds X-XSRFToken header cookie-based auth.
 */
export function getXSRFHeaders () {
  const xsrfToken = document.cookie.match('\\b_xsrf=([^;]*)\\b')
  const cylcHeaders = {}
  if (Array.isArray(xsrfToken) && xsrfToken.length > 0) {
    // pick the last match
    cylcHeaders['X-XSRFToken'] = xsrfToken.splice(-1)
  }
  return cylcHeaders
}

/**
 * Fetches data from the given path.
 *
 * @param {string} path - The path to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to the fetched data.
 * @throws {Error} If the request fails.
 */
export async function fetchData (path) {
  const { data } = await axios.get(
    createUrl(path),
    { headers: getXSRFHeaders() }
  )
  return data
}
