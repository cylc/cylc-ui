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
 * Return true if a node matches the specified id/state filter.
 *
 * @export
 * @param {Object} node
 * @param {?string} id
 * @param {?string[]} states
 * @return {boolean}
 */
export function matchNode (node, id, states) {
  let ret = true
  if (id?.trim()) {
    ret &&= node.tokens.relative_id.includes(id)
  }
  if (states?.length) {
    ret &&= states.includes(node.node.state)
  }
  return ret
}
