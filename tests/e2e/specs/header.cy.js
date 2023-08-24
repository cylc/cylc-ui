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
  it('Displays server owner user input and is disabled in single-user mode', () => {
    cy.visit('/#/')
    cy
      .get('#cylc-owner-combobox')
      .should('be.disabled')
  })
})

describe('Header Component multiuser', () => {
  beforeEach(() => {
    cy.intercept('/userprofile', {
      body: {
        name: 'userTest',
        groups: [
          'cylc',
          'developer'
        ],
        created: '2021-03-23T23:26:23.606Z',
        admin: true,
        server: '/user/cylc/',
        permissions: [
        ],
        mode: 'multi user',
        owner: 'userTest'
      }
    }).as('test-data-server-owner-input')
    cy.visit('/#/')
  })

  it('Displays server owner user input and is not disabled in multi-user mode', () => {
    cy.wait('@test-data-server-owner-input')
      .get('#cylc-owner-combobox')
      .should('not.be.disabled')
      .type('123{enter}')
      .get('.v-combobox__content').contains('userTest')
      .get('.v-combobox__content').contains('userTest123')
  })

  it('Displays deployment input and is not disabled in multi-user mode', () => {
    cy.wait('@test-data-server-owner-input')
      .get('#cylc-deployment-combobox')
      .should('not.be.disabled')
      .type('abc{enter}')
      .get('.v-combobox__content').contains(/localhost:\d{4,5}/)
      .get('.v-combobox__content').contains(/localhost:\d{4,5}abc/)
  })
  it('Displays go button', () => {
    cy.wait('@test-data-server-owner-input')
      .get('.v-btn')
      .should('be.visible')
  })
})
