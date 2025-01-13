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

import CopyBtn from '@/components/core/CopyBtn.vue'

describe('Copy Button component', () => {
  function mountCopyBtn (props) {
    cy.vmount(CopyBtn, { props })
    cy.addVuetifyStyles(cy)
  }
  it('copies text to the clipboard', { browser: 'electron' }, () => {
    // (Access to the clipboard in Cypress only reliably works in Electron)
    const text = 'I am writing this test while on a train'
    mountCopyBtn({ text })

    cy.get('[data-cy=copy-to-clipboard]').as('copyBtn')
      .find('svg path:first').as('copyIcon')
      .then(($el) => {
        const icon = $el.attr('d')
        expect(icon.length).to.be.greaterThan(0)

        cy.get('@copyBtn')
          .click()
          // icon should change to indicate successful copy:
          .get('@copyIcon')
          .then(($el) => $el.attr('d'))
          .should('have.length.greaterThan', 0)
          .should('not.equal', icon)
        // clipboard should contain the text:
        cy.window().its('navigator.clipboard')
          .then((clip) => clip.readText())
          .should('equal', text)
      })
  })
})
