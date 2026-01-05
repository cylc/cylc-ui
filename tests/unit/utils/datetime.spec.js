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

import * as datetime from '@/utils/datetime'

describe('humanDuration', () => {
  it.each([
    { offset: 0, out: 'now' },
    { offset: 3, out: 'in 3 seconds' },
    { offset: -3, out: '3 seconds ago' },
    { offset: 60, out: 'in 1 minute' },
    { offset: -60, out: '1 minute ago' },
    { offset: 3600, out: 'in 1 hour' },
    { offset: -3600, out: '1 hour ago' },
    { offset: 86400, out: 'tomorrow' },
    { offset: -86400, out: 'yesterday' },
    { offset: 2678400, out: 'next month' },
    { offset: -2678400, out: 'last month' },
    { offset: 31536000, out: 'in 12 months' },
    { offset: -31536000, out: '12 months ago' },
  ])('$out', ({ offset, out }) => {
    expect(
      datetime.humanDuration(new Date(new Date().getTime() + (offset * 1000)))
    ).to.equal(out)
  })
})

describe('formatDatetime', () => {
  it.each([
    ['2022-10-05T11:56:00.000Z', '2022-10-05T11:56:00Z'],
    ['2023-05-20T14:48-04:30', '2023-05-20T19:18:00Z'],
    ['2023-12-04T11:38+13:25', '2023-12-03T22:13:00Z'],
    ['2024-01-15T09:30:45.123Z', '2024-01-15T09:30:45Z'],
  ])('%s -> %s', (input, expected) => {
    expect(datetime.formatDatetime(new Date(input))).toEqual(expected)
  })
})
