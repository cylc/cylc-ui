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
import SubscriptionWorkflowService from 'workflow-service'

// Sync store with router
sync(store, router)

// WorkflowService singleton available application-wide
const workflowService = new SubscriptionWorkflowService()
Vue.prototype.$workflowService = workflowService

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
