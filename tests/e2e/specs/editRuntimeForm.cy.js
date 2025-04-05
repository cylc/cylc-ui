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

import { upperFirst } from 'lodash'

describe('Edit Runtime form', () => {
  const receivedMutations = []

  beforeEach(() => {
    receivedMutations.splice(0)
    // Patch graphql responses
    cy.intercept('/graphql', (req) => {
      const { body } = req
      if (body.query.startsWith('mutation')) {
        req.alias = 'mutation' // equivalent to `.as('mutation')`
        receivedMutations.push(body)
        req.reply({
          data: {
            [body.operationName]: {
              result: [true, {}],
              __typename: upperFirst(body.operationName)
            }
          }
        })
      }
    })
    cy.visit('/#/tree/one')
  })

  /**
   * @param {string} nodeName - the tree node name, to search for and open the mutations form
   */
  const openMenu = (nodeName) => {
    cy.get(`[data-node-name=${nodeName}]`)
      .find('[data-c-interactive]:first')
      .click({ force: true })
    cy.get('#less-more-button')
      .click()
  }

  /** Get the Edit Runtime command from the menu */
  const getMenuItem = () => {
    return cy
      .get('.c-mutation-menu-list:first')
      .contains('.c-mutation', 'Edit Runtime')
  }

  /**
   * Open the Edit Runtime form for a particular node
   * @param {string} nodeName
   */
  const openForm = (nodeName) => {
    openMenu(nodeName)
    getMenuItem().click()
  }

  /**
   * Get the form input v-list-item element for a given label.
   *
   * @param {string} label
   */
  const getInputListItem = (label) => {
    return cy
      .get('.c-edit-runtime-form')
      .find('.c-input-label')
      .contains(label)
      .parent()
  }

  it('handles editing and submitting the form', () => {
    openForm('retrying')

    getInputListItem('Init Script')
      .find('.v-input')
      .type('echo Kalgan')
    getInputListItem('Environment')
      .as('envInput')
      // Pre-existing items' keys should be immutable
      .find('.c-input-key')
      .find('input')
      .should('be.disabled')
      // Change a pre-existing item's value
      .get('@envInput')
      .find('.c-input-val:first')
      .clear()
      .type('2nd Foundation')
      // Add a new item
      .get('@envInput')
      .find('button[data-cy="add"]')
      .click()
      .get('@envInput')
      .find('.c-input-key:first')
      .type('HORSE')
      .get('@envInput')
      .find('.c-input-val:first')
      .type('Dorothy')

    // Submit form
    cy
      .then(() => {
        expect(receivedMutations.length).to.eq(0)
      })
      .get('[data-cy="submit"]')
      .click()
      .wait(['@mutation'])
      .then(() => {
        expect(receivedMutations.length).to.eq(1)
        expect(receivedMutations[0].operationName).to.eq('broadcast')
        expect(receivedMutations[0].variables).to.deep.include({
          settings: [
            { init_script: 'echo Kalgan' },
            { environment: { HORSE: 'Dorothy' } },
            { environment: { FACTION: '2nd Foundation' } }
          ]
        })
      })
      // Form should close
      .get('.c-mutation-dialog')
      .should('not.exist')
  })

  it('handles a form with zero diff', () => {
    openForm('retrying')

    getInputListItem('Outputs')
      // Add an empty item
      .find('button[data-cy="add"]')
      .click()
    getInputListItem('Env Script')
      // Re-type the same thing into an input
      .find('textarea:first')
      .as('input')
      .invoke('val')
      .then(val => {
        cy.get('@input')
          .clear()
          .type(val)
      })

    // Submit form
    cy
      .then(() => {
        expect(receivedMutations.length).to.eq(0)
      })
      .get('[data-cy="submit"]')
      .click()
      .then(() => {
        expect(receivedMutations.length).to.eq(0)
      })
      .get('[data-cy="warning-snack"]')
      .find('div[role="status"]')
      .invoke('text')
      .should('include', 'No changes were made')
      // Form should stay open
      .get('.c-mutation-dialog')
      .should('be.visible')
  })

  it('shows Edit Runtime as an option for cycles & namespaces only', () => {
    // E.g. families
    openMenu('GOOD')
    getMenuItem()
    // and cycle points (as root)
    openMenu('20000102T0000Z')
    getMenuItem().click()
      .get('.c-mutation-dialog .v-card-subtitle')
      .contains('/root')
    // but not jobs
    cy.get('[data-cy=tree-view] [data-c-interactive].c-job:first')
      .click({ force: true })
      .get('#less-more-button')
      .should('not.exist') // if this does deliberately exist in future, change to .click()
    getMenuItem().should('not.exist')
  })

  it('only offers live & skip run modes', () => {
    openForm('retrying')
    getInputListItem('Run Mode')
      .find('.v-field')
      .click()
      .invoke('attr', 'aria-controls').then((dropdownID) => {
        cy.get(`#${dropdownID}`)
          .find('[role=option]')
          .then(
            (items) => Array.from(items, (x) => x.innerText).sort()
          )
          .should('deep.equal', ['Live', 'Skip'])
      })
  })
})
