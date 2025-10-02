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
import EstimatedTime from '@/components/cylc/common/EstimatedTime.vue'
import { createVuetify } from 'vuetify'
import { vuetifyOptions } from '@/plugins/vuetify'
import { formatDuration } from '@/utils/tasks'

describe('Estimated Time component', () => {
  it.each([
    {
      props: { actual: 1, estimate: 2 },
      expected: '1',
    },
    {
      props: { estimate: 2 },
      expected: '2',
    },
    {
      props: { },
      expected: '',
    },
    {
      props: { actual: 75, formatter: formatDuration },
      expected: '00:01:15',
    },
    {
      props: { estimate: 2, formatter: formatDuration },
      expected: '00:00:02',
    },
  ])('Renders expected time: $expected', ({ props, expected }) => {
    const wrapper = mount(EstimatedTime, {
      props,
      global: {
        plugins: [createVuetify(vuetifyOptions)]
      }
    })
    expect(wrapper.text()).toBe(expected)
  })
})
