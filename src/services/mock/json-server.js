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

// TODO: make it configurable
const PORT = 3000

const data = require('./json/index')
const graphql = require('./graphql')
const websockets = require('./websockets')

const jsonServer = require('json-server')

const server = jsonServer.create()
require('express-ws')(server)
const router = jsonServer.router(data)
const middlewares = jsonServer.defaults()

server.use(middlewares)

// Initialize websockets
server.ws('/subscriptions', function (ws) {
  ws.on('message', function (msg) {
    const responseData = websockets.createWebSocketsMessage(msg)
    ws.send(responseData)
  })
})

/**
 * Render a response. This can be used to customize outputs,
 * map response parameters to other values.
 * @see https://www.rahulpnath.com/blog/setting-up-a-fake-rest-api-using-json-server/
 * @param req - express HTTP request
 * @param res - express HTTP response
 */
router.render = (req, res) => {
  // This is the original response.
  let responseData = res.locals.data || {}
  // Here we want to customize the response for GraphQL requests.
  // req.body is a key-value pairs of data submitted, or undefined.
  if (req.originalUrl === '/graphql' && req.body) {
    if (req.method === 'GET') {
      responseData = { errors: [{ message: 'Must provide query string.' }] }
    } else {
      responseData = graphql.handleGraphQLRequest(req)
    }
  }
  // NB: json-server returns 404 for requests that are not in db.json, but
  //     we have dynamic requests for the /graphql endpoint (i.e. no single
  //     data response) hence the status(200) below.
  res.status(200).jsonp(responseData)
}

server.use(router)
server.listen(PORT, () => {
  console.log('JSON Server is running')
})
