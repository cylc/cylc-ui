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

describe('GScan component', () => {
  beforeEach(() => {
    cy.visit('/#/')
  })

  it('should show all workflows by default', () => {
    cy.get('.treeitem:visible')
      .should('have.length', 1)
  })

  describe('Filtering', () => {
    it('should filter by workflow name', () => {
      cy.get('#c-gscan-search-workflows')
        .type('abc')
        .get('.treeitem:visible')
        .should('have.length', 0)
    })

    it('should filter by workflow state', () => {
      cy.get('.treeitem:visible')
        .should('have.length', 1)
      cy.get('#c-gscan-filter-menu-btn')
        .click()
        .get('[data-cy="filter workflow state"]')
        .parent()
        .click()
      cy.get('[role=listbox] [role=option]')
        .contains('stopped')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 0)
      cy.get('[role=listbox] [role=option]')
        .contains('running')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 1)
    })

    it('should filter by task state', () => {
      cy.get('.treeitem:visible')
        .should('have.length', 1)
      cy.get('#c-gscan-filter-menu-btn')
        .click()
        .get('[data-cy="filter task state"]')
        .parent()
        .click()
      cy.get('[role=listbox] [role=option]')
        .contains('submit-failed')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 0)
    })

    it('should filter by workflow name, state, and tasks states', () => {
      cy.get('.treeitem:visible')
        .should('have.length', 1)
      cy.get('#c-gscan-search-workflows')
        .type('on')
      cy.get('#c-gscan-filter-menu-btn')
        .click()
        .get('[data-cy="filter workflow state"]')
        .parent()
        .click()
        .get('[role=listbox] [role=option]')
        .contains('running')
        .click({ force: true })
      cy.get('[data-cy="filter task state"]')
        .parent()
        .click({ force: true })
        .get('[role=listbox] [role=option]')
        .contains('succeed')
        .click({ force: true })
      cy.get('.treeitem:visible')
        .should('have.length', 1)
    })

    it('filter controls behave as expected', () => {
      // Should show chips for each selected item
      cy.get('#c-gscan-filter-menu-btn')
        .click()
        .get('[data-cy="filter workflow state"]')
        .parent()
        .as('workflowFilterInput')
        .children('.v-chip')
        .should('have.length', 0)
      cy.get('@workflowFilterInput')
        .click()
        .get('[role=listbox] [role=option]')
        .contains('stopped')
        .click({ force: true })
        .get('[role=listbox] [role=option]')
        .contains('running')
        .click({ force: true })
      cy.get('@workflowFilterInput')
        .children('.v-chip')
        .should('have.length', 2)
      // Clicking back in box should close menu
      cy.get('@workflowFilterInput')
        .click()
        .get('[role=listbox] [role=option]')
        .contains('running')
        .should('not.be.visible')
      // Clicking close button inside chip should remove it
      cy.get('@workflowFilterInput')
        .find('.v-chip:first button[aria-label=Close]')
        .click()
        .get('@workflowFilterInput')
        .children('.v-chip')
        .should('have.length', 1)
      // Clicking clear icon should clear all
      cy.get('@workflowFilterInput')
        .parent()
        .find('button[aria-label="clear icon"]')
        .click()
        .get('@workflowFilterInput')
        .children('.v-chip')
        .should('have.length', 0)
    })

    it('shows badge for active filters', () => {
      cy.get('#c-gscan-filter-menu-btn')
        .parent()
        .find('[aria-label=Badge]')
        .as('badge')
        .should('not.be.visible')
      cy.get('#c-gscan-filter-menu-btn')
        .click()
        .get('[data-cy="filter workflow state"]')
        .parent()
        .click()
        .get('[role=listbox] [role=option]')
        .contains('stopped')
        .click({ force: true })
      cy.get('@badge')
        .should('be.visible')
    })
  })

  it('shows mutations menu when clicking on workflow icon', () => {
    cy.get('.c-gscan-workflows')
      .find('.treeitem .c-interactive:first') //
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card__title')
      .should(($el) => {
        expect($el.text().trim()).to.equal('~user/one')
      })
      .get('.c-mutation-menu-list:first')
      .children()
      .should('have.length.greaterThan', 2)
  })
})
