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

  it('Should compute the correct displayed jobs', async () => {
    const wrapper = mountFunction({
      props: {
        jobs,
      }
    })

    // Check displayedJobs contains the correct jobs
    expect(wrapper.vm.displayedJobs).to.have.length(2)
    expect(wrapper.vm.displayedJobs[0].name).to.equal('test_job')
    expect(wrapper.vm.displayedJobs[1].name).to.equal('yet_another_test_job')

    // Check displayedTaskCount
    expect(wrapper.vm.displayedTaskCount).to.equal(2)

    // Check numPages
    expect(wrapper.vm.numPages).to.equal(1)
  })

  it('Should paginate correctly', async () => {
    const wrapper = mountFunction({
      props: {
        jobs,
        tasksPerPage: 1,
      }
    })

    expect(wrapper.vm.displayedTaskCount).to.equal(1)
    expect(wrapper.vm.numPages).to.equal(2)
    expect(wrapper.vm.displayedJobs).to.have.length(1)
    expect(wrapper.vm.displayedJobs[0].name).to.equal('test_job')
  })
})
