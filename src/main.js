// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Plugins
import './plugins'

// Components
import './components'

// Sync router with store
import { sync } from 'vuex-router-sync'

// Application imports
import App from './App'
import i18n from '@/i18n'
import router from '@/router'
import store from '@/store'

// GraphQL
import VueApollo from 'vue-apollo'

import apolloClient from '@/utils/graphql'

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

// Sync store with router
sync(store, router)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
