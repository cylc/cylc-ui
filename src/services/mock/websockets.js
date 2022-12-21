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

const graphql = require('./graphql')

/**
 * Create a WebSockets response.
 *
 * @param {string} id - Subscription ID
 * @param {string} type - Message type (e.g. data, connection_init, etc, see GraphQL spec)
 * @param {object} [data] - Response data, optional
 * @returns {{id, type, payload}}
 */
function wsResponse(id, type, data) {
  const response = {
    id,
    type,
  }
  // connection ack does not include a payload
  if (data) {
    response.payload = {
      data,
    }
  }
  return response
}

/**
 * Create a WebSockets reply message, given the query message (received from client).
 * @param {string} msg - JSON encoded client message
 * @returns {string} JSON encoded server reply
 */
function createWebSocketsMessage(msg) {
  const parsed = JSON.parse(msg)
  try {
    if (parsed) {
      if (parsed.type === 'connection_init') {
        return JSON.stringify(wsResponse(parsed.id, 'connection_ack', null))
      } else if (parsed.type === 'stop') {
        return JSON.stringify(wsResponse(parsed.id, 'complete', null))
      } else if (parsed.type === 'start') {
        const operationName = parsed.payload.operationName
          ? parsed.payload.operationName
          : graphql.getOperationName(parsed.payload.query)
        const responseData = graphql.getGraphQLQueryResponse(operationName)
        return JSON.stringify(wsResponse(parsed.id, 'data', responseData))
      }
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`Unknown message type ${parsed.type}`)
    }
    // noinspection ExceptionCaughtLocallyJS
    throw new Error(`Failed to parse msg: ${msg}`)
  } catch (e) {
    return JSON.stringify({
      errors: [e],
    })
  }
}

module.exports = {
  createWebSocketsMessage,
  wsResponse,
}
