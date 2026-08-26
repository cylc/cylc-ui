/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
 * Remove an item from an array if it exists.
 *
 * @param {T[]} array - The array to remove the item from.
 * @param {T} item - The item to remove from the array.
 * @return {boolean} True if the item was found and removed, false otherwise.
 */
export function discardFromArray (array, item) {
  const index = array.indexOf(item)
  if (index >= 0) {
    array.splice(index, 1)
    return true
  }
  return false
}

/**
 * Calculate a non-cryptographic hash value for a given string.
 *
 * @param {string} string
 * @returns {number}
 */
export function nonCryptoHash (string) {
  let hash = 0
  let i, chr
  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
