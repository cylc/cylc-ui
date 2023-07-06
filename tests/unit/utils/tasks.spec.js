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

import TaskState from '@/model/TaskState.model'
import { dtMean, extractGroupState, latestJob, formatDuration } from '@/utils/tasks'

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
          [TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name)]
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
          [TaskState.SUBMITTED, TaskState.RUNNING, TaskState.EXPIRED].map((state) => state.name)]
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
      expected: undefined
    },
    {
      taskProxy: {},
      expected: undefined
    },
    {
      taskProxy: {
        children: []
      },
      expected: undefined
    },
    {
      taskProxy: {
        children: [
          { node: 'foo' },
          { node: 'bar' },
        ]
      },
      expected: 'foo'
    }
  ])('latestJob($taskProxy)', ({ taskProxy, expected }) => {
    it(`returns ${expected}`, () => {
      expect(latestJob(taskProxy)).to.equal(expected)
    })
  })
  describe('dtMean', () => {
    it('should format seconds to nice isodatetime format', () => {
      const tests = [
        {
          taskNode: { node: null },
          expected: undefined
        },
        {
          taskNode: {
            task: {
              meanElapsedTime: 0
            }
          },
          expected: undefined
        },
        {
          taskNode: {
            node: {
              task: {
                meanElapsedTime: 84
              }
            }
          },
          expected: '00:01:24'
        },
        {
          taskNode: {
            node: {
              task: {
                meanElapsedTime: 42
              }
            }
          },
          expected: '00:00:42'
        },
        {
          taskNode: {
            node: {
              task: {
                meanElapsedTime: 4242
              }
            }
          },
          expected: '01:10:42'
        },
        {
          taskNode: {
            node: {
              task: {
                meanElapsedTime: 1426332
              }
            }
          },
          expected: '16d 12:12:12'
        }
      ]
      tests.forEach(test => {
        expect(dtMean(test.taskNode)).to.equal(test.expected)
      })
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
      expect(formatDuration(42, false)).to.equal('00:00:42')
      expect(formatDuration(42, true)).to.equal('00:00:42')
    })
  })
})
