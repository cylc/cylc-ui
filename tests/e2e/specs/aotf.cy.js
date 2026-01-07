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
  mutationStatus,
  processMutations
} from '@/utils/aotf'
import {
  MUTATIONS,
  patchUserprofile,
} from '$tests/e2e/support/graphql'
import { cloneDeep } from 'lodash'

function mockApolloClient () {
  const mutations = []
  cy.window().its('app.$workflowService').then(service => {
    // mock the apollo client's mutate method to catch low-level calls
    service.apolloClient.mutate = async (args) => {
      // log this for later
      mutations.push(args)
      // return something roughly the same shape as what graphql would
      return {
        data: {
          [args.mutation.definitions[0].name.value]: {
            result: []
          }
        }
      }
    }
  })
  return mutations
}

function mockWorkflowService () {
  const mutations = []
  cy.window().its('app.$workflowService').then(service => {
    // mock the workflow service's mutate method to catch high-level calls
    service.mutate = async (args) => {
      // log this for later
      mutations.push(args)
      // return something roughly the same shape as what the workflow
      // service would
      return [mutationStatus.SUCCEEDED, {}]
    }
  })
  return mutations
}

describe('Api On The Fly', () => {
  beforeEach(() => {
    patchUserprofile()
    cy.intercept('/graphql', req => {
      if (req.body.query.includes('__schema')) {
        req.alias = 'IntrospectQuery' // equivalent to `.as('IntrospectQuery')`
      }
    })
    cy.visit('/#/workspace/one')
    cy.window().its('app.$workflowService').then(service => {
      const mutations = cloneDeep(MUTATIONS)
      processMutations(mutations, [])
      // mock the apollo client's mutate method to catch low-level calls
      service.introspection = Promise.resolve({
        mutations,
        types: [],
        queries: []
      })
      service.primaryMutations = {
        workflow: ['workflowMutation']
      }
    })
  })
  describe('cylc-object', () => {
    it('correctly associates objects with mutations', () => {
      mockApolloClient()

      cy.wait(['@IntrospectQuery'])

      // expand the second task so that its job is visible
      cy.get('.c-tree [data-node-type=task]:eq(1) .node-expand-collapse-button')
        .click()

      const tests = [
        // cycle point
        {
          selector: '.node-data-cycle .c-task:first',
          mutationTitle: 'Cycle Mutation',
          mutationText: 'cycle'
        },
        // family
        {
          selector: '.node-data-family .c-task:first',
          mutationTitle: 'Namespace Mutation',
          mutationText: 'namespace'
        },
        // task
        {
          selector: '.node-data-task .c-task:first',
          mutationTitle: 'Namespace Mutation',
          mutationText: 'namespace'
        },
        // job (in task summary)
        {
          selector: '.node-data-task .node-summary .c-job:first',
          mutationTitle: 'Job Mutation',
          mutationText: 'job'
        },
        // job (expanded)
        {
          selector: '.node-data-job:visible .c-job',
          mutationTitle: 'Job Mutation',
          mutationText: 'job'
        }
      ]

      for (const test of tests) {
        // click on a cycle point node
        cy
          .get(test.selector)
          .should('be.visible')
          .click()
        // ensure it opens the mutation menu
        cy
          .get('.c-mutation-menu-list:first')
          .should('be.visible')
          .within(() => {
            // ensure the mutation menu is associated with the correct object
            cy
              .get('.v-list-item')
              .should('have.length', 1)
              .get('.v-list-item-title:first')
              .should('have.text', test.mutationTitle)
              .get('.v-list-item-subtitle:first')
              .should('have.text', test.mutationText)
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
      const mutations = mockApolloClient()

      cy.wait(['@IntrospectQuery'])

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
          expect(mutation.mutation.definitions[0].name.value)
            .to.equal('cycleMutation')

          // ...which should be called with the cycle point of the selected node
          // as an argument
          expect(mutation.variables.cycle).to.equal('20000102T0000Z')
        })
    })
  })

  describe('Mutation Editor', () => {
    it('is opened when the edit button is clicked in the mutation menu', () => {
      // mock the mutation method
      const mutations = mockApolloClient()

      cy.wait(['@IntrospectQuery'])

      // before we do anything the mutation editor should be closed
      cy
        .get('.v-dialog')
        .should('have.length', 0)

      // open the mutation menu
      cy
        .get('.node-data-cycle > .c-task:first')
        .should('exist')
        .should('be.visible')
        .click()

      // click on the first mutation
      cy
        .get('.c-mutation-menu-list:first')
        .find('[data-cy=mutation-edit]')
        .should('exist')
        .should('be.visible')
        .click()

      // this should open the mutation editor
      cy
        .get('.v-dialog')
        .should('be.visible')
        .should('have.length', 1)

        // click the submit button
        .find('[data-cy=submit]')
        .click()
        .then(() => {
          // this should execute one mutation...
          expect(mutations.length).to.equal(1)
          const mutation = mutations[0]

          // ...which should be the cycleMutation...
          expect(mutation.mutation.definitions[0].name.value)
            .to.equal('cycleMutation')

          // ...which should be called with the cycle point of the selected node
          // as an argument
          expect(mutation.variables.cycle).to.equal('20000102T0000Z')
        })
    })

    it('opens in a new tab', () => {
      cy
        // wait for the mutations to have loaded
        .wait(['@IntrospectQuery'])

        // open the mutation menu
        .get('.node-data-cycle > .c-task:first')
        .click()

        // click on the first mutation
        .get('.c-mutation-menu-list:first [data-cy=mutation-edit]')
        .click()

        // this should open the mutation editor
        .get('.v-dialog').as('dialog')
        .should('be.visible')

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

        // the field should revert to its original value when reset
        .get('.c-mutation [data-cy=reset]')
        .click()
        .get('input[value="~user/one"]')
    })
  })

  describe('Play/pause button', () => {
    it('should play/pause the workflow', () => {
      // mock the mutation method
      const mutations = mockWorkflowService()
      expect(mutations.length).to.equal(0)

      cy.get('#workflow-play-pause-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(mutations).to.deep.equal(['pause'])
        })
    })
  })

  describe('Stop button', () => {
    it('should stop the workflow', () => {
      // mock the mutation method
      const mutations = mockWorkflowService()
      expect(mutations.length).to.equal(0)

      cy.wait(['@IntrospectQuery'])

      cy.get('#workflow-stop-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(mutations).to.deep.equal(['stop'])
        })
    })
  })

  describe('Mutation Button', () => {
    it('should list all workflow mutations', () => {
      // mock the mutation method
      mockWorkflowService()

      cy.wait(['@IntrospectQuery'])

      // click the mutations button
      cy
        .get('#workflow-mutate-button')
        .should('be.visible')
        .click()
        // this should open the mutations menu
        .get('.c-mutation-menu-list:first')
        .should('exist')
        .should('be.visible')
        // it should list the one default workflow mutation
        // (see workflowService.primaryMutations)
        .get('.c-mutation-menu-list:first')
        .find('.c-mutation-menu-item')
        .should('have.length', 1)
        // toggle the menu to "see more" items
        .get('#less-more-button')
        .click()
        // it should now list the five workflow mutations
        .get('.c-mutation-menu-list:first')
        .find('.c-mutation-menu-item')
        .should('have.length', 5)
        // should have unauthorised mutation disabled
        .get('.c-mutation-menu-list:first')
        .find('.c-mutation-menu-item:nth-child(4)')
        .should('exist')
        .should('have.class', 'v-list-item--disabled')
        // toggle the menu to "see less" items
        .get('#less-more-button')
        .click()
        // it should list the one default workflow mutation
        // (see workflowService.primaryMutations)
        .get('.c-mutation-menu-list:first')
        .find('.c-mutation-menu-item')
        .should('have.length', 1)
    })
  })
})
