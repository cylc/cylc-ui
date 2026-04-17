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

import { formatCompletion } from '@/utils/outputs'

describe('Outputs', () => {
  it('should format completion expressions', () => {
    expect(
      formatCompletion('succeeded or failed or submit_failed', [
        { label: 'succeeded', satisfied: true },
        { label: 'failed', satisfied: false },
        { label: 'submit-failed', satisfied: false },
      ]),
    ).to.deep.equal([
      [true, 0, 'succeeded'],
      [false, 0, 'or failed'],
      // NOTE: submit_failed in the completion expression corresponds to
      // submit-failed in the outputs
      [false, 0, 'or submit-failed'],
    ])

    expect(
      formatCompletion('((a and b) or (c and d)) or e', [
        { label: 'a', satisfied: true },
        { label: 'b', satisfied: true },
        { label: 'c', satisfied: true },
        { label: 'd', satisfied: false },
        { label: 'e', satisfied: false },
      ]),
    ).to.deep.equal([
      [null, 0, '('],

      [null, 1, '('],
      [true, 2, 'a'],
      [true, 2, 'and b'],
      [null, 1, ')'],

      [null, 1, 'or ('],
      [true, 2, 'c'],
      [false, 2, 'and d'],
      [null, 1, ')'],

      [null, 0, ')'],

      [false, 0, 'or e'],
    ])
  })
})
