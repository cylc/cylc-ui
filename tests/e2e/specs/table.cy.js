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

import TaskState from '@/model/TaskState.model'

const initialNumRows = 7

describe('Table view', () => {
  beforeEach(() => {
    cy.visit('/#/table/one')
  })

  it('Should display the mocked workflow', () => {
    cy.get('.c-table table > tbody > tr')
      .should('have.length', initialNumRows)
      .should('be.visible')
  })
  describe('Filters', () => {
    it('Should filter by ID', () => {
      cy.get('.c-table table > tbody > tr')
        .should('have.length', initialNumRows)
      cy.get('[data-cy=filter-id] input')
        .should('be.empty')
      cy.get('[data-cy="filter task state"] input')
        .should('have.value', '')
      cy.get('td > div.d-flex > div')
        .contains('sleepy')
        .should('be.visible')
      for (const id of ['eep', '/sle']) {
        cy.get('[data-cy=filter-id] input')
          .clear()
          .type(id)
        cy.get('td > div.d-flex > div')
          .contains('sleepy')
          .should('be.visible')
        cy.get('.c-table table > tbody > tr')
          .should('have.length', 1)
          .should('be.visible')
      }
    })
    it('Should filter by task state', () => {
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', initialNumRows)
      cy
        .get('td > div.d-flex > div')
        .contains(TaskState.FAILED.name)
        .should('be.visible')
      cy
        .get('[data-cy="filter task state"]')
        .click()
      cy
        .get('.v-list-item')
        .contains(TaskState.RUNNING.name)
        .click({ force: true })
      cy
        .get('td > div.d-flex > div')
        .contains('checkpoint')
        .should('be.visible')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
    it('Should filter by ID and states', () => {
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', initialNumRows)
      cy
        .get('[data-cy="filter task state"]')
        .click()
      cy
        .get('.v-list-item')
        .contains(TaskState.SUCCEEDED.name)
        .click({ force: true })
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 2)
        .should('be.visible')
      cy
        .get('[data-cy=filter-id] input')
        .type('eventually')
      cy
        .get('td > div.d-flex > div')
        .contains('eventually')
        .should('be.visible')
    })
    it('displays and sorts mean run time', () => {
      cy
        // sort dt-mean ascending
        .get('.c-table')
        .contains('th', 'Run Time').as('dTHeader')
        .click()

        // check 0 is at the top (1st row, 10th column)
        .get('tbody > :nth-child(1) > :nth-child(10)')
        .should(($ele) => {
          expect($ele.text().trim()).equal('') // no value sorted first
        })

        // sort dt-mean descending
        .get('@dTHeader')
        .click()

        // check 7 is at the top (1st row, 10th column)
        .get('tbody > :nth-child(1) > :nth-child(10)')
        .should(($ele) => {
          expect($ele.text().trim()).equal('00:00:12')
        })
    })
  })
})

function addView (view) {
  cy.get('[data-cy=add-view-btn]').click()
  cy.get(`#toolbar-add-${view}-view`).click()
    // wait for menu to close
    .should('not.be.exist')
}

describe('State saving', () => {
  beforeEach(() => {
    cy.visit('/#/workspace/one')
    addView('Table')
  })

  it('remembers filters when switching between workflows', () => {
    cy.get('.c-treeitem:visible')
    cy
      .get('.c-table table > tbody > tr')
      .should('have.length', initialNumRows)
    cy
      .get('[data-cy="filter task state"]:last')
      .click()
    cy
      .get('.v-list-item')
      .contains(TaskState.SUCCEEDED.name)
      .click({ force: true })
    cy
      .get('.c-table table > tbody > tr')
      .should('have.length', 2)
      .should('be.visible')
    cy
      .get('[data-cy=filter-id] input:last')
      .type('eventually')
    cy
      .get('td > div.d-flex > div')
      .contains('eventually')
      .should('be.visible')
    // Navigate away
    cy.visit('/#/')
    cy.get('.c-dashboard')
    // Navigate back
    cy.visit('/#/workspace/one')
    cy
      .get('.c-table table > tbody > tr')
      .should('have.length', 1)
      .should('be.visible')
    cy
      .get('td > div.d-flex > div')
      .contains('eventually')
      .should('be.visible')
  })

  it('remembers sorting & page options when switching between workflows', () => {
    const sortedClass = 'v-data-table__th--sorted'
    cy.get('.c-table th')
      .contains('Platform')
      .closest('th').as('platformCol')
      .should('not.have.class', sortedClass)
      .click()
      .should('have.class', sortedClass)
    cy.get('.c-table .v-data-table-footer__items-per-page .v-select')
      .as('itemsPerPage')
      .find('input')
      .should('not.have.value', -1)
      .get('@itemsPerPage')
      .click()
      .get('[role="listbox"] .v-list-item')
      .contains('All')
      .click()
      // Wait for menu to close
      .should('not.exist')
      .get('@itemsPerPage').find('input')
      .should('have.value', -1)
    // Navigate away
    cy.visit('/#/')
      .get('.c-dashboard')
    // Navigate back
    cy.visit('/#/workspace/one')
    cy.get('@platformCol')
      .should('have.class', sortedClass)
    cy.get('@itemsPerPage').find('input')
      .should('have.value', -1)
  })
})
