/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
  dummyMutations,
} from '@/utils/aotf'
import {
  MUTATIONS,
  patchUserprofile,
} from '$tests/e2e/support/graphql'
import { cloneDeep } from 'lodash'

function mockMutate () {
  const mutations = []
  cy.intercept('/cylc/graphql', (req) => {
    const { operationName, query } = req.body
    if (operationName && query?.includes('mutation')) {
      mutations.push(req.body)
      req.reply({
        data: {
          [operationName]: {
            result: [],
          },
        },
      })
    }
  })
  return mutations
}

function mockWorkflowService ({ mutations, queries, types } = {}) {
  cy.intercept('/cylc/graphql', (req) => {
    if (req.body.query.includes('__schema')) {
      req.alias = 'IntrospectQuery' // equivalent to `.as('IntrospectQuery')`
      req.continue((res) => {
        res.body.data.__schema.mutationType.fields = mutations ?? cloneDeep(MUTATIONS)
        res.body.data.__schema.queryType.fields = queries ?? []
        res.body.data.__schema.types = types ?? []
      })
    }
  })
}

function mockPrimaryMutations () {
  cy.window().its('app.$workflowService').then(service => {
    service.primaryMutations = {
      workflow: ['workflowMutation'],
    }
  })
}

describe('Api On The Fly', () => {
  beforeEach(() => {
    patchUserprofile()
  })
  describe('cylc-object', () => {
    beforeEach(() => {
      mockWorkflowService()
      cy.visit('/#/workspace/one')
        .wait(['@IntrospectQuery'])
      mockPrimaryMutations()
    })

    it('correctly associates objects with mutations', () => {
      mockMutate()

      // expand the second task so that its job is visible
      cy.get('.c-tree [data-node-type=task]:eq(1) .node-expand-collapse-button')
        .click()

      const tests = [
        {
          type: 'cycle',
          selector: '.node-data-cycle .c-task:first',
          mutationTitle: 'Cycle Mutation',
          mutationText: 'cycle',
        },
        {
          type: 'family',
          selector: '.node-data-family .c-task:first',
          mutationTitle: 'Namespace Mutation',
          mutationText: 'namespace',
        },
        {
          type: 'task',
          selector: '.node-data-task .c-task:first',
          mutationTitle: 'Namespace Mutation',
          mutationText: 'namespace',
        },

        {
          type: 'job', // (in task summary)
          selector: '.node-data-task .node-summary .c-job:first',
          mutationTitle: 'Job Mutation',
          mutationText: 'job',
        },
        {
          type: 'job', // (expanded)
          selector: '.node-data-job:visible .c-job',
          mutationTitle: 'Job Mutation',
          mutationText: 'job',
        },
      ]

      for (const test of tests) {
        const applicableDummyMutations = dummyMutations.filter((m) => m._appliesTo?.includes(test.type))
        // click on a cycle point node
        cy.get(test.selector)
          .should('be.visible')
          .click()
        // ensure it opens the mutation menu
        cy.get('.c-mutation-menu-list:first')
          .should('be.visible')
          .within(() => {
            // ensure the mutation menu is associated with the correct object
            cy.get('.v-list-item')
              .should('have.length', 1 + applicableDummyMutations.length)
              .get('.v-list-item-title').contains(test.mutationTitle)
              .get('.v-list-item-subtitle').contains(test.mutationText)
          })
        // click outside of the menu
        // (click on hidden element to avoid clicking on anything unexpected)
        cy.get('noscript')
          .click({ force: true })
        // ensure that the menu has closed
        cy.get('.c-mutation-menu-list')
          .should('not.exist')
      }
    })

    it('fires the mutation when clicked', () => {
      // mock the mutation method
      const mutations = mockMutate()

      // open the mutation menu
      cy
        .get('.node-data-cycle > .c-task:first')
        .should('exist')
        .should('be.visible')
        .click()

      // click on the first mutation
      cy
        .get('.c-mutation-menu-list:first')
        .find('.v-list-item__content:first')
        .should('exist')
        .should('be.visible')
        .click({ force: true })
        .then(() => {
          // this should execute one mutation...
          expect(mutations.length).to.equal(1)
          const mutation = mutations[0]

          // ...which should be the cycleMutation...
          expect(mutation.operationName).to.equal('cycleMutation')

          // ...which should be called with the cycle point of the selected node
          // as an argument
          expect(mutation.variables.cycle).to.equal('20000102T0000Z')
        })
    })

    it('should list all workflow mutations', () => {
      const applicableDummyMutations = dummyMutations.filter((m) => m._appliesTo?.includes('workflow'))
      cy.get('#workflow-mutate-button')
        .click()
        // this should open the mutations menu
        // it should list the one default workflow mutation
        // (see workflowService.primaryMutations)
        .get('.c-mutation-menu-item')
        .should('have.length', 1)
        // toggle the menu to "see more" items
        .get('#less-more-button')
        .click()
        // it should now list the five workflow mutations (plus any applicable dummy mutations)
        .get('.c-mutation-menu-item')
        .should('have.length', 5 + applicableDummyMutations.length)
        // should have unauthorised mutation disabled
        .get('.c-mutation-menu-list:first')
        .find('.c-mutation-menu-item.v-list-item--disabled')
        // toggle the menu to "see less" items
        .get('#less-more-button')
        .click()
        // it should list the one default workflow mutation
        // (see workflowService.primaryMutations)
        .get('.c-mutation-menu-item')
        .should('have.length', 1)
    })
  })

  describe('Mutation Editor', () => {
    beforeEach(() => {
      mockWorkflowService()
      cy.visit('/#/workspace/one')
        .wait(['@IntrospectQuery'])
      mockPrimaryMutations()
    })

    it('is opened when the edit button is clicked in the mutation menu', () => {
      const mutations = mockMutate()

      // open the mutation menu
      cy.get('.node-data-cycle > .c-task:first').click()
      // click on the first mutation
      cy.get('.c-mutation-menu-item:first')
        .find('[data-cy=mutation-edit]')
        .click()
      // this should open the mutation editor
      cy.get('.c-mutation-dialog')
        // click the submit button
        .find('[data-cy=submit]')
        .click()
        .then(() => {
          // this should execute one mutation...
          expect(mutations.length).to.equal(1)
          const mutation = mutations[0]

          // ...which should be the cycleMutation...
          expect(mutation.operationName).to.equal('cycleMutation')

          // ...which should be called with the cycle point of the selected node
          // as an argument
          expect(mutation.variables.cycle).to.equal('20000102T0000Z')
        })
    })

    describe('Mutation view in workspace tab', () => {
      it('opens in a new tab', () => {
        const mutations = mockMutate()

        // 1) it opens in a new tab (restores from popup data)
        cy
        // open the mutation menu
          .get('.node-data-cycle > .c-task:first').click()
        // click on the first mutation
          .get('[data-cy=mutation-edit]:first').click()
        // this should open the mutation editor
          .get('.c-mutation-dialog').as('dialog')

        // make an edit to the workflow field
          .get('input[value="~user/one"]').as('workflowInput')
          .type('-edit-1')
          .should('have.value', '~user/one-edit-1')

        // the edit should be reverted when the form is reset
          .get('.c-mutation [data-cy=reset]')
          .click()
          .get('@workflowInput')
          .should('have.value', '~user/one')

        // make another edit
          .type('-edit-2')
          .should('have.value', '~user/one-edit-2')

        // open the form in a new tab
          .get('.c-mutation')
          .should('have.length', 1)
          .find('[data-cy=open-in-new-tab]')
          .click()

        // the dialog and menu should have been closed
          .get('@dialog')
          .should('not.exist')
          .get('.c-mutation-menu-list')
          .should('not.exist')

        // the mutation should have re-opened in a new tab (original destroyed)
          .get('.c-mutation')
          .should('have.length', 1)
          .get('@workflowInput')
          .should('not.exist')

        // the tab title should contain the mutation name
          .get('body')
          .contains('.lm-TabBar-tabLabel', 'Command: Cycle Mutation')
          .should('have.length', 1)

        // the edit should have been preserved in the new tab
          .get('input[value="~user/one-edit-2"]')

        // click the submit button
          .get('.c-mutation [data-cy=submit]').click().then(() => {
          // the mutation should have been submitted with the edited value
            expect(mutations.length).to.equal(1)
            expect(mutations[0].variables.workflow).to.equal('~user/one-edit-2')
          })

        // 2) it restores from the saved layout
        // navigate to another workflow and back
        cy.visit('/#/workspace/other/multi/run2')
          .visit('/#/workspace/one')

        // clear prior mutation
          .then(() => { mutations.splice(0) })

        // the edit should have been preserved post-navigation
          .get('input[value="~user/one-edit-2"]')

        // click the submit button
          .get('.c-mutation [data-cy=submit]').click().then(() => {
          // the mutation should have been submitted with the edited value
            expect(mutations.length).to.equal(1)
            expect(mutations[0].variables.workflow).to.equal('~user/one-edit-2')
          })

        // the field should revert to its original value when reset
          .get('.c-mutation [data-cy=reset]')
          .click()
          .get('input[value="~user/one"]')
      })

      it('clears saved data when schema changes', () => {
        // When the Cylc GraphQL schema changes between Cylc versions, any saved mutation forms are no longer valid.

        // Open mutation editor in a tab
        cy.get('.c-task:first').click()
          .get('[data-cy=mutation-edit]:first').click()
          .get('[data-cy=open-in-new-tab]').click()
          .get('.c-mutation input:first').as('input')
          .then(($input) => {
            const origVal = $input.val()
            expect(origVal).not.to.equal('edited')

            cy.get('@input')
              .clear()
              .type('edited')

            // Quick check that normal page refresh doesn't reset the data
            cy.reload().wait(['@IntrospectQuery'])
            cy.get('@input')
              .should('have.value', 'edited')

            // Check that a page refresh with a schema change results in the data being reset
            mockWorkflowService({ types: ['blah'] })
            cy.reload().wait(['@IntrospectQuery'])
            cy.get('@input')
              .should('have.value', origVal)
          })
      })
    })
  })

  describe('Toolbar buttons', () => {
    beforeEach(() => {
      cy.visit('/#/workspace/one')
    })

    it('plays/pauses the workflow', () => {
      // mock the mutation method
      const mutations = mockMutate()
      expect(mutations.length).to.equal(0)

      cy.get('#workflow-play-pause-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(mutations.map((m) => m.operationName)).to.deep.equal(['pause'])
        })
    })

    it('stops the workflow', () => {
      // mock the mutation method
      const mutations = mockMutate()
      expect(mutations.length).to.equal(0)

      cy.get('#workflow-stop-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(mutations.map((m) => m.operationName)).to.deep.equal(['stop'])
        })
    })
  })
})
