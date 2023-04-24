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

import { expect } from 'chai'
import { matchTask, platformOptions } from '@/components/cylc/analysis/filter'

describe('matchTask', () => {
  const task = {
    name: 'task_name',
    platform: 'task_platform'
  }
  it('should match with default or matching filter values', () => {
    const filters = [
      { name: '', platformOption: null },
      { name: 'task_name', platformOption: null },
      { name: '', platformOption: 'task_platform' },
      { name: 'task_name', platformOption: 'task_platform' }
    ]
    filters.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(true)
    })
  })
  it('should not match if at least one of the filter options does not match', () => {
    const filters = [
      { name: 'task_name', platformOption: 'wrong_platform' },
      { name: 'wrong_task', platformOption: 'task_platform' },
      { name: 'wrong_task', platformOption: 'wrong_platform' }
    ]
    filters.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(false)
    })
  })
  it('should allow partial matches of names but not platforms', () => {
    const filterNames = [
      { name: 'task_', platformOption: null },
      { name: '_name', platformOption: null },
      { name: 'sk_na', platformOption: null }
    ]
    const filterPlatforms = [
      { name: '', platformOption: 'platform' },
      { name: '', platformOption: 'form_1' },
      { name: '', platformOption: 'form' }
    ]
    filterNames.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(true)
    })
    filterPlatforms.forEach(filter => {
      expect(matchTask(task, filter)).to.equal(false)
    })
  })
})
describe('platformOptions', () => {
  it('should return all unique platforms and the "all" option', () => {
    const tasks = [
      { platform: 'platform_1' },
      { platform: 'platform_1' },
      { platform: 'platform_2' }
    ]
    const expected = [
      { text: 'All', value: null },
      { text: 'platform_1', value: 'platform_1' },
      { text: 'platform_2', value: 'platform_2' }
    ]
    expect(platformOptions([])).to.deep.equal([{ text: 'All', value: null }])
    expect(platformOptions(tasks)).to.deep.equal(expected)
  })
})
