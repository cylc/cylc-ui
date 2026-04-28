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
import sinon from 'sinon'
import { createVuetify } from 'vuetify'
import WorkflowService from '@/services/workflow.service'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'

const jobs = {
  test_job: [{
    name: 'test_job',
    id: '~cbennett/analysis_view_test/run1//1/a/01',
    submittedTime: '2023-02-23T11:10:09Z',
    startedTime: '2023-02-23T11:10:13Z',
    finishedTime: '2023-02-23T11:10:20Z',
    platform: 'localhost'
  }],
  yet_another_test_job: [{
    name: 'yet_another_test_job',
    id: '~cbennett/analysis_view_test/run1//1/b/01',
    submittedTime: '2023-02-23T11:10:21Z',
    startedTime: '2023-02-23T11:10:24Z',
    finishedTime: '2023-02-23T11:10:26Z',
    platform: 'localhost'
  }]
}

const vuetify = createVuetify()
const $workflowService = sinon.createStubInstance(WorkflowService)

describe('GanttChart component', () => {
  const mountFunction = (options) => {
    return mount(GanttChart, {
      global: {
        plugins: [vuetify],
        mocks: { $workflowService },
      },
      shallow: true,
      ...options
    })
  }

  it('Should deliver the correct values to the chart', async () => {
    const expectedSubmittedTime = 1677150609000
    const expectedStartedTime = 1677150613000
    const expectedFinishedTime = 1677150620000
    const wrapper = mountFunction({
      props: {
        jobs,
      }
    })

    // The component now uses a computed property `barData` which is used by `setOption`
    // We can't directly access the series data as easily.
    // Instead, we can check the `barData` computed property.
    // Note: This is an internal implementation detail and might break if the component is refactored.
    // A better approach would be to check the rendered output, but that's harder in a unit test.
    let barData = wrapper.vm.barData
    expect(barData[0].value).to.deep.equal([
      1, // y-axis category index
      expectedSubmittedTime,
      expectedFinishedTime
    ])

    await wrapper.setProps({ timingOption: 'queue' })
    await wrapper.vm.$nextTick() // Wait for computed properties to update
    barData = wrapper.vm.barData
    expect(barData[0].value).to.deep.equal([
      1,
      expectedSubmittedTime,
      expectedStartedTime
    ])

    await wrapper.setProps({ timingOption: 'run' })
    await wrapper.vm.$nextTick() // Wait for computed properties to update
    barData = wrapper.vm.barData
    expect(barData[0].value).to.deep.equal([
      1,
      expectedStartedTime,
      expectedFinishedTime
    ])
  })
})
