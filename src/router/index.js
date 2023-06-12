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

/**
 * Vue Router
 *
 * @library
 *
 * https://router.vuejs.org/en/
 */

// Lib imports
import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import { store } from '@/store/index'

import 'nprogress/css/nprogress.css'

// Routes
import paths from './paths'
import Alert from '@/model/Alert.model'

function route (path) {
  const copy = Object.assign({}, path)
  const view = copy.view
  return Object.assign(copy, {
    name: path.name || view,
    component: (resolve) => import(
      `@/views/${view}.vue`
    ).then(resolve)
  })
}

// Create a new router
const router = createRouter({
  history: createWebHashHistory(),
  routes: paths.map(path => route(path)),
  //  .concat([{ path: '*', redirect: '/dashboard' }]),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { left: 0, top: 0 }
  }
})

router.beforeEach(async (to, from) => {
  NProgress.start()
  if (!store.state.user.user) {
    try {
      const user = await router.app.config.globalProperties.$userService.getUserProfile()
      store.commit('user/SET_USER', user)
    } catch (error) {
      const alert = new Alert(error, 'error')
      store.dispatch('setAlert', alert)
    }
  }
})

router.beforeResolve((to, from) => {
  if (to.name) {
    let title = to.name
    let workflowName = null
    if (to.meta.toolbar) {
      // When a workflow is being displayed, we set the title to a
      // different value.
      title = to.params.workflowName
      workflowName = to.params.workflowName
    }
    store.commit('app/setTitle', title)
    store.commit('workflows/SET_WORKFLOW_NAME', workflowName)
    store.dispatch('setAlert', null)
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
