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
import { clear } from '@/components/cylc/tree'
import {
  before,
  after,
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
    // If it were TS, we would use a ReadOnly type here...
    this.lookup = store.state.workflows.lookup
    const workflow = store.state.tree.workflow
    this.workflow = Object.assign({}, workflow)
    const results = before(deltas, this.workflow, this.lookup)
    errors.push(...results.errors)
  }

  after (deltas, store, errors) {
    const results = after(deltas, this.workflow, null)
    errors.push(...results.errors)
  }

  tearDown (store, errors) {
    clear(this.workflow)
    store.commit('tree/SET_WORKFLOW', this.workflow)
    this.lookup = null
    this.workflow = null
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
    store.commit('tree/SET_WORKFLOW', this.workflow)
  }
}

export default TreeCallback
