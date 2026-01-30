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
import { analysisTaskQuery } from '@/services/mock/json/index.cjs'
import WorkflowService from '@/services/workflow.service'
import AnalysisTable from '@/components/cylc/analysis/AnalysisTable.vue'

const vuetify = createVuetify()
const analysisTasks = analysisTaskQuery.data.tasks
const $workflowService = sinon.createStubInstance(WorkflowService)

describe('AnalysisTable component', () => {
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = options => {
    return mount(AnalysisTable, {
      global: {
        plugins: [vuetify],
        mocks: { $workflowService },
      },
      ...options,
    })
  }

  it('should sort task name column by default', async () => {
    const wrapper = mountFunction({
      props: {
        tasks: analysisTasks,
        timingOption: 'total',
      },
    })

    // check the the raw task data doesn't have the names in order
    expect(wrapper.vm.tasks.map((task) => task.name)).to.deep.equal([
      'succeeded',
      'eventually_succeeded',
      'waiting',
    ])

    // check that the html have the names in alphabetical order
    await wrapper.vm.$nextTick()
    expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(1)').element.innerHTML).to.equal('eventually_succeeded')
    expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(1)').element.innerHTML).to.equal('succeeded')
    expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(1)').element.innerHTML).to.equal('waiting')
  })

  it('should display the table with valid data', () => {
    const wrapper = mountFunction({
      props: {
        tasks: analysisTasks,
        timingOption: 'total',
      },
    })
    expect(wrapper.props().tasks[0].name).to.equal('succeeded')
    expect(wrapper.find('div')).to.not.equal(null)
  })

  describe('Visible columns', () => {
    it('should correctly display total times', () => {
      const wrapper = mountFunction({
        props: {
          tasks: analysisTasks,
          timingOption: 'total',
        },
      })
      expect(wrapper.vm.timingOption).to.equal('total')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for total times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal('00:00:30')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal('00:00:32')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal('00:00:38')
    })

    it('should correctly display run times', () => {
      const wrapper = mountFunction({
        props: {
          tasks: analysisTasks,
          timingOption: 'run',
        },
      })
      expect(wrapper.vm.timingOption).to.equal('run')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for run times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal('00:00:20')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal('00:00:21')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal('00:00:34')
    })

    it('should correctly display queue times', () => {
      const wrapper = mountFunction({
        props: {
          tasks: analysisTasks,
          timingOption: 'queue',
        },
      })
      expect(wrapper.vm.timingOption).to.equal('queue')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for queue times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal('00:00:10')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal('00:00:11')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal('00:00:12')
    })
  })
})
