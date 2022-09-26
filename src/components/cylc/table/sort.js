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

/**
 * Compare function for sorting datetime strings, that might possibly be
 * nullish or empty strings.
 *
 * @export
 * @param {*} a - The first element for comparison.
 * @param {*} b - The second element for comparison.
 * @return {number} A number > 0 if a > b, or < 0 if a < b, or 0 if a === b
 */
export function datetimeSort (a, b) {
  const valueA = a !== '' && typeof a !== 'undefined' ? (new Date(a)).getTime() : 0
  const valueB = b !== '' && typeof b !== 'undefined' ? (new Date(b)).getTime() : 0
  return valueA - valueB
}
