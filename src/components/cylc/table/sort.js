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
 * Comparator function for sorting datetime strings. Note: nullish or empty
 * strings are treated as infinity.
 *
 * @param {*} a - The first element for comparison.
 * @param {*} b - The second element for comparison.
 * @return {number} A number > 0 if a > b, or < 0 if a < b, or 0 if a === b
 */
export function datetimeComparator (a, b) {
  a = (a ?? '') === '' ? Infinity : new Date(a).getTime()
  b = (b ?? '') === '' ? Infinity : new Date(b).getTime()
  // Avoid return NaN for a === b === Infinity
  return a === b ? 0 : a - b
}

/**
 * Comparator function for sorting numbers. Note: nullish values are treated as infinity.
 *
 * @param {number?} a
 * @param {number?} b
 * @returns {number}
 */
export function numberComparator (a, b) {
  a ??= Infinity
  b ??= Infinity
  // Avoid return NaN for a === b === Infinity
  return a === b ? 0 : a - b
}
