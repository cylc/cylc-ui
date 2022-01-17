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
import {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
} from '@/components/cylc/gscan/deltas'

describe('GScan component', () => {
  let workflows
  let newWorkflow
  beforeEach(() => {
    workflows = {}
    newWorkflow = {
      id: '~cylc/test',
      status: WorkflowState.PAUSED
    }
  })
  describe('Deltas', () => {
    describe('Added', () => {
      it('should apply added deltas', () => {
        const deltas = {
          added: {
            workflow: newWorkflow
          }
        }
        applyDeltasAdded(deltas.added, workflows)
        expect(workflows[newWorkflow.id]).to.not.equal(undefined)
      })
    })
    describe('Updated', () => {
      it('should apply updated deltas', () => {
        const deltasAdded = {
          added: {
            workflow: newWorkflow
          }
        }
        applyDeltasAdded(deltasAdded.added, workflows)
        expect(workflows[newWorkflow.id].status).to.equal(WorkflowState.PAUSED)
        newWorkflow.status = WorkflowState.STOPPED
        const deltasUpdated = {
          updated: {
            workflow: newWorkflow
          }
        }
        applyDeltasUpdated(deltasUpdated.updated, workflows)
        expect(workflows[newWorkflow.id].status).to.equal(WorkflowState.STOPPED)
      })
    })
    describe('Pruned', () => {
      it('should apply pruned deltas', () => {
        const deltasAdded = {
          added: {
            workflow: newWorkflow
          }
        }
        applyDeltasAdded(deltasAdded.added, workflows)
        expect(workflows[newWorkflow.id]).to.not.equal(undefined)
        const deltasPruned = {
          pruned: {
            workflow: newWorkflow.id
          }
        }
        applyDeltasPruned(deltasPruned.pruned, workflows)
        expect(workflows[newWorkflow.id]).to.equal(undefined)
      })
    })
  })
})
