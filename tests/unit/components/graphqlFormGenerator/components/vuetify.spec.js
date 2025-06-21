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
import { RE } from '@/components/graphqlFormGenerator/components/vuetify'

describe('RE', () => {
  describe('cyclePoint', () => {
    const regex = new RegExp(String.raw`^${RE.cyclePoint}$`)
    it.for([
      // Integer
      '1',
      '105',
      '999999999',
      // Calendar date
      '2025',
      '20250619',
      '20250619T15',
      '20250619T153045',
      '20250619T153045Z',
      '20250619T153045+01',
      '20250619T153045-0500',
      '2025-06-19',
      '2025-06-19T15',
      '2025-06-19T15Z',
      '2025-06-19T15:30:45',
      '2025-06-19T15:30:45Z',
      '2025-06-19T15:30:45+01',
      '2025-06-19T15:30:45-05:00',
      // Week date
      '2015W534',
      '2015W534T0631',
      '2015-W53-4',
      '2015-W53-4T06:31',
      '2015W534T0631+02',
      '2015-W53-4T06:31+02',
      // Ordinal date
      '2025170',
      '2025-170',
      '2025170T15:30',
      '2025-170T15:30:45+00:00',
    ])('matches %s', (str) => {
      expect(regex.test(str)).toBe(true)
    })
  })
})
