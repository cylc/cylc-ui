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

import { configureCompat, createApp } from 'vue'

// Plugins
import vuetify from './plugins/vuetify'
import ServicesPlugin from '@/services/plugin'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import Default from '@/layouts/Default.vue'
import Empty from '@/layouts/Empty.vue'

// Application imports
import App from './App'
import { i18n } from '@/i18n/index'
import router from '@/router/index'
import { store } from '@/store/index'
import mitt from 'mitt'
import { createHead, VueHeadMixin } from '@unhead/vue'

// Vue.config.productionTip = false

configureCompat({
  MODE: 3,
  INSTANCE_CHILDREN: true
  // OPTIONS_DATA_MERGE: true ?
})

const app = createApp(App)

app.mixin(VueHeadMixin)

const head = createHead()
app.use(store)
app.use(router)
app.use(vuetify)
app.use(i18n)
app.use(head)
app.use(ServicesPlugin, {
  offline: process.env.VUE_APP_SERVICES === 'offline'
})
app.use(CylcObjectPlugin)

app.config.globalProperties.$eventBus = mitt()

app.component('default-layout', Default)
app.component('empty-layout', Empty)

// https://router.vuejs.org/guide/migration/#removal-of-router-app
router.app = app

router.isReady().then(() => app.mount('#app'))

// e2e tests use the offline mode, so here we expose the Vue.js app so Cypress can access it programmatically
// e.g. window.app.$store and window.app.$workflowService.
// Ref: https://www.cypress.io/blog/2017/11/28/testing-vue-web-application-with-vuex-data-store-and-rest-backend/
if (process.env.NODE_ENV !== 'production') {
  window.app = app.config.globalProperties
}
