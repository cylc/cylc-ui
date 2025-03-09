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

import { shallowMount } from '@vue/test-utils'
import EditRuntimeForm from '@/components/graphqlFormGenerator/EditRuntimeForm.vue'
import { IntrospectionQuery, taskProxy } from '@/services/mock/json/index.cjs'
import { cloneDeep } from 'lodash'
import { createVuetify } from 'vuetify'

/** NOTE: update this if updating src/services/mock/json/taskProxy.json */
const INITIAL_DATA = {
  platform: '',
  script:
    'sleep 4\nif [[ "$CYLC_TASK_SUBMIT_NUMBER" > 1 ]]; then\n    false\nfi',
  initScript: '',
  envScript: 'echo Anacreon',
  errScript: '',
  exitScript: '',
  preScript: 'echo Terminus',
  postScript: '',
  workSubDir: '',
  executionPollingIntervals: '',
  executionRetryDelays: 'PT2M, PT2M, PT2M, PT2M, PT2M, PT5M',
  executionTimeLimit: 'PT2H',
  submissionPollingIntervals: '',
  submissionRetryDelays: '',
  directives: [
    {
      key: '--nodes',
      value: '5',
      frozenKey: true
    },
    {
      key: '--account',
      value: 'h_seldon',
      frozenKey: true
    }
  ],
  environment: [
    {
      key: 'FACTION',
      value: 'Foundation',
      frozenKey: true
    },
    {
      key: 'MAYOR',
      value: 'Hardin',
      frozenKey: true
    }
  ],
  outputs: [],
  runMode: 'Live',
}

const $workflowService = {
  query () {
    return Promise.resolve(taskProxy.data)
  }
}

const vuetify = createVuetify()

describe('EditRuntimeForm Component', () => {
  const props = {
    cylcObject: {
      id: '~u/w//1/t',
      isFamily: false,
      tokens: { id: '~u/w//1/t' }
    },
    value: false,
    types: cloneDeep(IntrospectionQuery.data.__schema.types)
  }

  /**
   * @param {*} options
   * @returns {Wrapper<EditRuntimeForm>}
   */
  const mountFunction = (options) => shallowMount(EditRuntimeForm, {
    global: {
      plugins: [vuetify],
      mocks: { $workflowService }
    },
    ...options
  })

  describe('reset()', () => {
    it("queries the task's runtime section & processes the response", async () => {
      const wrapper = mountFunction({
        props,
        created () {},
      })
      await wrapper.vm.reset()
      expect(INITIAL_DATA).not.to.have.key('__typename')
      expect(wrapper.vm.model).to.deep.equal(INITIAL_DATA)
      expect(wrapper.vm.initialData).to.deep.equal(INITIAL_DATA)
    })
  })

  describe('getBroadcastData()', () => {
    it('correctly extracts only the changed data', () => {
      const model = {
        ...INITIAL_DATA,
        executionTimeLimit: 'PT30M',
        environment: [
          { // new item
            key: 'HORSE',
            value: '22'
          },
          { // altered item
            key: 'FACTION',
            value: 'Empire',
            frozenKey: true
          },
          {
            key: 'MAYOR',
            value: 'Hardin',
            frozenKey: true
          }
        ],
        outputs: [
          {
            key: 'planet',
            value: 'Trantor'
          }
        ]
      }
      const expected = [
        { execution_time_limit: 'PT30M' },
        { environment: { HORSE: '22' } },
        { environment: { FACTION: 'Empire' } },
        { outputs: { planet: 'Trantor' } }
      ]
      const wrapper = mountFunction({
        props,
        data: () => ({
          initialData: INITIAL_DATA,
          model
        }),
        created () {}
      })
      expect(wrapper.vm.getBroadcastData()).to.deep.equal(expected)
    })

    it('handles empty key-val pairs', () => {
      const model = {
        ...INITIAL_DATA,
        environment: [
          { key: null, value: null },
          { key: undefined, value: undefined }
        ],
        outputs: [
          {}
        ]
      }
      const expected = []
      const wrapper = mountFunction({
        props,
        data: () => ({
          initialData: INITIAL_DATA,
          model
        }),
        created () {}
      })
      expect(wrapper.vm.getBroadcastData()).to.deep.equal(expected)
    })
  })
})
