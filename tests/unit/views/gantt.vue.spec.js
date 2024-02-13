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

import { GanttCallback } from '@/views/Gantt.vue'

const data = {
  jobs: [{
    name: 'a',
    id: '~cbennett/analysis_view_test/run2//1/a/01',
    submittedTime: '2023-02-23T11:36:58Z',
    startedTime: '2023-02-23T11:37:00Z',
    finishedTime: '2023-02-23T11:37:05Z',
    platform: 'localhost',
    __typename: 'UISJob'
  },
  {
    name: 'b',
    id: '~cbennett/analysis_view_test/run2//1/b/03',
    submittedTime: '2023-02-23T11:37:29Z',
    startedTime: '2023-02-23T11:37:33Z',
    finishedTime: '2023-02-23T11:37:35Z',
    platform: 'vld684',
    __typename: 'UISJob'
  },
  {
    name: 'b',
    id: '~cbennett/analysis_view_test/run2//2/b/01',
    submittedTime: '2023-02-23T11:38:07Z',
    startedTime: '2023-02-23T11:38:12Z',
    finishedTime: '2023-02-23T11:38:13Z',
    platform: 'vld684',
    __typename: 'UISJob'
  }]
}
const expectedJobs = [{
  a: [{
    __typename: 'UISJob',
    finishedTime: '2023-02-23T11:37:05Z',
    id: '~cbennett/analysis_view_test/run2//1/a/01',
    name: 'a',
    platform: 'localhost',
    startedTime: '2023-02-23T11:37:00Z',
    submittedTime: '2023-02-23T11:36:58Z',
  }],
  b: [{
    __typename: 'UISJob',
    finishedTime: '2023-02-23T11:37:35Z',
    id: '~cbennett/analysis_view_test/run2//1/b/03',
    name: 'b',
    platform: 'vld684',
    startedTime: '2023-02-23T11:37:33Z',
    submittedTime: '2023-02-23T11:37:29Z'
  },
  {
    __typename: 'UISJob',
    finishedTime: '2023-02-23T11:38:13Z',
    id: '~cbennett/analysis_view_test/run2//2/b/01',
    name: 'b',
    platform: 'vld684',
    startedTime: '2023-02-23T11:38:12Z',
    submittedTime: '2023-02-23T11:38:07Z'
  }],
}]

describe('GanttCallback', () => {
  it('adds data', () => {
    const ganttCallback = new GanttCallback([])
    ganttCallback.add(data)
    expect(ganttCallback.jobs).toEqual(expectedJobs)
  })
})

//  describe('Gantt view', () => {
//  let store, $workflowService
//  beforeEach(() => {
//    store = createStore(storeOptions)
//    const user = new User('cylc', [], new Date(), true, 'localhost', 'owner')
//    store.commit('user/SET_USER', user)
//    $workflowService = sinon.createStubInstance(WorkflowService)
//  })
//
//  it('computes tasks', async () => {
//    const wrapper = mount(Table, {
//      shallow: true,
//      global: {
//        plugins: [store],
//        mocks: { $workflowService }
//      },
//      props: {
//        workflowName: 'one',
//      },
//      data: () => ({
//        // Override computed property
//        workflows
//      })
//    })
//
//    expect(wrapper.vm.tasks).toMatchObject([
//      {
//        task: { id: '~user/one//1/eventually_succeeded' },
//        latestJob: { id: '~user/one//1/eventually_succeeded/3' },
//        previousJob: { id: '~user/one//1/eventually_succeeded/2' }
//      },
//      {
//        task: { id: '~user/one//1/failed' },
//        latestJob: { id: '~user/one//1/failed/1' },
//      }
//    ])
//  })
//  })
