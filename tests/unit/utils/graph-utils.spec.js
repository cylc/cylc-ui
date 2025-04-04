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

import {
  posToPath,
  nonCryptoHash,
} from '@/utils/graph-utils'

describe('Graph functionality', () => {
  describe('posToPath', () => {
    it('Converts GraphViz pos strings to SVG path strings', () => {
      // e,211.5,156.5 61.5,388.5 61.5,269.19 87.195,162.7 201.3,156.76
      expect(posToPath(
        'e,211.5,156.5 61.5,388.5 61.5,269.19 87.195,162.7 201.3,156.76'
      )).to.equal(
        // the second point in the pos is the first point in the path
        // (because GraphViz, that's why)
        'M61.5 -388.5 ' +
        // the following points in the pos are for the bézier curve
        'C 61.5 -269.19, 87.195 -162.7, 201.3 -156.76, ' +
        // the first point in the pos is the last point in the path
        // (because GraphViz, that's why)
        // we use a straight line segment, it should be a curve, but, the
        // difference isn't noticeable
        'L 211.5 -156.5'
      )
    })
    it('Handles negative coordinates', () => {
      expect(posToPath(
        'e,1,1 -2,-2 3,-3 -1,-0'
      )).to.equal(
        'M-2 2 C 3 3, -1 0, L 1 -1'
      )
    })
  })

  describe('nonCryptoHash', () => {
    it.each([
      ['foo', 101574],
      ['', 0],
    ])('Converts a string to a stable hash: %o -> %i', (str, expected) => {
      expect(nonCryptoHash(str)).to.equal(expected)
    })
  })
})
