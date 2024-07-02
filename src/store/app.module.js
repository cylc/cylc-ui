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

import { markRaw } from 'vue'

const state = () => ({
  title: null,
  workspaceLayouts: new Map(),
})

const mutations = {
  setTitle (state, title) {
    state.title = title
  },
  saveLayout ({ workspaceLayouts }, { workflowName, layout, views }) {
    // Delete and re-add to keep this FIFO
    workspaceLayouts.delete(workflowName)
    /* NOTE: use markRaw to prevent proxying of the Lumino layout in particular.
    It is not necessary for this saved state to be reactive, and moreover
    proxying the layout breaks some parts of the 3rd party Lumino backend. */
    workspaceLayouts.set(workflowName, markRaw({ layout, views }))
    if (workspaceLayouts.size > 100) {
      const firstKey = workspaceLayouts.keys().next().value
      workspaceLayouts.delete(firstKey)
    }
  }
}

export const app = {
  namespaced: true,
  state,
  mutations
}
