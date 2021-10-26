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

import { expect } from 'chai'
import WorkflowState from '@/model/WorkflowState.model'
import { applyDeltasAdded, applyDeltasUpdated, applyDeltasPruned } from '@/components/cylc/gscan/deltas'

describe('GScan component', () => {
  let gscan
  let newWorkflow
  beforeEach(() => {
    gscan = {
      lookup: {},
      tree: []
    }
    newWorkflow = {
      id: 'cylc|test',
      status: WorkflowState.PAUSED
    }
  })
  describe('Deltas', () => {
    describe('Added', () => {
      it('should apply added deltas', () => {
        const added = {
          workflow: newWorkflow
        }
        applyDeltasAdded(added, gscan, {})
        expect(gscan.lookup[newWorkflow.id]).to.not.equal(undefined)
        expect(gscan.tree[0]).to.not.equal(undefined)
      })
    })
    describe('Updated', () => {
      it('should apply updated deltas', () => {
        const added = {
          workflow: newWorkflow
        }
        applyDeltasAdded(added, gscan, {})
        expect(gscan.lookup[newWorkflow.id].node.status).to.equal(WorkflowState.PAUSED)
        newWorkflow.status = WorkflowState.STOPPED
        const updated = {
          workflow: newWorkflow
        }
        applyDeltasUpdated(updated, gscan, {})
        expect(gscan.lookup[newWorkflow.id].node.status).to.equal(WorkflowState.STOPPED)
      })
    })
    describe('Pruned', () => {
      it('should apply pruned deltas', () => {
        const added = {
          workflow: newWorkflow
        }
        applyDeltasAdded(added, gscan, {})
        expect(gscan.lookup[newWorkflow.id]).to.not.equal(undefined)
        const pruned = {
          workflow: newWorkflow.id
        }
        applyDeltasPruned(pruned, gscan, {})
        expect(gscan.lookup[newWorkflow.id]).to.equal(undefined)
      })
    })
  })
})
