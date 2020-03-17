describe('Toolbar component', () => {
  it('Is displayed when we are looking at a workflow', () => {
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
