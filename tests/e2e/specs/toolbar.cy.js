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

import { mutationStatus } from '@/utils/aotf'
import { Deferred } from '$tests/util'

describe('Toolbar component', () => {
  it('Is displayed when we are looking at a workflow', () => {
    cy.visit('/#/workspace/one')
    cy
      .get('#core-app-bar')
      .should('exist')
  })
  it('Is NOT displayed when looking at the dashboard', () => {
    cy.visit('/#/')
    cy
      .get('#core-app-bar')
      .should('not.exist')
  })
  it('Contains an avatar displaying user icon', () => {
    cy.visit('/#/workspace/one')
    cy
      .get('#core-app-bar')
      .get('.v-avatar')
      .get('.v-icon')
      .should('exist')
  })
})

describe('Toolbar Component authenticated user', () => {
  beforeEach(() => {
    cy.intercept('/userprofile', {
      body: {
        username: 'user',
        name: 'user',
        initials: 'U',
        owner: 'user',
        permissions: [
          'read',
          'write',
        ],
        mode: 'single user',
      },
    }).as('test-data-server-owner-input')
    cy.visit('/#/workspace/one')
  })

  it('Contains an avatar displaying user initials', () => {
    cy.wait('@test-data-server-owner-input')
      .get('#core-app-bar')
      .get('.v-avatar')
      .should('have.text', 'U')
  })
})

describe('N-window selector', () => {
  /** Capture mutations. */
  function captureGraphWinMutation () {
    const mutations = []
    const deferred = new Deferred()
    cy.window().its('app.$workflowService').then((service) => {
      // mock the workflow service's mutate method to catch high-level calls
      service.mutate = async (name, id, args) => {
        switch (name) {
          case 'setGraphWindowExtent':
            mutations.push(args.nEdgeDistance)
            await deferred.promise
            return [mutationStatus.SUCCEEDED, '']
          default:
            throw new Error('This mutation is not mocked by the tests')
        }
      }
    })
    return { mutations, deferred }
  }

  it('Is enabled for workflows that are not stopped', () => {
    // Disabled for stopped workflow:
    cy.visit('/#/workspace/multi/level/run1')
      .get('#core-app-bar')
      .find('[data-cy=n-win-selector]')
      .should('have.attr', 'disabled')
    // Enabled for running workflow:
    cy.visit('/#/workspace/one')
      .get('[data-cy=n-win-selector]')
      .click()
      .get('[data-cy=n-win-popup]')
      .find('input')
      .invoke('val')
      .should('eq', '1')
  })

  it('Sets the n-window', () => {
    cy.visit('/#/workspace/one')
    const { mutations, deferred } = captureGraphWinMutation()
    cy.get('[data-cy=n-win-selector]')
      .click()
      .get('[data-cy=n-win-popup]')
      .find('.v-field[role=combobox]')
      .click()
      .invoke('attr', 'aria-controls').then((dropdownID) => {
        cy.get(`#${dropdownID}`)
          .contains('3')
          .click()
          .then(() => {
            expect(mutations).to.deep.equal([3])
            // Should show loading spinner while waiting for response
            cy.get('[data-cy=n-win-popup] .v-progress-circular').as('loadingSpinner')
              .should('be.visible').then(() => {
                // Allow the "response" to complete
                deferred.resolve()
                cy.get('@loadingSpinner')
                  .should('not.exist')
                // Note we cannot mock websockets in Cypress so we cannot test the actual update of the n-window in the GraphQL subscription
              })
          })
      })
  })
})
