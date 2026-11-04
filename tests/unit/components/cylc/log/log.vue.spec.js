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

// shallowMount stubs Teleport without rendering its content by default
const stubs = { teleport: false }

describe('Log component', () => {
  it('shows a warning alert when the end of the file is truncated', async () => {
    const truncatedWrapper = shallowMount(Log, {
      props: {
        logs: ['line-1'],
        truncated: true,
        headMode: true,
      },
      global: { stubs },
    })
    await nextTick()
    expect(
      truncatedWrapper.find('[data-cy="log-truncated-btn"].log-truncation--end').exists()
    ).toBe(true)
    // the start-of-file warning should not be shown
    expect(
      truncatedWrapper.find('[data-cy="log-truncated-btn"].log-truncation--start').exists()
    ).toBe(false)
  })

  it('shows a warning alert when the start of the file is truncated', async () => {
    const truncatedWrapper = shallowMount(Log, {
      props: {
        logs: ['line-1'],
        truncated: true,
        headMode: false,
      },
      global: { stubs },
    })
    await nextTick()
    expect(
      truncatedWrapper.find('[data-cy="log-truncated-btn"].log-truncation--start').exists()
    ).toBe(true)
    expect(
      truncatedWrapper.find('[data-cy="log-truncated-btn"].log-truncation--end').exists()
    ).toBe(false)
  })

  it('shows no truncation warnings by default', async () => {
    const plainWrapper = shallowMount(Log, {
      props: {
        logs: ['line-1'],
      },
      global: { stubs },
    })
    await nextTick()
    expect(
      plainWrapper.find('[data-cy="log-truncated-btn"].log-truncation--start').exists()
    ).toBe(false)
    expect(
      plainWrapper.find('[data-cy="log-truncated-btn"].log-truncation--end').exists()
    ).toBe(false)
  })
})
