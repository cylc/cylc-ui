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
  it('Should display leaf node triangle with margin', () => {
    // this is testing that there is a margin, not necessarily that the leaf node's triangle is exactly under the node
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-task-proxy:first')
      .prev()
      .click()
    // no jobs, and no leaves are visible initially
    cy
      .get('.leaf:first')
      .should('not.be.visible')
    // but clicking on a visible job should display its leaf node
    cy
      .get('.node-data-job:first')
      .click()
    cy
      .get('.leaf:first')
      .should('be.visible')
    // and, important, the leaf node has a triangle, as a helper to quickly point the user to its parent
    // job in the tree - i.e. the leaf has a left margin... as the leaves are not root nodes, we
    // **always** have a margin > 0, unless a bug broke it (which happened before due to a wrong variable name).
    cy
      .get('.leaf:first > .arrow-up')
      .should(($div) => {
        const marginLeft = $div.get(0).style.marginLeft
        if (
          marginLeft === undefined ||
          marginLeft === '' ||
          marginLeft === '0' ||
          marginLeft === '0px'
        ) {
          throw new Error(`Invalid leaf node margin-left: "${marginLeft}"`)
        }
      })
  })
})
