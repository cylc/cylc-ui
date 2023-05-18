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

import { vi } from 'vitest'
import sinon from 'sinon'
import { shallowMount } from '@vue/test-utils'
import Lumino from '@/components/cylc/workflow/Lumino.vue'

describe('Workflow component', () => {
  it('should display the workflow with valid data', async () => {
    vi.mock('@lumino/widgets')
    sinon.stub(Lumino.methods, 'syncWidgets')
    const wrapper = shallowMount(Lumino, {
      props: {
        workflowName: 'nox',
        allViews: []
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div')).to.exist
  })
})
