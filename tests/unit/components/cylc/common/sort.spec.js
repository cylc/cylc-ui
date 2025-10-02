/*
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

import { DEFAULT_COMPARATOR, sortedIndexBy } from '@/components/cylc/common/sort'

describe('DEFAULT_COMPARATOR', () => {
  it.each([
    ['a', 'b', -1],
    ['b', 'a', 1],
    ['a', 'a', 0],
    ['A', 'a', 0],
    ['A', 'b', -1],
    ['1', '2', -1],
    ['01', '1', 0],
    ['20000101T0000Z', '20000101T0001Z', -1],
  ])('(%o, %o) -> %o', (a, b, expected) => {
    expect(DEFAULT_COMPARATOR(a, b)).toEqual(expected)
  })
})

describe('sortedIndexBy', () => {
  it.each([
    [['a', 'c', 'e'], 'a', 0],
    [['a', 'c', 'e'], 'b', 1],
    [['a', 'c', 'e'], 'c', 1],
    [['a', 'c', 'e'], 'd', 2],
    [['a', 'c', 'e'], 'x', 3],
    [[], 'x', 0],
  ])('sortedIndexBy(%o, %o) -> %i', (arr, value, expected) => {
    expect(sortedIndexBy(arr, value)).toEqual(expected)
  })

  it('uses the iteratee function to determine the value for comparison', () => {
    const arr = [{ key: 'a' }, { key: 'c' }, { key: 'e' }]
    const value = { key: 'b' }
    const iteratee = (x) => x.key
    expect(sortedIndexBy(arr, value, iteratee)).toEqual(1)
  })

  it.each([
    [[8], 0],
    [[8, 8], 0],
    [[8, 8, 8], 3],
  ])('%#) uses a custom comparator if provided', (value, expected) => {
    const arr = [[8, 8], [8, 8], [8, 8]]
    const comparator = (leftObj, leftVal, rightObj, rightVal) => (
      leftObj.length - rightObj.length
    )
    expect(sortedIndexBy(arr, value, (x) => x, { comparator })).toEqual(expected)
  })

  it('reverses the comparison if reverse option is true', () => {
    const arr = ['e', 'c', 'a']
    const value = 'd'
    expect(sortedIndexBy(arr, value, (x) => x, { reverse: true })).toEqual(1)
  })

  it('handles numeric collation correctly by default', () => {
    const arr = ['1', '2']
    const value = '10'
    expect(sortedIndexBy(arr, value)).toEqual(2)
  })
})
