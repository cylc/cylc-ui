/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
 * Hooks for handling deltas received from a subscription.
 * @typedef {Object} DeltasHooks
 * @property {({ added: any, updated: any, pruned: any }) => void} [onBeforeDelta] - Run before a delta is processed in the data store.
 * @property {({ added: any, updated: any, pruned: any }) => void} [onDelta] - Run after a delta is processed in the data store.
 * @property {() => void} [tearDown] - Run when stopping the subscription.
 */

/**
 * A subscription query. It is part of a Subscription, and contains query and auxiliary data
 * such as query name, variables, and callbacks.
 *
 * The name of the query is an important part of the data, as it is used as key in a map
 * that holds the queries. It can be used to merge two queries when they have the same name.
 *
 * You can provide an object containing hooks to run when the subscription receives data, which will
 * run in addition to the global data store actions.
 * Alternatively, you can specify a custom `next` function to run when the subscription receives data,
 * which will run *instead* of the global data store actions.
 *
 * @see Subscription
 */
export class SubscriptionQuery {
  /**
   * @param {import('graphql').DocumentNode} query
   * @param {Record<string, any>} variables
   * @param {string} name
   * @param {?DeltasHooks | (data: any) => void} callback - Either an object containing hooks, or a custom next() function, to run when the subscription receives data.
   */
  constructor (query, variables, name, callback) {
    this.query = query
    this.variables = variables ?? {}
    this.name = name
    if (typeof callback === 'function') {
      this.next = callback
    } else {
      this.hooks = callback
    }
  }
}
