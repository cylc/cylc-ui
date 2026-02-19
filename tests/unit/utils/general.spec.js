/*
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

import { describe, it, expect } from 'vitest'
import { discardFromArray } from '@/utils/general'

const arrOfObjs = [{ id: 1 }, { id: 2 }, { id: 3 }]

describe('discardFromArray', () => {
  it.each([
    { array: [1, 2, 3], item: 2, expected: [1, 3] },
    { array: ['a', 'b', 'c'], item: 'c', expected: ['a', 'b'] },
    { array: [...arrOfObjs], item: arrOfObjs[0], expected: arrOfObjs.slice(1) },
  ])('removes $item from $array', ({ array, item, expected }) => {
    expect(discardFromArray(array, item)).toBe(true)
    expect(array).toEqual(expected)
  })

  it('returns false if item not found', () => {
    const array = [1, 2, 3]
    expect(discardFromArray(array, 4)).toBe(false)
    expect(array).toEqual([1, 2, 3])
  })
})
