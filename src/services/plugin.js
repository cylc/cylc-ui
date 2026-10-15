/**
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

import { createSubscriptionClient, createGraphQLUrls } from '@/graphql'
import SubscriptionWorkflowService from '@/services/workflow.service'
import { fetchData } from '@/utils/urls'
import { useAsyncState } from '@vueuse/core'
import { User } from '@/model/User.model'

/** @typedef {import('vue').App} App */

/**
 * A plugin that loads the application services.
 * @type {import('vue').Plugin}
 */
class ServicesPlugin {
  #user
  /**
   * @param {App} app - Vue application
   * @param {Object} options
   * @param {import('vue-router').Router} options.router - Vue Router instance
   */
  install (app, { router }) {
    this.#installWorkflowService(app)

    // Provide cylc-flow & uis version info as a ref that will update once the fetch is complete.
    app.provide('versionInfo', useAsyncState(fetchData('version'), {}).state)

    // The user info is crucial for the app to function.
    // It is more ergonomic to await it here and provide the object directly rather than providing a promise or ref.
    // When components inject the user, it is guaranteed to be available because we await the same promise
    // in the router beforeEach() guard.
    this.getUser().then((user) => {
      app.provide('user', user)
    })
    router.beforeEach(async (to, from) => {
      const user = await this.getUser()
      // TODO: catch error getting user profile and redirect to static error page
      if (!user.permissions?.includes('read')) {
        if (to.name !== 'NoAuth') { // Avoid infinite redirect?
          return { name: 'NoAuth' }
        }
      } else if (to.name === 'NoAuth') {
        // If authorized, redirect no-auth page to home page
        return { path: '/' }
      }
    })
  }

  /**
   * Creates a workflow service for the application.
   *
   * The service is available via injection or as `vm.$workflowService`.
   *
   * @param {App} app - Vue application
   */
  #installWorkflowService (app) {
    const graphQLUrls = createGraphQLUrls()
    const client = createSubscriptionClient(graphQLUrls.wsUrl)
    const workflowService = new SubscriptionWorkflowService(
      graphQLUrls.httpUrl,
      client
    )
    // Composition API:
    app.provide('workflowService', workflowService)
    // Options API (legacy):
    app.config.globalProperties.$workflowService = workflowService
  }

  async #fetchUserProfile () {
    return Object.freeze(
      new User(await fetchData('userprofile'))
    )
  }

  /**
   * Return the user profile, fetching it from the backend server if it hasn't already been loaded.
   * @returns {Promise<User>}
   */
  getUser () {
    return (this.#user ??= this.#fetchUserProfile())
  }
}

export const servicesPlugin = new ServicesPlugin()

// For testing
export { ServicesPlugin as __ServicesPlugin }
