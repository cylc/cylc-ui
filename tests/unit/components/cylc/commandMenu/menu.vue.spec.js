/*
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

import { mount } from '@vue/test-utils'
import Menu, { getLogFileForNode } from '@/components/cylc/commandMenu/Menu.vue'
import { Tokens } from '@/utils/uid'
import {
  simpleTaskNode,
  simpleJobNode,
  simpleWorkflowNode,
} from '$tests/unit/components/cylc/tree/tree.data'

describe('Command menu', () => {
  it('has a title with the node ID excluding the username', () => {
    const wrapper = mount(Menu, { shallow: true })
    wrapper.vm.target = { dataset: {} }
    const id = '~neil.armstrong/apollo//11/eagle'
    wrapper.vm.node = {
      id,
      tokens: new Tokens(id)
    }
    expect(wrapper.vm.title).toEqual('apollo//11/eagle')
  })

  describe('getLogFileForNode()', () => {
    it.for([
      {
        testID: 'job node',
        node: simpleJobNode,
        expected: 'job.err',
      },
      {
        testID: 'task node with multiple jobs (picks latest)',
        node: simpleTaskNode,
        expected: 'job-activity.log',
      },
      {
        testID: 'workflow node',
        node: simpleWorkflowNode,
        expected: undefined
      }
    ])('$testID', ({ node, expected }) => {
      expect(getLogFileForNode(node)).toEqual(expected)
    })
  })
})
