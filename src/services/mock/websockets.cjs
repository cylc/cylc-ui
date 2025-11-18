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

const { MessageType } = require('graphql-ws')
const { isArray } = require('lodash')
const graphql = require('./graphql.cjs')

/**
 * Send a WebSockets reply message(s), given the query message (received from client).
 *
 * @see https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md
 *
 * @param {WebSocket} ws
 * @param {string} msg - JSON encoded client message
 */
async function sendWSResponse (ws, msg) {
  /** @type {import('graphql-ws').Message} */
  const parsed = JSON.parse(msg)
  if (parsed) {
    switch (parsed.type) {
      case MessageType.ConnectionInit:
        return ws.send(JSON.stringify({ type: MessageType.ConnectionAck }))
      case MessageType.Ping:
        return ws.send(JSON.stringify({ type: MessageType.Pong }))
      case MessageType.Pong:
      case MessageType.Complete:
        return
      case MessageType.Subscribe: {
        const operationName = (
          parsed.payload.operationName || graphql.getOperationName(parsed.payload.query)
        )
        const responseData = await graphql.getGraphQLQueryResponse(operationName, parsed.payload.variables)
        for (const item of isArray(responseData) ? responseData : [responseData]) {
          ws.send(JSON.stringify({
            id: parsed.id,
            type: MessageType.Next,
            payload: { data: item },
          }))
        }
        return
      }
      default: {
        throw new Error(`Invalid message type for graphql-transport-ws: ${parsed.type}`)
      }
    }
  }
  throw new Error(`Failed to parse msg: ${msg}`)
}

module.exports = {
  sendWSResponse,
}
