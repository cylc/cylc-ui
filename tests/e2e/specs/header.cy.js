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
describe('Header Component', () => {
  it('Displays read-only server info in single-user mode', () => {
    cy.visit('/#/')
      .get('#cylc-owner-combobox')
      .should('be.disabled')
      .get('#cylc-deployment-combobox')
      .should('be.disabled')
      .get('[data-cy=multiuser-go-btn]')
      .should('not.exist')
  })
})

describe('Header Component multiuser', () => {
  beforeEach(() => {
    cy.intercept('/userprofile', {
      body: {
        username: 'userTest',
        permissions: [
          'read',
        ],
        mode: 'multi user',
        owner: 'userTest',
      },
    }).as('test-data-server-owner-input')
    cy.visit('/#/')
  })

  it('Displays editable server info in multi-user mode', () => {
    cy.location('host').then((host) => {
      cy.wait('@test-data-server-owner-input')
        .get('#cylc-owner-combobox')
        .should('not.be.disabled')
        .get('[data-cy=multiuser-go-btn]')
        .should('not.exist')

      cy.get('#cylc-owner-combobox')
        .type('123{enter}')
        .click()
        .get('.v-combobox__content').contains('userTest')
        .get('.v-combobox__content').contains('userTest123')

      // Test to see if values are in local storage
      cy.getAllLocalStorage().then((result) => {
        expect(JSON.parse(result[window.location.origin].owners)).to.deep.equal(['userTest', 'userTest123'])
      })

      cy.get('body').type('{esc}') // Closes combobox
        .get('[data-cy=multiuser-go-btn]')
        .should('be.visible')
        .should('have.attr', 'href', `//${host}/user/userTest123/cylc/#`)

      cy.get('#cylc-deployment-combobox')
        .should('not.be.disabled')
        .type('abc{enter}')
        .click()
        .get('.v-combobox__content').contains(host)
        .get('.v-combobox__content').contains(`${host}abc`)
        .get('[data-cy=multiuser-go-btn]')
        .should('have.attr', 'href', `//${host}abc/user/userTest123/cylc/#`)
    })
  })
})
