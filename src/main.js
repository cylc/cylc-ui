// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Components
import './components'

// Plugins
import './plugins'

// Sync router with store
import { sync } from 'vuex-router-sync'

// Application imports
import App from './App'
import i18n from '@/i18n'
import FlagIcon from 'vue-flag-icon'
import router from '@/router'
import store from '@/store'

// Material UI icons
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// Layouts
import Default from '@/layouts/Default.vue'
import Empty from '@/layouts/Empty.vue'
Vue.component('default-layout', Default)
Vue.component('empty-layout', Empty)

// Sync store with router
sync(store, router)

Vue.config.productionTip = false

Vue.use(FlagIcon)

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
