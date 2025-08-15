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

import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import storeOptions from '@/store/options'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import Log from '@/views/Log.vue'
import WorkflowService from '@/services/workflow.service'
import User from '@/model/User.model'
import { getJobLogFileFromState } from '@/model/JobState.model'

describe('Log view', () => {
  const owner = 'svimes'
  const workflowName = 'thud'
  const workflowID = `~${owner}/${workflowName}`
  const initialFile = 'koom-valley.log'

  const vuetify = createVuetify()
  let $workflowService, store

  const mountFunction = (options) => mount(Log, {
    global: {
      plugins: [vuetify, store],
      mocks: { $workflowService },
    },
    props: {
      workflowName,
      initialOptions: {
        file: initialFile,
      },
    },
    ...options
  })

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit(
      'user/SET_USER',
      new User({ username: 'cylc', permissions: [], owner })
    )
    $workflowService = sinon.createStubInstance(WorkflowService)
    $workflowService.apolloClient = {
      query: () => ({
        data: {
          logFiles: {
            files: ['a.log', 'b.log'],
          },
        }
      }),
    }
  })

  describe('Default log files', () => {
    describe('Job log', () => {
      it.each([
        ['failed', 'job.err'],
        ['submit-failed', 'job-activity.log'],
        ['submitted', 'job-activity.log'],
        ['running', 'job.out'],
        ['succeeded', 'job.out'],
        [undefined, undefined],
      ])('%s -> %s', async (state, expected) => {
        $workflowService.query2 = () => ({
          data: {
            jobs: [
              // Query response only includes latest job
              { id: 'w//1/foo/02', state },
            ]
          }
        })
        const wrapper = mountFunction()
        wrapper.vm.jobLog = 1
        wrapper.vm.relativeID = '1/foo'
        const result = await wrapper.vm.fetchJobData()
        expect(result.state).toBe(state)
        expect(getJobLogFileFromState(result.state)).toBe(expected)
      })
    })

    describe('Workflow log', () => {
      it.for([
        {
          files: [
            'scheduler/02-restart-02.log',
            'scheduler/01-start-01.log',
            'install/02-reinstall.log',
            'config/flow-processed.cylc',
            'config/20240212T155825+0000-rose-suite.conf',
            'config/02-restart-02.cylc',
          ].sort().reverse(),
          expected: 'scheduler/02-restart-02.log',
        },
        {
          files: [],
          expected: undefined,
        },
        {
          files: ['ceres', 'vesta', 'aphosis'].sort().reverse(),
          expected: undefined,
        },
      ])('getDefaultFile($files) == $expected', async ({ files, expected }) => {
        const wrapper = mountFunction()
        wrapper.vm.jobLog = 0
        wrapper.vm.logFiles = files
        expect(wrapper.vm.getDefaultWorkflowLog()).toBe(expected)
      })
    })
  })

  it('issues the subscription', async () => {
    const wrapper = mountFunction()
    await nextTick()
    expect(wrapper.vm.jobLog).toEqual(0)
    expect(wrapper.vm.query.variables).toMatchObject({
      id: workflowID,
      file: initialFile,
    })
    expect(wrapper.vm.file).toEqual(initialFile)
    // switch workflow -> job log
    wrapper.vm.jobLog = 1
    await nextTick()
    // old file & log lines should be wiped
    expect(wrapper.vm.file).toBe(undefined)
    expect(wrapper.vm.results.lines).toEqual([])
    expect(wrapper.vm.id).toBe(undefined)
    // should have unsubscribed
    expect(wrapper.vm.$workflowService.unsubscribe.calledOnce).toBe(true)
  })

  it('does not issue subscription for incomplete task ID', async () => {
    const wrapper = mountFunction()
    wrapper.vm.jobLog = 1
    await nextTick()
    wrapper.vm.relativeID = '2000' // cycle point only is invalid
    await nextTick()
    expect(wrapper.vm.id).toBe(undefined)
    expect(wrapper.vm.query).toBe(null)
    // type in complete task ID
    wrapper.vm.relativeID += '/bashfullsson'
    wrapper.vm.file = 'job.out'
    await nextTick()
    const expectedID = `${workflowID}//2000/bashfullsson/NN`
    expect(wrapper.vm.id).toEqual(expectedID)
    // query issued
    expect(wrapper.vm.query.variables).toMatchObject({
      id: expectedID,
      file: 'job.out',
    })
  })

  it('goes back to previous job when toggling job->workflow->job', async () => {
    const relativeID = '2000/angua'
    const expectedJobID = `${workflowID}//${relativeID}/NN`
    const wrapper = mountFunction({
      props: {
        workflowName,
        initialOptions: {
          file: 'job.out',
          relativeID,
        },
      },
    })
    expect(wrapper.vm.jobLog).toEqual(1)
    expect(wrapper.vm.id).toEqual(expectedJobID)
    wrapper.vm.jobLog = 0
    await nextTick()
    expect(wrapper.vm.id).toEqual(workflowID)
    wrapper.vm.jobLog = 1
    await nextTick()
    expect(wrapper.vm.id).toEqual(expectedJobID)
  })
})
