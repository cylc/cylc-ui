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

import InfoComponent from '@/components/cylc/Info.vue'
import { Tokens } from '@/utils/uid'

const DESCRIPTION = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
`
const TOKENS = new Tokens('~user/workflow//1234/foo')
const TASK = {
  id: TOKENS.id,
  name: TOKENS.task,
  tokens: TOKENS,
  node: {
    state: 'running',
    task: {
      meta: {
        title: 'My Foo',
        description: DESCRIPTION,
        URL: 'https://cylc.org',
        customMeta: {
          answer: '42',
          question: 'mutually exclusive',
        }
      }
    },
    prerequisites: [
      {
        satisfied: false,
        expression: '(c0 & c1) | c2',
        conditions: [
          {
            taskId: 'a',
            message: 'succeeded',
            reqState: 'succeeded',
            exprAlias: 'c0',
            satisfied: true,
          },
          {
            taskId: 'b',
            message: 'custom message',
            reqState: 'custom_output',
            exprAlias: 'c1',
            satisfied: false,
          },
          {
            taskId: 'a',
            message: 'expired',
            reqState: 'expired',
            exprAlias: 'c2',
            satisfied: false,
          },
        ],
      },
      {
        satisfied: true,
        expression: 'c0',
        conditions: [
          {
            taskId: 'x',
            message: 'succeeded',
            reqState: 'succeeded',
            exprAlias: 'c0',
            satisfied: true,
          },
        ],
      },
    ],
    outputs: [
      {
        label: 'started',
        message: 'started',
        satisfied: true,
      },
      {
        label: 'succeeded',
        message: 'succeeded',
        satisfied: false,
      },
      {
        label: 'failed',
        message: 'failed',
        satisfied: false,
      },
    ]
  },
  children: [
    {
      id: TOKENS.clone({ job: '01' }).id,
      tokens: TOKENS.clone({ job: '01' }),
      name: '01',
      node: {
        state: 'failed'
      }
    },
    {
      id: TOKENS.clone({ job: '02' }).id,
      tokens: TOKENS.clone({ job: '02' }),
      name: '02',
      node: {
        state: 'succeeded'
      }
    },
  ],
}

describe('Info component', () => {
  it('displays task information', () => {
    cy.vmount(InfoComponent, {
      props: {
        task: TASK,
        class: 'job_theme--default',
        // NOTE: expand all sections by default
        panelExpansion: [0, 1, 2],
      }
    })

    // there should be a task icon (running)
    cy.get('.c-graph-node .c8-task.running').should('be.visible')

    // and two job icons (succeeded & failed)
    cy.get('.c-graph-node .c-job').should('have.length', 2)
      .get('.c-graph-node .c-job .failed').should('be.visible')
      .get('.c-graph-node .c-job .succeeded').should('be.visible')

    // the metadata panel
    cy.get('.metadata-panel.v-expansion-panel--active').should('be.visible')
      .contains('My Foo')
      .get('.metadata-panel') // the description should be displayed
      .contains(/Lorem ipsum dolor sit amet.*/)
      .get('.metadata-panel a:first') // the URL should be an anchor
      .should('have.attr', 'href', 'https://cylc.org')
      .contains(/^https:\/\/cylc.org$/)

    // the prerequisites panel
    cy.get('.prerequisites-panel.v-expansion-panel--active').should('be.visible')
      .find('.prerequisite-alias.condition')
      .should('have.length', 6)
      .then((selector) => {
        expect(selector[0]).to.contain('(c0 & c1) | c2')
        expect(selector[0].classList.toString()).to.equal('prerequisite-alias condition')

        expect(selector[0]).to.contain('c0')
        expect(selector[1].classList.toString()).to.equal('prerequisite-alias condition satisfied')

        expect(selector[0]).to.contain('c1')
        expect(selector[2].classList.toString()).to.equal('prerequisite-alias condition')

        expect(selector[0]).to.contain('c2')
        expect(selector[3].classList.toString()).to.equal('prerequisite-alias condition')

        expect(selector[0]).to.contain('c0')
        expect(selector[4].classList.toString()).to.equal('prerequisite-alias condition satisfied')

        expect(selector[0]).to.contain('c0')
        expect(selector[5].classList.toString()).to.equal('prerequisite-alias condition satisfied')
      })

    // the outputs panel
    cy.get('.outputs-panel.v-expansion-panel--active').should('be.visible')
      .find('.condition')
      .should('have.length', 3)
      .then((selector) => {
        expect(selector[0]).to.contain('started')
        expect(selector[0].classList.toString()).to.equal('condition satisfied')

        expect(selector[1]).to.contain('succeeded')
        expect(selector[1].classList.toString()).to.equal('condition')

        expect(selector[2]).to.contain('failed')
        expect(selector[2].classList.toString()).to.equal('condition')
      })
  })

  it('should expand sections as intended', () => {
    const spy = cy.spy()
    cy.vmount(InfoComponent, {
      props: {
        task: TASK,
        class: 'job_theme--default'
      },
      listeners: {
        'update:panelExpansion': spy,
      }
    }).as('wrapper')

    // ONLY the metadata panel should be expanded by default
    cy.get('.v-expansion-panel--active')
      .should('have.length', 1)
      .should('have.class', 'metadata-panel')

    // the update:panelExpansion event should be emitted when a panel is
    // expanded/collapsed
    cy.get('.prerequisites-panel')
      .find('button')
      .should('be.visible')
      .click({ force: true })
      .get('@wrapper').then(({ wrapper }) => {
        expect(
          wrapper.emitted('update:panelExpansion')[0][0]
        ).to.deep.equal([0, 1])
      })
  })
})
