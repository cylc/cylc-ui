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

import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import { i18n } from '@/i18n'

import paths from '@/router/paths'
import { store } from '@/store/index'
import { Alert } from '@/model/Alert.model'
import { getUserProfile } from '@/services/user.service'

const defaultPageTitle = i18n.global.t('App.name')

NProgress.configure({ showSpinner: false })

function getRoute (path) {
  return {
    ...path,
    name: path.name || path.view,
    component: () => import(`@/views/${path.view}.vue`),
  }
}

/**
 * Return the page title for a particular route.
 * @param {import('vue-router').RouteLocation} route
 */
export function getPageTitle ({ meta, params }) {
  const extra = meta.getTitle?.(params) || meta.title
  return extra
    ? `${defaultPageTitle} | ${extra}`
    : defaultPageTitle
}

// Create a new router
const router = createRouter({
  history: createWebHashHistory(),
  routes: paths.map(getRoute),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to, from) => {
  NProgress.start()
  if (!store.state.user.user) {
    const user = await getUserProfile()
    // TODO: catch error getting user profile and redirect to static error page
    store.commit('user/SET_USER', user)
  }
  if (!store.state.user.user.permissions?.includes('read')) {
    if (to.name !== 'NoAuth') { // Avoid infinite redirect?
      return { name: 'NoAuth' }
    }
  } else if (to.name === 'NoAuth') {
    // If authorized, redirect no-auth page to home page
    return { path: '/' }
  }

  // Set page title:
  document.title = getPageTitle(to)

  // Set toolbar title:
  let title = to.name
  if (to.meta.toolbar) {
    // When a workflow is being displayed, we set the title to a
    // different value.
    title = to.params.workflowName
  }
  store.commit('app/setTitle', title)
  store.dispatch('setAlert', null)
})

router.afterEach(() => {
  NProgress.done()
})

router.onError((err, to, from) => {
  store.dispatch('setAlert', new Alert(err, 'error'))
  NProgress.done()
})

export default router
