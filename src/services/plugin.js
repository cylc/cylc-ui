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

import { createSubscriptionClient, createGraphQLUrls } from '@/graphql'
import SubscriptionWorkflowService from '@/services/workflow.service'
import UserService from '@/services/user.service'

/**
 * A plugin that loads the application services.
 *
 * It uses the `VUE_APP_SERVICES` environment variable to decide whether to use
 * mocked services, when its value is "offline", or to use normal services.
 */
export default {
  /**
   * @param {Object} app - Vue application
   * @param {{ offline: boolean }} options - options passed to the plug-in
   */
  install (app, options) {
    const offline = options.offline || false
    this._installWorkflowService(app, offline)
    this._installUserService(app)
  },

  /**
   * Creates a workflow service for the application.
   *
   * The service is available as `Vue.$workflowService`.
   *
   * @private
   * @param {Object} app - Vue application
   * @param {boolean} offline
   */
  _installWorkflowService (app, offline) {
    const graphQLUrls = createGraphQLUrls()
    const client = createSubscriptionClient(graphQLUrls.wsUrl)
    app.config.globalProperties
      .$workflowService = new SubscriptionWorkflowService(
        graphQLUrls.httpUrl,
        client
      )
  },

  /**
   * Creates a user service for the application.
   *
   * The service is available as `Vue.$userService`.
   *
   * @private
   * @param {Object} app - Vue application
   */
  _installUserService (app) {
    app.config.globalProperties.$userService = new UserService()
  }
}
