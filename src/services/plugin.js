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

import { shallowRef } from 'vue'
import { createSubscriptionClient, createGraphQLUrls } from '@/graphql'
import SubscriptionWorkflowService from '@/services/workflow.service'
import { fetchData } from '@/utils/urls'

/**
 * A plugin that loads the application services.
 */
export default {
  /**
   * @param {Object} app - Vue application
   */
  install (app) {
    this._installWorkflowService(app)

    const versionInfo = shallowRef(null)
    app.provide('versionInfo', versionInfo)
    fetchData('version').then((data) => { versionInfo.value = data })
  },

  /**
   * Creates a workflow service for the application.
   *
   * The service is available as `vm.$workflowService`.
   *
   * @private
   * @param {Object} app - Vue application
   */
  _installWorkflowService (app) {
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
  },
}
