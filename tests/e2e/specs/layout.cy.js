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

describe('Default layout', () => {
  it('Should display errors from children elements captured at the Default layout level', () => {
    const errMsg = 'Error raised in Cypress stub!'
    // visit any page first, so that we create the window.app reference
    cy.visit('/#/guide')
    cy.get('[data-cy=alert-snack]')
      .should('not.exist')
    cy.window().its('app.$workflowService').then(service => {
      // mock service so that it returns an error
      cy.stub(service, 'subscribe').callsFake(() => {
        throw new Error('Error raised in Cypress stub!')
      })
      // now visit dashboard, that calls service.subscribe, which will raise an uncaught error...
      cy.get('nav')
        .contains('.v-list-item', 'Dashboard')
        .click({ force: true })
      cy.get('[data-cy=alert-snack]')
        .contains(errMsg)
    })
  })
})
