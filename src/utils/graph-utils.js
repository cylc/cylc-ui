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

export function posToPath (pos) {
  // the last point comes first, followed by the others in order I.E:
  // -1, 0, 1, 2, ... -3, -2
  const parts = pos.substring(2).split(' ').map(x => x.split(','))
  const [last] = parts.splice(0, 1)
  let path = null
  for (const part of parts) {
    if (!path) {
      path = `M${part[0]} -${part[1]}, C`
    } else {
      path = path + ` ${part[0]} -${part[1]},`
    }
  }
  path = path + ` L ${last[0]} -${last[1]}`
  return path
}

/* TODO: everything! */
// eslint-disable-next-line no-extend-native
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

export function updateArray (before, after) {
  // remove old items
  for (const item of before) {
    if (after.indexOf(after) === -1) {
      before.splice(
        before.indexOf(item), 1
      )
    }
  }
  // insert new items
  for (const item of after) {
    if (before.indexOf(item) === -1) {
      before.push(item)
    }
  }
}
