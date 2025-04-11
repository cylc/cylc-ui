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

import {
  deletedFile,
  jobLogFiles,
  workflowLogFiles,
} from '@/services/mock/json/logFiles.cjs'
import {
  logDirPath,
  jobLogLines,
  workflowLogLines,
} from '@/services/mock/json/logData.cjs'

/**
 * @param {string[]} items
 */
function expectFileListContains (items) {
  cy.get('.c-log [data-cy=file-input]')
    .click()
    .get('[data-cy=file-input-menu] [role=listbox]')
    .should('have.text', items.join(''))
    .children('[role=option]')
    .should('have.length', items.length)
}

/**
 * Get the max width of the given elements.
 *
 * @param {JQuery<HTMLElement>} $els
 * @returns {number}
 */
function getMaxLineWidth ($els) {
  return Math.max(...Array.from($els, (el) => el.offsetWidth))
}

describe('Log View', () => {
  beforeEach(() => {
    cy.visit('/#/log/one')
  })

  it('displays the workflow log', () => {
    const defaultFile = workflowLogFiles[0]

    // the workflow ID should be filled in
    cy.get('.c-log [data-cy=workflow-id-input]')
      .should('be.visible')
      .find('input')
      .should('have.value', '~user/one')
      .should('have.attr', 'disabled')

    // the default file should have been selected
    cy.get('.c-log [data-cy=file-input]')
      .should('be.visible')
      .find('input')
      .should('have.value', defaultFile)
      .should('not.have.attr', 'disabled')

    // the log file should have been loaded into the viewer
    cy.get('[data-cy=log-viewer]')
      .contains(workflowLogLines.join(''))

    // the file path should be displayed
    cy.get('[data-cy=log-path]')
      .should('be.visible')
      .invoke('text').then((text) => {
        expect(text.startsWith('my-host:')).to.be.true
        expect(text.endsWith(defaultFile)).to.be.true
      })

    // the connected icon should be visible
    cy.get('[data-cy=connected-icon]')
      .should('be.visible')

    // the workflow log files list should have been populated by the query
    expectFileListContains(workflowLogFiles)
  })

  it('toggles timestamps', () => {
    cy.get('.c-view-toolbar [data-cy=control-timestamps]')
      .click()
      .get('[data-cy=log-viewer] span:first')
      .invoke('text')
      .then((text) => {
        expect(workflowLogLines[0].endsWith(text)).to.equal(true)
        expect(text.length).to.be.lessThan(workflowLogLines[0].length)
      })
  })

  it('toggles word wrap', () => {
    cy.get('[data-cy=log-viewer] span')
      .then(($els) => {
        const nonWrappedMaxWidth = getMaxLineWidth($els)
        cy.get('.c-view-toolbar [data-cy=control-wordWrap]')
          .click()
        cy.get('[data-cy=log-viewer] span')
          .then(($els) => {
            expect(getMaxLineWidth($els)).to.be.lessThan(nonWrappedMaxWidth)
          })
      })
  })

  it('switches from workflow -> job log', () => {
    const defaultFile = 'job.out'
    const defaultFileFailed = 'job.err'

    cy.get('[data-cy=job-toggle]')
      .click()
      // the old log file lines should have been wiped
      .get('[data-cy=log-text]')
      .should('be.empty')
      .get('[data-cy=file-input] input')
      .should('be.disabled')

    // fill in a cycle point (incomplete)
    cy.get('[data-cy=job-id-input]')
      .find('input')
      .type('1/')
      .get('[data-cy=log-text]')
      .should('be.empty')
      .get('[data-cy=file-input] input')
      .should('be.disabled')

    // fill in a task (valid)
    cy.get('[data-cy=job-id-input]')
      .find('input')
      .type('a')
      // the new log file should have been loaded
      .get('[data-cy=log-text]')
      .contains(jobLogLines.join(''))
      // the file path should be displayed
      .get('[data-cy=log-path]')
      .should('be.visible')
      .invoke('text').then((text) => {
        expect(text.startsWith('my-host:')).to.be.true
        expect(text.endsWith(defaultFile)).to.be.true
      })
    // the job log files list should have been populated
    expectFileListContains(jobLogFiles)

    // correct default log file is loaded if job failed
    cy.get('[data-cy=job-id-input]')
      .find('input')
      .clear()
      .type('1/failed/01')
      .get('[data-cy=file-input]')
      .contains(defaultFileFailed)
      .get('[data-cy=log-path]')
      .should('be.visible')
      .invoke('text').then((text) => {
        expect(text.startsWith('my-host:')).to.be.true
        expect(text.endsWith(defaultFileFailed)).to.be.true
      })
  })

  it('shows banner when error occurs', () => {
    cy.get('[data-cy=file-input]')
      .click()
      .get('[data-cy=file-input-menu] [role=listbox]')
      .contains(deletedFile)
      .click()

    cy.get('.c-log .v-alert')
      .should('be.visible')
  })

  it('copies the log filepath to the clipboard', { browser: 'electron' }, () => {
    cy.get('.c-log [data-cy=copy-to-clipboard]')
      .click()
    cy.window().its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', `${logDirPath}/${workflowLogFiles[0]}`)
  })
})

describe('Log command in menu', () => {
  it('opens a log view tab', () => {
    cy.visit('/#/workspace/one')
      .get('.lm-DockPanel-widget')
      .should('have.length', 1)
      .get('.c-tree .c-job:first')
      .click()
      .get('.c-mutation').contains('Log')
      .click()
      .get('.lm-DockPanel-widget')
      .should('have.length', 2)
      .get('[data-cy=log-viewer]')
      .contains(jobLogLines.join(''))
  })
})

describe('Log view in workspace', () => {
  it('remembers job ID and file when switching between workflows', () => {
    const jobFile = 'job.out'
    const jobID = '4/avocet'
    cy.visit('/#/workspace/one')
      .get('#workflow-mutate-button')
      .click()
      .get('.c-mutation').contains('Log')
      .click()
      .get('[data-cy=job-toggle]')
      .click()
      .get('.c-log [data-cy=job-id-input] input').as('jobIDInput')
      .type(jobID)
      .get('[data-cy=log-viewer]')
      .should('be.visible')
      .get('.c-log [data-cy=file-input] input').as('fileInput')
      .invoke('val')
      .should('eq', jobFile)
    // Navigate away
    cy.visit('/#/workspace/two')
      .get('.c-log')
      .should('not.exist')
    // Navigate back
    cy.visit('/#/workspace/one')
      .get('@jobIDInput')
      .invoke('val')
      .should('eq', jobID)
      .get('@fileInput')
      .invoke('val')
      .should('eq', jobFile)
  })

  it('navigates to correct workflow when choosing log option in mutation menu', () => {
    const one = 'one'
    const multi = 'multi/level/run1'
    cy.visit('/#')
      .get('.c-gscan .node').contains(one)
      .parents('.node').find('[data-c-interactive]')
      .click()
      .get('.c-mutation').contains('Log')
      .click()
    cy.url()
      .should('contain', `/workspace/${encodeURIComponent(one)}`)
      .get('.c-log [data-cy=workflow-id-input] input').as('idInput')
      .invoke('val')
      .should('eq', `~user/${one}`)
    cy.get('.c-gscan .node').contains(multi)
      .parents('.node').find('[data-c-interactive]')
      .click()
      .get('.c-mutation').contains('Log')
      .click()
    cy.url()
      .should('contain', `/workspace/${encodeURIComponent(multi)}`)
      .get('@idInput')
      .invoke('val')
      .should('eq', `~user/${multi}`)
  })
})
