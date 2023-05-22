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

describe('Log View', () => {
  beforeEach(() => {
    cy.visit('/#/log/one')
  })

  it('fills in inputs', () => {
    // the workflow ID should be filled in
    cy.get('.c-log [data-cy=workflow-id-input]')
      .should('be.visible')
      .find('input')
      .should('have.value', '~user/one')
      .should('have.attr', 'disabled')

    // the job.out file should have been selected
    cy.get('.c-log [data-cy=file-input]')
      .should('be.visible')
      .find('input')
      .should('have.value', 'job.out')
      .should('not.have.attr', 'disabled')

    // the job log files list should have been populated by the query
    cy.get('.c-log [data-cy=file-input]')
      .click()
      .get('.v-select__content .v-list-item')
      .contains('job.out')
      .parents('[role=listbox]')
      .children()
      .should('have.length', 3)
  })

  it('loads the log file', () => {
    // the log file should have been loaded into the viewer
    cy.get('[data-cy=log-viewer]')
      .contains('one\ntwo\nthree\nfour\nfive')

    // the file path should be displayed
    cy.get('[data-cy=log-path]')
      .should('be.visible')
      .contains('my-host:')
      .contains('job.out')

    // the connected icon should be visible
    cy.get('[data-cy=connected-icon]')
      .should('be.visible')
  })

  it('switches from workflow -> job log', () => {
    cy.get('[data-cy=job-toggle]')
      .click()
      // the old log file lines should have been wiped
      .get('[data-cy=log-viewer] > pre')
      .should('be.empty')

    // fill in a cycle point (incomplete)
    cy.get('[data-cy=job-id-input]')
      .find('input')
      .type('1/')
      .get('[data-cy=log-viewer] > pre')
      .should('be.empty')
      // fill in a task (valid)
      .get('[data-cy=job-id-input]')
      .find('input')
      .type('a')
      // the new log file should have been loaded
      .get('[data-cy=log-viewer] > pre')
      .contains('one\ntwo\nthree\nfour\nfive')
  })
})
