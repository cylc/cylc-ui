describe('User Profile', () => {
  it('Visits the user profile', () => {
    cy.visit('/#/user-profile')
    cy
      .get('h3.headline')
      .should('be.visible')
      .should('contain', 'Your Profile')
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })
})
