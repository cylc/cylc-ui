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
 * Return true if a node has matches the specified name/state filter.
 *
 * @export
 * @param {{ name: string, state: string }} node
 * @param {?string} name
 * @param {?string[]} states
 * @return {boolean}
 */
export function matchNode (node, name, states) {
  let ret = true
  if (name?.trim()) {
    ret &&= node.name.includes(name)
  }
  if (states?.length) {
    ret &&= states.includes(node.state)
  }
  return ret
}
