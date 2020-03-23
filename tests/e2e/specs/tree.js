describe('Tree component', () => {
  it('Should display two cycle points for the mocked workflow', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.cyclepoint')
      .should(($div) => {
        // by default, in our expected viewport size for tests, both cycle points exist and are visible
        expect($div).to.have.length(2)
        expect($div.get(0)).to.contain('20000101T0000Z')
        expect($div.get(0)).to.be('visible')
        expect($div.get(1)).to.contain('20000102T0000Z')
        expect($div.get(1)).to.be('visible')
      })
  })
})
