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
import { Tokens } from '@/utils/uid'

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
        tokens: new Tokens(workflowID),
        file: initialFile,
      },
    },
    ...options
  })

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit(
      'user/SET_USER',
      new User('cylc', [], new Date(), true, 'localhost', owner)
    )
    $workflowService = sinon.createStubInstance(WorkflowService)
  })

  it('issues the subscription', async () => {
    const wrapper = mountFunction()
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
    expect(wrapper.vm.file).toBe(null)
    expect(wrapper.vm.results.lines).toEqual([])
    // should have unsubscribed
    expect(wrapper.vm.$workflowService.unsubscribe.calledOnce).toBe(true)
  })

  it('does not issue subscription for incomplete task ID', async () => {
    const wrapper = mountFunction({
      data: () => ({
        jobLog: 1,
        relativeID: '2000', // cycle point only is invalid
      })
    })
    expect(wrapper.vm.id).toBe(null)
    expect(wrapper.vm.query).toBe(null)
    // type in complete task ID
    wrapper.vm.relativeID += '/bashfullsson'
    wrapper.vm.file = 'job.out'
    await nextTick()
    const expectedID = `${workflowID}//2000/bashfullsson`
    expect(wrapper.vm.id).toEqual(expectedID)
    // query issued
    expect(wrapper.vm.query.variables).toMatchObject({
      id: expectedID,
      file: 'job.out',
    })
  })
})
