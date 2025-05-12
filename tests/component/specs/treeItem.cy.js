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

import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import {
  simpleCyclepointNode,
} from '$tests/unit/components/cylc/tree/tree.data'

// Get lists of: a) all tree item nodes; b) only visible ones.
Cypress.Commands.add('getNodeTypes', () => {
  cy.get('.c-treeitem')
    .then(($els) => {
      const all = Array.from($els, ({ dataset }) => dataset.nodeType)
      const visible = all.filter((val, i) => $els[i].checkVisibility())
      return { all, visible }
    })
})

// Expand/collapse the first node of this type.
Cypress.Commands.add('toggleNode', (nodeType) => {
  cy.get(`[data-node-type=${nodeType}] .node-expand-collapse-button:first`).click()
})

describe('TreeItem component', () => {
  it('expands/collapses children', () => {
    cy.vmount(TreeItem, {
      props: {
        node: simpleCyclepointNode,
        filteredOutNodesCache: new WeakMap(),
      },
    })
    cy.addVuetifyStyles(cy)

    cy.getNodeTypes()
      .should('deep.equal', {
        // Auto expand everything down to task nodes by default
        all: ['cycle', 'task'],
        visible: ['cycle', 'task']
      })

    cy.toggleNode('task')
    cy.getNodeTypes()
      .should('deep.equal', {
        all: ['cycle', 'task', 'job', 'job'],
        visible: ['cycle', 'task', 'job', 'job']
      })

    cy.toggleNode('cycle')
    cy.getNodeTypes()
      .should('deep.equal', {
        // All previously expanded nodes under cycle should be hidden but remain rendered
        all: ['cycle', 'task', 'job', 'job'],
        visible: ['cycle']
      })

    cy.toggleNode('cycle')
    cy.toggleNode('job')
    cy.getNodeTypes()
      .should('deep.equal', {
        // Job node does not use a child TreeItem
        all: ['cycle', 'task', 'job', 'job'],
        visible: ['cycle', 'task', 'job', 'job']
      })
  })
})
