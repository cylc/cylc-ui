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
  init,
  before,
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
} from '@/components/cylc/table/deltas'

class TableCallback extends DeltasCallback {
  constructor () {
    super()
    this.table = null
    this.lookup = null
  }

  init (store, errors) {
    const table = store.state.table.table
    // if the table store isn't defined, pull the needed deltas from the current workflow lookup and prepopulate the view
    if (typeof table === 'undefined' || Object.keys(table).length === 0) {
      try {
        const globalLookup = store.state.workflows.workflow.lookup
        const globalLookupValues = Object.values(globalLookup)
        const initialBurstData = {
          // this is needed so we can 'symlink' instead of setting up new objects where they aren't needed
          globalLookup,
          taskProxies: globalLookupValues.filter(lookup => lookup.type === 'task-proxy'),
          jobs: globalLookupValues.filter(lookup => lookup.type === 'job')
        }
        const results = init(initialBurstData, table)
        // finally, set the callback table to the value of the store so future callbacks can function as expected
        this.table = Object.assign({}, table)
        errors.push(...results.errors)
      } catch (error) {
        errors.push([
          'Error trying to initialize the table view store, possibly because the workflow store has not yet been initialized',
          error,
          store.state
        ])
      }
    }
  }

  before (deltas, store, errors) {
    // ReadOnly
    this.lookup = store.state.workflows.lookup
    const table = store.state.table.table
    this.table = Object.assign({}, table)
    const results = before(deltas, this.table, this.lookup)
    errors.push(...results.errors)
  }

  tearDown (store, errors) {
    store.commit('table/SET_TABLE', {})
    this.workflow = null
    this.lookup = null
  }

  onAdded (added, store, errors) {
    const results = applyDeltasAdded(added, this.table, this.lookup)
    errors.push(...results.errors)
  }

  onUpdated (updated, store, errors) {
    const results = applyDeltasUpdated(updated, this.table, this.lookup)
    errors.push(...results.errors)
  }

  onPruned (pruned, store, errors) {
    const results = applyDeltasPruned(pruned, this.table, this.lookup)
    errors.push(...results.errors)
  }

  commit (store, errors) {
    store.commit('table/SET_TABLE', this.table)
  }
}

export default TableCallback
