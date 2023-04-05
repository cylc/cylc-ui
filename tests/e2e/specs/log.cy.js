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
  it('works', () => {
    cy
      .visit('/#/log/one')

      // the workflow ID should be filled in
      .get('.workflow-id-input')
      .find('input')
      .should('be.visible')
      .should('have.attr', 'disabled', 'disabled')
      .should(($input) => {
        expect($input.val()).to.equal('~user/one')
      })

      // the job log files list should have been populated by the query
      .get('.c-log')
      .should(($el) => {
        expect($el[0].__vue__.logFiles).to.have.length(3)
      })

      // the job.out file should have been selected
      .should(($el) => {
        expect($el[0].__vue__.file).to.equal('job.out')
      })
      .get('.file-input')
      .should('be.visible')
      .should('not.have.attr', 'disabled', 'disabled')

      // the subscription should have been issued
      .get('.c-log')
      .should(($el) => {
        expect($el[0].__vue__.query.variables.id).to.equal('~user/one')
        expect($el[0].__vue__.query.variables.file).to.equal('job.out')
      })

      // the log file should have been loaded into the viewer
      .get('.log-viewer')
      .contains('one\ntwo\nthree\nfour\nfive')

      // the file path should be displayed
      .get('.log-path')
      .should('be.visible')
      .contains('my-host:')
      .contains('job.out')

      // the connected icon should be visible
      .get('.connected-icon')
      .should('be.visible')

      // toggle the mode from workflow => job
      .get('.job-workflow-toggle > :nth-child(2)')
      .click({ force: true })
      .get('.c-log')
      .should(($el) => {
        // the old file name should have been wiped
        expect($el[0].__vue__.file).to.equal(null)
        // the old query should have been wiped (this triggers unsubscribe)
        expect($el[0].__vue__.query).to.equal(null)
        // the old log file lines should have been wiped
        expect($el[0].__vue__.results.lines).to.deep.equal([])
      })

      // fill in a cycle point (invalid)
      .get('.job-id-input')
      .find('input')
      .type('1')
      .get('.c-log')
      .should(($el) => {
        // the id should not have been updated
        expect($el[0].__vue__.id).to.equal(null)
        // and no query should have been issued
        expect($el[0].__vue__.query).to.equal(null)
      })

      // fill in a task (valid)
      .get('.job-id-input')
      .find('input')
      .type('/a')
      .get('.c-log')
      .should(($el) => {
        // a new query should have been issued
        expect($el[0].__vue__.query.variables.id).to.equal('~user/one//1/a')
        expect($el[0].__vue__.query.variables.file).to.equal('job.out')
      })

      // the new log file should have been loaded
      .get('.log-viewer')
      .contains('one\ntwo\nthree\nfour\nfive')
  })
})
