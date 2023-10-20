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
  init (store, errors) {
    if (!this.inited) {
      // only init once
      store.commit('workflows/CREATE')
      this.inited = true
    }
  }

  before (deltas, store, errors) {
    // Wipe all child nodes from a workflow in the data store if a reloaded
    // delta is received. Reloaded deltas are sent whenever a workflow is
    // restarted or reloaded (note, restarting a workflow implicitly reloads
    // it).
    //
    // When a workflow reloads it is hard to generate the relevant pruned
    // and updated deltas to remove any objects which have been wiped out by
    // the configuration change, so the easiest solution is to wipe the
    // entire tree under the workflow and rebuild from scratch. If we don't
    // do this, we can end up with nodes in the store which aren't meant to be
    // there and won't get pruned.
    if (deltas.updated?.workflow?.reloaded) {
      store.commit('workflows/REMOVE_CHILDREN', (deltas.updated.workflow.id))
    }
    if (deltas.added?.workflow?.reloaded) {
      store.commit('workflows/REMOVE_CHILDREN', (deltas.added.workflow.id))
    }
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

  // this callback does not need the tearDown and commit methods
  commit (a, b, c) {}
  tearDown (s, e) {}
}

export default CylcTreeCallback
