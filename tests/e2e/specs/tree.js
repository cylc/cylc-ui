describe('Tree component', () => {
  it('Should display two cycle points for the mocked workflow', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-cyclepoint')
      .should(($div) => {
        // by default, in our expected viewport size for tests, both cycle points exist and are visible
        expect($div).to.have.length(2)
        expect($div.get(0)).to.contain('20000101T0000Z')
        expect($div.get(1)).to.contain('20000102T0000Z')
      })
    cy
      .get('.node-data-cyclepoint')
      .should('be.visible')
  })
  it('Should hide jobs by default', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-job')
      .should('not.be.visible')
  })
  it('Should make jobs visible when clicking on tasks', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    // expand the first task proxy we have
    cy
      .get('.node-data-task-proxy:first')
      .prev()
      .click()
    // now, consequentially, the first job that we have should also be visible
    cy
      .get('.node-data-job:first')
      .should('be.visible')
  })
  // it('Should display leaf node triangle with padding', () => {
  //   // this is testing that there is a padding, not necessarily that the leaf node's triangle is exactly under the node
  // }
})
