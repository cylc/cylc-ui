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
import { clear } from '@/components/cylc/gscan/index'

/**
 * Provisional GScan callback until https://github.com/cylc/cylc-ui/pull/736
 * is done.
 */
class GScanCallback extends DeltasCallback {
  constructor () {
    super()
    this.lookup = null
    this.gscan = null
  }

  before (deltas, store, errors) {
    // If it were TS, we would use a ReadOnly type here...
    this.lookup = store.state.workflows.lookup
    const gscan = store.state.gscan.gscan
    this.gscan = Object.assign({}, gscan)
  }

  tearDown (store, errors) {
    clear(this.gscan)
    store.commit('gscan/SET_GSCAN', this.gscan)
    this.lookup = null
    this.gscan = null
  }

  onAdded (added, store, errors) {
    const results = applyDeltasAdded(added, this.gscan, {})
    errors.push(...results.errors)
  }

  onUpdated (updated, store, errors) {
    const results = applyDeltasUpdated(updated, this.gscan, {})
    errors.push(...results.errors)
  }

  onPruned (pruned, store, errors) {
    const results = applyDeltasPruned(pruned, this.gscan, {})
    errors.push(...results.errors)
  }

  commit (store, errors) {
    store.commit('gscan/SET_GSCAN', this.gscan)
  }
}

export default GScanCallback
