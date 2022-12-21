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
  init(store) {
    if (!this.inited) {
      // only init once
      store.commit('workflows/CREATE')
      this.inited = true
    }
  }

  tearDown() {
    // never tear down, this callback lives for the live of the UI
  }

  onAdded(added, store) {
    store.commit('workflows/UPDATE_DELTAS', added)
  }

  onUpdated(updated, store) {
    store.commit('workflows/UPDATE_DELTAS', updated)
  }

  onPruned(pruned, store) {
    store.commit('workflows/REMOVE_DELTAS', pruned)
  }

  // this callback does not need the before and commit methods
  before() {}
  commit() {}
}

export default CylcTreeCallback
