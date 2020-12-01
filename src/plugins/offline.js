
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
/**
 * @type SubscriptionWorkflowService
 */
import SubscriptionWorkflowService from 'workflow-service'
import { createGraphQLUrls, createSubscriptionClient } from '@/utils/graphql'

/**
 * Offline mode plug-in.
 *
 * Loads the application offline mode. It uses the `NODE_ENV` variable. Does
 * not reflect the application mode used by webpack.
 */
const OfflineModePlugin = {
  /**
   * @param Vue {object} - Vue application
   * @param options {*} - options passed to the plug-in (if any)
   */
  install (Vue, options) {
    Vue.prototype.$offline = ((process.env.VUE_APP_OFFLINE_MODE || 'false').trim().toLowerCase() === 'true')
    let subscriptionClient = null
    const graphQLUrls = createGraphQLUrls()

    if (!Vue.prototype.$offline) {
      subscriptionClient = createSubscriptionClient(graphQLUrls.wsUrl)
    }

    // Set Vue global workflow service.
    Vue.prototype.$workflowService = new SubscriptionWorkflowService(graphQLUrls.httpUrl, subscriptionClient)
  }
}

Vue.use(OfflineModePlugin)
