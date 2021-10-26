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
   * This is the CylcTree, which contains the hierarchical tree data structure.
   * It is created from the GraphQL data, with the only difference that this one
   * contains hierarchy, while the lookup (not workflow.lookup) is flat-ish.
   *
   * The nodes in the .tree property have a reference or pointer (.node) to the
   * data in the lookup map above, to avoid data duplication.
   *
   * @type {Workflow}
   */
  workflow: {
    tree: {},
    lookup: {}
  }
}

const mutations = {
  SET_WORKFLOW (state, data) {
    state.workflow = data
  }
}

export const tree = {
  namespaced: true,
  state,
  mutations
}
