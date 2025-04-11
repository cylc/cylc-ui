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

// Code related to GraphiQL

import { parse } from 'graphql'
import { createGraphQLUrls } from '@/graphql/index'
import { getXSRFHeaders } from '@/utils/urls'

// TODO: https://github.com/apollographql/GraphiQL-Subscriptions-Fetcher/issues/16
//       the functions hasSubscriptionOperation and graphQLFetcher are both from
//       the graphiql-subscriptions-fetcher. Unfortunately that project is archived
//       on GitHub, and is using the old API for subscription-transport-ws, which
//       is a dependency of Cylc UI. As we cannot use an older version, instead we
//       have the two functions here, patched as per issue to work with newer API.

/**
 * Tell whether it is a query or subscription.
 *
 * @private
 * @param {{
 *   query: string
 * }}graphQlParams
 * @returns {boolean} true if the params contain a subscription, false otherwise
 */
const hasSubscriptionOperation = function (graphQlParams) {
  const queryDoc = parse(graphQlParams.query)
  for (let _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
    const definition = _a[_i]
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation
      if (operation === 'subscription') {
        return true
      }
    }
  }
  return false
}

/**
 * @typedef SubscribableComponent
 * @property {?Object} subscription - GraphQL subscription
 */

/**
 * The GraphQL fetcher function.
 *
 * @param {?Object} subscriptionsClient
 * @param {function} fallbackFetcher
 * @param {SubscribableComponent} component
 * @returns {function}
 */
const graphQLFetcher = function (subscriptionsClient, fallbackFetcher, component) {
  component.subscription = null
  return function (graphQLParams) {
    if (subscriptionsClient && component.subscription !== null) {
      subscriptionsClient.unsubscribe(component.subscription)
    }
    if (subscriptionsClient && hasSubscriptionOperation(graphQLParams)) {
      return {
        subscribe: function (observer) {
          observer.next('Your subscription data will appear here after server publication!')
          const subscription = subscriptionsClient.request({
            query: graphQLParams.query,
            variables: graphQLParams.variables
          }, function (error, result) {
            if (error) {
              observer.error(error)
            } else {
              observer.next(result)
            }
          })
          component.subscription = subscription.subscribe((result, err) => {
            if (err) {
              observer.error(err)
            } else {
              observer.next(result)
            }
          })
          return component.subscription
        }
      }
    } else {
      return fallbackFetcher(graphQLParams)
    }
  }
}

/**
 * Fallback GraphQL fetcher.
 *
 * @param {*} graphQLParams
 * @returns {Promise<any | string>}
 */
function fallbackGraphQLFetcher (graphQLParams) {
  // re-using same method UI uses to create GraphQL URL's used by its client with createGraphQLUrls()
  return fetch(
    createGraphQLUrls().httpUrl,
    {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getXSRFHeaders()
      },
      body: JSON.stringify(graphQLParams),
      credentials: 'include'
    }
  ).then(function (response) {
    return response.json().catch(function () {
      return response.text()
    })
  })
}

export {
  graphQLFetcher,
  fallbackGraphQLFetcher
}
