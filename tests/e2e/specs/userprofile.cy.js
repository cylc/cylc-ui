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
    .get('.c-user-profile .v-form')
    .contains('Font size')
    .should('have.css', 'font-size', `${expected}px`)
}

describe('User Profile', () => {
  const defaultFontSize = 16 // px
  beforeEach(() => {
    cy.visit('/#/user-profile')
    cy.title().should('eq', 'Cylc UI | User Profile')
  })

  it('Visits the user profile', () => {
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })

  it('Increases, resets & decrease the font size', () => {
    // Increases
    let expectedFontSize = defaultFontSize
    expectFontSize(expectedFontSize)
    for (let i = 0; i < 3; i++) {
      expectedFontSize += INCREMENT
      cy.get('button#font-size-increase-button')
        .click()
      expectFontSize(expectedFontSize)
    }
    // Remembers font size after refresh
    cy.reload(true)
    expectFontSize(expectedFontSize)
    // Resets font size
    cy.get('button#font-size-reset-button')
      .click()
    expectedFontSize = defaultFontSize
    expectFontSize(expectedFontSize)
    // Decreases font size
    for (let i = 0; i < 3; i++) {
      expectedFontSize -= INCREMENT
      cy.get('button#font-size-decrease-button')
        .click()
      expectFontSize(expectedFontSize)
    }
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
        .get('[data-c-interactive]:first')
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
        .get('@mutationMenu')
        .should('not.be.visible')
    }

    cy.get('[data-cy=reduced-animation] input')
      .should('not.be.checked')
    // Force initial render of menu:
    cy.get('[data-c-interactive]:first').click()
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
    cy.on('uncaught:exception', (err) => {
      // This test has been flaky on Firefox only.
      // Cast this ridiculous error into the fires of Mount Doom:
      if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        console.warn(err)
        return false
      }
    })
    cy.get('[data-cy=select-default-view]')
      // Default should be tree view by default
      .contains('Tree')
      // Change default
      .click()
      .get('[data-cy=select-default-view-menu] [role=listbox]')
      .contains('Table')
      .click()
      // Wait for menu to close before navigation to avoid FF ResizeObserver error
      .get('[data-cy=select-default-view-menu]')
      .should('not.exist')
    cy.visit('/#/workspace/one')
      .get('[data-cy=workspace-view] .c-table')
      .should('be.visible')
      .get('[data-cy=workspace-view] .c-tree')
      .should('not.exist')
  })

  it('Sets the cycle points order', () => {
    const checkCyclePointOrder = (expected) => {
      cy.visit('/#/workspace/other/multi/run2')
        .get('.node-data-cycle')
        .then(($els) => {
          expect(
            Array.from($els, (el) => el.innerText.trim())
          ).to.deep.equal(expected)
        })
    }
    // Latest on top by default
    cy.get('#input-cyclepoints-order')
      .should('be.checked')
    checkCyclePointOrder(['2', '1'])
    // Change the order
    cy.visit('/#/user-profile')
    cy.get('#input-cyclepoints-order')
      .click()
    checkCyclePointOrder(['1', '2'])
  })
})
