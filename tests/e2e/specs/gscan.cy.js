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

  it('shows mutations menu when clicking on workflow icon', () => {
    cy.get('.c-gscan-workflows')
      .find('.c-treeitem [data-c-interactive]:first')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card-title')
      .should(($el) => {
        expect($el.text().trim()).to.equal('one')
      })
      .get('.c-mutation-menu-list:first')
      .children()
      .should('have.length.greaterThan', 2)
  })

  describe('Filtering', () => {
    beforeEach(() => {
      // should show all workflows by default
      cy.get('.c-treeitem:visible')
        .should('have.length', 5)
    })

    it('filters by workflow name', () => {
      cy.get('#c-gscan-search-workflows')
        .type('level')
        .get('.c-treeitem:visible')
        .should('have.length', 1)
      cy.get('#c-gscan-search-workflows')
        .type('abc')
        .get('.c-treeitem:visible')
        .should('have.length', 0)
    })

    it('filters by workflow state', () => {
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .click()
      cy.get('.v-select__content')
        .contains('.v-list-item', 'stopping')
        .click({ force: true })
        .get('.c-treeitem:visible')
        .should('have.length', 0)
      cy.get('.v-select__content')
        .contains('.v-list-item', 'paused')
        .click({ force: true })
        .get('.c-treeitem [data-c-interactive]:visible')
        .should('have.length', 1)
      cy.get('.v-select__content')
        .contains('.v-list-item', 'running')
        .click({ force: true })
        .get('.c-treeitem [data-c-interactive]:visible')
        .should('have.length', 2)
      cy.get('.v-select__content')
        .contains('.v-list-item', 'stopped')
        .click({ force: true })
        .get('.c-treeitem [data-c-interactive]:visible')
        .should('have.length', 4)
    })

    it('filters by task state', () => {
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter task state"]')
        .click()
      cy.get('.v-select__content')
        .contains('.v-list-item', 'submit-failed')
        .click({ force: true })
        .get('.c-treeitem:visible')
        .should('have.length', 0)
    })

    it('filters by workflow name, state, and tasks states', () => {
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
        .contains('.v-list-item', 'succeeded')
        .click({ force: true })
      cy.get('.c-treeitem:visible')
        .should('have.length', 1)
    })

    it('filter controls behave as expected', () => {
      // Should show chips for each selected item
      cy.get('[data-cy=gscan-filter-btn]')
        .click()
        .get('[data-cy="filter workflow state"]')
        .as('workflowFilterInput')
        .find('.v-select__selection')
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
        .find('.v-select__selection')
        .should('have.length', 2)
      // Clicking back in box should close menu
      cy.get('@workflowFilterInput')
        .click({ force: true })
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

  describe('Task state badges', () => {
    it('collates task states up the tree', () => {
      cy.get('.c-gscan')
        .find('[data-node-name="other/multi"]').as('parent')
        .find('.node:first .task-state-badge')
        .should('have.length', 1)
        .should('have.class', 'running')
        .contains('3')
      // child run2 contributes the running tasks
      cy.get('@parent').find('[data-node-name="run2"] .task-state-badge')
        .should('have.length', 1)
        .should('have.class', 'running')
        .contains('3')
      // but child run1 is stopped and so doesn't contribute
      cy.get('@parent').find('[data-node-name="run1"] .task-state-badge')
        .should('have.length', 1)
        .should('have.class', 'failed')
        .contains('1')
    })
  })

  describe('Task waiting badges', () => {
    it('displays retry and held icons', () => {
      cy.get('.c-gscan')
        .find('[data-node-name="one"]').as('parent')
        .find('.node:first .modifier-badge.held')
        .should('be.visible')
      // child run2 contributes the running tasks
      cy.get('@parent').find('.node:first .modifier-badge.retrying')
        .should('be.visible')
    })
  })

  describe('Warnings', () => {
    it('collates warnings up the tree', () => {
      // NOTE: Log events may be duplicated in offline-mode due to the way the
      // mock data is loaded. This does not apply to production.

      // id="other/muti/run2" type="workflow"
      cy.get('[data-node-name="run2"] .c-warn:first')
        .should('have.class', 'active') // warning active
        .find('svg')
        .trigger('mouseenter')
        .invoke('attr', 'aria-describedby').then((tooltipid) => {
          cy.get(`#${tooltipid} .v-overlay__content`)
            .should('contain', 'ERROR')
            .and('contain', 'SOS')
        })

      // id="other/muti" type="workflow-part"
      cy.get('[data-node-name="other/multi"] .c-warn:first')
        .should('have.class', 'active') // warning has bubbled up from run2
        .find('svg')
        .trigger('mouseenter')
        .invoke('attr', 'aria-describedby').then((tooltipid) => {
          cy.get(`#${tooltipid} .v-overlay__content`)
            .should('contain', 'ERROR')
            .and('contain', 'SOS')
        })

      // dismiss the warning
      cy.get('[data-node-name="run2"] .c-warn:first svg')
        .click({ force: true })

      // id="other/muti/run2" type="workflow"
      cy.get('[data-node-name="run2"] .c-warn:first')
        .should('not.have.class', 'active') // warning dismissed

      // id="other/muti" type="workflow-part"
      cy.get('[data-node-name="other/multi"] .c-warn:first')
        .should('not.have.class', 'active') // warning dismissed
    })
  })
})
