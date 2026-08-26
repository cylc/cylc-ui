/**
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
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import storeOptions from '@/store/options'
import sinon from 'sinon'
import Log from '@/views/Log.vue'
import WorkflowService from '@/services/workflow.service'
import User from '@/model/User.model'
import { getJobLogFileFromState } from '@/model/JobState.model'
import { mockRoute } from '$tests/util'

describe('Log view', () => {
  const owner = 'svimes'
  const workflowName = 'thud'
  const workflowID = `~${owner}/${workflowName}`
  const initialFile = 'koom-valley.log'

  mockRoute({ params: { workflowName } })
  let $workflowService, store

  const mountFunction = (options) => mount(Log, {
    global: {
      plugins: [store],
      mocks: { $workflowService },
    },
    props: {
      initialOptions: {
        file: initialFile,
      },
    },
    shallow: true,
    ...options,
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
        },
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
            ],
          },
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

  it('toggles the log mode and updates the toolbar label', async () => {
    const wrapper = mountFunction()
    await nextTick()

    const initialMode = wrapper.vm.logMode
    const initialTitle = wrapper.vm.controlGroups[0].controls.find(
      ({ key }) => key === 'logMode'
    ).title

    wrapper.vm.setOption('logMode', !initialMode)
    await nextTick()
    expect(wrapper.vm.logMode).toBe(!initialMode)

    const newTitle = wrapper.vm.controlGroups[0].controls.find(
      ({ key }) => key === 'logMode'
    ).title
    expect(newTitle).not.toBe(initialTitle)
  })

  it('uses toggle action for the log mode toolbar control', async () => {
    const wrapper = mountFunction()
    await nextTick()

    const logModeControl = wrapper.vm.controlGroups[0].controls.find(
      ({ key }) => key === 'logMode'
    )

    expect(logModeControl.action).toBe('toggle')
    expect(logModeControl.value).toBe(wrapper.vm.logMode)
    expect(logModeControl.values).toBe(undefined)
    expect(logModeControl.title).toBe(
      wrapper.vm.logMode
        ? 'HEAD: showing the start of the file'
        : 'TAIL: showing the end of the file'
    )
  })

  it('shows start/end truncation banner messages with max line count', async () => {
    const wrapper = mountFunction()
    await nextTick()

    const maxLines = Number(wrapper.vm.maxLines)

    wrapper.vm.results = {
      ...wrapper.vm.results,
      truncated: 'start',
    }
    await nextTick()
    expect(wrapper.vm.truncationMessage).toBe(
      `The start of this file has been truncated because it is over ${maxLines} lines long.`
    )

    wrapper.vm.results = {
      ...wrapper.vm.results,
      truncated: 'end',
    }
    await nextTick()
    expect(wrapper.vm.truncationMessage).toBe(
      `The end of this file has been truncated because it is over ${maxLines} lines long.`
    )
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
