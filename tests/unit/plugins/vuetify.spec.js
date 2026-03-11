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

import { btnIconFontSize } from '@/plugins/vuetify'

describe('btnIconFontSize', () => {
  it.each([
    { size: '28', expected: '0.75rem' },
    { size: '40', expected: '1rem' },
    { size: '48', expected: '1.25rem' },
    { size: 'large', expected: undefined },
  ])('btnIconFontSize($size) -> $expected', ({ size, expected }) => {
    expect(btnIconFontSize(size)).toBe(expected)
  })
})
