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

import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Workflow from '@/components/cylc/workflow/Workflow'
import { simpleWorkflowTree4Nodes } from '../tree/tree.data'

describe('Workflow component', () => {
  // TODO: Lumino is warning about "Host is not attached"
  it('should display the workflow with valid data', async () => {
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      }
    })
    await Vue.nextTick()
    expect(wrapper.props().workflowTree[0].node.__typename).to.equal('Workflow')
    expect(wrapper.contains('div')).to.equal(true)
  })
})
