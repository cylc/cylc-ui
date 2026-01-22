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
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'
import WorkflowState from '@/model/WorkflowState.model'
import { createVuetify } from 'vuetify'
import { mdiHelpCircle } from '@mdi/js'

const vuetify = createVuetify()

describe('WorkflowIcon', () => {
  it.each([
    {
      status: '',
      expected: mdiHelpCircle,
    },
    {
      status: WorkflowState.STOPPED.name,
      expected: WorkflowState.STOPPED.icon,
    },
  ])('uses the right icon for state: $status', ({ status, expected }) => {
    const wrapper = shallowMount(WorkflowIcon, {
      global: {
        plugins: [vuetify],
      },
      props: {
        status,
      },
    })
    expect(wrapper.vm.getIcon()).to.equal(expected)
  })
})
