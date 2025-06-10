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
import { analysisJobQuery } from '@/services/mock/json/index.cjs'
import WorkflowService from '@/services/workflow.service'
import TimeSeries from '@/components/cylc/analysis/TimeSeries.vue'

const vuetify = createVuetify()
const analysisJobs = analysisJobQuery.data.jobs
const $workflowService = sinon.createStubInstance(WorkflowService)

describe('TimeSeries component', () => {
  const mountFunction = (options) => {
    return mount(TimeSeries, {
      global: {
        plugins: [vuetify],
        mocks: { $workflowService },
      },
      shallow: true,
      ...options,
    })
  }

  it('should not display any data when loaded', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    expect(wrapper.vm.jobs).to.deep.equal([])
    expect(wrapper.vm.displayedTasks).to.deep.equal([])
    expect(wrapper.vm.cyclePoints).to.deep.equal([])
    expect(wrapper.vm.series).to.deep.equal([])
  })

  it('should display no data when no tasks have been selected', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    // Retrieve job data and check that nothing is displayed
    wrapper.vm.jobs = analysisJobs
    expect(wrapper.vm.cyclePoints).to.deep.equal([])
    expect(wrapper.vm.series).to.deep.equal([])

    // Select a task and check that cyclePoints and series have been calculated
    wrapper.vm.displayedTasks = ['succeeded']
    expect(wrapper.vm.cyclePoints).not.to.deep.equal([])
    expect(wrapper.vm.series).not.to.deep.equal([])

    // Deselect task and check that no data will be displayed again
    wrapper.vm.displayedTasks = []
    expect(wrapper.vm.cyclePoints).to.deep.equal([])
    expect(wrapper.vm.series).to.deep.equal([])
  })

  it('should correctly sort cycle points', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    wrapper.vm.jobs = analysisJobs
    wrapper.vm.displayedTasks = ['eventually_succeeded']

    // Check the the raw job data doesn't have the cycle points in order
    expect(wrapper.vm.jobs.filter(
      job => wrapper.vm.displayedTasks.includes(job.name)
    ).map(
      job => job.cyclePoint
    )).to.deep.equal([
      '20240101T1200Z',
      '20240101T0000Z',
      '20240102T0000Z',
    ])

    // Check that cyclePoints is in order
    expect(wrapper.vm.cyclePoints).to.deep.equal([
      '20240101T0000Z',
      '20240101T1200Z',
      '20240102T0000Z',
    ])
    expect(wrapper.vm.series[0].data[0].x).to.equal('20240101T0000Z')
    expect(wrapper.vm.series[0].data[1].x).to.equal('20240101T1200Z')
    expect(wrapper.vm.series[0].data[2].x).to.equal('20240102T0000Z')
  })

  it('should only display cycle points that have data', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    wrapper.vm.jobs = analysisJobs
    wrapper.vm.displayedTasks = ['succeeded', 'waiting']

    // succeeded has data on all three cycle points
    expect(wrapper.vm.cyclePoints).to.deep.equal([
      '20240101T0000Z',
      '20240101T1200Z',
      '20240102T0000Z',
    ])

    // waiting only has data on two of the cycle points
    wrapper.vm.displayedTasks = ['waiting']
    expect(wrapper.vm.cyclePoints).to.deep.equal([
      '20240101T0000Z',
      '20240102T0000Z',
    ])
  })

  it('should use nulls when no job for that cycle point', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    wrapper.vm.jobs = analysisJobs
    wrapper.vm.displayedTasks = ['succeeded', 'waiting']

    // waiting shouldn't have any data for the second cycle point
    expect(wrapper.vm.series[1].data[1].y).to.equal(null)
  })

  it('should choose last run job when there are multiple jobs', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    wrapper.vm.jobs = analysisJobs
    wrapper.vm.displayedTasks = ['waiting']

    // startedTime should be highest value
    expect(wrapper.vm.series[0].data[1].startedTime).to.equal('2023-01-01T02:02:00Z')
    expect(wrapper.vm.series[0].data[1].y).to.equal(52)
  })

  it('should display correct timing type', async () => {
    const wrapper = mountFunction({
      props: {
        workflowIDs: ['one'],
        platformOption: -1,
        timingOption: 'total',
      },
    })

    wrapper.vm.jobs = analysisJobs
    wrapper.vm.displayedTasks = ['succeeded']

    expect(wrapper.vm.series[0].data[0].y).to.equal(60)

    await wrapper.setProps({ timingOption: 'run' })
    expect(wrapper.vm.series[0].data[0].y).to.equal(58)

    await wrapper.setProps({ timingOption: 'queue' })
    expect(wrapper.vm.series[0].data[0].y).to.equal(2)
  })
})
