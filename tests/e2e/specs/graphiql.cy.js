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

/** query used for the graphiql test */
const query = `query GraphIQLTest {
  workflows {
    id
  }
}
`

describe('GraphiQL', () => {
  it('should execute a GraphQL query and get a valid response', () => {
    cy.visit('/#/graphiql')
      .get('#graphiql')
      .should('be.visible')
    cy.intercept('/graphql*').as('GraphQLQuery')
    cy.get('.monaco-editor textarea').as('editors')
      .should('have.length', 4)
    cy.window().then((win) => {
      const queryEditor = win.__MONACO.editor.getModels()[0]
      queryEditor.setValue(query)
    })
    cy.get('@editors')
      .then((editors) => {
        expect(editors[0].value).to.equal(query) // query editor
        expect(editors[1].value).to.equal('') // query variables
        expect(editors[2].value).to.equal('') // request headers
        expect(editors[3].value).to.equal('') // results box
      })
    cy.get('.graphiql-execute-button')
      .click()
    cy.wait('@GraphQLQuery')
    cy.get('.graphiql-response')
      .find('.graphiql-spinner')
      .should('not.exist')
    cy.get('@editors')
      .then((editors) => {
        expect(editors[0].value).to.equal(query)
        expect(editors[3].value).to.contain('~user/one')
      })
  })
})
