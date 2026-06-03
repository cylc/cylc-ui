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
  matchTask,
  platformOptions,
} from '@/components/cylc/analysis/filter'

describe('matchTask', () => {
  const task = {
    name: 'task_name',
    platform: 'task_platform',
  }

  it('should match with default or matching filter values', () => {
    const filters = [
      { name: [], platformOption: -1 },
      { name: ['task_name'], platformOption: -1 },
      { name: [], platformOption: 'task_platform' },
      { name: ['task_name'], platformOption: 'task_platform' },
    ]
    filters.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(true)
    })
  })

  it('should not match if at least one of the filter options does not match', () => {
    const filters = [
      { name: ['task_name'], platformOption: 'wrong_platform' },
      { name: ['wrong_task'], platformOption: 'task_platform' },
      { name: ['wrong_task'], platformOption: 'wrong_platform' },
    ]
    filters.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(false)
    })
  })
})

describe('platformOptions', () => {
  it('should return all unique platforms and the "all" option', () => {
    const tasks = [
      { platform: 'platform_1' },
      { platform: 'platform_1' },
      { platform: 'platform_2' },
    ]
    const expected = [
      { title: 'All', value: -1 },
      { title: 'platform_1', value: 'platform_1' },
      { title: 'platform_2', value: 'platform_2' },
    ]
    expect(platformOptions([])).to.deep.equal([{ title: 'All', value: -1 }])
    expect(platformOptions(tasks)).to.deep.equal(expected)
  })
})
