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

// This module provides a couple of DeltasCallback classes for use in
// testing.
//
// These used to be created for each view, they maintained a local data
// structure containing pointers which referenced nodes in the central data
// store to avoid duplication.
//
// We now drive views off of the central data store directly, however, this
// system for registering local callbacks is still preserved as it may be useful
// for future views. In general we should aim to drive views off of the central
// data store directly, however, if a view requires data in a format that is
// really, really hard (or inefficient to reconcile with the central data store
// these deltas provide low-level access to the primitive deltas received
// by the UI.
//
// To see these callbacks in action go back to cylc-ui version 1.3.0:
// * https://github.com/cylc/cylc-ui/blob/a0d27ea3d8ec7d303126e57fe20a0de28f8770ef/src/components/cylc/tree/callbacks.js
// * https://github.com/cylc/cylc-ui/blob/a3005b07f20f456bb2b855f19fab2a082affdece/src/components/cylc/common/callbacks.js

export class TreeCallback extends DeltasCallback {
  constructor () {
    super()
    this.workflow = null
    this.lookup = null
  }

  before (deltas, store, errors) {
    const lookup = store.state.workflows.lookup
    const workflow = store.state.workflows.workflow
    this.workflow = Object.assign({}, workflow)
    this.lookup = Object.assign({}, lookup)
  }

  after (deltas, store, errors) {
  }

  tearDown (store, errors) {
    this.workflow = null
    this.lookup = null
  }

  onAdded (added, store, errors) {}

  onUpdated (updated, store, errors) {}

  onPruned (pruned, store, errors) {}

  commit (store, errors) {}
}

export class WorkflowCallback extends DeltasCallback {
  constructor () {
    super()
    this.workflow = null
    this.lookup = null
  }

  before (deltas, store, errors) {
    const lookup = store.state.workflows.lookup
    const workflow = store.state.workflows.workflow
    this.workflow = Object.assign({}, workflow)
    this.lookup = Object.assign({}, lookup)
  }

  after (deltas, store, errors) {
  }

  tearDown (store, errors) {
    this.workflow = null
    this.lookup = null
  }

  onAdded (added, store, errors) {}

  onUpdated (updated, store, errors) {}

  onPruned (pruned, store, errors) {}

  commit (store, errors) {}
}
