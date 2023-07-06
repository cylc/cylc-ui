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

/**
 * Return true if the node ID matches the given ID, or if no ID is given.
 *
 * @param {Object} node
 * @param {?string} id
 * @return {boolean}
 */
export function matchID (node, id) {
  return !id?.trim() || node.tokens.relative_id.includes(id)
}

/**
 * Return true if the given list of states includes the node state, or if
 * if the list is empty.
 *
 * @param {Object} node
 * @param {?string[]} states
 * @returns {boolean}
 */
export function matchState (node, states) {
  return !states?.length || states.includes(node.node.state)
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
export function matchNode (node, id, states) {
  return matchID(node, id) && matchState(node, states)
}
