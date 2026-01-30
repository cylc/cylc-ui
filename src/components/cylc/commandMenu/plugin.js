/*
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

import { uniqueId } from 'lodash-es'
import { eventBus } from '@/services/eventBus'

/** Reference to closure listeners (needed as we are using variables from another scope) */
const listeners = new WeakMap()

function bind (el, binding, vnode) {
  // Set data-c-interactive = <unique identifier> for every element that opens the menu.
  // This allows the menu component to tell apart every activating element.
  el.dataset.cInteractive = uniqueId()
  const listener = function (e) {
    e.stopPropagation() // prevents click event from bubbling up to parents
    eventBus.emit('show-mutations-menu', {
      node: binding.value,
      target: el,
    })
  }
  el.addEventListener('click', listener)
  listeners.set(el, listener)
}

function unbind (el) {
  // Clean up to avoid memory issues
  el.removeEventListener('click', listeners.get(el))
  listeners.delete(el)
}

function updated (el, binding, newVnode, oldVnode) {
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
   * @param {Object} app - Vue application
   * @param {Object}} options - options passed to the plug-in (if any)
   */
  install (app, options) {
    // add a global directive
    app.directive('command-menu', {
      beforeMount: bind,
      unmounted: unbind,
      updated,
    })
  },
}
