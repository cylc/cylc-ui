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

import { mount } from '@vue/test-utils'
import Job from '@/components/cylc/Job.vue'

describe('Job component', () => {
  it('should initialize props', () => {
    const wrapper = mount(Job, {
      props: {
        status: '',
        multiple: false,
      },
    })
    expect(wrapper.element.className).to.equal('c-job')
    expect(wrapper.get('.job').element.childElementCount).to.equal(1)
  })
  it('should add a new class for multiple jobs', () => {
    const wrapper = mount(Job, {
      props: {
        status: 'failed',
        'previous-state': 'submit-failed',
      },
    })
    // The shadow is added as an extra child element for the Job SVG (two rects).
    expect(wrapper.get('.job').element.childElementCount).to.equal(2)
  })
})
