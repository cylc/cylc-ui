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

describe('Gantt view', () => {
  beforeEach(() => {
    cy.visit('/#/gantt/one')
  })
  describe('Gantt view', () => {
    it('Should display the mocked workflow', () => {
      cy
        .get('.vue-apexcharts')
        .should('be.visible')
    })
  })
})

describe('Filter save state', () => {
  // Its hard to test the gantt chart is displaying what we expect as it is rendered as svg
  // Instead we can check the filter values remain the same when navigating away and back again

  function addView (view) {
    cy.get('[data-cy=add-view-btn]').click()
    cy.get(`#toolbar-add-${view}-view`).click()
      // wait for menu to close
      .should('not.be.exist')
  }

  function checkOption (selector, value) {
    cy.get(selector)
      .parent()
      .contains(value)
      .should('be.visible')
  }

  function selectOption (selector, value) {
    cy.get(selector)
      .click({ force: true })
    cy.get('.v-list-item')
      .contains(value)
      .click({ force: true })
  }

  it('remembers task name, platform and timings when switching between workflows', () => {
    cy.visit('/#/workspace/one')
    addView('Gantt')
    // Set task name filter option to something other than default ('')
    selectOption('#c-gantt-filter-job-name', 'c3')
    // Set task times filter option to something other than default ('Total times')
    selectOption('#c-gantt-filter-job-timings', 'Queue times')
    // Set platform filter option to something other than default ('All')
    selectOption('#c-gantt-filter-job-platforms', 'localhost')
    // Set tasks per page filter option to something other than default (10)
    selectOption('#c-gantt-tasks-per-page', '25')

    // Navigate away
    cy.visit('/#/')
    cy.get('.c-dashboard')
    // Navigate back
    cy.visit('/#/workspace/one')

    // Check name filter
    checkOption('#c-gantt-filter-job-name', 'c3')
    // Check task times filter
    checkOption('#c-gantt-filter-job-timings', 'Queue times')
    // Check platform filter
    checkOption('#c-gantt-filter-job-platforms', 'localhost')
    // Check tasks per page
    checkOption('#c-gantt-tasks-per-page', '25')
  })
})
