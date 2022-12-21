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

import { createLocalVue, shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon'
import WorkflowState from '@/model/WorkflowState.model'

const localVue = createLocalVue()

describe('WorkflowIcon', () => {
  /**
   * @param {Object} options - component options
   * @returns {Wrapper<WorkflowIcon>} - component test wrapper
   */
  const mountFunction = (options) => {
    return shallowMount(WorkflowIcon, {
      localVue,
      ...options,
    })
  }
  it('should create a workflow-icon component with the right icon', () => {
    const tests = [
      {
        status: '',
        expected: WorkflowState.ERROR.icon,
      },
      {
        status: WorkflowState.STOPPED.name,
        expected: WorkflowState.STOPPED.icon,
      },
    ]
    tests.forEach((test) => {
      const wrapper = mountFunction({
        propsData: {
          status: test.status,
        },
      })
      expect(wrapper.vm.getIcon()).to.equal(test.expected)
    })
  })
})
