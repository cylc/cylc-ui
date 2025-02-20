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
 * Mapping between a query and the returned data. The returned data
 * can be generated programmatically, or with GraphiQL, or another GraphQL
 * command line.
 */
const data = require('./json/index.cjs')

/**
 * Given a GraphQL query, this function tries to fetch the operation
 * name from a subscription, query, or mutation GraphQL query.
 *
 * Sometimes requests contain the .OperationName properties, but other
 * times they don't, so we have to try to guess it either from the
 * query name, or from its text (this function does the former, for
 * introspection we are searching for __schema elsewhere).
 *
 * Returns an empty string if not found.
 *
 * @param {string} query - GraphQL query
 * @returns {string} operation name, or empty string if not found
 */
function getOperationName (query) {
  const regexp = /\s*(subscription|query|mutation)\s+([a-zA-Z0-9_]+)/
  const match = regexp.exec(query)
  if (match && match.length >= 3) {
    return match[2]
  }
  return ''
}

/**
 * Get the response for a given GraphQL query operation name.
 *
 * @param {string} operationName - GraphQL query operation name (e.g. GScanQuery, WorkflowTableQuery, etc)
 * @param {?Record<string, *>} variables - GraphQL query variables
 * @returns {*|Promise<*>} GraphQL response
 */
async function getGraphQLQueryResponse (operationName, variables) {
  const res = data[operationName] || {}
  if (typeof res === 'function') {
    return await res(variables)
  }
  return res
}

/**
 * Will take care of guessing the operation name from the GraphQL request,
 * and returning the valid response (if any).
 *
 * @param {*} request - Express HTTP GraphQL request
 * @returns {*|Promise<*>} GraphQL response
 */
async function handleGraphQLRequest (request) {
  const isSchemaQuery = request.body.query.includes('__schema')
  const operationName = isSchemaQuery
    ? 'IntrospectionQuery'
    : getOperationName(request.body.query)
  try {
    return await getGraphQLQueryResponse(operationName, request.body.variables)
  } catch (err) {
    console.error(err)
    return {
      errors: [{
        message: err.message,
        extensions: {
          stacktrace: err.stack.split ? err.stack.split('\n') : err.stack,
        },
      }],
    }
  }
}

module.exports = {
  getOperationName,
  getGraphQLQueryResponse,
  handleGraphQLRequest
}
