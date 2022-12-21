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
import { datetimeComparator } from '@/components/cylc/table/sort'

describe('datetimeComparator()', () => {
  it('should rank datetime strings appropriately', () => {
    expect(
      datetimeComparator('2022-09-26T12:30:00Z', '2022-09-26T12:30:01Z')
    ).to.be.lessThan(0)
    expect(
      datetimeComparator('2022-09-26T12:30:01Z', '2022-09-26T12:30:00Z')
    ).to.be.greaterThan(0)
    expect(
      datetimeComparator('2022-09-26T12:30:00Z', '2022-09-26T12:30:00Z')
    ).to.equal(0)
  })
  it('should rank nullish as higher than proper datetimes', () => {
    expect(datetimeComparator('', '2022-09-26T12:30:00Z')).to.be.greaterThan(0)
    expect(
      datetimeComparator(undefined, '2022-09-26T12:30:00Z')
    ).to.be.greaterThan(0)
    expect(datetimeComparator(undefined, '')).to.equal(0)
  })
})
