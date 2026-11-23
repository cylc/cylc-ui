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

import TaskState from '@/model/TaskState.model'
import {
  extractGroupState,
  latestJob,
  formatDuration,
  jobMessageOutputs,
  formatFlowNums,
  getRunTime,
  isTruthyOrZero,
  compare,
  formatChartLabels,
  getTimingOption,
  formatHeader,
  formatRSS,
} from '@/utils/tasks'

describe('tasks', () => {
  describe('extractGroupState', () => {
    it('should return the correct state for the node groups when not stopped', () => {
      [
        [
          TaskState.FAILED.name, // expected
          [TaskState.WAITING, TaskState.FAILED].map((state) => state.name)], // childStates
        [
          TaskState.WAITING.name,
          [TaskState.WAITING].map((state) => state.name)],
        [
          TaskState.RUNNING.name,
          [TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name)],
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], false)
        expect(groupState).to.equal(val[0])
      })
    })

    it('should return the correct state for the node groups when stopped', () => {
      [
        [
          TaskState.RUNNING.name, // expected
          [TaskState.WAITING, TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name)], // childStates
        [
          TaskState.SUCCEEDED.name,
          [TaskState.SUCCEEDED].map((state) => state.name)],
        [
          TaskState.RUNNING.name,
          [TaskState.SUBMITTED, TaskState.RUNNING, TaskState.EXPIRED].map((state) => state.name)],
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], true)
        expect(groupState).to.equal(val[0])
      })
    })

    it('should return empty when no states provided', () => {
      expect(extractGroupState([])).to.equal('')
    })
  })

  describe.each([
    {
      taskProxy: null,
      expected: undefined,
    },
    {
      taskProxy: {},
      expected: undefined,
    },
    {
      taskProxy: {
        children: [],
      },
      expected: undefined,
    },
    {
      taskProxy: {
        children: [
          { node: 'foo' },
          { node: 'bar' },
        ],
      },
      expected: 'foo',
    },
  ])('latestJob($taskProxy)', ({ taskProxy, expected }) => {
    it(`returns ${expected}`, () => {
      expect(latestJob(taskProxy)).to.equal(expected)
    })
  })

  describe('formatDuration', () => {
    it('should format seconds to nice isodatetime format', () => {
      expect(formatDuration(null)).to.equal(undefined)
      expect(formatDuration(undefined)).to.equal(undefined)
      expect(formatDuration(42)).to.equal('00:00:42')
      expect(formatDuration(84)).to.equal('00:01:24')
      expect(formatDuration(4242)).to.equal('01:10:42')
      expect(formatDuration(1426332)).to.equal('16d 12:12:12')
    })
    it('should return undefined for 0 seconds by default', () => {
      expect(formatDuration(0)).to.equal(undefined)
    })
    it('should change format of 0 seconds based on value of allowZeros', () => {
      expect(formatDuration(0, false)).to.equal(undefined)
      expect(formatDuration(0, true)).to.equal('00:00:00')
    })
    it('should not change format of non-zero values based on allowZeros', () => {
      expect(formatDuration(42)).to.equal('00:00:42')
      expect(formatDuration(42, { allowZeros: false })).to.equal('00:00:42')
      expect(formatDuration(42, { allowZeros: true })).to.equal('00:00:42')
    })
    it.each(['queue', 'total', 'run'])('formats %o timing option as HH:MM:SS', (timingOption) => {
      expect(formatDuration(4242, false, timingOption)).to.equal('01:10:42')
      expect(formatDuration(0, false, timingOption)).to.equal(undefined)
      expect(formatDuration(0, true, timingOption)).to.equal('00:00:00')
    })
    it('converts cpuTime from milliseconds', () => {
      expect(formatDuration(4242000, false, 'cpuTime')).to.equal('01:10:42')
      expect(formatDuration(1500, false, 'cpuTime')).to.equal('00:00:02')
      expect(formatDuration(0, true, 'cpuTime')).to.equal('00:00:00')
      expect(formatDuration(undefined, true, 'cpuTime')).to.equal(undefined)
      expect(formatDuration(null, false, 'cpuTime')).to.equal(undefined)
    })
    it.each([
      [undefined, undefined],
      [null, undefined],
      [512, '0.500 KiB'],
      [2048, '2.00 KiB'],
      [5 * 1048576, '5.00 MiB'],
      [2 * 1073741824, '2.00 GiB'],
    ])('formats maxRss %o -> %o', (value, expected) => {
      expect(formatDuration(value, false, 'maxRss')).to.equal(expected)
    })
    it('rounds non-integer durations', () => {
      expect(formatDuration(41.6, false, 'run')).to.equal('00:00:42')
      expect(formatDuration(59.6, false, 'run')).to.equal('00:01:00')
    })
    it('returns undefined for an unknown timing option', () => {
      expect(formatDuration(42, false, 'foo')).to.equal(undefined)
    })
  })

  describe('formatRSS', () => {
    it.each([
      [undefined, undefined],
      [null, undefined],
      [0, '0.00 KiB'],
      [512, '0.500 KiB'],
      [1024, '1.00 KiB'],
      [999 * 1024, '999 KiB'],
      [1000 * 1024, '0.977 MiB'],
      [1.5 * 1048576, '1.50 MiB'],
      [999 * 1048576, '999 MiB'],
      [1000 * 1048576, '0.977 GiB'],
      [2 * 1073741824, '2.00 GiB'],
    ])('formatRSS(%o) -> %o', (value, expected) => {
      expect(formatRSS(value)).to.equal(expected)
    })
  })

  describe('compare', () => {
    it('compares non-quartile fields directly', () => {
      const a = { name: 'a', count: 1, meanMaxRss: 1 }
      const b = { name: 'b', count: 2, meanMaxRss: 2 }
      expect(compare(a, b, 'name', false)).to.equal(-1)
      expect(compare(b, a, 'name', false)).to.equal(1)
      expect(compare(a, b, 'name', true)).to.equal(1)
      expect(compare(b, a, 'name', true)).to.equal(-1)
      expect(compare(a, b, 'count', false)).to.equal(-1)
      expect(compare(a, b, 'meanMaxRss', false)).to.equal(-1)
    })
    it.each([
      ['RunTime', 'runTimeQuartiles'],
      ['QueueTime', 'queueTimeQuartiles'],
      ['TotalTime', 'totalTimeQuartiles'],
      ['MaxRss', 'maxRssQuartiles'],
      ['CpuTime', 'cpuTimeQuartiles'],
    ])('compares min/median/max %o using %o', (metric, quartilesKey) => {
      // Each statistic's ordering deliberately opposes its neighbours'
      // to check the correct index is used
      const a = { [quartilesKey]: [1, 9, 2, 9, 5] }
      const b = { [quartilesKey]: [2, 1, 5, 1, 4] }
      // min (index 0)
      expect(compare(a, b, `min${metric}`, false)).to.equal(-1)
      expect(compare(a, b, `min${metric}`, true)).to.equal(1)
      // median (index 2)
      expect(compare(a, b, `median${metric}`, false)).to.equal(-1)
      expect(compare(b, a, `median${metric}`, false)).to.equal(1)
      // max (index 4)
      expect(compare(a, b, `max${metric}`, false)).to.equal(1)
      expect(compare(a, b, `max${metric}`, true)).to.equal(-1)
    })
  })

  describe('formatChartLabels', () => {
    it.each([
      ['maxRss', 'Max RSS'],
      ['cpuTime', 'CPU Time'],
      ['run', 'Run Time'],
      ['queue', 'Queue Time'],
      ['total', 'Total Time'],
    ])('%o -> %o', (input, expected) => {
      expect(formatChartLabels(input)).to.equal(expected)
    })
  })

  describe('getTimingOption', () => {
    it.each([
      ['maxRss', 'maxRss'],
      ['cpuTime', 'cpuTime'],
      ['run', 'runTime'],
      ['queue', 'queueTime'],
      ['total', 'totalTime'],
    ])('%o -> %o', (input, expected) => {
      expect(getTimingOption(input)).to.equal(expected)
    })
  })

  describe('formatHeader', () => {
    it.each([
      ['quartiles', 'maxRss', 'maxRssQuartiles'],
      ['mean', 'maxRss', 'meanMaxRss'],
      ['stdDev', 'maxRss', 'stdDevMaxRss'],
      ['quartiles', 'cpuTime', 'cpuTimeQuartiles'],
      ['stdDev', 'cpuTime', 'stdDevCpuTime'],
      ['quartiles', 'run', 'runTimeQuartiles'],
      ['mean', 'run', 'meanRunTime'],
      ['stdDev', 'queue', 'stdDevQueueTime'],
      ['quartiles', 'total', 'totalTimeQuartiles'],
    ])('formatHeader(%o, %o) -> %o', (statistic, timingOption, expected) => {
      expect(formatHeader(statistic, timingOption)).to.equal(expected)
    })
  })

  describe('getRunTime', () => {
    it.each([
      [{ startedTime: '2024-10-01T23:59:40Z', finishedTime: '2024-10-02T00:00:10Z' }, 30],
      [{ startedTime: '2024-10-01T23:59:40Z' }, undefined],
      [{ }, undefined],
    ])('%o -> %o', (jobNode, expected) => {
      expect(getRunTime(jobNode)).toEqual(expected)
    })
  })

  describe('jobMessageOutputs()', () => {
    it('returns expected value for outputs vs ordinary messages', () => {
      const jobNode = {
        node: {
          messages: [
            'submitted',
            'started',
            'chilbolton',
            'larkhill',
          ],
          taskProxy: {
            outputs: [{
              label: 'my-output',
              message: 'chilbolton',
            }],
          },
        },
      }

      expect(jobMessageOutputs(jobNode)).toEqual([
        {
          level: undefined,
          label: 'my-output',
          message: 'chilbolton',
          isMessage: false,
        },
        {
          level: undefined,
          label: undefined,
          message: 'larkhill',
          isMessage: true,
        },
      ])
    })
  })

  describe('formatFlowNums', () => {
    it.each([
      ['[1]', '1'],
      ['[1, 4, 8]', '1, 4, 8'],
      ['[]', 'None'],
    ])('formatFlowNums(%o) -> %o', (input, expected) => {
      expect(formatFlowNums(input)).toEqual(expected)
    })
  })

  describe('isTruthyOrZero', () => {
    it.each([
      [undefined, false],
      [null, false],
      [false, false],
      ['', false],
      ['foo', true],
      [0, true],
      [-1, true],
      [[], true],
    ])('%o -> %o', (input, expected) => {
      expect(isTruthyOrZero(input)).toEqual(expected)
    })
  })
})
