describe('User Profile', () => {
  it('Visits the user profile', () => {
    cy.visit('/#/user-profile')
    cy
      .get('h4.title')
      .should('be.visible')
      .should('contain', 'Your Profile')
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })
})
