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
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .click()
      cy.get('.v-select__content')
        .contains('.v-list-item', 'stopped')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 0)
      cy.get('.v-select__content')
        .contains('.v-list-item', 'running')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 1)
    })

    it('should filter by task state', () => {
      cy.get('.treeitem:visible')
        .should('have.length', 1)
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter task state"]')
        .click()
      cy.get('.v-select__content')
        .contains('.v-list-item', 'submit-failed')
        .click({ force: true })
        .get('.treeitem:visible')
        .should('have.length', 0)
    })

    it('should filter by workflow name, state, and tasks states', () => {
      cy.get('.treeitem:visible')
        .should('have.length', 1)
      cy.get('#c-gscan-search-workflows')
        .type('on')
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .click()
        .get('.v-select__content')
        .contains('.v-list-item', 'running')
        .click({ force: true })
      cy.get('body').type('{esc}')
      cy.get('[data-cy="filter task state"]')
        .click()
        .get('.v-select__content')
        .contains('.v-list-item', 'succeed')
        .click({ force: true })
      cy.get('.treeitem:visible')
        .should('have.length', 1)
    })

    it('filter controls behave as expected', () => {
      // Should show chips for each selected item
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .as('workflowFilterInput')
        .find('.v-chip')
        .should('have.length', 0)
      cy.get('@workflowFilterInput')
        .click()
        .get('.v-select__content')
        .contains('.v-list-item', 'stopped')
        .click({ force: true })
        .get('.v-select__content')
        .contains('.v-list-item', 'running')
        .click({ force: true })
      cy.get('@workflowFilterInput')
        .find('.v-chip')
        .should('have.length', 2)
      // Clicking back in box should close menu
      cy.get('@workflowFilterInput')
        .click()
        .get('.v-select__content')
        .contains('.v-list-item', 'running')
        .should('not.be.visible')
      // Clicking close button inside chip should remove it
      cy.get('@workflowFilterInput')
        .find('.v-chip:first [aria-label=Close]')
        .click()
        .get('@workflowFilterInput')
        .find('.v-chip')
        .should('have.length', 1)
      // Clicking clear icon should clear all
      cy.get('@workflowFilterInput')
        .find('[aria-label="Clear Filter by workflow state"]')
        .click()
        .get('@workflowFilterInput')
        .find('.v-chip')
        .should('have.length', 0)
    })

    it('shows badge for active filters', () => {
      cy.get('[data-cy=gscan-filter-btn]')
        .parent()
        .find('[aria-label=Badge]')
        .as('badge')
        .should('not.be.visible')
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .click()
        .get('.v-select__content')
        .contains('.v-list-item', 'stopped')
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
      .find('.v-card-title')
      .should(($el) => {
        expect($el.text().trim()).to.equal('~user/one')
      })
      .get('.c-mutation-menu-list:first')
      .children()
      .should('have.length.greaterThan', 2)
  })
})
