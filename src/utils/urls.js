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
 * Get the application base URL (JupyterHub). Always includes trailing slash.
 * @returns {string} - application base URL (JupyterHub) with trailing slash
 */
export function getBaseUrl () {
  const port = window.location.port ? ':' + window.location.port : ''
  const baseUrl = `${window.location.protocol}//${window.location.hostname}${port}${window.location.pathname}`
  if (baseUrl.endsWith('//')) {
    return baseUrl.substring(0, baseUrl.length - 1)
  } else if (baseUrl.endsWith('/')) {
    return baseUrl
  }
  return `${baseUrl}/`
}

/**
 * Create the HTTP and WebSocket URLs for an ApolloClient.
 *
 * @return {{wsUrl: string, httpUrl: string}}
 * @private
 */
export function createGraphQLUrls () {
  // TODO: revisit this and evaluate other ways to build the GraphQL URL - not safe to rely on window.location (?)
  const baseUrl = getBaseUrl()
  const httpUrl = `${baseUrl}graphql`
  const websocketsProtocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:'
  const wsUrl = `${websocketsProtocol}//${baseUrl.substring(baseUrl.indexOf('//'))}subscriptions`
  return {
    httpUrl: httpUrl,
    wsUrl: wsUrl
  }
}
