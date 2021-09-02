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

import DeltasCallback from '@/services/callbacks'
import * as CylcTree from '@/components/cylc/tree/index'
import {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
} from '@/components/cylc/tree/deltas'

/**
 * Handle the deltas. This function receives the new set of deltas, and the tree object. It is assumed
 * the tree has been correctly created. Except for family proxies, it is expected that other elements
 * are only created via the deltas.added attribute.
 *
 * Family proxies are a special case, due to hierarchy within families, so we have no easy way to grab
 * the first family from the top of the hierarchy in the deltas.
 */
class TreeCallback extends DeltasCallback {
  constructor () {
    super()
    this.workflow = null
    this.lookup = null
    this.options = {
      cyclePointsOrderDesc: localStorage.cyclePointsOrderDesc
        ? JSON.parse(localStorage.cyclePointsOrderDesc)
        : true
    }
  }

  before (deltas, store, errors) {
    const lookup = store.state.workflows.lookup
    const workflow = store.state.workflows.workflow
    // first we check whether it is a new initial-data-burst
    if (deltas && deltas.added && deltas.added.workflow) {
      CylcTree.clear(workflow)
    }
    // Safe check in case the tree is empty.
    if (CylcTree.isEmpty(workflow)) {
      // When the tree is empty, we have two possible scenarios:
      //   1. This means that we will receive our initial data burst in deltas.added
      //      which we can use to create the tree structure.
      //   2. Or this means that after the shutdown (when we delete the tree), we received a delta.
      //      In this case we don't really have any way to fix the tree.
      // In both cases, actually, the user has little that s/he could do, besides refreshing the
      // page. So we fail silently and wait for a request with the initial data.
      //
      // We need at least a deltas.added.workflow in the deltas data, since it is the root node.
      if (!deltas.added || !deltas.added.workflow) {
        errors.push([
          'Received a Tree delta before the workflow initial data burst',
          deltas.added,
          workflow,
          lookup
        ])
      }
    }
    this.workflow = Object.assign({}, workflow)
    this.lookup = Object.assign({}, lookup)
  }

  after (deltas, store, errors) {
    // if added, removed, or updated deltas, we want to re-calculate the cycle point states now
    if (deltas.pruned || deltas.added || deltas.updated) {
      CylcTree.tallyCyclePointStates(this.workflow)
    }
  }

  tearDown (store, errors) {
    store.commit('workflows/CLEAR_WORKFLOW')
    this.workflow = null
    this.lookup = null
  }

  onAdded (added, store, errors) {
    const results = applyDeltasAdded(added, this.workflow, this.lookup, this.options)
    errors.push(...results.errors)
  }

  onUpdated (updated, store, errors) {
    const results = applyDeltasUpdated(updated, this.workflow, this.lookup, this.options)
    errors.push(...results.errors)
  }

  onPruned (pruned, store, errors) {
    const results = applyDeltasPruned(pruned, this.workflow, this.lookup, this.options)
    errors.push(...results.errors)
  }

  commit (store, errors) {
    store.commit('workflows/SET_WORKFLOW', this.workflow)
  }
}

export default TreeCallback
