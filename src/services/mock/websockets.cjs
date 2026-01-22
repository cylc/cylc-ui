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

const { isArray } = require('lodash')
const graphql = require('./graphql.cjs')

/**
 * Create a WebSockets response.
 *
 * @param {string} id - Subscription ID
 * @param {string} type - Message type (e.g. data, connection_init, etc, see GraphQL spec)
 * @param {Object} [data] - Response data, optional
 * @returns {string}
 */
function wsResponse (id, type, data = null) {
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
  return JSON.stringify(response)
}

/**
 * Send a WebSockets reply message(s), given the query message (received from client).
 *
 * @param {WebSocket} ws
 * @param {string} msg - JSON encoded client message
 */
async function sendWSResponse (ws, msg) {
  const parsed = JSON.parse(msg)
  if (parsed) {
    if (parsed.type === 'connection_init') {
      return ws.send(wsResponse(parsed.id, 'connection_ack'))
    } else if (parsed.type === 'stop') {
      return ws.send(wsResponse(parsed.id, 'complete'))
    } else if (parsed.type === 'start') {
      const operationName = (
        parsed.payload.operationName || graphql.getOperationName(parsed.payload.query)
      )
      const responseData = await graphql.getGraphQLQueryResponse(operationName, parsed.payload.variables)
      for (const item of isArray(responseData) ? responseData : [responseData]) {
        ws.send(wsResponse(parsed.id, 'data', item))
      }
      return
    }
    throw new Error(`Unknown message type ${parsed.type}`)
  }
  throw new Error(`Failed to parse msg: ${msg}`)
}

module.exports = {
  sendWSResponse,
}
