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
 * Declare function used in sortedIndexBy as a comparator.
 *
 * @callback SortedIndexByComparator
 * @param {Object} leftObject - left parameter object
 * @param {string} leftValue - left parameter value
 * @param {Object} rightObject - right parameter object
 * @param {string} rightValue - right parameter value
 * @returns {boolean} - true if leftValue is higher than rightValue
 */

/**
 * The default comparator used to compare strings for cycle points, family proxies names,
 * task proxies names, and jobs.
 *
 * @param {string} left
 * @param {string} right
 * @returns {number}
 * @constructor
 */
export const DEFAULT_COMPARATOR = (left, right) => {
  return left.toLowerCase().localeCompare(
    right.toLowerCase(),
    undefined,
    {
      numeric: true,
      sensitivity: 'base',
    }
  )
}

/**
 * Declare function used in sortedIndexBy for creating the iteratee.
 *
 * @callback SortedIndexByIteratee
 * @param {Object} value - any object
 * @returns {string}
 */

/**
 * Given a list of elements, and a value to be added to the list, we
 * perform a simple binary search of the list to determine the next
 * index where the value can be inserted, so that the list remains
 * sorted.
 *
 * This function uses localeCompare, which will respect the numeric
 * collation.
 *
 * This is a simplified version of lodash's function with the same
 * name, but that respects natural order for numbers, i.e. [1, 2, 10].
 * Not [1, 10, 2].
 *
 * @param {Object[]} array - list of string values, or of objects with string values
 * @param {Object} value - a value to be inserted in the list, or an object wrapping the value (see iteratee)
 * @param {SortedIndexByIteratee=} iteratee - an optional function used to return the value of the element of the list}
 * @param {{comparator: SortedIndexByComparator, reverse: boolean}=} options - an optional object with a comparator function and a reverse flag
 * @return {number} - sorted index
 */
export function sortedIndexBy (array, value, iteratee = (x) => x, options = {}) {
  if (array.length === 0) {
    return 0
  }
  // If given a function, use it. Otherwise, simply use locale sort with numeric enabled
  const comparator = options.comparator || (
    (leftObject, leftValue, rightObject, rightValue) => DEFAULT_COMPARATOR(leftValue, rightValue)
  )
  let low = 0
  let high = array.length

  const newValue = iteratee(value)

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const midValue = iteratee(array[mid])
    let higher = comparator(value, newValue, array[mid], midValue)
    if (options.reverse) {
      higher = higher * -1
    }
    if (higher > 0) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return high
}
