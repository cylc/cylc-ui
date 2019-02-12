describe('User Profile', () => {
  it('Visits the user profile', () => {
    cy.visit('/user-profile')
    cy.get('input#username')
      .should('be.visible')
      .should('be.disabled')
  })
})
