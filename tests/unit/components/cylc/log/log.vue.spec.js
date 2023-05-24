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

import { shallowMount } from '@vue/test-utils'
import Log from '@/components/cylc/log/Log.vue'

describe('Log component', () => {
  const wrapper = shallowMount(Log, {
    props: {
      logs: [],
    },
  })

  describe.each([
    { line: '' },
    { line: '  ' },
    { line: 'Hello, Mr. Thompson' },
    { line: '1969-07-20T20:17:00 the eagle has landed', expected: 'the eagle has landed' },
    { line: '2038-01-19T03:14:07Z INFO - oops!', expected: 'INFO - oops!' },
    { line: '2038-01-19T03:14:07+02:15 ', expected: '' },
    { line: '2038-01-19T03:14:07-12:03    meow', expected: '   meow' },
    { line: 'INIT_TIME=2023-04-27T13:53:09+01:00' },

  ])('stripTimestamp($line)', ({ line, expected }) => {
    expected ??= line
    it(`returns '${expected}'`, () => {
      expect(wrapper.vm.stripTimestamp(line)).toEqual(expected)
    })
  })
})
