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

/* Logic for filtering tasks. */

import {
  GenericModifierNames,
  TaskState,
  TaskStateNames,
  WaitingStateModifierNames,
} from '@/model/TaskState.model'
import {
  escapeRegExp
} from 'lodash-es'

/* Convert a glob to a Regex.
 *
 * Returns null if a blank string is provided as input.
 *
 * Supports the same globs as Python's "fnmatch" module:
 *   `*` - match everything.
 *   `?` - match a single character.
 *   `[seq]` - match any character in seq (same as regex).
 *   `[!seq]` - match any character *not* in seq.
 */
export function globToRegex (glob) {
  if (!glob || !glob.trim()) {
    // no glob provided
    return null
  }
  return new RegExp(
    // escape any regex characters in the glob
    escapeRegExp(glob.trim())
      .replace(/\\\*/, '.*')
      // `?` -> `.`
      .replace(/\\\?/, '.')
      // `[!X]` -> `[^X]`
      .replace(/\\\[!([^]*)\\\]/, '[^$1]')
      // `[X]` -> `[X]`
      .replace(/\\\[([^]*)\\\]/, '[$1]')
  )
}

/**
 * Return true if the node ID matches the given ID, or if no ID is given.
 *
 * @param {Object} node
 * @param {?string} id
 * @return {boolean}
 */
export function matchID (node, regex) {
  return !regex || Boolean(node.tokens.relativeID.match(regex))
}

/**
 * Return true if the given list of states includes the node state, or if
 * if the list is empty.
 *
 * @param {Object} node
 * @param {?string[]} states
 * @returns {boolean}
 */
export function matchState (
  node,
  states = [],
  waitingStateModifiers = [],
  genericModifiers = [],
) {
  return (
    (!states?.length || states.includes(node.node.state)) &&
    (
      node.node.state !== 'waiting' ||
      !states.includes(TaskState.WAITING.name) ||
      !waitingStateModifiers.length ||
      waitingStateModifiers.some((modifier) => node.node[modifier])
    ) &&
    (
      !genericModifiers.length ||
      genericModifiers.some((modifier) => node.node[modifier]) ||
      (
        genericModifiers.includes('isSkip') &&
        node.node.runtime?.runMode === 'Skip'
      )
    )
  )
}

/**
 * Return true if a node matches the specified id/state filter.
 *
 * @export
 * @param {Object} node
 * @param {?string} id
 * @param {?string[]} states
 * @return {boolean}
 */
export function matchNode (node, regex, states, waitingStateModifiers, genericModifiers) {
  return matchID(node, regex) && matchState(node, states, waitingStateModifiers, genericModifiers)
}

export function groupStateFilters (states) {
  return [
    states.filter(x => TaskStateNames.includes(x)),
    states.filter(x => WaitingStateModifierNames.includes(x)),
    states.filter(x => GenericModifierNames.includes(x)),
  ]
}
