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
import {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
} from '@/components/cylc/common/deltas'

class WorkflowCallback extends DeltasCallback {
  constructor () {
    super()
    this.lookup = null
  }

  before (deltas, store, errors) {
    this.lookup = Object.assign({}, store.state.workflows.lookup)
    store.commit('workflows/CREATE_CYLC_TREE')
  }

  tearDown (store, errors) {
    store.commit('workflows/SET_LOOKUP', {})
    this.lookup = null
  }

  onAdded (added, store, errors) {
    const results = applyDeltasAdded(added, this.lookup)
    store.commit('workflows/UPDATE', added)
    errors.push(...results.errors)
  }

  onUpdated (updated, store, errors) {
    const results = applyDeltasUpdated(updated, this.lookup)
    store.commit('workflows/UPDATE', updated)
    errors.push(...results.errors)
  }

  onPruned (pruned, store, errors) {
    const results = applyDeltasPruned(pruned, this.lookup)
    errors.push(...results.errors)
  }

  commit (store, errors) {
    store.commit('workflows/SET_LOOKUP', this.lookup)
  }
}

export default WorkflowCallback
