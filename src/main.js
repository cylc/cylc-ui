// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Plugins
import './plugins'
import vuetify from './plugins/vuetify'

// Sync router with store
import { sync } from 'vuex-router-sync'

// Application imports
import App from './App'
import i18n from '@/i18n'
import router from '@/router'
import store from '@/store'

// GraphQL client
/**
 * @type SubscriptionWorkflowService
 */
import SubscriptionWorkflowService from 'workflow-service'
import { createGraphQLUrls, createSubscriptionClient } from '@/utils/graphql'

// Sync store with router
sync(store, router)

// WorkflowService singleton available application-wide
// On the offline mode, we do not have a WebSocket link, so we must create a null SubscriptionClient to use an empty link
const graphQLUrls = createGraphQLUrls()
let subscriptionClient = null
if (process.env.NODE_ENV !== 'offline') {
  subscriptionClient = createSubscriptionClient(graphQLUrls.wsUrl)
}
const workflowService = new SubscriptionWorkflowService(graphQLUrls.httpUrl, subscriptionClient)
Vue.prototype.$workflowService = workflowService

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  vuetify,
  render (h) {
    return h(App, {
      props: {
        baseUrl: this.$el.attributes['data-base-url'].value
      }
    })
  }
}).$mount('#app')
