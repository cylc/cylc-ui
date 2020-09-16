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

import orderBy from 'lodash/orderBy'

const treeitem = {
  methods: {
    /**
     * Sort children based on the type of the node.
     *
     * Each type may have a different sorting strategy. For example,
     * for nodes of type workflow, we know our children will be cycle points.
     * So we may sort them by their `id`, and in ascending or descending
     * order.
     *
     * Ditto for other types. This way we can control how to sort the children
     * nodes of each node in the UI.
     *
     * Some elements are sorted in the GraphQL query, on the server-side. While
     * some times these elements may have to be re-sorted, the best case
     * scenario is that the elements are already in order, and the JS sorting
     * algorithm doesn't have to sort anything.
     *
     * NOTE: the Array.sort algorithm implementation is browser-engine dependent,
     * and also type dependent. One browser may use quick-sort for numeric arrays,
     * and merge-sort for contiguous arrays of non-numeric types, and selection-sort for
     * all the other cases (source: https://stackoverflow.com/questions/234683/javascript-array-sort-implementation
     * and http://trac.webkit.org/browser/trunk/Source/JavaScriptCore/runtime/ArrayPrototype.cpp?rev=138530#L647).
     *
     * @param type {string} - node type (e.g. 'workflow', 'cyclepoint', etc)
     * @param children {Array} - node children (e.g. list of jobs of a task-proxy)
     * @returns {Array} - sorted children
     */
    sortedChildren (type, children) {
      if (children && children.length !== 0) {
        switch (type) {
        case 'workflow': {
          // sort workflow children (cycle-points)
          // sort by id descending, so '20100102' comes before '20100101'
          return orderBy(children, ['id'], 'desc')
        }
        case 'cyclepoint': {
          // sort cycle point children (family-proxies, and task-proxies)
          // first we sort by type ascending, so 'family-proxy' types come before 'task-proxy'
          // then we sort by node name ascending, so 'bar' comes before 'foo'
          return orderBy(children, [child => child.type, child => child.node.name.toLowerCase()], ['asc', 'asc'])
        }
        case 'family-proxy': {
          // sort family-proxy children (family-proxies, and task-proxies)
          // first we sort by type ascending, so 'family-proxy' types come before 'task-proxy'
          // then we sort by node name ascending, so 'bar' comes before 'foo'
          return orderBy(children, [child => child.type, child => child.node.name.toLowerCase()], ['asc', 'asc'])
        }
        case 'task-proxy': {
          // sort task-proxy children (jobs)
          // sort by node submit  descending, so '4' comes before '3'
          return orderBy(children, ['node.submitNum'], 'desc')
        }
        }
      }
      return children
    }
  }
}

export {
  treeitem
}
