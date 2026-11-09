/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import Log from '@/components/cylc/log/Log.vue'

describe('Log component', () => {
  it.each([
    {
      scenario: 'when the end of the file is truncated',
      props: { truncated: true, headMode: true },
      startWarning: false,
      endWarning: true,
    },
    {
      scenario: 'when the start of the file is truncated',
      props: { truncated: true, headMode: false },
      startWarning: true,
      endWarning: false,
    },
    {
      scenario: 'by default',
      props: {},
      startWarning: false,
      endWarning: false,
    },
  ])('shows the expected truncation warnings $scenario', async ({
    props,
    startWarning,
    endWarning,
  }) => {
    const wrapper = shallowMount(Log, {
      props: {
        logs: ['line-1'],
        ...props,
      },
    })
    await nextTick()
    expect(
      wrapper.find('[data-cy="log-truncated-btn"].log-truncation--start').exists()
    ).toBe(startWarning)
    expect(
      wrapper.find('[data-cy="log-truncated-btn"].log-truncation--end').exists()
    ).toBe(endWarning)
  })
})
