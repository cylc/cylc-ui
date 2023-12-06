/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('Workspace view and component/widget', () => {
  beforeEach(() => {
    cy.visit('/#/workspace/one')
    cy.title().should('eq', 'Cylc UI | Workflow one')
  })

  afterEach(() => {
    cy
      .get('.v-alert')
      .should('not.exist')
  })

  it('Should display the Lumino component in the Workspace view, with a Tree widget', () => {
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)

    cy.get('.lm-Widget')
      .should('be.visible')
  })

  it('Should remove the default widget and leave no more widgets', () => {
    cy.get('.lm-TabBar-tabCloseIcon').click()
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })

  it('Should be able to add two widgets of the same type', () => {
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    cy.get('[data-cy=add-view-btn]').click()
    cy.get('#toolbar-add-Tree-view').click()
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
  })

  it('Should be able to add two widgets of different types', () => {
    // there should be one widget open by default (tree)
    cy.get('.lm-TabBar-tabLabel')
      // there should be a tab representing the widget
      .should('have.length', 1)
      // the tab should contain the name of the widget
      .contains('Tree')
      // the tab should be active (that is to say on top)
      .parent()
      .should('have.class', 'lm-mod-current')

    cy.get('[data-cy=add-view-btn]').click()
    cy.get('#toolbar-add-Table-view').click()
    cy.get('.lm-TabBar-tabLabel')
      // there should be two tabs (tree + table)
      .should('have.length', 2)
      // the new tab should be last
      .last()
      .contains('Table')
      // the new tab should be active (that is to say on top)
      .parent()
      .should('have.class', 'lm-mod-current')
  })

  it('Should remove widgets added successfully', () => {
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('[data-cy=add-view-btn]').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    // close all widgets
    cy.get('.lm-TabBar-tabCloseIcon').each(($el) => {
      cy.wrap($el).click()
    })
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })

  it('Should remove widgets when leaving the Workspace view', () => {
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('[data-cy=add-view-btn]').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    cy.visit('/#/')
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })

  it('Should remove widgets when updating the Workspace view', () => {
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('[data-cy=add-view-btn]').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    // this is OK, as we render one for every route/workflow requested
    cy.visit('/#/workspace/two')
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
  })
})
