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

import Vue from 'vue'
import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vuetify from 'vuetify/lib'
import { analysisTasks } from './analysis.data'
// import TaskState from '@/model/TaskState.model'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import AnalysisTable from '@/components/cylc/analysis/AnalysisTable'

Vue.use(Vuetify)

const localVue = createLocalVue()
localVue.prototype.$eventBus = {
  emit () {}
}
localVue.prototype.$workflowService = {
  register () {},
  unregister () {},
  subscribe () {},
  introspection: Promise.resolve({
    mutations: [
      { args: [] }
    ],
    types: []
  })
}
localVue.use(CylcObjectPlugin)

describe('AnalysisTable component', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
  })
  // mount function from Vuetify docs https://vuetifyjs.com/ru/getting-started/unit-testing/
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = options => {
    // the mocks.$vuetify is for https://github.com/vuetifyjs/vuetify/issues/9923
    return mount(AnalysisTable, {
      localVue,
      mocks: {
        $vuetify: {
          lang: {
            t: (val) => val
          }
        }
      },
      vuetify,
      ...options
    })
  }
  global.requestAnimationFrame = cb => cb()
  it('should sort task name column by default', async () => {
    const wrapper = mountFunction({
      propsData: {
        tasks: analysisTasks,
        timingOption: 'totalTimes'
      }
    })

    // check the the raw task data doesn't have the names in order
    expect(wrapper.vm.tasks[0].name).to.equal('succeeded')
    expect(wrapper.vm.tasks[1].name).to.equal('eventually_succeeded')
    expect(wrapper.vm.tasks[2].name).to.equal('waiting')

    // check that the html have the names in alphabetical order
    await wrapper.vm.$nextTick()
    expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(1)').element.innerHTML).to.equal('eventually_succeeded')
    expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(1)').element.innerHTML).to.equal('succeeded')
    expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(1)').element.innerHTML).to.equal('waiting')
  })
  it('should display the table with valid data', () => {
    const wrapper = mountFunction({
      propsData: {
        tasks: analysisTasks,
        timingOption: 'totalTimes'
      }
    })
    expect(wrapper.props().tasks[0].name).to.equal('succeeded')
    expect(wrapper.find('div')).to.not.equal(null)
  })
  describe('Visible columns', () => {
    it('should correctly display total times', () => {
      const wrapper = mountFunction({
        propsData: {
          tasks: analysisTasks,
          timingOption: 'totalTimes'
        }
      })
      expect(wrapper.vm.timingOption).to.equal('totalTimes')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for total times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:30 ')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:32 ')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:34 ')
    })
    it('should correctly display run times', () => {
      const wrapper = mountFunction({
        propsData: {
          tasks: analysisTasks,
          timingOption: 'runTimes'
        }
      })
      expect(wrapper.vm.timingOption).to.equal('runTimes')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for run times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:20 ')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:21 ')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:22 ')
    })
    it('should correctly display queue times', () => {
      const wrapper = mountFunction({
        propsData: {
          tasks: analysisTasks,
          timingOption: 'queueTimes'
        }
      })
      expect(wrapper.vm.timingOption).to.equal('queueTimes')
      expect(wrapper.vm.tasks.length).to.equal(3)

      // check that the html has the expected data for queue times
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:10 ')
      expect(wrapper.find('table > tbody > tr:nth-child(2) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:11 ')
      expect(wrapper.find('table > tbody > tr:nth-child(3) > td:nth-child(4)').element.innerHTML).to.equal(' 00:00:12 ')
    })
  })
})
