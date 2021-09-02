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
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
} from '@/components/cylc/gscan/deltas'
import DeltasCallback from '@/services/callbacks'

/**
 * Provisional GScan callback until https://github.com/cylc/cylc-ui/pull/736
 * is done.
 */
class GScanCallback extends DeltasCallback {
  constructor () {
    super()
    this.workflows = null
  }

  before (deltas, store, errors) {
    this.workflows = Object.assign({}, store.state.workflows.workflows)
  }

  tearDown (store, errors) {
    store.commit('workflows/SET_WORKFLOWS', {})
    this.workflows = null
  }

  onAdded (added, store, errors) {
    this.workflows = Object.assign(this.workflows, store.state.workflows.workflows)
    const results = applyDeltasAdded(added, this.workflows)
    errors.push(...results.errors)
  }

  onUpdated (updated, store, errors) {
    const results = applyDeltasUpdated(updated, this.workflows)
    errors.push(...results.errors)
  }

  onPruned (pruned, store, errors) {
    this.workflows = Object.assign(this.workflows, store.state.workflows.workflows)
    const results = applyDeltasPruned(pruned, this.workflows)
    errors.push(...results.errors)
  }

  commit (store, errors) {
    store.commit('workflows/SET_WORKFLOWS', this.workflows)
  }
}

export default GScanCallback
