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

describe('URL handling', () => {
  it('strips token from querystring', () => {
    cy.visit('/?token=l0r3m1p5um#/')
      .get('#app')
    cy.url()
      .should('not.contain', '?')
      .should('not.contain', 'token')
      .should('not.contain', 'l0r3m1p5um')
  })

  it('preserves other params in the querystring', () => {
    // Other query params moved to after hash so vue-router can access
    cy.visit('/?a=1&token=42&b=2#/')
      .get('#app')
    cy.url()
      .should('not.contain', 'token')
      .then((url) => {
        expect(url.endsWith('?a=1&b=2')).to.be.true
      })
  })

  it('reroutes to noAuth page if user isnt authorised', () => {
    cy.intercept('/userprofile', {
      body: {
        username: 'user',
        permissions: [],
        mode: 'single user',
        owner: 'user',
      },
    })
    cy.visit('/#').get('#app')
    cy.url().should('contain', 'noAuth')
  })
})
