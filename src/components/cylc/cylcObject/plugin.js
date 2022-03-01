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

import {
  filterAssociations,
  getType,
  tokenise
} from '@/utils/aotf'

// reference to closure listener (needed as we are using variables from another scope)
let listener = null

function bind (el, binding, vnode) {
  const mutations = vnode.context.$workflowService.mutations
  const types = vnode.context.$workflowService.types
  // a closure to use the variables above in the event listener
  listener = function (e) {
    const cylcId = binding.value.id
    const tokens = tokenise(cylcId)
    const type = getType(tokens)
    const componentMutations = filterAssociations(
      type,
      tokens,
      mutations
    )
    vnode.context.$eventBus.emit('show-mutations-menu', {
      id: cylcId,
      type: type,
      types: types,
      tokens: tokens,
      mutations: componentMutations,
      node: binding.value,
      event: e
    })
  }
  el.addEventListener('click', listener)
  el.classList.add('c-interactive')
}

function unbind (el) {
  // clean up to avoid memory issues
  el.removeEventListener('click', listener)
  listener = null
}

function update (el, binding, newVnode, oldVnode) {
  if (binding.value !== binding.oldValue) {
    unbind(el)
    bind(el, binding, newVnode)
  }
}

/**
 * Cylc Objects plug-in.
 */
export default {
  /**
   * Called when the Vue application is created, and this plug-in is loaded.
   * @param {object} Vue - Vue application
   * @param {*} options - options passed to the plug-in (if any)
   */
  install (Vue, options) {
    // add a global directive
    Vue.directive('cylc-object', {
      bind,
      unbind,
      update
    })
  }
}
