/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

export function getNodeChildren (node, cyclePointsOrderDesc) {
  // returns child nodes folling the family tree and following sort order
  if (node.type === 'workflow' && !cyclePointsOrderDesc) {
    // a user configuration has configured the sort order for cycle points to
    // be reversed
    return [...node.children].reverse()
  } else if (node.type === 'cycle') {
    // display tasks in the inheritance tree
    const rootFamily = node.familyTree[0]
    if (!rootFamily) {
      return []
    }
    return rootFamily.children
  }
  return node.children
}
