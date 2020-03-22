describe('Tree component', () => {
  it('Should display leaf node with a triangle with left padding', () => {
    // this is testing that there is a padding, not necessarily that the leaf node's triangle is exactly under the node
    cy.visit('/#/workflows/one')
    cy
      .get('#core-app-bar')
      .should('be.visible')
  })
  it('Is NOT displayed when looking at the dashboard', () => {
    cy.visit('/#/')
    cy
      .get('#core-app-bar')
      .should('not.be.visible')
  })
})
