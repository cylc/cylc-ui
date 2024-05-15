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

/**
 * Convert graphviz edge bezier curve in dot format to SVG path .
 *
 * @param {string} pos - `pos` attribute of a graph edge in dot format.
 * @returns {string} The SVG path.
 */
export function posToPath (pos) {
  // pos starts with `e,` followed by a list of coordinates
  const parts = pos.substring(2).split(' ')
  // the last point comes first, followed by the others in order I.E:
  // -1, 0, 1, 2, ... -3, -2
  const [last, first] = parts.splice(0, 2)
  const path = parts.reduce(
    (acc, part) => `${acc} ${getCoord(part)},`,
    `M${getCoord(first)} C`
  )
  return `${path} L ${getCoord(last)}`
}

/**
 * Convert dotcode `pos` coordinate to SVG path coordinate.
 *
 * @param {string} posCoord - A coordinate in dot format.
 * @returns {string}
 */
export function getCoord (posCoord) {
  const [x, y] = posCoord.split(',').map(parseFloat)
  return `${x} ${-y}`
}

/**
 * Calculate a non-cryptographic hash value for a given string.
 *
 * @param {string} string
 * @returns {number}
 */
export function nonCryptoHash (string) {
  let hash = 0
  let i
  let chr
  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
