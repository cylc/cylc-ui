describe('Drawer component', () => {
  it('Is displayed when mode is desktop', () => {
    cy.visit('/#/')
    cy
      .get('.v-navigation-drawer')
      .should('be.visible')
  })
  it('Is NOT displayed when mode is mobile', () => {
    // when the window dimension is below a mobile-threshold, the app sets state.app.drawer as false
    // and then the drawer is hidden
    cy.viewport(320, 480)
    cy.visit('/#/')
    cy
      .get('.v-navigation-drawer')
      .should('not.be.visible')
    // besides the above, now the user should see a link to display the drawer
    cy
      .get('#toggle-drawer')
      .should('be.visible')
  })
})
