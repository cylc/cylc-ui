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

import Vue from 'vue'
import { createGraphQLUrls, createSubscriptionClient } from '@/utils/graphql'
import SubscriptionWorkflowService from '@/services/workflow.service'
import MockWorkflowService from '@/services/mock/workflow.service.mock'
import UserService from '@/services/user.service'
import MockUserService from '@/services/mock/user.service.mock'

/**
 * A plugin that loads the application services.
 *
 * It uses the `VUE_APP_SERVICES` environment variable to decide whether to use
 * mocked services, when its value is "offline", or to use normal services.
 */
export default {
  /**
   * @param Vue {object} - Vue application
   * @param options {{
   *   offline: boolean
   * }} - options passed to the plug-in (if any)
   */
  install (Vue, options) {
    const offline = options.offline || false
    this._createWorkflowService(offline)
    this._installUserService(offline)
  },

  /**
   * Creates a workflow service for the application. If the mode is offline, then
   * a mocked service is used.
   *
   * The service is available as `Vue.$workflowService`.
   *
   * @param {boolean} offline - whether the application is in offline mode or not
   * @private
   */
  _createWorkflowService (offline) {
    const graphQLUrls = createGraphQLUrls()
    Vue.prototype.$workflowService = offline
      ? new MockWorkflowService(graphQLUrls.wsUrl, null)
      : new SubscriptionWorkflowService(graphQLUrls.httpUrl, createSubscriptionClient(graphQLUrls.wsUrl))
  },

  /**
   * Creates a user service for the application. If the mode is offline, then
   * a mocked service is used.
   *
   * The service is available as `Vue.$userService`.
   *
   * @param {boolean} offline - whether the application is in offline mode or not
   * @private
   */
  _installUserService (offline) {
    Vue.prototype.$userService = offline ? new MockUserService() : new UserService()
  }
}
