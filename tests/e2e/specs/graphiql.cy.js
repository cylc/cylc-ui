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
    cy.get('.CodeMirror')
      .should('have.length', 4)
      .then((editors) => {
        editors[0].CodeMirror.setValue(query)
        // This appears to force the CodeMirror command above to be executed, or at least
        // waited for.
        expect(editors[0].CodeMirror.getValue()).to.equal(query) // query editor
        expect(editors[1].CodeMirror.getValue()).to.equal('') // query variables
        expect(editors[2].CodeMirror.getValue()).to.equal('') // request headers
        expect(editors[3].CodeMirror.getValue()).to.equal('') // results box
      })
    // TODO: CodeMirror seems to have a delay to actually set the value to the underlying
    //       textarea. Which can cause the test below to fail as the query submitted is
    //       the default commented-out text, instead of the given query above.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('.graphiql-execute-button')
      .click()
    cy.wait('@GraphQLQuery')
    cy.get('.graphiql-response')
      .find('.graphiql-spinner')
      .should('not.exist')
    cy.get('.CodeMirror')
      .then((editors) => {
        expect(editors[0].CodeMirror.getValue()).to.equal(query)
        expect(editors[3].CodeMirror.getValue()).to.contain('~user/one')
      })
  })
})
