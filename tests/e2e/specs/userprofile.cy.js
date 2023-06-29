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

import { INCREMENT } from '@/utils/font-size'

/** @param {number} expected font size in px */
function expectFontSize (expected) {
  cy.get('html')
    .should('have.css', 'font-size', `${expected}px`)
}

describe('User Profile', () => {
  const defaultFontSize = 16 // px
  beforeEach(() => {
    // resetFontSize()
    cy.visit('/#/user-profile')
  })

  it('Visits the user profile', () => {
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })

  it('Increases the font size', () => {
    expectFontSize(defaultFontSize)
    const clicks = 3
    let expectedFontSize = defaultFontSize
    for (let i = 0; i < clicks; i++) {
      expectedFontSize += INCREMENT
      cy.get('button#font-size-increase-button')
        .click()
      expectFontSize(expectedFontSize)
    }
  })

  it('Decreases the font size', () => {
    expectFontSize(defaultFontSize)
    const clicks = 3
    let expectedFontSize = defaultFontSize
    for (let i = 0; i < clicks; i++) {
      expectedFontSize -= INCREMENT
      cy.get('button#font-size-decrease-button')
        .click()
      expectFontSize(expectedFontSize)
    }
  })

  it('Resets the font size', () => {
    expectFontSize(defaultFontSize)
    for (let i = 0; i < 3; i++) {
      cy.get('button#font-size-decrease-button')
        .click()
    }
    cy.get('button#font-size-reset-button')
      .click()
    expectFontSize(defaultFontSize)
  })

  it('Sets the job theme', () => {
    cy.get('#input-job-theme-default')
      .click({ force: true })
    // set the job theme to normal
    cy.get('.c-gscan:first .c-job:first rect:first')
      .should('have.css', 'fill')
      .then(($fill1) => {
        // set the job theme to greyscale
        cy.get('#input-job-theme-greyscale')
          .click({ force: true })
        cy.get('.c-gscan:first .c-job:first rect:first')
          .should('have.css', 'fill')
          // make sure that the job has changed colour
          .then(($fill2) => {
            expect($fill1).not.to.equal($fill2)
          })
      })
  })

  it('Sets reduced animations mode', () => {
    let animationSpy
    const testMenu = (shouldAnimate) => {
      cy.get('.c-mutation-menu:first')
        .as('mutationMenu')
        .should('not.be.visible')
        .then(([$el]) => {
          animationSpy = cy.spy($el, 'animate')
        })
        .get('.c-interactive:first')
        .click()
        .get('@mutationMenu')
        .should('be.visible')
        .then(() => {
          if (shouldAnimate) {
            expect(animationSpy).to.be.called
          } else {
            expect(animationSpy).not.to.be.called
          }
        })
        // Close menu:
        .get('noscript').click({ force: true })
    }

    cy.get('[data-cy=reduced-animation] input')
      .should('not.be.checked')
    // Force initial render of menu:
    cy.get('.c-interactive:first').click()
      .get('noscript').click({ force: true })
    // Test default animation:
    testMenu(true)
    // Turn on reduced animations mode:
    cy.get('[data-cy=reduced-animation] input')
      .click()
      .should('be.checked')
    testMenu(false)
  })

  it('Sets the default view', () => {
    cy.get('[data-cy=select-default-view]')
      // Default should be tree view by default
      .contains('Tree')
      // Change default
      .click()
      .get('[data-cy=select-default-view-menu] [role=listbox]')
      .contains('Table')
      .click()
    cy.visit('/#/workspace/one')
      .get('[data-cy=workspace-view] .c-table')
      .should('be.visible')
      .get('[data-cy=workspace-view] .c-tree')
      .should('not.exist')
  })

  // TODO
  // it('Sets the cycle points order', () => {
  //   cy.visit('/#/user-profile')
  //   cy.get('#input-cyclepoints-order')
  //     .should('have.attr', 'aria-checked', JSON.stringify(CylcTree.DEFAULT_CYCLE_POINTS_ORDER_DESC))
  //   // change the cycle points order
  //   cy.get('#input-cyclepoints-order')
  //     .click({ force: true })
  //   cy.get('#input-cyclepoints-order')
  //     .should('have.attr', 'aria-checked', JSON.stringify(!CylcTree.DEFAULT_CYCLE_POINTS_ORDER_DESC))
  // })
})
