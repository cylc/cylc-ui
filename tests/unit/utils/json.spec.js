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

import { replacer, reviver } from '@/utils/json'

describe('JSON utils', () => {
  it('replaces and revives Maps and Sets', () => {
    const obj = {
      foo: new Map([
        ['a', 1],
        ['b', 2],
      ]),
      bar: new Set([1, 2, 3]),
      control: ['Conklin', 'Abbott'],
    }
    const json = JSON.stringify(obj, replacer)
    expect(JSON.parse(json, reviver)).toEqual(obj)
  })
})
