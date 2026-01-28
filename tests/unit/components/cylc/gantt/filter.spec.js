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

import {
  matchTasks,
  platformOptions,
} from '@/components/cylc/gantt/filter'

describe('matchTasks', () => {
  const task1 = [{
    name: 'task1',
    platform: 'test_platform',
    id: 'task1/01',
  }]
  const task2 = [{
    name: 'task2',
    platform: 'test_platform_2',
    id: 'task2/01',
  }]
  const task3 = [
    {
      name: 'task3',
      platform: 'test_platform_3',
      id: 'task3/01',
    },
    {
      name: 'task3',
      platform: 'test_platform', // 2nd job submitted on different platform
      id: 'task3/02',
    },
  ]
  const task4 = [{
    name: 'task4',
    platform: 'test_platform_4',
    id: 'task4/01',
  }]

  const tasksIn = {
    task1,
    task2,
    task3,
    task4,
  }

  it('should filter out the tasks that do not match', () => {
    const filter = {
      name: ['task1', 'task2'],
      platformOption: -1,
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal({
      task1,
      task2,
    })
  })

  it('should filter out the platforms that do not match', () => {
    const filter = {
      name: [],
      platformOption: 'test_platform',
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal({
      task1,
      task3,
    })
  })

  it('should filter out the platforms and tasks that do not match', () => {
    const filter = {
      name: ['task1', 'task2', 'task3'],
      platformOption: 'test_platform_2',
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal({
      task2,
    })
  })
})

describe('platformOptions', () => {
  it('should return all unique platforms and the "all" option', () => {
    const tasks = {
      test_entry_1: [{ name: 'test_entry_1', platform: 'platform_1' }],
      test_entry_2: [{ name: 'test_entry_2', platform: 'platform_1' }],
      test_entry_3: [{ name: 'test_entry_3', platform: 'platform_2' }],
    }
    const expected = [
      { title: 'All', value: -1 },
      { title: 'platform_1', value: 'platform_1' },
      { title: 'platform_2', value: 'platform_2' },
    ]
    expect(platformOptions([])).to.deep.equal([{ title: 'All', value: -1 }])
    expect(platformOptions(tasks)).to.deep.equal(expected)
  })
})
