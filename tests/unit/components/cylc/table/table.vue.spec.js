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
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import { simpleTableTasks } from './table.data'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import Table from '@/components/cylc/table/Table.vue'
import WorkflowService from '@/services/workflow.service'

const $workflowService = sinon.createStubInstance(WorkflowService)

const vuetify = createVuetify()

describe('Table component', () => {
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = (options) => mount(Table, {
    global: {
      plugins: [vuetify, CommandMenuPlugin],
      mocks: {
        $workflowService,
      },
    },
    ...options,
  })

  it('should sort cycle point column descending by default', async () => {
    const wrapper = mountFunction({
      props: {
        tasks: simpleTableTasks,
      },
    })
    // check the the raw task data has the cycle points from lowest to highest
    expect(wrapper.vm.tasks[wrapper.vm.tasks.length - 1].task.tokens.cycle).to.equal('20000103T0000Z')
    expect(wrapper.vm.tasks[0].task.tokens.cycle).to.equal('20000101T0000Z')

    // check that the html have the cycle points from high to low
    await wrapper.vm.$nextTick()
    expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(3)').element.innerHTML).to.equal('20000103T0000Z')
    expect(wrapper.find(`table > tbody > tr:nth-child(${wrapper.vm.tasks.length}) > td:nth-child(3)`).element.innerHTML).to.equal('20000101T0000Z')
  })

  it('should display the table with valid data', () => {
    const wrapper = mountFunction({
      props: {
        tasks: simpleTableTasks,
      },
    })
    expect(wrapper.props().tasks[0].task.name).to.equal('taskA')
    expect(wrapper.find('div')).to.not.equal(null)
  })

  describe('Sort', () => {
    it.each([
      { cyclePointsOrderDesc: true, expected: 'desc' },
      { cyclePointsOrderDesc: false, expected: 'asc' },
    ])('sorts cycle point $expected from localStorage by default', ({ cyclePointsOrderDesc, expected }) => {
      localStorage.setItem('cyclePointsOrderDesc', cyclePointsOrderDesc)
      const wrapper = mountFunction({
        props: {
          tasks: simpleTableTasks,
        },
      })
      expect(wrapper.vm.sortBy).toMatchObject([
        { order: expected },
      ])
    })

    describe('nullSorter', () => {
      it.each([
        ['a', 'b', 'asc', -1],
        ['a', 'b', 'desc', 1],
        ['a', '', 'asc', -1],
        ['a', '', 'desc', 1],
        ['a', null, 'asc', -1],
        ['a', null, 'desc', 1],
        [null, 'a', 'asc', 1],
        [null, 'a', 'desc', -1],
        ['a', undefined, 'asc', -1],
        ['a', undefined, 'desc', 1],
        [0, null, 'asc', -1],
        [0, null, 'desc', 1],
        [null, null, 'asc', 0],
        [null, null, 'desc', 0],
        ['', null, 'asc', 0],
        ['', null, 'desc', 0],
      ])('$2: $0, $1 -> $3', (a, b, order, expected) => {
        const key = 'key'
        const wrapper = mountFunction({
          props: {
            tasks: [],
            initialOptions: {
              sortBy: [{ key, order }],
            },
          },
        })
        const comparator = (x, y) => {
          return order === 'asc' ? x.localeCompare(y) : y.localeCompare(x)
        }
        expect(wrapper.vm.nullSorter(key, comparator, a, b)).toEqual(expected)
      })
    })
  })
})
