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
  platformOptions
} from '@/components/cylc/gantt/filter'

describe('matchTasks', () => {
  const tasksIn = {
    task_1: [{
      task_name: 'task_1',
      platform: 'test_platform',
      some_other_key: 'some_other_test_key'
    }],
    task_2: [{
      task_name: 'task_2',
      platform: 'test_platform_2',
      some_other_key: 'some_other_test_key'
    }],
    task_3: [{
      task_name: 'task_3',
      platform: 'test_platform_3',
      some_other_key: 'some_other_test_key'
    }],
    task_4: [{
      task_name: 'task_4',
      platform: 'test_platform_1',
      some_other_key: 'some_other_test_key'
    }]
  }
  const tasksOut = {
    task_1: [{
      task_name: 'task_1',
      platform: 'test_platform',
      some_other_key: 'some_other_test_key'
    }],
    task_2: [{
      task_name: 'task_2',
      platform: 'test_platform_2',
      some_other_key: 'some_other_test_key'
    }],
  }
  const platformsOut = {
    task_1: [{
      task_name: 'task_1',
      platform: 'test_platform',
      some_other_key: 'some_other_test_key'
    }],
  }

  it('should filter out the tasks that do not match', () => {
    const filter = {
      name: ['task_1', 'task_2'],
      platformOption: -1,
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal(tasksOut)
  })

  it('should filter out the platforms that do not match', () => {
    const filter = {
      name: ['task_1', 'task_2', 'task_3'],
      platformOption: 'test_platform',
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal(platformsOut)
  })

  it('should filter out the platforms and tasks that do not match', () => {
    const filter = {
      name: ['task_1', 'task_3', 'task_4'],
      platformOption: 'test_platform',
    }
    expect(matchTasks(tasksIn, filter)).to.deep.equal(platformsOut)
  })
})

describe('platformOptions', () => {
  it('should return all unique platforms and the "all" option', () => {
    const tasks = {
      test_entry_1: [{ name: 'test_entry_1', platform: 'platform_1' }],
      test_entry_2: [{ name: 'test_entry_2', platform: 'platform_1' }],
      test_entry_3: [{ name: 'test_entry_3', platform: 'platform_2' }]
    }
    const expected = [
      { title: 'All', value: -1 },
      { title: 'platform_1', value: 'platform_1' },
      { title: 'platform_2', value: 'platform_2' }
    ]
    expect(platformOptions([])).to.deep.equal([{ title: 'All', value: -1 }])
    expect(platformOptions(tasks)).to.deep.equal(expected)
  })
})
