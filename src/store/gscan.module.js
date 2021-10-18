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

const state = {
  /**
   * This is the data structure used by GScan component. The tree holds the hierarchical GScan,
   * and the lookup is a helper structure for quick access to nodes in the tree.
   */
  gscan: {
    tree: [],
    lookup: {}
  }
}

const mutations = {
  SET_GSCAN (state, data) {
    state.gscan = data
  }
}

export const gscan = {
  namespaced: true,
  state,
  mutations
}
