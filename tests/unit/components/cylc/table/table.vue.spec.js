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

import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import { simpleTableTasks } from './table.data'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import Table from '@/components/cylc/table/Table.vue'
import WorkflowService from '@/services/workflow.service'
import { vuetifyOptions } from '@/plugins/vuetify'

const $workflowService = sinon.createStubInstance(WorkflowService)

const vuetify = createVuetify(vuetifyOptions)

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

  it('should display the table with valid data', () => {
    const wrapper = mountFunction({
      props: {
        tasks: simpleTableTasks,
      },
    })
    expect(wrapper.props().tasks[0].task.name).to.equal('taskA')
    expect(wrapper.find('div')).to.not.equal(null)
  })

  it('computes run times per row', () => {
    const wrapper = mountFunction({
      props: { tasks: [] },
      shallow: true,
    })
    const { getTaskRunTimes } = wrapper.vm
    expect(getTaskRunTimes({
      task: { node: { task: { meanElapsedTime: 2 } } },
      latestJob: {
        node: {
          startedTime: '2000-01-01T00:00:00Z',
          finishedTime: '2000-01-01T00:00:10Z',
        },
      },
    })).toEqual({ actual: 10, estimate: 2 })
    expect(getTaskRunTimes({
      task: { node: {} },
      latestJob: undefined,
    })).toEqual({ actual: undefined, estimate: undefined })
  })

  it('displays job fields', () => {
    const wrapper = mountFunction({
      props: {
        tasks: simpleTableTasks,
      },
    })
    const firstRow = wrapper.find('table > tbody > tr:nth-child(1)')
    // platform, job runner & job ID of taskA's latest job
    expect(firstRow.text()).toContain('localhost')
    expect(firstRow.text()).toContain('background')
    expect(firstRow.findAll('td').map((td) => td.text())).toContain('1')
  })

  describe('Sort', () => {
    it.each([
      { order: 'desc' },
      { order: 'asc' },
    ])('sorts cycle point $order', async ({ order }) => {
      const wrapper = mountFunction({
        props: {
          tasks: simpleTableTasks,
          sortBy: [{ key: 'task.tokens.cycle', order }],
        },
      })
      const min = '20000101T0000Z'
      const max = '20000103T0000Z'
      // check the the raw task data has the cycle points from lowest to highest
      expect(wrapper.vm.tasks[0].task.tokens.cycle).to.equal(min)
      expect(wrapper.vm.tasks[wrapper.vm.tasks.length - 1].task.tokens.cycle).to.equal(max)

      // check that the html have the cycle points in the right order
      await wrapper.vm.$nextTick()
      expect(wrapper.find('table > tbody > tr:nth-child(1) > td:nth-child(3)').element.innerHTML).to.equal(order === 'asc' ? min : max)
      expect(wrapper.find(`table > tbody > tr:nth-child(${wrapper.vm.tasks.length}) > td:nth-child(3)`).element.innerHTML).to.equal(order === 'asc' ? max : min)
    })

    it.each([
      { order: 'asc', expected: ['taskY', 'taskZ', 'taskX'] },
      { order: 'desc', expected: ['taskX', 'taskZ', 'taskY'] },
    ])('sorts run time $order', async ({ order, expected }) => {
      const makeRow = (name, runTimeSecs) => {
        const job = {
          id: `~u/w//1/${name}/01`,
          node: {
            state: 'succeeded',
            startedTime: '2000-01-01T00:00:00Z',
            finishedTime: new Date(Date.UTC(2000, 0, 1, 0, 0, runTimeSecs)).toISOString(),
          },
          children: [],
        }
        return {
          task: {
            id: `~u/w//1/${name}`,
            name,
            tokens: { cycle: '1' },
            node: { state: 'succeeded' },
            children: [job],
          },
          latestJob: job,
          previousJob: null,
        }
      }
      const wrapper = mountFunction({
        props: {
          tasks: [makeRow('taskX', 30), makeRow('taskY', 10), makeRow('taskZ', 20)],
          sortBy: [{ key: 'task.node.task.meanElapsedTime', order }],
        },
      })
      await wrapper.vm.$nextTick()
      expect(
        wrapper.findAll('[data-cy-task-name]').map((el) => el.attributes('data-cy-task-name'))
      ).toEqual(expected)
    })

    it.each([
      { order: 'asc', expected: ['taskB', 'taskC', 'taskA'] },
      { order: 'desc', expected: ['taskC', 'taskB', 'taskA'] },
    ])('sorts job columns $order (empty values last)', async ({ order, expected }) => {
      const makeRow = (name, platform) => {
        const job = platform && {
          id: `~u/w//1/${name}/01`,
          node: { state: 'running', platform },
          children: [],
        }
        return {
          task: {
            id: `~u/w//1/${name}`,
            name,
            tokens: { cycle: '1' },
            node: { state: 'running' },
            children: job ? [job] : [],
          },
          latestJob: job || undefined,
          previousJob: undefined,
        }
      }
      const wrapper = mountFunction({
        props: {
          tasks: [makeRow('taskA', null), makeRow('taskB', 'alpha'), makeRow('taskC', 'beta')],
          sortBy: [{ key: 'latestJob.node.platform', order }],
        },
      })
      await wrapper.vm.$nextTick()
      expect(
        wrapper.findAll('[data-cy-task-name]').map((el) => el.attributes('data-cy-task-name'))
      ).toEqual(expected)
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
            sortBy: [{ key, order }],
          },
          shallow: true,
        })
        const comparator = (x, y) => {
          return order === 'asc' ? x.localeCompare(y) : y.localeCompare(x)
        }
        expect(wrapper.vm.nullSorter(key, comparator, a, b)).toEqual(expected)
      })
    })
  })
})
