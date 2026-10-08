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

import { toRaw } from 'vue'
import ViewState from '@/model/ViewState.model'
import { Alert } from '@/model/Alert.model'
import { store } from '@/store/index'

/** @typedef {import('@/model/SubscriptionQuery.model').SubscriptionQuery} SubscriptionQuery */

/**
 * @typedef {Vue} View
 * @property {ViewState} viewState
 * @property {SubscriptionQuery} query
 */

/**
 * A view or component subscription. Views or components will declare a SubscriptionQuery,
 * that will be used to create a Subscription.
 *
 * A Subscription may contain one or more SubscriptionQuery's. It accumulates the subscribers (views
 * or components), as well as callbacks (an object containing methods to run upon receiving deltas, usually Vuex actions).
 *
 * The WorkflowService service will use this Subscription to create a GraphQL Subscription using
 * WebSockets. So any Subscription object created from this class will have a .observable property
 * that can be used to control the GraphQL Subscription.
 *
 * @see SubscriptionQuery
 * @see WorkflowService
 */
export class Subscription {
  /**
   * @param {SubscriptionQuery} query
   * @param {boolean} debug
   */
  constructor (query) {
    this.query = query
    /**
     * @type {import('zen-observable-ts').Subscription}
     */
    this.observable = null
    /**
     * @type {Map<[componentOrViewUID: string], View>}
     */
    this.subscribers = new Map()
    this.reload = false
  }

  /**
   * @param {ViewState} viewState
   * @param {{ message?: Error | string }} context
   */
  handleViewState (viewState, context = {}) {
    for (const subscriber of this.subscribers.values()) {
      subscriber.viewState = viewState
    }
    if (toRaw(viewState) === ViewState.ERROR) {
      store.dispatch('setAlert', new Alert(context.message, 'error'))
      console.error(context)
    }
  }
}
