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

function waitForGraphLayout () {
  // wait for the initial graph layout to be performed
  cy
    .get('.c-graph:first')
    .then(($el) => { checkGraphLayoutPerformed($el) })
}

function checkGraphLayoutPerformed ($el, depth = 0) {
  // Check if the graphID has been set (indicating successful layout) or wait
  // one second.
  // This is a recursive function which will be called up to 10 times. We can't
  // do this in a for loop as otherwise the waits aren't chained correctly.
  if (depth > 10) {
    expect('graph loaded').to.equal(true)
  } else if (typeof $el[0].__vue__.graphID !== 'number') {
    cy
      .wait(1000)
      .then(() => { checkGraphLayoutPerformed($el, depth + 1) })
  }
}

describe('Graph View', () => {
  it('should load', () => {
    cy.visit('/#/graph/one')
    waitForGraphLayout()

    cy
      // there should be 7 graph nodes (all on-screen)
      .get('.c-graph:first')
      .find('.graph-node-container')
      .should('be.visible')
      .should('have.length', 7)

      // they shouldn't be stacked up in a pile
      // (we use SVG transforms to push the nodes around)
      .each(($el, index, $list) => {
        const el1 = $el[0]
        const matrix1 = el1.transform.baseVal[0].matrix
        for (const el2 of $list) {
          const matrix2 = el2.transform.baseVal[0].matrix
          expect(matrix1).to.not.equal(matrix2)
        }
      })

      // there should be 10 graph edges (all on-screen)
      .get('.c-graph:first')
      .find('.graph:first .edges:first')
      .children()
      .should('have.length', 10)
      .should('be.visible')
  })
})
