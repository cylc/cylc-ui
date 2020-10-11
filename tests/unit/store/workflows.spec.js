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
import store from '@/store'

/**
 * Tests for the store/workflows module.
 */
describe('workflows', () => {
  /**
   * Tests for store.workflows.
   */
  describe('workflows', () => {
    const resetState = () => {
      store.state.workflows.workflows = []
      store.state.workflows.workflowName = null
    }
    beforeEach(resetState)
    afterEach(resetState)
    it('should start with no workflows and no workflow name', () => {
      expect(store.state.workflows.workflows).to.deep.equal([])
      expect(store.state.workflows.workflowName).to.equal(null)
    })
    it('should set workflows', () => {
      const workflows = [
        {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      ]
      store.dispatch('workflows/set', workflows)
      expect(store.state.workflows.workflows).to.deep.equal(workflows)
    })
    it('should set workflow name', () => {
      const workflowName = 'cylc'
      store.commit('workflows/SET_WORKFLOW_NAME', { workflowName })
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
    it('should get the current workflow', () => {
      expect(store.getters['workflows/currentWorkflow']).to.equal(null)
      const workflows = [
        {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      ]
      store.dispatch('workflows/set', workflows)
      store.commit('workflows/SET_WORKFLOW_NAME', {
        workflowName: workflows[0].name
      })
      expect(store.getters['workflows/currentWorkflow']).to.deep.equal(workflows[0])
    })
  })
})
