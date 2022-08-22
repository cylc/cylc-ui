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

class CylcTreeCallback extends DeltasCallback {
  // TODO: pass results.errors down the line?

  init (store, errors) {
    store.commit('workflows/CREATE')
  }

  tearDown (store, errors) {
    store.commit('workflows/CLEAR')
  }

  onAdded (added, store, errors) {
    store.commit('workflows/UPDATE_DELTAS', added)
  }

  onUpdated (updated, store, errors) {
    store.commit('workflows/UPDATE_DELTAS', updated)
  }

  onPruned (pruned, store, errors) {
    store.commit('workflows/REMOVE_DELTAS', pruned)
  }
}

export default CylcTreeCallback
