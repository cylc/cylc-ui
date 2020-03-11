describe('Dashboard', () => {
  it('Visits the app root url', () => {
    it('Displays the Dashboard link as active on the left sidebar menu', () => {
      cy.visit('/#/')
      cy
        .get('div .v-list-item__title')
        .contains('Dashboard')
        .parent()
        .should('have.class', 'v-list-item--active')
    })
  })
})
